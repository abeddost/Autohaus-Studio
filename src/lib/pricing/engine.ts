import {
  ADDONS,
  DISCOVERY,
  EXTERNAL_COSTS,
  FIXED_PACKAGES,
  LANGUAGE_INCLUDED_PAGES,
  PLATFORM_PACKAGE,
  QUOTE_TRIGGERS,
  type AddonId,
  type ExternalCostId,
  type L10n,
  type PackageId,
} from "@/config/pricing";
import { normalizeSelection, type Selection } from "./selection";

export type LineItem = {
  id: string;
  label: L10n;
  quantity: number;
  unitCents: number;
  totalCents: number;
};

export type QuoteMode = "empty" | "fixed" | "quote" | "platform";

export type Quote = {
  mode: QuoteMode;
  packageId: PackageId | null;
  packageName: string | null;
  lineItems: LineItem[];
  /** Sum of all priced standard components. */
  knownSubtotalCents: number;
  /** Complete estimated one-time total – only when no individual confirmation is needed. */
  setupCents: number | null;
  monthly: {
    /** null: no fixed amount (platform) or no charge (self-operation). */
    cents: number | null;
    kind: "managed" | "self" | "tbd";
    required: boolean;
    includedMinutes: number | null;
    /** true when the monthly amount may change after review. */
    provisional: boolean;
  };
  includedScope: L10n[];
  excludedScope: L10n[];
  externalCosts: { id: ExternalCostId; label: L10n }[];
  needsQuote: boolean;
  quoteReasons: { id: string; label: L10n }[];
  /** Platform only: shown separately, never added to setup or monthly totals. */
  discoveryCents: number | null;
  platformNeeds: L10n[];
};

const EMPTY_QUOTE: Quote = {
  mode: "empty",
  packageId: null,
  packageName: null,
  lineItems: [],
  knownSubtotalCents: 0,
  setupCents: null,
  monthly: { cents: null, kind: "tbd", required: false, includedMinutes: null, provisional: false },
  includedScope: [],
  excludedScope: [],
  externalCosts: [],
  needsQuote: false,
  quoteReasons: [],
  discoveryCents: null,
  platformNeeds: [],
};

function addonItem(id: AddonId, quantity: number): LineItem | null {
  if (quantity <= 0) return null;
  const addon = ADDONS[id];
  return {
    id,
    label: addon.label,
    quantity,
    unitCents: addon.unitCents,
    totalCents: addon.unitCents * quantity,
  };
}

/**
 * Pure price calculation. Runs in the browser for the live summary and again
 * on the server before an enquiry is stored – client totals are never trusted.
 */
