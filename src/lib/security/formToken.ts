import { createHmac, timingSafeEqual } from "node:crypto";

export const MIN_FILL_MS = 3_000;
export const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function secret(): string | null {
  const value = process.env.FORM_SECRET;
  if (value && value.length >= 16) return value;
  return process.env.NODE_ENV === "production" ? null : "development-only-form-secret";
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

/** Issues a signed timestamp. The form must be open ≥3 s and ≤24 h before submission. */
export function issueFormToken(now = Date.now()): string | null {
  const key = secret();
  if (!key) return null;
  const payload = String(now);
  return `${payload}.${sign(payload, key)}`;
}

export type TokenCheck = "ok" | "invalid" | "too_fast" | "expired" | "not_configured";

export function verifyFormToken(token: unknown, now = Date.now()): TokenCheck {
  const key = secret();
  if (!key) return "not_configured";
  if (typeof token !== "string" || token.length > 200) return "invalid";
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return "invalid";
  const expected = Buffer.from(sign(payload, key));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return "invalid";
  const issued = Number(payload);
  if (!Number.isFinite(issued)) return "invalid";
  const age = now - issued;
  if (age < MIN_FILL_MS) return "too_fast";
  if (age > MAX_AGE_MS) return "expired";
  return "ok";
}
