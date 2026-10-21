import { expect, test } from "@playwright/test";
import { ALL_PAGES } from "./helpers";

test("every page and every internal link resolves", async ({ page, request }) => {
  const links = new Set<string>();
  for (const path of ALL_PAGES) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs) {
      if (href.startsWith("/") && !href.startsWith("//")) links.add(href.split("#")[0] || "/");
    }
  }
  expect(links.size).toBeGreaterThan(20);
  for (const link of links) {
    const res = await request.get(link);
    expect(res.status(), link).toBe(200);
  }
});

test("in-page anchors used by CTAs exist", async ({ page }) => {
  await page.goto("/preise");
  await expect(page.locator("#preisrechner")).toHaveCount(1);
  await page.goto("/leistungen");
  for (const id of ["websites", "inventory", "purchase", "combined", "dashboards", "care"]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});

test("primary navigation and CTAs lead to the right places", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Hauptnavigation" }).first();
  for (const [label, path] of [
    ["Leistungen", "/leistungen"],
    ["Referenzen", "/referenzen"],
    ["Preise", "/preise"],
    ["Über mich", "/ueber-mich"],
    ["Kontakt", "/kontakt"],
  ]) {
    await page.goto("/");
    await nav.getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }

  await page.goto("/");
  await page.getByRole("link", { name: "Preis berechnen" }).first().click();
  await expect(page).toHaveURL(/\/preise#preisrechner$/);

  await page.goto("/");
  await page.getByRole("link", { name: "Projektpreis berechnen" }).first().click();
  await expect(page).toHaveURL(/\/preise#preisrechner$/);

  await page.goto("/");
  await page.getByRole("link", { name: "Referenzen ansehen" }).click();
  await expect(page).toHaveURL(/\/referenzen$/);
});

test("language switch maps to the equivalent page", async ({ page }) => {
  await page.goto("/referenzen/hf-eautos");
  await page.getByRole("link", { name: /Sprache wählen: English/ }).click();
  await expect(page).toHaveURL(/\/en\/work\/hf-eautos$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("link", { name: /Choose language: Deutsch/ }).click();
  await expect(page).toHaveURL(/\/referenzen\/hf-eautos$/);
});

test("unknown URLs return 404", async ({ request }) => {
  expect((await request.get("/referenzen/gibt-es-nicht")).status()).toBe(404);
  expect((await request.get("/gibt-es-nicht")).status()).toBe(404);
});
