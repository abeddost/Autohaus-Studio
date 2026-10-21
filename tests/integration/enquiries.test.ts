import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq, sql } from "drizzle-orm";
import { getDb, resetDbForTests, type Db } from "@/lib/db/client";
import { enquiries, notifications, submissionAttempts } from "@/lib/db/schema";
import { handleEnquiryRequest } from "@/lib/enquiries/handler";
import { processDueNotifications } from "@/lib/enquiries/service";
import { issueFormToken } from "@/lib/security/formToken";
import { EMPTY_SELECTION, encodeSelection } from "@/lib/pricing/selection";

const ORIGIN = "http://localhost:3000";
let db: Db;
let ipCounter = 0;

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    name: "Erika Beispiel",
    company: "Beispiel Automobile",
    email: "erika@example.com",
    phone: "",
    website: "beispiel-automobile.de",
    message: "Wir möchten unseren Bestand auf der eigenen Website zeigen.",
    contactMethod: "email",
    nextStep: "intro",
    projectRef: "",
    locale: "de",
    config: encodeSelection({ ...EMPTY_SELECTION, projectType: "ankauf", localSeo: true }),
    token: issueFormToken(Date.now() - 10_000),
    fax: "",
    ...overrides,
  };
}

function request(body: unknown, headers: Record<string, string> = {}) {
  ipCounter += 1;
  return new Request(`${ORIGIN}/api/enquiries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: ORIGIN,
      Host: "localhost:3000",
      "X-Forwarded-For": `203.0.113.${ipCounter}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function configureResend() {
  vi.stubEnv("EMAIL_PROVIDER", "resend");
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("EMAIL_FROM", "Website <anfragen@example.com>");
  vi.stubEnv("CONTACT_RECIPIENT", "inbox@example.com");
}

beforeAll(async () => {
  vi.stubEnv("PGLITE_DIR", "memory://");
  vi.stubEnv("FORM_SECRET", "integration-test-secret-1234567890");
  resetDbForTests();
  db = await getDb();
});

beforeEach(async () => {
  await db.delete(notifications);
  await db.delete(enquiries);
  await db.delete(submissionAttempts);
  vi.stubEnv("EMAIL_PROVIDER", "none");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("enquiry persistence", () => {
  it("stores the enquiry with a server-side recalculated quote, ignoring client totals", async () => {
    const res = await handleEnquiryRequest(request(validBody({ setupCents: 1, monthlyCents: 0 })));
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data).toMatchObject({ ok: true, notification: "not_configured" });
    expect(data.reference).toMatch(/^AW-\d{8}-[0-9A-F]{6}$/);

    const [row] = await db.select().from(enquiries).where(eq(enquiries.reference, data.reference));
    expect(row.company).toBe("Beispiel Automobile");
    expect(row.website).toBe("https://beispiel-automobile.de");
    expect(row.setupCents).toBe(515000); // Autoankauf 4.500 € + Local SEO 650 €
    expect(row.monthlyCents).toBe(24900);
    expect(row.needsQuote).toBe(false);

    const [note] = await db.select().from(notifications).where(eq(notifications.enquiryId, row.id));
    expect(note.status).toBe("pending");
    expect(note.lastError).toContain("EMAIL_PROVIDER");
  });

  it("stores platform enquiries without an invented total", async () => {
    const config = encodeSelection({ ...EMPTY_SELECTION, projectType: "plattform", platformNeeds: ["branches", "crm"] });
    const res = await handleEnquiryRequest(request(validBody({ config, nextStep: "discovery" })));
    const { reference } = await res.json();
    const [row] = await db.select().from(enquiries).where(eq(enquiries.reference, reference));
    expect(row.setupCents).toBeNull();
    expect(row.monthlyCents).toBeNull();
    expect(row.needsQuote).toBe(true);
    expect((row.quote as { discoveryCents: number }).discoveryCents).toBe(120000);
  });

  it("accepts enquiries without a calculator configuration", async () => {
    const res = await handleEnquiryRequest(request(validBody({ config: "" })));
    expect(res.status).toBe(201);
  });
});

describe("email notification", () => {
  it("sends through the configured provider after storing", async () => {
    configureResend();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "msg_1" }), { status: 200 }));
    const res = await handleEnquiryRequest(request(validBody()));
    const data = await res.json();
    expect(data.notification).toBe("sent");

    const [call] = fetchMock.mock.calls;
    expect(String(call[0])).toBe("https://api.resend.com/emails");
    const sent = JSON.parse(String((call[1] as RequestInit).body));
    expect(sent.to).toEqual(["inbox@example.com"]);
    expect(sent.reply_to).toBe("erika@example.com");
    expect(sent.text).toContain("Geschätzte Einrichtung: 5.150");

    const [note] = await db.select().from(notifications);
    expect(note).toMatchObject({ status: "sent", attempts: 1, providerMessageId: "msg_1" });
  });

  it("keeps the enquiry when email delivery fails and retries later", async () => {
    configureResend();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream down", { status: 503 }));
    const res = await handleEnquiryRequest(request(validBody()));
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.notification).toBe("queued");

    const [stored] = await db.select().from(enquiries);
    expect(stored.reference).toBe(data.reference);
    let [note] = await db.select().from(notifications);
    expect(note).toMatchObject({ status: "pending", attempts: 1 });
    expect(note.lastError).toContain("HTTP 503");

    // Make it due and let the retry job deliver it.
    await db.update(notifications).set({ nextAttemptAt: sql`now() - interval '1 minute'` });
    vi.restoreAllMocks();
    configureResend();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ id: "msg_2" }), { status: 200 }));
    const result = await processDueNotifications(db);
    expect(result).toMatchObject({ processed: 1, sent: 1 });
    [note] = await db.select().from(notifications);
    expect(note).toMatchObject({ status: "sent", attempts: 2 });
  });

  it("marks non-retryable provider errors as failed", async () => {
    configureResend();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("invalid from address", { status: 422 }));
    await handleEnquiryRequest(request(validBody()));
    const [note] = await db.select().from(notifications);
    expect(note.status).toBe("failed");
    expect(await db.select().from(enquiries)).toHaveLength(1);
  });
});

