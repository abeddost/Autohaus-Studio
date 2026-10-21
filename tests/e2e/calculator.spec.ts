import { expect, test } from "@playwright/test";
import { chooseType, euro, next, openCalculator, summary } from "./helpers";

test.describe("calculator examples from the brief", () => {
  test("1 · Präsenz without care: 2.490 €, no monthly agency charge", async ({ page }) => {
    await openCalculator(page);
    await chooseType(page, /Autohaus vorstellen/);
    await next(page);
    await next(page);
    await page.getByRole("radio", { name: /Eigenbetrieb/ }).check({ force: true });
    await expect(summary(page)).toContainText(euro("2.490"));
    await expect(summary(page)).toContainText("kein laufendes Entgelt an uns");
    await expect(page.getByText(/kümmern Sie sich selbst/)).toBeVisible();
  });

  test("Präsenz with optional care: 99 €/Monat", async ({ page }) => {
    await openCalculator(page);
    await chooseType(page, /Autohaus vorstellen/);
    await expect(summary(page)).toContainText(/99\s€\/Monat/);
  });

  test("2 · Showroom standard: 4.900 € and 249 €/Monat (required)", async ({ page }) => {
    await openCalculator(page);
    await chooseType(page, /Fahrzeuge präsentieren/);
    await expect(summary(page)).toContainText(euro("4.900"));
    await expect(summary(page)).toContainText(/249\s€\/Monat/);
    await next(page);
    await next(page);
    await expect(page.getByText(/passende Betriebspaket erforderlich/)).toBeVisible();
    await expect(page.getByRole("radio", { name: /Eigenbetrieb/ })).toHaveCount(0);
  });

  test("3 · Showroom with 200 vehicles: 5.500 € and 299 €/Monat", async ({ page }) => {
    await openCalculator(page);
    await chooseType(page, /Fahrzeuge präsentieren/);
    await next(page);
    await page.getByRole("radio", { name: /Bis zu 200 Fahrzeuge/ }).check({ force: true });
    await expect(summary(page)).toContainText(euro("5.500"));
    await expect(summary(page)).toContainText(/299\s€\/Monat/);
  });

  test("4 · Autoankauf + Local SEO: 5.150 € and 249 €/Monat", async ({ page }) => {
    await openCalculator(page);
    await chooseType(page, /Autoankauf-Anfragen gewinnen/);
    await next(page);
    await page.getByRole("checkbox", { name: /Lokale SEO-Einrichtung/ }).check({ force: true });
    await expect(summary(page)).toContainText(euro("5.150"));
    await expect(summary(page)).toContainText(/249\s€\/Monat/);
  });

  test("5 · Komplett + one additional language: 8.400 € and 399 €/Monat", async ({ page }) => {
    await openCalculator(page);
    await chooseType(page, /Fahrzeuge verkaufen und ankaufen/);
    await next(page);
    await page.getByRole("checkbox", { name: /^Zusätzliche Sprache/ }).check({ force: true });
    await expect(summary(page)).toContainText(euro("8.400"));
    await expect(summary(page)).toContainText(/399\s€\/Monat/);
  });

  test("6 · Händlerplattform: no invented total, discovery shown separately", async ({ page }) => {
    await openCalculator(page);
    await chooseType(page, /Individuelle Plattform/);
    const s = summary(page);
    await expect(s).toContainText("Individuelles Angebot erforderlich.");
    await expect(s).toContainText("nach Analyse");
    await expect(s).toContainText(euro("1.200"));
    await expect(s).toContainText("Anforderungsanalyse (separat, einmalig)");
    await expect(s).not.toContainText("Geschätzte Einrichtung€");
  });
});

test("larger stock and extra requirements switch to an individual quotation", async ({ page }) => {
  await openCalculator(page);
  await chooseType(page, /Fahrzeuge verkaufen und ankaufen/);
  await next(page);
  await page.getByRole("radio", { name: /Mehr als 100 Fahrzeuge/ }).check({ force: true });
  await expect(summary(page)).toContainText("Individuelles Angebot erforderlich.");
  await expect(summary(page)).toContainText(/Zwischensumme bekannter Standardkomponenten/);
  await expect(summary(page)).toContainText(euro("7.500"));
});

