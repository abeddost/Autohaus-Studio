/**
 * Central agency configuration.
 *
 * Every value that is not yet confirmed stays `null`. In development, `null`
 * values are shown as visible "Fehlt:" markers (see `components/Missing.tsx`);
 * in production they are omitted. `pnpm check:launch` lists all open items.
 * Never replace a `null` with an invented value.
 */
export type SiteConfig = {
  name: string;
  domain: string;
  owner: {
    name: string;
    role: { de: string; en: string };
    /** Path below /public, e.g. "/team/portrait.jpg". */
    portrait: string | null;
  };
  /** Path below /public to an SVG/PNG logo. Without a logo the typographic wordmark is used. */
  logo: string | null;
  contact: {
    email: string | null;
    phone: string | null;
    /** Display format, e.g. "+49 6131 000000". */
    phoneDisplay: string | null;
    whatsapp: string | null;
  };
  address: {
    street: string | null;
    postalCode: string | null;
    city: string | null;
    country: "DE";
  };
  /** Business region shown in copy, e.g. "Rhein-Main". Optional. */
  region: string | null;
  social: { label: string; url: string }[];
  /** Number of dealership websites built – confirmed by the owner. */
  dealershipWebsitesBuilt: number;
  analytics: {
    /** Keep false until a consent solution is configured. */
    enabled: false;
  };
};

export const site: SiteConfig = {
  name: "Autohaus Webstudio",
  domain: "autohaus-webstudio.de",
  owner: {
    name: "Abdul Qader Dost",
    role: {
      de: "Webentwickler für Autohäuser und Autoankauf",
      en: "Web developer for car dealerships and vehicle buying businesses",
    },
    portrait: null,
  },
  logo: null,
  contact: {
    email: null,
    phone: null,
    phoneDisplay: null,
    whatsapp: null,
  },
  address: {
    street: null,
    postalCode: null,
    city: null,
    country: "DE",
  },
  region: null,
  social: [],
  dealershipWebsitesBuilt: 6,
  analytics: { enabled: false },
};

export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  return (fromEnv && fromEnv.replace(/\/$/, "")) || `https://www.${site.domain}`;
}
