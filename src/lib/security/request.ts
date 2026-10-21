import { createHash } from "node:crypto";

/** Rejects cross-site form posts. Same-origin fetches always send an Origin header. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const originHost = new URL(origin).host;
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const allowed = new Set<string>([host ?? ""]);
    if (process.env.NEXT_PUBLIC_SITE_URL) allowed.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
    return allowed.has(originHost);
  } catch {
    return false;
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Salted hash – raw IP addresses are never stored. */
export function hashIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? process.env.FORM_SECRET ?? "development-only-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
