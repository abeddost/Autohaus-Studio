/**
 * Captures genuine screenshots of the confirmed client projects.
 *
 *   pnpm screenshots            # all projects
 *   pnpm screenshots hf-eautos  # one project
 *
 * Output: public/projects/<slug>/<shot>-{desktop,mobile}.webp + manifest.json
 * Cookie/consent overlays are hidden via injected CSS (no consent is given).
 */
import { chromium, type Page } from "playwright";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type Shot = {
  id: string;
  /** Absolute URL, or a function that finds the URL on an already loaded page. */
  url: string | { from: string; selector: string };
  devices: ("desktop" | "mobile")[];
  /** Capture a taller desktop crop (in CSS px) instead of just the first viewport. */
  tallHeight?: number;
};

const TARGETS: Record<string, { base: string; shots: Shot[] }> = {
  "autohaus-bodenheim": {
    base: "https://www.autohaus-bodenheim.de",
    shots: [
      { id: "home", url: "/", devices: ["desktop", "mobile"] },
      { id: "inventory", url: "/unsere-angebote", devices: ["desktop", "mobile"], tallHeight: 1500 },
      {
        id: "vehicle",
        url: { from: "/unsere-angebote", selector: 'a[href^="/unsere-angebote/"]' },
        devices: ["desktop", "mobile"],
        tallHeight: 1500,
      },
      { id: "ankauf", url: "/auto-verkaufen", devices: ["desktop", "mobile"] },
    ],
  },
  meinautoverkauf: {
    base: "https://meinautoverkauf.de",
    shots: [
      { id: "home", url: "/", devices: ["desktop", "mobile"] },
      { id: "home-long", url: "/", devices: ["desktop"], tallHeight: 2200 },
    ],
  },
  "hf-eautos": {
    base: "https://www.hf-eautos.de",
    shots: [
      { id: "home", url: "/", devices: ["desktop", "mobile"] },
      { id: "inventory", url: "/unsere-angebote", devices: ["desktop", "mobile"], tallHeight: 1500 },
      {
        id: "vehicle",
        url: { from: "/unsere-angebote", selector: 'a[href^="/unsere-angebote/"]' },
        devices: ["desktop", "mobile"],
        tallHeight: 1500,
      },
      { id: "services", url: "/leistungen", devices: ["desktop"] },
    ],
  },
};

const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, isMobile: false, outWidth: 2400 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, outWidth: 780 },
} as const;

const HIDE_OVERLAYS_CSS = `
  [id*="cookie" i], [class*="cookie" i], [id*="consent" i], [class*="consent" i],
  [id*="usercentrics" i], [id*="borlabs" i], [class*="cmp-" i], [id*="cmp" i][role="dialog"],
  #CybotCookiebotDialog, .cky-consent-container, .cc-window { display: none !important; }
  html, body { overflow: auto !important; }
`;

/** Declines optional cookies (never accepts tracking) so the consent dialog closes. */
async function dismissConsent(page: Page) {
  for (const name of [/^alle ablehnen$/i, /^ablehnen$/i, /^nur (notwendige|essenzielle)/i]) {
    const button = page.getByRole("button", { name }).first();
    if (await button.isVisible().catch(() => false)) {
      await button.click().catch(() => {});
      await page.waitForTimeout(600);
      return;
    }
  }
}

async function settle(page: Page) {
  await dismissConsent(page);
  await page.addStyleTag({ content: HIDE_OVERLAYS_CSS }).catch(() => {});
  // Trigger lazy-loaded images, then return to the top.
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < Math.min(document.body.scrollHeight, 6000); y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(1200);
}

async function resolveUrl(page: Page, base: string, url: Shot["url"]): Promise<string> {
  if (typeof url === "string") return new URL(url, base).toString();
  await page.goto(new URL(url.from, base).toString(), { waitUntil: "networkidle", timeout: 60000 });
  const href = await page.locator(url.selector).first().getAttribute("href");
  if (!href) throw new Error(`No link matching ${url.selector} on ${url.from}`);
  return new URL(href, base).toString();
}

async function main() {
  const only = process.argv[2];
  const browser = await chromium.launch();
  const manifest: Record<string, Record<string, { file: string; width: number; height: number; source: string }>> = {};

  for (const [slug, target] of Object.entries(TARGETS)) {
    if (only && only !== slug) continue;
    const outDir = path.join(process.cwd(), "public", "projects", slug);
    await mkdir(outDir, { recursive: true });
    manifest[slug] = {};

    for (const shot of target.shots) {
      for (const device of shot.devices) {
        const d = DEVICES[device];
        const context = await browser.newContext({
          viewport: d.viewport,
          deviceScaleFactor: d.deviceScaleFactor,
          isMobile: d.isMobile,
          hasTouch: d.isMobile,
          locale: "de-DE",
          reducedMotion: "reduce",
        });
        const page = await context.newPage();
        try {
          const url = await resolveUrl(page, target.base, shot.url);
          await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
          await settle(page);
          const tall = device === "desktop" && shot.tallHeight;
          const png = await page.screenshot({
            type: "png",
            fullPage: Boolean(tall),
            clip: tall ? { x: 0, y: 0, width: d.viewport.width, height: shot.tallHeight! } : undefined,
          });
          const file = `${shot.id}-${device}.webp`;
          const img = sharp(png).resize({ width: d.outWidth, withoutEnlargement: true }).webp({ quality: 82 });
          const { width, height } = await img.toFile(path.join(outDir, file));
          manifest[slug][`${shot.id}-${device}`] = { file: `/projects/${slug}/${file}`, width, height, source: url };
          console.log(`✓ ${slug} ${shot.id} ${device} ← ${url}`);
        } catch (error) {
          console.error(`✗ ${slug} ${shot.id} ${device}:`, (error as Error).message);
        } finally {
          await context.close();
        }
      }
    }
    await writeFile(path.join(outDir, "manifest.json"), JSON.stringify(manifest[slug], null, 2));
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
