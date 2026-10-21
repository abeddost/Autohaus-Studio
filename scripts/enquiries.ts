/**
 * Lists stored enquiries with their notification state.
 *
 *   pnpm enquiries            # latest 20
 *   pnpm enquiries --csv      # CSV export to stdout
 *
 * Uses DATABASE_URL, or the local PGlite database (stop `pnpm dev` first –
 * the embedded database allows one process at a time).
 */
import { desc, eq } from "drizzle-orm";
import { getDb } from "../src/lib/db/client";
import { enquiries, notifications } from "../src/lib/db/schema";

async function main() {
  const db = await getDb();
  const rows = await db
    .select({
      reference: enquiries.reference,
      createdAt: enquiries.createdAt,
      company: enquiries.company,
      name: enquiries.name,
      email: enquiries.email,
      phone: enquiries.phone,
      setupCents: enquiries.setupCents,
      monthlyCents: enquiries.monthlyCents,
      needsQuote: enquiries.needsQuote,
      notification: notifications.status,
      attempts: notifications.attempts,
      lastError: notifications.lastError,
    })
    .from(enquiries)
    .leftJoin(notifications, eq(notifications.enquiryId, enquiries.id))
    .orderBy(desc(enquiries.createdAt))
    .limit(process.argv.includes("--csv") ? 10_000 : 20);

  if (process.argv.includes("--csv")) {
    const header = Object.keys(rows[0] ?? { reference: "" });
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    console.log(header.join(","));
    for (const row of rows) console.log(header.map((h) => esc((row as Record<string, unknown>)[h])).join(","));
  } else {
    console.table(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), lastError: r.lastError?.slice(0, 60) })));
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
