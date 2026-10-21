import { expect, test } from "@playwright/test";
import { ALL_PAGES } from "./helpers";

const FORBIDDEN = [
  /Fehlt:/,
  /data-missing/,
  /testimonial/i,
  /Kundenstimme/i,
  /aggregateRating/i,
  /★/,
  /offizielle[rn]? (mobile\.de-)?Partner/i,
  /mobile\.de[- ]Partner/i,
  /Partner von mobile\.de/i,
  /Jahre(n)? Erfahrung/i,
  /years of experience/i,
  /rechtssicher garantiert|garantiert rechtssicher|DSGVO-konform garantiert/i,
  /lorem ipsum/i,
  /undefined/,
];

test("production pages contain no placeholders, fake proof or forbidden claims", async ({ request }) => {
  for (const path of ALL_PAGES) {
    const html = await (await request.get(path)).text();
    // Only inspect visible markup, not inlined framework payloads.
    const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
    for (const pattern of FORBIDDEN) {
      expect(body, `${path} matches ${pattern}`).not.toMatch(pattern);
    }
  }
});

test("portfolio shows exactly the three confirmed client projects", async ({ page }) => {
  for (const path of ["/", "/referenzen"]) {
    await page.goto(path);
    const articles = page.locator("article", { hasText: "Kundenprojekt" });
    await expect(articles).toHaveCount(3);
    for (const name of ["Autohaus Bodenheim", "Meinautoverkauf", "HF E-Autos"]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
  }
  await page.goto("/en/work");
  await expect(page.locator("article", { hasText: "Client project" })).toHaveCount(3);
});

test("demonstration interfaces are labelled", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Konzeptdemo").first()).toBeVisible();
  await page.goto("/en");
  await expect(page.getByText("Concept demo").first()).toBeVisible();
});

test("structured data uses genuine fields only", async ({ page }) => {
  await page.goto("/");
  const json = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
  expect(json["@type"]).toBe("ProfessionalService");
  expect(json.name).toBe("Autohaus Webstudio");
  expect(json.founder.name).toBe("Abdul Qader Dost");
  expect(json).not.toHaveProperty("aggregateRating");
  expect(json).not.toHaveProperty("review");
});

test("metadata: canonical, hreflang and indexing guard", async ({ page, request }) => {
  await page.goto("/preise");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/preise$/);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/en\/pricing$/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /");
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/referenzen/hf-eautos");
});

test("no tracking scripts are loaded", async ({ page }) => {
  const external: string[] = [];
  page.on("request", (r) => {
    const url = new URL(r.url());
    if (url.hostname !== "localhost") external.push(url.hostname);
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(external).toEqual([]);
});

test("hero showroom stage can be paused and does not auto-advance under reduced motion", async ({ page, browser }) => {
  await page.goto("/");
  const pause = page.getByRole("button", { name: "Automatischen Wechsel anhalten" });
  await expect(pause).toBeVisible();
  await pause.click();
  await expect(page.getByRole("button", { name: "Automatischen Wechsel fortsetzen" })).toBeVisible();

  const context = await browser.newContext({ reducedMotion: "reduce" });
  const reduced = await context.newPage();
  await reduced.goto("http://localhost:3200/");
  const caption = reduced.locator("#hero-title").locator("xpath=ancestor::section").locator("p.serif").first();
  const first = await caption.textContent();
  await reduced.waitForTimeout(7500);
  expect(await caption.textContent()).toBe(first);
  await context.close();
});

test("every demo photo used on the site is credited", async ({ page, request }) => {
  const credits = (await (await request.get("/demo/credits.json")).json()) as Record<string, { source: string; license: string }>;
  const used = new Set<string>();
  for (const path of ["/", "/leistungen", "/preise"]) {
    await page.goto(path);
    await page.evaluate(() => document.querySelectorAll("img").forEach((i) => ((i as HTMLImageElement).loading = "eager")));
    const srcs = await page.$$eval("img", (imgs) => imgs.map((i) => decodeURIComponent(i.currentSrc || i.src)));
    for (const src of srcs) {
      const match = src.match(/\/demo\/([a-z0-9-]+?)(?:-sm)?\.webp/);
      if (match) used.add(match[1]);
    }
  }
  expect(used.size).toBeGreaterThan(5);
  for (const name of used) {
    expect(credits[name], name).toBeTruthy();
    expect(credits[name].source).toMatch(/^https:\/\/unsplash\.com\/photos\//);
  }
});

test("concept demos are labelled wherever they appear", async ({ page }) => {
  for (const path of ["/", "/leistungen", "/preise"]) {
    await page.goto(path);
    expect(await page.getByText(/Konzeptdemo/).count(), path).toBeGreaterThan(0);
  }
});
