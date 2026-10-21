import { expect, type Page } from "@playwright/test";

export const DE_PAGES = ["/", "/leistungen", "/preise", "/referenzen", "/ueber-mich", "/kontakt", "/impressum", "/datenschutz"];
export const EN_PAGES = ["/en", "/en/services", "/en/pricing", "/en/work", "/en/about", "/en/contact", "/en/legal-notice", "/en/privacy"];
export const PROJECT_SLUGS = ["autohaus-bodenheim", "meinautoverkauf", "hf-eautos"];
export const ALL_PAGES = [
  ...DE_PAGES,
  ...EN_PAGES,
  ...PROJECT_SLUGS.map((s) => `/referenzen/${s}`),
  ...PROJECT_SLUGS.map((s) => `/en/work/${s}`),
];

/** Euro amount regex tolerant to the non-breaking space Intl inserts. */
export const euro = (amount: string) => new RegExp(`${amount.replace(".", "\\.")}\\s€`);

export async function openCalculator(page: Page) {
  await page.goto("/preise#preisrechner");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByRole("heading", { name: "Projektart", level: 3 })).toBeVisible();
}

export function summary(page: Page) {
  return page.getByRole("complementary", { name: "Ihre Auswahl" });
}

export async function chooseType(page: Page, name: RegExp) {
  await page.getByRole("radio", { name }).check({ force: true });
}

export async function next(page: Page) {
  await page.getByRole("button", { name: /^Weiter:/ }).click();
}
