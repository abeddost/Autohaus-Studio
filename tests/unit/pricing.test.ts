import { describe, expect, it } from "vitest";
import { calculateQuote } from "@/lib/pricing/engine";
import {
  EMPTY_SELECTION,
  decodeSelection,
  encodeSelection,
  normalizeSelection,
  type Selection,
} from "@/lib/pricing/selection";
import { formatEuro, formatMonthly } from "@/lib/format";

const sel = (patch: Partial<Selection>): Selection => ({ ...EMPTY_SELECTION, ...patch });

describe("brief calculation examples", () => {
  it("1. Präsenz without care: 2.490 € setup, no monthly agency charge", () => {
    const q = calculateQuote(sel({ projectType: "praesenz", operation: "self" }));
    expect(q.setupCents).toBe(249000);
    expect(q.monthly.kind).toBe("self");
    expect(q.monthly.cents).toBeNull();
  });

  it("2. Showroom standard: 4.900 € setup, 249 €/Monat", () => {
    const q = calculateQuote(sel({ projectType: "showroom" }));
    expect(q.setupCents).toBe(490000);
    expect(q.monthly.cents).toBe(24900);
    expect(q.monthly.required).toBe(true);
  });

  it("3. Showroom with 200 vehicles: 5.500 € setup, 299 €/Monat", () => {
    const q = calculateQuote(sel({ projectType: "showroom", vehicleTier: "vehicles_200" }));
    expect(q.setupCents).toBe(550000);
    expect(q.monthly.cents).toBe(29900);
  });

  it("4. Autoankauf + Local SEO: 5.150 € setup, 249 €/Monat", () => {
    const q = calculateQuote(sel({ projectType: "ankauf", localSeo: true }));
    expect(q.setupCents).toBe(515000);
    expect(q.monthly.cents).toBe(24900);
  });

  it("5. Komplett + one additional language (5 translated pages): 8.400 € setup, 399 €/Monat", () => {
    const q = calculateQuote(sel({ projectType: "komplett", language: true }));
    expect(q.setupCents).toBe(840000);
    expect(q.monthly.cents).toBe(39900);
  });

  it("6. Händlerplattform: no total, no monthly fee, discovery separately at 1.200 €", () => {
    const q = calculateQuote(sel({ projectType: "plattform", platformNeeds: ["branches", "crm"] }));
    expect(q.mode).toBe("platform");
    expect(q.setupCents).toBeNull();
    expect(q.monthly.cents).toBeNull();
    expect(q.monthly.kind).toBe("tbd");
    expect(q.discoveryCents).toBe(120000);
    expect(q.knownSubtotalCents).toBe(0);
    expect(q.lineItems).toHaveLength(0);
  });
});

describe("fixed package starting prices and care", () => {
  it.each([
    ["praesenz", 249000, 9900],
    ["showroom", 490000, 24900],
    ["ankauf", 450000, 24900],
    ["komplett", 750000, 39900],
  ] as const)("%s → %i setup, %i monthly", (projectType, setup, monthly) => {
    const q = calculateQuote(sel({ projectType }));
    expect(q.setupCents).toBe(setup);
    expect(q.monthly.cents).toBe(monthly);
  });

  it("Präsenz care is optional: managed = 99 €/Monat", () => {
    const q = calculateQuote(sel({ projectType: "praesenz", operation: "managed" }));
    expect(q.monthly).toMatchObject({ cents: 9900, kind: "managed", required: false, includedMinutes: 15 });
  });

  it("operating plans are required for agency-managed applications", () => {
    for (const projectType of ["showroom", "ankauf", "komplett"] as const) {
      const q = calculateQuote(sel({ projectType, operation: "self" }));
      expect(q.monthly.kind).toBe("managed");
      expect(q.monthly.required).toBe(true);
    }
  });

  it("included minutes per plan", () => {
    expect(calculateQuote(sel({ projectType: "showroom" })).monthly.includedMinutes).toBe(30);
    expect(calculateQuote(sel({ projectType: "ankauf" })).monthly.includedMinutes).toBe(30);
    expect(calculateQuote(sel({ projectType: "komplett" })).monthly.includedMinutes).toBe(45);
  });
});

