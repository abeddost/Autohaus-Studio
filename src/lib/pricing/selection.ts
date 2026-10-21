import { z } from "zod";
import {
  ADDONS,
  FIXED_PACKAGES,
  LANGUAGE_INCLUDED_PAGES,
  PACKAGE_ORDER,
  PLATFORM_PACKAGE,
  QUOTE_TRIGGERS,
  type FixedPackageId,
  type PackageId,
  type PlatformNeedId,
  type QuoteTriggerId,
} from "@/config/pricing";

const count = (max: number) => z.int().min(0).max(max);

const QUOTE_TRIGGER_IDS = Object.keys(QUOTE_TRIGGERS) as [QuoteTriggerId, ...QuoteTriggerId[]];
const PLATFORM_NEED_IDS = PLATFORM_PACKAGE.possibleFeatures.map((f) => f.id) as [PlatformNeedId, ...PlatformNeedId[]];

export const selectionSchema = z.object({
  v: z.literal(1),
  projectType: z.enum(PACKAGE_ORDER as [PackageId, ...PackageId[]]).nullable(),
  extraPages: count(ADDONS.extra_page.max!),
  language: z.boolean(),
  extraTranslatedPages: count(ADDONS.extra_translated_page.max!),
  copywritingPages: count(ADDONS.copywriting.max!),
  localSeo: z.boolean(),
  landingPages: count(ADDONS.landing_page.max!),
  appointments: z.enum(["none", "request", "booking"]),
  headlessCms: z.boolean(),
  vehicleTier: z.string().max(40).nullable(),
  quoteRequirements: z.array(z.enum(QUOTE_TRIGGER_IDS)).max(QUOTE_TRIGGER_IDS.length * 2),
  operation: z.enum(["managed", "self"]),
  platformNeeds: z.array(z.enum(PLATFORM_NEED_IDS)).max(PLATFORM_NEED_IDS.length * 2),
});

export type Selection = z.infer<typeof selectionSchema>;

export const EMPTY_SELECTION: Selection = {
  v: 1,
  projectType: null,
  extraPages: 0,
  language: false,
  extraTranslatedPages: 0,
  copywritingPages: 0,
  localSeo: false,
  landingPages: 0,
  appointments: "none",
  headlessCms: false,
  vehicleTier: null,
  quoteRequirements: [],
  operation: "managed",
  platformNeeds: [],
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const unique = <T,>(items: T[]) => Array.from(new Set(items));

export function totalContentPages(packageId: FixedPackageId, extraPages: number) {
  return FIXED_PACKAGES[packageId].includedPages + extraPages;
}

/**
 * Removes options that do not apply to the chosen package and enforces all
 * dependencies, so that an invalid or duplicate combination cannot be priced.
 * Idempotent: normalize(normalize(x)) === normalize(x).
 */
export function normalizeSelection(input: Selection): Selection {
  const s: Selection = { ...input };

  if (s.projectType === null) {
    return { ...EMPTY_SELECTION };
  }

  if (s.projectType === "plattform") {
    return {
      ...EMPTY_SELECTION,
      projectType: "plattform",
      platformNeeds: unique(s.platformNeeds),
    };
  }

  const pkg = FIXED_PACKAGES[s.projectType];
  const allowed = new Set(pkg.addons);

  s.extraPages = allowed.has("extra_page") ? clamp(s.extraPages, 0, ADDONS.extra_page.max!) : 0;
  const pages = totalContentPages(pkg.id, s.extraPages);

  s.language = allowed.has("language") ? s.language : false;
  s.extraTranslatedPages =
    s.language && allowed.has("extra_translated_page")
      ? clamp(s.extraTranslatedPages, 0, Math.max(0, pages - LANGUAGE_INCLUDED_PAGES))
      : 0;

  s.copywritingPages = allowed.has("copywriting") ? clamp(s.copywritingPages, 0, pages) : 0;
  s.localSeo = allowed.has("local_seo") ? s.localSeo : false;
  s.landingPages = allowed.has("landing_page") ? clamp(s.landingPages, 0, ADDONS.landing_page.max!) : 0;
  s.headlessCms = allowed.has("headless_cms") ? s.headlessCms : false;

  if (s.appointments === "request" && !allowed.has("appointment_request")) s.appointments = "none";
  if (s.appointments === "booking" && !allowed.has("booking_integration")) s.appointments = "none";

  const tiers = pkg.vehicleTiers;
  s.vehicleTier = tiers ? (tiers.some((t) => t.id === s.vehicleTier) ? s.vehicleTier : tiers[0].id) : null;

  const triggers = new Set(pkg.quoteTriggers);
  s.quoteRequirements = unique(s.quoteRequirements).filter((id) => triggers.has(id));

  s.operation = pkg.care.required ? "managed" : s.operation;
  s.platformNeeds = [];

  return s;
}

/** Lenient parse for persisted/URL state: falls back to an empty selection. */
export function parseSelection(value: unknown): Selection {
  const parsed = selectionSchema.safeParse(value);
  return parsed.success ? normalizeSelection(parsed.data) : { ...EMPTY_SELECTION };
}

export function encodeSelection(selection: Selection): string {
  const json = JSON.stringify(normalizeSelection(selection));
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeSelection(encoded: string | null | undefined): Selection | null {
  if (!encoded || encoded.length > 4000) return null;
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64 + "===".slice((b64.length + 3) % 4));
    const parsed = selectionSchema.safeParse(JSON.parse(json));
    return parsed.success ? normalizeSelection(parsed.data) : null;
  } catch {
    return null;
  }
}
