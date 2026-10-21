import type { MetadataRoute } from "next";
import { projects } from "@/config/projects";
import { siteUrl } from "@/config/site";
import { ROUTES, type RouteKey } from "@/i18n/routes";

const KEYS: RouteKey[] = ["home", "services", "pricing", "work", "about", "contact", "imprint", "privacy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const entry = (de: string, en: string): MetadataRoute.Sitemap => [
    { url: `${base}${de === "/" ? "" : de}`, alternates: { languages: { de: `${base}${de === "/" ? "" : de}`, en: `${base}${en}` } } },
    { url: `${base}${en}`, alternates: { languages: { de: `${base}${de === "/" ? "" : de}`, en: `${base}${en}` } } },
  ];
  return [
    ...KEYS.flatMap((key) => entry(ROUTES[key].de, ROUTES[key].en)),
    ...projects.flatMap((p) => entry(`${ROUTES.work.de}/${p.slug}`, `${ROUTES.work.en}/${p.slug}`)),
  ];
}
