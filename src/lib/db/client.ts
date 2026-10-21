import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

export class DatabaseUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

const MIGRATIONS = path.join(process.cwd(), "drizzle");
const store = globalThis as unknown as { __awDb?: Promise<Db> };

/**
 * Database selection:
 * - DATABASE_URL set → PostgreSQL via node-postgres (production).
 * - otherwise PGLITE_DIR (or `.data/pglite` outside production) → embedded
 *   PGlite, a real Postgres engine persisted on disk. "memory://" for tests.
 * - otherwise → DatabaseUnavailableError (the API answers 503; nothing is faked).
 */
export function getDb(): Promise<Db> {
  if (!store.__awDb) {
    store.__awDb = createDb().catch((error) => {
      store.__awDb = undefined;
      throw error;
    });
  }
  return store.__awDb;
}

/** Test helper: forget the cached connection. */
export function resetDbForTests() {
  store.__awDb = undefined;
}

async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({ connectionString: url, max: 5, connectionTimeoutMillis: 5000 });
    const db = drizzle(pool, { schema });
    if (process.env.DB_AUTO_MIGRATE === "true") {
      const { migrate } = await import("drizzle-orm/node-postgres/migrator");
      await migrate(db, { migrationsFolder: MIGRATIONS });
    }
    return db as unknown as Db;
  }

  const dir = process.env.PGLITE_DIR ?? (process.env.NODE_ENV !== "production" ? ".data/pglite" : undefined);
  if (!dir) throw new DatabaseUnavailableError("DATABASE_URL is not configured");

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  let client;
  if (dir === "memory://") {
    client = new PGlite();
  } else {
    const resolved = path.resolve(/*turbopackIgnore: true*/ process.cwd(), dir);
    await mkdir(resolved, { recursive: true });
    client = new PGlite(resolved);
  }
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db as unknown as Db;
}
