import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { indexingEnabled } from "@/lib/metadata";

/** Indexing stays disabled until SITE_INDEXING=true is set for the launched domain. */
export default function robots(): MetadataRoute.Robots {
  if (!indexingEnabled()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
