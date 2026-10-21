import { DatabaseUnavailableError, getDb } from "../db/client";
import { log } from "../log";
import { isRateLimited, recordAttempt } from "../security/rateLimit";
import { clientIp, hashIp, isSameOrigin } from "../security/request";
import { verifyFormToken } from "../security/formToken";
import { enquirySchema, fieldErrors, type EnquiryResponse } from "./schema";
import { deliverNotification, notificationIdFor, storeEnquiry } from "./service";

const MAX_BODY_BYTES = 32 * 1024;

function json(body: EnquiryResponse, status: number) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * POST /api/enquiries
 * Order matters: validate → store durably → then notify. A failed email never
 * loses an enquiry, and success is only reported after the row is committed.
 */
export async function handleEnquiryRequest(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) return json({ ok: false, code: "forbidden" }, 403);
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return json({ ok: false, code: "bad_request" }, 415);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json({ ok: false, code: "bad_request" }, 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("not an object");
  } catch {
    return json({ ok: false, code: "bad_request" }, 400);
  }

  let db;
  try {
    db = await getDb();
  } catch (error) {
    log("error", "enquiry.db.unavailable", { error: String((error as Error).message) });
    return json({ ok: false, code: "unavailable" }, 503);
  }

  const ipHash = hashIp(clientIp(request));
  try {
    if (await isRateLimited(db, ipHash)) {
      await recordAttempt(db, ipHash, "rate_limited");
      return json({ ok: false, code: "rate_limited" }, 429);
    }

    // Honeypot: a hidden field humans never see. Rejected with a neutral message.
    if (typeof body.fax === "string" && body.fax.trim() !== "") {
      await recordAttempt(db, ipHash, "spam");
      log("warn", "enquiry.rejected.honeypot", { ipHash });
      return json({ ok: false, code: "spam" }, 422);
    }

    const token = verifyFormToken(body.token);
    if (token === "not_configured") {
      log("error", "enquiry.form_secret.missing");
      return json({ ok: false, code: "unavailable" }, 503);
    }
    if (token !== "ok") {
      await recordAttempt(db, ipHash, `token_${token}`);
      return json({ ok: false, code: token === "expired" ? "expired" : token === "too_fast" ? "too_fast" : "spam" }, 422);
    }

    const parsed = enquirySchema.safeParse(body);
    if (!parsed.success) {
      await recordAttempt(db, ipHash, "invalid");
      return json({ ok: false, code: "validation", fields: fieldErrors(parsed.error) }, 422);
    }

    const stored = await storeEnquiry(db, parsed.data);
    await recordAttempt(db, ipHash, "stored");
    log("info", "enquiry.stored", { reference: stored.reference, package: stored.quote?.packageId ?? null });

    let notification: "sent" | "queued" | "not_configured" = "queued";
    try {
      notification = await deliverNotification(db, await notificationIdFor(db, stored.id));
    } catch (error) {
      // The enquiry is already stored; the retry job will pick the notification up.
      log("error", "enquiry.notification.error", { reference: stored.reference, error: String((error as Error).message) });
    }

    return json({ ok: true, reference: stored.reference, notification }, 201);
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) return json({ ok: false, code: "unavailable" }, 503);
    log("error", "enquiry.failed", { error: String((error as Error).message ?? error).slice(0, 300) });
    return json({ ok: false, code: "unavailable" }, 503);
  }
}
