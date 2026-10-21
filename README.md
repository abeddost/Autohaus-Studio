# Autohaus Webstudio – agency website

Bilingual (German primary, English under `/en`) marketing website for a web studio that builds
websites and web applications for car dealerships and Autoankauf businesses. It includes an
accessible four-step **Preisrechner** and a durable enquiry backend.

**Stack:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · PostgreSQL via
Drizzle ORM (embedded PGlite in development) · Resend or Postmark over HTTPS · Zod · Vitest · Playwright.

## Quick start

```bash
pnpm install
pnpm dev            # http://localhost:3000 – uses an embedded Postgres in .data/pglite
```

No `.env` is needed for local development. Enquiries are stored in the embedded database.
Without an email provider, the success screen says so honestly and the notification stays queued.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | Develop, build (runs the launch check first), serve |
| `pnpm test` | Unit tests (pricing engine) + integration tests (enquiry storage, email failure, retries, spam guards) |
| `pnpm test:e2e` | Playwright against the production build – run `pnpm build` first |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |
| `pnpm check:launch` | Lists everything still missing before launch |
| `pnpm screenshots [slug]` | Re-captures client project screenshots into `public/projects/<slug>/` |
| `pnpm demo:photos` | Re-downloads the licensed concept-demo photography into `public/demo/` |
| `pnpm db:generate` / `pnpm db:migrate` | Generate SQL from the schema / apply migrations to `DATABASE_URL` |
| `pnpm enquiries [--csv]` | List or export stored enquiries with notification status |

## Where to edit

| What | File |
| --- | --- |
| Agency name, domain, owner, contact details, logo, portrait | `src/config/site.ts` |
| **All prices**, package scope, add-ons, care plans, quote triggers, external costs | `src/config/pricing.ts` |
| Client projects (texts, tags, screenshots) | `src/config/projects.ts` |
| All page copy | `src/content/de.ts`, `src/content/en.ts` (same typed shape) |
| Legal texts | `src/content/legal/*.md` (see the README there) |
| Routes and URL mapping DE ↔ EN | `src/i18n/routes.ts` |

**Missing information is never invented.** Unset values in `site.ts` stay `null`. They show as amber
"Fehlt: …" markers in development (and on previews with `NEXT_PUBLIC_SHOW_MISSING=true`) and are
omitted in production. Legal routes show "Dieses Dokument wird derzeit vorbereitet." until approved
Markdown is supplied.

## Design system – "Night Showroom"

- Tokens live in `src/app/globals.css` (`@theme`): night surfaces, bone/paper light sections and a
  single champagne accent. Typography: Instrument Serif (display), Geist (UI), Geist Mono (specs).
- The hero (`src/components/home/HeroShowroom.tsx`) stages the three **genuine** client sites in 3D.
  Auto-rotation has a visible pause control and is off under `prefers-reduced-motion`.
- Concept demos use the fictional dealer **"Automobile Mustermann"** (`src/config/demo.ts`,
  `src/components/demo/*`) and are always labelled "Konzeptdemo". The configurator preview
  (`src/components/calculator/ConfiguratorPreview.tsx`) assembles itself from the current selection.

### Demo photography

Free photos from Unsplash (Unsplash License: commercial use allowed, no attribution required),
downloaded by `scripts/fetch-demo-photos.ts`. Photographer and source of every image are recorded in
`public/demo/credits.json`, and an e2e test checks that every demo image used is credited. Vehicle titles
in the demo data match the car in each photo; prices and mileages are illustrative sample data.

## Pricing logic

- Integer euro cents, stable ids, net prices. A single config is used by the browser and the server.
- `src/lib/pricing/selection.ts`: Zod schema, `normalizeSelection()` (drops options that don't
  apply, enforces dependencies and mutual exclusions, caps counts), and URL encoding.
- `src/lib/pricing/engine.ts`: `calculateQuote()` separates one-time setup, monthly operation, a
  separately shown discovery fee and external costs. When an individual quotation is required, the
  setup total is `null`, and only a labelled subtotal of known standard components is shown.
