import type { Locale } from "@/config/pricing";

const formatters: Record<Locale, Intl.NumberFormat> = {
  de: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
};

const precise: Record<Locale, Intl.NumberFormat> = {
  de: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }),
  en: new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }),
};

/** Formats integer cents as euros. Whole euros are shown without decimals ("2.490 €"). */
export function formatEuro(cents: number, locale: Locale = "de"): string {
  return cents % 100 === 0 ? formatters[locale].format(cents / 100) : precise[locale].format(cents / 100);
}

export function formatMonthly(cents: number, locale: Locale = "de"): string {
  return locale === "de" ? `${formatEuro(cents, locale)}/Monat` : `${formatEuro(cents, locale)}/month`;
}