test("appointment options are mutually exclusive", async ({ page }) => {
  await openCalculator(page);
  await chooseType(page, /Autohaus vorstellen/);
  await next(page);
  await page.getByRole("radio", { name: /Terminanfrage-Formular/ }).check({ force: true });
  await expect(summary(page)).toContainText(euro("2.940"));
  await page.getByRole("radio", { name: /Anbindung eines Buchungsdienstes/ }).check({ force: true });
  await expect(summary(page)).toContainText(euro("3.690"));
  await expect(summary(page)).not.toContainText("Terminanfrage-Formular");
  await expect(summary(page)).toContainText("Abonnement des externen Buchungsdienstes");
});

test("keyboard-only operation", async ({ page }) => {
  await openCalculator(page);
  await page.getByRole("radio", { name: /Autohaus vorstellen/ }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight"); // → Fahrzeuge präsentieren
  await expect(page.getByRole("radio", { name: /Fahrzeuge präsentieren/ })).toBeChecked();
  await page.keyboard.press("Tab"); // Zurücksetzen
  await page.keyboard.press("Tab"); // Weiter
  await expect(page.getByRole("button", { name: /^Weiter: Umfang/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Umfang & Extras", level: 3 })).toBeFocused();
  await expect(summary(page)).toContainText(euro("4.900"));
});

test("selections persist across reload and backwards navigation; reset clears them", async ({ page }) => {
  await openCalculator(page);
  await chooseType(page, /Fahrzeuge präsentieren/);
  await next(page);
  await page.getByRole("radio", { name: /Bis zu 200 Fahrzeuge/ }).check({ force: true });
  await next(page);
  await page.getByRole("button", { name: "Zurück", exact: true }).click();
  await expect(page.getByRole("radio", { name: /Bis zu 200 Fahrzeuge/ })).toBeChecked();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Umfang & Extras", level: 3 })).toBeVisible();
  await expect(summary(page)).toContainText(euro("5.500"));

  await page.getByRole("button", { name: "Zurücksetzen" }).click();
  await expect(summary(page)).toContainText("Wählen Sie eine Projektart");
  await expect(page.getByRole("heading", { name: "Projektart", level: 3 })).toBeVisible();
});

test("prices are visible before any contact details are requested", async ({ page }) => {
  await openCalculator(page);
  await expect(page.getByText(/ab\s2\.490\s€/).first()).toBeVisible();
  await expect(page.getByLabel("E-Mail-Adresse")).toHaveCount(0);
});

test("homepage teaser preselects the project type", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.getByRole("link", { name: /Autoankauf-Anfragen gewinnen/ }).first().click();
  await expect(page).toHaveURL(/typ=ankauf/);
  await expect(page.getByRole("radio", { name: /Autoankauf-Anfragen gewinnen/ })).toBeChecked();
  await expect(summary(page)).toContainText(euro("4.500"));
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("no horizontal scroll and the summary bar never covers step navigation", async ({ page }) => {
    for (const path of ["/", "/preise", "/referenzen", "/kontakt", "/en/pricing"]) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, path).toBeLessThanOrEqual(0);
    }

    await openCalculator(page);
    await chooseType(page, /Fahrzeuge präsentieren/);
    const bar = summary(page);
    await expect(bar).toBeVisible();
    await expect(bar).toContainText(euro("4.900"));

    const nextButton = page.getByRole("button", { name: /^Weiter: Umfang/ });
    await nextButton.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await nextButton.scrollIntoViewIfNeeded();
    const hit = await nextButton.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const target = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return target === el || el.contains(target);
    });
    expect(hit).toBe(true);

    await bar.getByRole("button", { name: "Details" }).click();
    await expect(bar.getByText("Positionen", { exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(bar.getByText("Positionen", { exact: true })).toBeHidden();
  });
});
