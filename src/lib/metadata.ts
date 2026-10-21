import type { Metadata } from "next";
import type { Locale } from "@/config/pricing";
import { site, siteUrl } from "@/config/site";
import { getDictionary } from "@/content";
import { ROUTES, type RouteKey } from "@/i18n/routes";

export function indexingEnabled() {
  return process.env.SITE_INDEXING === "true";
}

export function rootMetadata(locale: Locale): Metadata {
  const t = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: site.name, template: `%s · ${site.name}` },
    description: t.meta.siteDescription,
    applicationName: site.name,
    authors: [{ name: site.owner.name }],
    robots: indexingEnabled() ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: locale === "de" ? "de_DE" : "en_GB",
    },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

type PageMetaInput = {
  locale: Locale;
  route: RouteKey;
  /** Sub-path below the route, e.g. a project slug. */
  subPath?: string;
  title?: string;
  description?: string;
  /** Use the absolute title (home page). */
  absoluteTitle?: boolean;
};

export function pageMetadata({ locale, route, subPath, title, description, absoluteTitle }: PageMetaInput): Metadata {
  const t = getDictionary(locale);
  const page = t.meta.pages[route];
  const suffix = subPath ? `/${subPath}` : "";
  const paths = { de: `${ROUTES[route].de}${suffix}`, en: `${ROUTES[route].en}${suffix}` };
  const resolvedTitle = title ?? page.title;
  const resolvedDescription = description ?? page.description;
  return {
    title: absoluteTitle ? { absolute: `${site.name} – ${resolvedTitle}` } : resolvedTitle,
    description: resolvedDescription,
    alternates: {
      canonical: paths[locale],
      languages: { de: paths.de, en: paths.en, "x-default": paths.de },
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: paths[locale],
    },
  };
}
