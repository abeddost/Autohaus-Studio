import { timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { getDb } from "@/lib/db/client";
import { processDueNotifications } from "@/lib/enquiries/service";
import { log } from "@/lib/log";
import { pruneAttempts } from "@/lib/security/rateLimit";

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/**
 * Retries pending enquiry notifications. Call on a schedule with
 * `Authorization: Bearer $CRON_SECRET` (Vercel Cron sends this automatically).
 */
export async function GET(request: Request) {
  await connection();
  if (!authorised(request)) return Response.json({ ok: false }, { status: 401 });
  try {
    const db = await getDb();
    const result = await processDueNotifications(db);
    await pruneAttempts(db);
    log("info", "cron.notifications", result);
    return Response.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    log("error", "cron.notifications.failed", { error: String((error as Error).message) });
    return Response.json({ ok: false }, { status: 503 });
  }
}
