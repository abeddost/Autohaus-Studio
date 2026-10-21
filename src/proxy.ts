import { NextResponse, type NextRequest } from "next/server";
import { projects } from "@/config/projects";

const SLUGS = new Set(projects.map((p) => p.slug));

/**
 * Project pages are prerendered for known slugs. Unknown slugs are rewritten to
 * an unmatched path so they receive the global 404 page with a real 404 status
 * (Cache Components does not support `dynamicParams = false`).
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/").filter(Boolean).pop() ?? "";
  if (!SLUGS.has(slug)) {
    return NextResponse.rewrite(new URL("/__unknown-project", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/referenzen/:slug", "/en/work/:slug"],
};
