import type { Locale } from "@/config/pricing";
import de, { type Dictionary } from "./de";
import en from "./en";

const dictionaries: Record<Locale, Dictionary> = { de, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Replaces {placeholders} in a template string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

export type { Dictionary };
