import type { Locale } from "@/config/pricing";

export type RouteKey = "home" | "services" | "pricing" | "work" | "about" | "contact" | "imprint" | "privacy";

export const ROUTES: Record<RouteKey, Record<Locale, string>> = {
  home: { de: "/", en: "/en" },
  services: { de: "/leistungen", en: "/en/services" },
  pricing: { de: "/preise", en: "/en/pricing" },
  work: { de: "/referenzen", en: "/en/work" },
  about: { de: "/ueber-mich", en: "/en/about" },
  contact: { de: "/kontakt", en: "/en/contact" },
  imprint: { de: "/impressum", en: "/en/legal-notice" },
  privacy: { de: "/datenschutz", en: "/en/privacy" },
};

export const NAV_KEYS: RouteKey[] = ["services", "work", "pricing", "about", "contact"];

export function href(key: RouteKey, locale: Locale): string {
  return ROUTES[key][locale];
}

export function projectHref(slug: string, locale: Locale): string {
  return `${ROUTES.work[locale]}/${slug}`;
}

export const CALCULATOR_ANCHOR = "preisrechner";

export function calculatorHref(locale: Locale, projectType?: string): string {
  const query = projectType ? `?typ=${projectType}` : "";
  return `${ROUTES.pricing[locale]}${query}#${CALCULATOR_ANCHOR}`;
}

export function contactHref(locale: Locale, params?: Record<string, string>): string {
  const query = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : "";
  return `${ROUTES.contact[locale]}${query}`;
}

/** Maps a pathname to its equivalent in the other language (for the switcher and hreflang). */
export function translatePath(pathname: string, target: Locale): string {
  const clean = pathname.replace(/\/$/, "") || "/";
  for (const key of Object.keys(ROUTES) as RouteKey[]) {
    for (const from of ["de", "en"] as Locale[]) {
      const base = ROUTES[key][from];
      if (clean === base) return ROUTES[key][target];
      if (key === "work" && clean.startsWith(`${base}/`)) {
        return `${ROUTES.work[target]}${clean.slice(base.length)}`;
      }
    }
  }
  return ROUTES.home[target];
}

export function localeFromPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "de";
}