- The server re-prices every enquiry from the selection. Totals sent by the client are ignored.

## Enquiry flow

`POST /api/enquiries` runs these steps in order: same-origin check → size/content-type limits →
Postgres-backed rate limit (salted IP hash) → honeypot → signed minimum-fill-time token
(`GET /api/enquiries/token`) → Zod validation → server-side re-pricing → **one transaction storing
the enquiry and its notification outbox row** → email attempt → response.

- Success (201) is only returned after the row is committed. The response states whether the
  notification was `sent`, `queued` (provider error; it will be retried) or `not_configured`.
- Retries: `GET /api/cron/notifications` with `Authorization: Bearer $CRON_SECRET` uses exponential
  backoff (up to 6 attempts). `vercel.json` schedules it every 15 minutes. On other hosts, call it
  from any scheduler.
- A database outage returns 503, and the form keeps the visitor's input.

## Environment variables

See `.env.example` for the full annotated list.

| Variable | Required in production | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical URL, sitemap, structured data |
| `DATABASE_URL` | yes | PostgreSQL. Run `pnpm db:migrate` or set `DB_AUTO_MIGRATE=true` |
| `EMAIL_PROVIDER` | yes | `resend` or `postmark` |
| `RESEND_API_KEY` / `POSTMARK_SERVER_TOKEN` | per provider | Server-only |
| `EMAIL_FROM` | yes | Sender on a domain verified with the provider |
| `CONTACT_RECIPIENT` | yes | Comma-separated |
| `FORM_SECRET` | yes | ≥ 16 characters. Signs form timestamps |
| `CRON_SECRET` | yes | ≥ 16 characters. Protects the retry endpoint |
| `RATE_LIMIT_SALT` | recommended | Salt for hashed IPs |
| `SITE_INDEXING` | at launch | `true` enables indexing. Until then robots.txt disallows all and pages are `noindex` |
| `LAUNCH_STRICT` | recommended | `1` makes `pnpm build` fail while launch blockers remain |
| `NEXT_PUBLIC_SHOW_MISSING` | no | Shows "Fehlt:" markers on preview deployments |

No secrets are exposed to the browser. Only `NEXT_PUBLIC_*` values are public.
No analytics or tracking is included (`site.analytics.enabled` is `false`). Add a consent solution
before enabling any non-essential tracking.

## Before launch

Run `pnpm check:launch`. At the time of delivery it reports:

1. **Contact details:** a contact email address and the business address in `site.ts`; a phone number is recommended.
2. **Legal texts:** approved Impressum and Datenschutzerklärung (DE and EN) as Markdown in
   `src/content/legal/`. The privacy policy must cover the enquiry form, hosting, database and email provider.
3. **Infrastructure:** a production PostgreSQL database (then `pnpm db:migrate`), an email provider
   account with a verified sender domain, `FORM_SECRET`, `CRON_SECRET` and `NEXT_PUBLIC_SITE_URL`.
4. **Brand assets (recommended):** logo file (`site.logo`) and portrait photo (`site.owner.portrait`).
   Until then a typographic wordmark and a monogram panel are used.
5. **Review:** the project descriptions in `src/config/projects.ts`. They describe only functionality
   that was visible on the live sites on 17 Oct 2026, plus your confirmed contribution (concept, design and development).
6. Set `SITE_INDEXING=true` on the production domain and add the cron schedule if you don't host on Vercel.

## Content rules followed

- No testimonials, ratings, awards, certifications, statistics, years of experience, official
  mobile.de partnership or legal-compliance guarantees. The only quantified claim is the confirmed
  six dealership websites.
- Only the three confirmed client projects are shown, labelled "Kundenprojekt" / "Client project".
- Illustrative interfaces (hero, sync demo, inbox demo) are labelled "Konzeptdemo" / "Concept demo"
  and use generic sample data.
- An automated content test (`tests/e2e/content.spec.ts`) guards these rules on every page.
