import { expect, test } from "@playwright/test";
import { chooseType, euro, next, openCalculator, summary } from "./helpers";

test("configuration is transferred into the enquiry and the enquiry is stored", async ({ page }) => {
  await openCalculator(page);
  await chooseType(page, /Fahrzeuge verkaufen und ankaufen/);
  await next(page);
  await page.getByRole("checkbox", { name: /^Zusätzliche Sprache/ }).check({ force: true });
  await expect(summary(page)).toContainText(euro("8.400"));
  await summary(page).getByRole("link", { name: "Konfiguration anfragen" }).click();

  await expect(page).toHaveURL(/\/kontakt\?config=/);
  const config = page.getByRole("complementary", { name: "Ihre Konfiguration" });
  await expect(config).toContainText("Autohaus Komplett");
  await expect(config).toContainText(euro("8.400"));

  await page.getByLabel(/^Name/).fill("Erika Beispiel");
  await page.getByLabel(/^Betrieb \/ Firma/).fill("Beispiel Automobile");
  await page.getByLabel(/^E-Mail-Adresse/).fill("erika@example.com");
  await page.getByLabel(/^Projektbeschreibung/).fill("Wir möchten Verkauf und Ankauf auf einer Website bündeln.");
  await page.getByRole("radio", { name: "E-Mail" }).check();
  await page.waitForTimeout(3200); // minimum fill time of the spam protection

  const responsePromise = page.waitForResponse((r) => r.url().endsWith("/api/enquiries") && r.request().method() === "POST");
  await page.getByRole("button", { name: "Anfrage senden" }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(201);
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(body.reference).toMatch(/^AW-/);
  // No email provider is configured in this environment – reported honestly, not as "sent".
  expect(body.notification).toBe("not_configured");

  await expect(page.getByRole("heading", { name: /Ihre Anfrage ist eingegangen/ })).toBeVisible();
  await expect(page.getByText(body.reference)).toBeVisible();
});

test("invalid input shows an accessible error summary and nothing is sent", async ({ page }) => {
  let posted = false;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/enquiries") && r.method() === "POST") posted = true;
  });
  await page.goto("/kontakt");
  await page.getByRole("button", { name: "Anfrage senden" }).click();
  const alert = page.getByRole("alert").filter({ hasText: "Bitte prüfen" });
  await expect(alert).toBeFocused();
  await expect(alert).toContainText("Bitte prüfen Sie die markierten Felder.");
  await expect(page.getByLabel(/^Name/)).toHaveAttribute("aria-invalid", "true");
  expect(posted).toBe(false);
});

test("discovery request explains the paid phase and no option is preselected", async ({ page }) => {
  await page.goto("/kontakt");
  await expect(page.getByRole("radio", { name: /Kennenlerngespräch/ })).not.toBeChecked();
  await expect(page.getByRole("radio", { name: /Anforderungsanalyse/ })).not.toBeChecked();
  await expect(page.getByRole("checkbox")).toHaveCount(0); // no marketing consent checkbox
  await page.getByRole("radio", { name: /Anforderungsanalyse/ }).check();
  await expect(page.getByText(/1\.200 € netto zzgl\. USt\. und wird bei Beauftragung/)).toBeVisible();
});

test("API rejects cross-origin and premature submissions", async ({ request }) => {
  const cross = await request.post("/api/enquiries", {
    headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
    data: {},
  });
  expect(cross.status()).toBe(403);

  const { token } = await (await request.get("/api/enquiries/token")).json();
  const early = await request.post("/api/enquiries", {
    headers: { Origin: "http://localhost:3200", "Content-Type": "application/json" },
    data: { token },
  });
  expect((await early.json()).code).toBe("too_fast");
});

test("notification retry endpoint is protected", async ({ request }) => {
  expect((await request.get("/api/cron/notifications")).status()).toBe(401);
  const ok = await request.get("/api/cron/notifications", { headers: { Authorization: "Bearer e2e-cron-secret-0123456789" } });
  expect(ok.status()).toBe(200);
  expect((await ok.json()).ok).toBe(true);
});