export function calculateQuote(input: Selection): Quote {
  const s = normalizeSelection(input);
  if (s.projectType === null) return EMPTY_QUOTE;

  if (s.projectType === "plattform") {
    const needs = PLATFORM_PACKAGE.possibleFeatures.filter((f) => s.platformNeeds.includes(f.id)).map((f) => f.label);
    return {
      ...EMPTY_QUOTE,
      mode: "platform",
      packageId: "plattform",
      packageName: PLATFORM_PACKAGE.name,
      needsQuote: true,
      quoteReasons: [
        {
          id: "platform",
          label: {
            de: "Umfang wird in der Anforderungsanalyse festgelegt",
            en: "Scope is defined in the discovery phase",
          },
        },
      ],
      discoveryCents: DISCOVERY.priceCents,
      platformNeeds: needs,
      externalCosts: (["mobilede_access", "legal_texts"] as const).map((id) => ({ id, label: EXTERNAL_COSTS[id] })),
    };
  }

  const pkg = FIXED_PACKAGES[s.projectType];
  const items: LineItem[] = [
    {
      id: `package:${pkg.id}`,
      label: { de: `${pkg.name} – Einrichtung`, en: `${pkg.name} – setup` },
      quantity: 1,
      unitCents: pkg.setupCents,
      totalCents: pkg.setupCents,
    },
  ];
  const quoteReasons: Quote["quoteReasons"] = [];
  let monthlyCents = pkg.care.monthlyCents;

  const tier = pkg.vehicleTiers?.find((t) => t.id === s.vehicleTier);
  if (tier && tier !== pkg.vehicleTiers![0]) {
    if (tier.requiresQuote) {
      quoteReasons.push({
        id: `tier:${tier.id}`,
        label: {
          de: `${tier.label.de} – individuelle Bestätigung erforderlich`,
          en: `${tier.label.en} – individual confirmation required`,
        },
      });
    } else {
      items.push({
        id: `tier:${tier.id}`,
        label: { de: `Erweiterung: ${tier.label.de}`, en: `Upgrade: ${tier.label.en}` },
        quantity: 1,
        unitCents: tier.setupDeltaCents,
        totalCents: tier.setupDeltaCents,
      });
      if (tier.monthlyCents !== undefined) monthlyCents = tier.monthlyCents;
    }
  }

  const appointmentAddon: AddonId | null =
    s.appointments === "request" ? "appointment_request" : s.appointments === "booking" ? "booking_integration" : null;

  const addonItems = [
    addonItem("extra_page", s.extraPages),
    addonItem("language", s.language ? 1 : 0),
    addonItem("extra_translated_page", s.extraTranslatedPages),
    addonItem("copywriting", s.copywritingPages),
    addonItem("local_seo", s.localSeo ? 1 : 0),
    addonItem("landing_page", s.landingPages),
    appointmentAddon ? addonItem(appointmentAddon, 1) : null,
    addonItem("headless_cms", s.headlessCms ? 1 : 0),
  ].filter((item): item is LineItem => item !== null);
  items.push(...addonItems);

  for (const id of s.quoteRequirements) {
    quoteReasons.push({ id: `req:${id}`, label: QUOTE_TRIGGERS[id] });
  }

  const externalIds = new Set<ExternalCostId>(pkg.externalCosts);
  for (const item of addonItems) {
    for (const id of ADDONS[item.id as AddonId].externalCosts ?? []) externalIds.add(id);
  }

  const knownSubtotalCents = items.reduce((sum, item) => sum + item.totalCents, 0);
  const needsQuote = quoteReasons.length > 0;
  const selfOperated = !pkg.care.required && s.operation === "self";

  const includedScope = [...pkg.includes];
  if (s.language) {
    includedScope.push({
      de: `Zweite Sprache: bis zu ${LANGUAGE_INCLUDED_PAGES} übersetzte Seiten${
        s.extraTranslatedPages ? ` + ${s.extraTranslatedPages} weitere` : ""
      }`,
      en: `Second language: up to ${LANGUAGE_INCLUDED_PAGES} translated pages${
        s.extraTranslatedPages ? ` + ${s.extraTranslatedPages} more` : ""
      }`,
    });
  }

  return {
    mode: needsQuote ? "quote" : "fixed",
    packageId: pkg.id,
    packageName: pkg.name,
    lineItems: items,
    knownSubtotalCents,
    setupCents: needsQuote ? null : knownSubtotalCents,
    monthly: selfOperated
      ? { cents: null, kind: "self", required: false, includedMinutes: null, provisional: false }
      : {
          cents: monthlyCents,
          kind: "managed",
          required: pkg.care.required,
          includedMinutes: pkg.care.includedMinutes,
          provisional: needsQuote,
        },
    includedScope,
    excludedScope: pkg.excludes,
    externalCosts: Array.from(externalIds).map((id) => ({ id, label: EXTERNAL_COSTS[id] })),
    needsQuote,
    quoteReasons,
    discoveryCents: null,
    platformNeeds: [],
  };
}

/** Starting price used on package cards: "ab 2.490 €". null for platform. */
export function startingSetupCents(id: PackageId): number | null {
  return id === "plattform" ? null : FIXED_PACKAGES[id].setupCents;
}
