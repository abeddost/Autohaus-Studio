import type { Locale } from "@/config/pricing";
import { site, siteUrl } from "@/config/site";
import { getDictionary } from "@/content";

/**
 * Structured data built only from configured, genuine agency details.
 * Fields that are not configured are omitted – no ratings, no reviews.
 */
export function JsonLd({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const url = siteUrl();
  const { contact, address } = site;
  const hasAddress = address.street && address.postalCode && address.city;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}/#organization`,
    name: site.name,
    url,
    description: t.meta.siteDescription,
    founder: { "@type": "Person", name: site.owner.name },
    areaServed: { "@type": "Country", name: "Deutschland" },
    knowsLanguage: ["de", "en"],
    ...(site.logo ? { logo: `${url}${site.logo}` } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(contact.phone ? { telephone: contact.phone } : {}),
    ...(hasAddress
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: address.street,
            postalCode: address.postalCode,
            addressLocality: address.city,
            addressCountry: address.country,
          },
        }
      : {}),
    ...(site.social.length ? { sameAs: site.social.map((s) => s.url) } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
