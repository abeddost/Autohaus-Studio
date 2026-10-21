import { and, eq, gte, lt, sql } from "drizzle-orm";
import type { Db } from "../db/client";
import { submissionAttempts } from "../db/schema";

export const LIMITS = { perHour: 8, perDay: 30 };

/** Postgres-backed limiter: works across serverless instances without extra infrastructure. */
export async function isRateLimited(db: Db, ipHash: string, now = new Date()): Promise<boolean> {
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const [row] = await db
    .select({
      hour: sql<number>`count(*) filter (where ${submissionAttempts.createdAt} >= ${hourAgo})`.mapWith(Number),
      day: sql<number>`count(*)`.mapWith(Number),
    })
    .from(submissionAttempts)
    .where(and(eq(submissionAttempts.ipHash, ipHash), gte(submissionAttempts.createdAt, dayAgo)));
  return (row?.hour ?? 0) >= LIMITS.perHour || (row?.day ?? 0) >= LIMITS.perDay;
}

export async function recordAttempt(db: Db, ipHash: string, outcome: string) {
  await db.insert(submissionAttempts).values({ ipHash, outcome });
}

export async function pruneAttempts(db: Db, now = new Date()) {
  const cutoff = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  await db.delete(submissionAttempts).where(lt(submissionAttempts.createdAt, cutoff));
}