describe("add-ons and dependencies", () => {
  it("prices each add-on once at its configured amount", () => {
    const q = calculateQuote(
      sel({
        projectType: "praesenz",
        extraPages: 2,
        copywritingPages: 3,
        landingPages: 1,
        appointments: "request",
        headlessCms: true,
        operation: "self",
      }),
    );
    // 2490 + 2×250 + 3×250 + 850 + 450 + 1200
    expect(q.setupCents).toBe(249000 + 50000 + 75000 + 85000 + 45000 + 120000);
    const ids = q.lineItems.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("appointment request and booking integration are mutually exclusive", () => {
    const q = calculateQuote(sel({ projectType: "ankauf", appointments: "booking" }));
    const ids = q.lineItems.map((i) => i.id);
    expect(ids).toContain("booking_integration");
    expect(ids).not.toContain("appointment_request");
    expect(q.setupCents).toBe(450000 + 120000);
    expect(q.externalCosts.map((c) => c.id)).toContain("booking_subscription");
  });

  it("translated pages require the language add-on and are capped by page count", () => {
    expect(normalizeSelection(sel({ projectType: "praesenz", extraTranslatedPages: 3 })).extraTranslatedPages).toBe(0);
    // 5 included + 2 extra = 7 pages → max 2 translated pages beyond the first five
    const n = normalizeSelection(sel({ projectType: "praesenz", language: true, extraPages: 2, extraTranslatedPages: 9 }));
    expect(n.extraTranslatedPages).toBe(2);
    expect(calculateQuote(n).setupCents).toBe(249000 + 50000 + 90000 + 24000);
  });

  it("copywriting cannot exceed the number of content pages", () => {
    expect(normalizeSelection(sel({ projectType: "komplett", copywritingPages: 30 })).copywritingPages).toBe(7);
  });

  it("does not charge for included features (Ankauf form, enquiry admin, vehicle stock)", () => {
    for (const projectType of ["ankauf", "komplett", "showroom"] as const) {
      const q = calculateQuote(sel({ projectType }));
      expect(q.lineItems).toHaveLength(1);
      expect(q.lineItems[0].id).toBe(`package:${projectType}`);
    }
  });

  it("vehicle tiers only apply to packages that have them", () => {
    expect(normalizeSelection(sel({ projectType: "ankauf", vehicleTier: "vehicles_200" })).vehicleTier).toBeNull();
    expect(normalizeSelection(sel({ projectType: "komplett", vehicleTier: "vehicles_200" })).vehicleTier).toBe(
      "vehicles_100",
    );
  });

  it("quote triggers that do not apply to a package are dropped", () => {
    const n = normalizeSelection(sel({ projectType: "praesenz", quoteRequirements: ["crm", "extra_branches"] }));
    expect(n.quoteRequirements).toEqual(["extra_branches"]);
  });
});

describe("individual quotation states", () => {
  it("Komplett above 100 vehicles requires confirmation and has no automatic total", () => {
    const q = calculateQuote(sel({ projectType: "komplett", vehicleTier: "vehicles_more" }));
    expect(q.mode).toBe("quote");
    expect(q.setupCents).toBeNull();
    expect(q.knownSubtotalCents).toBe(750000);
    expect(q.monthly.provisional).toBe(true);
  });

  it("Showroom above 200 vehicles requires confirmation", () => {
    const q = calculateQuote(sel({ projectType: "showroom", vehicleTier: "vehicles_more" }));
    expect(q.needsQuote).toBe(true);
    expect(q.setupCents).toBeNull();
  });

  it.each(["extra_branches", "crm", "extra_feeds", "complex_roles", "custom_workflows", "more_languages"] as const)(
    "%s triggers an individual quotation on Komplett",
    (req) => {
      const q = calculateQuote(sel({ projectType: "komplett", localSeo: true, quoteRequirements: [req, req] }));
      expect(q.setupCents).toBeNull();
      expect(q.knownSubtotalCents).toBe(750000 + 65000);
      expect(q.quoteReasons).toHaveLength(1);
    },
  );
});

describe("selection handling", () => {
  it("plattform ignores standard add-ons", () => {
    const n = normalizeSelection(sel({ projectType: "plattform", extraPages: 5, localSeo: true }));
    expect(n.extraPages).toBe(0);
    expect(n.localSeo).toBe(false);
  });

  it("normalize is idempotent", () => {
    const s = sel({ projectType: "showroom", language: true, extraTranslatedPages: 40 as number, copywritingPages: 9 });
    const once = normalizeSelection(s);
    expect(normalizeSelection(once)).toEqual(once);
  });

  it("encode/decode round-trips and rejects garbage", () => {
    const s = normalizeSelection(sel({ projectType: "komplett", language: true, appointments: "request" }));
    expect(decodeSelection(encodeSelection(s))).toEqual(s);
    expect(decodeSelection("not-base64!!")).toBeNull();
    expect(decodeSelection(btoa(JSON.stringify({ v: 2 })))).toBeNull();
  });

  it("empty selection yields an empty quote", () => {
    const q = calculateQuote(EMPTY_SELECTION);
    expect(q.mode).toBe("empty");
    expect(q.setupCents).toBeNull();
  });
});

describe("German number formatting", () => {
  it("formats cents as euros", () => {
    expect(formatEuro(249000, "de")).toBe("2.490\u00a0€");
    expect(formatEuro(840000, "de")).toBe("8.400\u00a0€");
    expect(formatMonthly(24900, "de")).toBe("249\u00a0€/Monat");
    expect(formatEuro(249000, "en")).toBe("€2,490");
  });
});
