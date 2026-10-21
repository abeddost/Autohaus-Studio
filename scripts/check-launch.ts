/**
 * Lists everything that must be supplied before the public launch.
 *
 *   pnpm check:launch            # report only (exit 0)
 *   LAUNCH_STRICT=1 pnpm build   # fails the build while blockers remain
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { site } from "../src/config/site";

type Item = { label: string; ok: boolean; level: "blocker" | "recommended" };
const env = process.env;
const items: Item[] = [];
const add = (label: string, ok: boolean, level: Item["level"] = "blocker") => items.push({ label, ok, level });

// Content & identity
add("Contact email address (src/config/site.ts → contact.email)", Boolean(site.contact.email));
add("Business address for legal notice / structured data (site.address)", Boolean(site.address.street && site.address.postalCode && site.address.city));
add("Telephone number (site.contact.phone)", Boolean(site.contact.phone), "recommended");
add("Logo file (site.logo) – typographic wordmark is used until then", Boolean(site.logo), "recommended");
add("Portrait photo for /ueber-mich (site.owner.portrait)", Boolean(site.owner.portrait), "recommended");
for (const file of ["impressum.de.md", "datenschutz.de.md", "impressum.en.md", "datenschutz.en.md"]) {
  add(`Approved legal text src/content/legal/${file}`, existsSync(path.join(process.cwd(), "src/content/legal", file)));
}

// Infrastructure
add("DATABASE_URL (PostgreSQL)", Boolean(env.DATABASE_URL));
const provider = (env.EMAIL_PROVIDER ?? "none").toLowerCase();
add("EMAIL_PROVIDER (resend | postmark)", provider === "resend" || provider === "postmark");
if (provider === "resend") add("RESEND_API_KEY", Boolean(env.RESEND_API_KEY));
if (provider === "postmark") add("POSTMARK_SERVER_TOKEN", Boolean(env.POSTMARK_SERVER_TOKEN));
add("EMAIL_FROM (verified sender domain)", Boolean(env.EMAIL_FROM));
add("CONTACT_RECIPIENT", Boolean(env.CONTACT_RECIPIENT));
add("FORM_SECRET (≥ 16 characters)", (env.FORM_SECRET ?? "").length >= 16);
add("CRON_SECRET (≥ 16 characters) for notification retries", (env.CRON_SECRET ?? "").length >= 16);
add("RATE_LIMIT_SALT", Boolean(env.RATE_LIMIT_SALT), "recommended");
add("NEXT_PUBLIC_SITE_URL (canonical domain)", Boolean(env.NEXT_PUBLIC_SITE_URL));
add("SITE_INDEXING=true (enable search engine indexing at launch)", env.SITE_INDEXING === "true", "recommended");

const open = items.filter((i) => !i.ok);
const blockers = open.filter((i) => i.level === "blocker");
console.log(`\nLaunch check – ${site.name}\n`);
for (const item of items) {
  const mark = item.ok ? "✓" : item.level === "blocker" ? "✗" : "•";
  console.log(`  ${mark} ${item.label}${!item.ok && item.level === "recommended" ? " (recommended)" : ""}`);
}
console.log(`\n${blockers.length} blocker(s), ${open.length - blockers.length} recommendation(s).\n`);

if (env.LAUNCH_STRICT === "1" && blockers.length) {
  console.error("LAUNCH_STRICT=1: build stopped until all blockers are resolved.");
  process.exit(1);
}
