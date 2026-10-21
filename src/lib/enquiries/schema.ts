import { z } from "zod";
import { projects } from "@/config/projects";

/**
 * Shared between the browser (instant feedback) and the server (authoritative).
 * Error codes map to localised messages in the contact dictionary.
 */
const PHONE = /^[+\d][\d\s()/.-]{5,29}$/;

function normaliseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const enquirySchema = z
  .object({
    name: z.string().trim().min(2, "name").max(120, "name"),
    company: z.string().trim().min(2, "company").max(160, "company"),
    email: z.string().trim().max(200, "email").pipe(z.email("email")),
    phone: z
      .string()
      .trim()
      .max(40, "phone")
      .refine((v) => v === "" || PHONE.test(v), "phone")
      .default(""),
    website: z
      .string()
      .max(300, "website")
      .transform(normaliseUrl)
      .refine((v) => {
        if (v === "") return true;
        try {
          const url = new URL(v);
          return url.hostname.includes(".");
        } catch {
          return false;
        }
      }, "website")
      .default(""),
    message: z.string().trim().min(20, "message").max(4000, "messageLong"),
    contactMethod: z.enum(["email", "phone"], { error: "contactMethod" }),
    nextStep: z.enum(["intro", "discovery", "none"]).default("none"),
    projectRef: z
      .string()
      .max(80)
      .refine((v) => v === "" || projects.some((p) => p.slug === v))
      .default(""),
    locale: z.enum(["de", "en"]).default("de"),
    /** Encoded calculator selection; decoded and re-priced on the server. */
    config: z.string().max(4000).default(""),
  })
  .superRefine((data, ctx) => {
    if (data.contactMethod === "phone" && !data.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "phoneRequired" });
    }
  });

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryData = z.output<typeof enquirySchema>;

export type FieldErrors = Partial<Record<keyof EnquiryData, string>>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof EnquiryData | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** API response contract. */
export type EnquiryResponse =
  | { ok: true; reference: string; notification: "sent" | "queued" | "not_configured" }
  | { ok: false; code: "validation"; fields: FieldErrors }
  | { ok: false; code: "rate_limited" | "unavailable" | "spam" | "too_fast" | "expired" | "bad_request" | "forbidden" };