describe("protection", () => {
  it("rejects cross-origin posts", async () => {
    const res = await handleEnquiryRequest(request(validBody(), { Origin: "https://evil.example" }));
    expect(res.status).toBe(403);
  });

  it("rejects filled honeypots without storing", async () => {
    const res = await handleEnquiryRequest(request(validBody({ fax: "http://spam" })));
    expect(res.status).toBe(422);
    expect((await res.json()).code).toBe("spam");
    expect(await db.select().from(enquiries)).toHaveLength(0);
  });

  it("rejects submissions faster than the minimum fill time", async () => {
    const res = await handleEnquiryRequest(request(validBody({ token: issueFormToken(Date.now()) })));
    expect((await res.json()).code).toBe("too_fast");
  });

  it("rejects forged tokens", async () => {
    const res = await handleEnquiryRequest(request(validBody({ token: `${Date.now() - 10_000}.forged` })));
    expect(res.status).toBe(422);
  });

  it("returns field errors for invalid input", async () => {
    const res = await handleEnquiryRequest(request(validBody({ email: "nope", message: "kurz", contactMethod: "phone", phone: "" })));
    const data = await res.json();
    expect(res.status).toBe(422);
    expect(data.fields).toMatchObject({ email: "email", message: "message", phone: "phoneRequired" });
  });

  it("rate-limits repeated submissions from one address", async () => {
    const headers = { "X-Forwarded-For": "198.51.100.7" };
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) {
      const res = await handleEnquiryRequest(request(validBody(), headers));
      statuses.push(res.status);
    }
    expect(statuses.slice(0, 8).every((s) => s === 201)).toBe(true);
    expect(statuses[8]).toBe(429);
  });

  it("answers 503 honestly when no database is configured in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PGLITE_DIR", "");
    delete process.env.PGLITE_DIR;
    resetDbForTests();
    const res = await handleEnquiryRequest(request(validBody()));
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe("unavailable");
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("PGLITE_DIR", "memory://");
    resetDbForTests();
    db = await getDb();
  });
});
