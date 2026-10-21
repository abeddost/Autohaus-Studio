import { randomBytes } from "node:crypto";
import { and, eq, inArray, lte, sql } from "drizzle-orm";
import { ESTIMATE_NOTICE, VAT_NOTICE } from "@/config/pricing";
import { getProject } from "@/config/projects";
import { formatEuro, formatMonthly } from "@/lib/format";
import { calculateQuote, type Quote } from "@/lib/pricing/engine";
import { decodeSelection, type Selection } from "@/lib/pricing/selection";
import type { Db } from "../db/client";
import { enquiries, notifications } from "../db/schema";
import { getEmailConfig, EmailSendError, type EmailMessage } from "../email/provider";
import { log } from "../log";
import type { EnquiryData } from "./schema";

export const MAX_ATTEMPTS = 6;

export type NotificationOutcome = "sent" | "queued" | "not_configured";

function makeReference(now = new Date()) {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").toUpperCase();
  return `AW-${date}-${suffix}`;
}

/** Exponential backoff: 2, 4, 8, 16, 32 minutes … capped at 6 hours. */
export function nextAttemptDelayMs(attempts: number) {
  return Math.min(2 ** attempts * 60_000, 6 * 60 * 60 * 1000);
}

export type StoredEnquiry = {
  id: string;
  reference: string;
  selection: Selection | null;
  quote: Quote | null;
};

/**
 * Persists the enquiry and its notification outbox entry in one transaction.
 * Prices are recalculated here from the selection – client totals are ignored.
 */
export async function storeEnquiry(db: Db, data: EnquiryData): Promise<StoredEnquiry> {
  const selection = data.config ? decodeSelection(data.config) : null;
  const quote = selection && selection.projectType ? calculateQuote(selection) : null;

  for (let attempt = 0; attempt < 3; attempt++) {
    const reference = makeReference();
    try {
      const id = await db.transaction(async (tx) => {
        const [row] = await tx
          .insert(enquiries)
          .values({
            reference,
            locale: data.locale,
            name: data.name,
            company: data.company,
            email: data.email,
            phone: data.phone || null,
            website: data.website || null,
            message: data.message,
            contactMethod: data.contactMethod,
            nextStep: data.nextStep === "none" ? null : data.nextStep,
            projectRef: data.projectRef || null,
            selection: selection && selection.projectType ? selection : null,
            quote,
            setupCents: quote?.setupCents ?? null,
            knownSubtotalCents: quote ? quote.knownSubtotalCents : null,
            monthlyCents: quote?.monthly.cents ?? null,
            needsQuote: quote?.needsQuote ?? false,
          })
          .returning({ id: enquiries.id });
        await tx.insert(notifications).values({ enquiryId: row.id });
        return row.id;
      });
      return { id, reference, selection, quote };
    } catch (error) {
      const message = String((error as Error).message ?? error);
      if (/unique|duplicate/i.test(message) && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error("Could not allocate a unique enquiry reference");
}

/* ----------------------------- Email body ----------------------------- */

const CONTACT_METHOD = { email: "E-Mail", phone: "Telefon" } as const;
const NEXT_STEP = { intro: "Kostenloses Kennenlerngespräch", discovery: "Bezahlte Anforderungsanalyse (1.200 € netto)" } as const;

export function buildNotificationEmail(
  enquiry: typeof enquiries.$inferSelect,
  recipients: string[],
): EmailMessage {
  const quote = enquiry.quote as Quote | null;
  const project = enquiry.projectRef ? getProject(enquiry.projectRef) : undefined;
  const lines: string[] = [
    `Neue Projektanfrage ${enquiry.reference}`,
    "",
    `Name:            ${enquiry.name}`,
    `Betrieb:         ${enquiry.company}`,
    `E-Mail:          ${enquiry.email}`,
    `Telefon:         ${enquiry.phone ?? "–"}`,
    `Website:         ${enquiry.website ?? "–"}`,
    `Kontaktweg:      ${CONTACT_METHOD[enquiry.contactMethod as keyof typeof CONTACT_METHOD] ?? enquiry.contactMethod}`,
    `Nächster Schritt: ${enquiry.nextStep ? NEXT_STEP[enquiry.nextStep as keyof typeof NEXT_STEP] : "keine Angabe"}`,
    `Sprache:         ${enquiry.locale}`,
  ];
  if (project) lines.push(`Bezug:           Referenz ${project.name}`);
  lines.push("", "Projektbeschreibung:", enquiry.message, "");

  if (quote) {
    lines.push("Konfiguration (serverseitig berechnet):", `Paket: ${quote.packageName}`);
    for (const item of quote.lineItems) {
      const qty = item.quantity > 1 ? ` (${item.quantity} × ${formatEuro(item.unitCents)})` : "";
      lines.push(`  – ${item.label.de}${qty}: ${formatEuro(item.totalCents)}`);
    }
    if (quote.mode === "fixed" && quote.setupCents !== null) {
      lines.push(`Geschätzte Einrichtung: ${formatEuro(quote.setupCents)}`);
    } else {
      lines.push("Individuelles Angebot erforderlich.");
      if (quote.mode === "quote") lines.push(`Zwischensumme bekannter Standardkomponenten: ${formatEuro(quote.knownSubtotalCents)}`);
    }
    if (quote.monthly.kind === "self") lines.push("Betrieb: Eigenbetrieb / anderer Anbieter");
    else if (quote.monthly.cents !== null) lines.push(`Betrieb: ${formatMonthly(quote.monthly.cents)}${quote.monthly.provisional ? " (vorläufig)" : ""}`);
    else lines.push("Betrieb: nach Anforderungsanalyse");
    if (quote.discoveryCents !== null) lines.push(`Anforderungsanalyse (separat): ${formatEuro(quote.discoveryCents)}`);
    if (quote.quoteReasons.length) lines.push(`Zu prüfen: ${quote.quoteReasons.map((r) => r.label.de).join("; ")}`);
    if (quote.platformNeeds.length) lines.push(`Gewünschte Bausteine: ${quote.platformNeeds.map((n) => n.de).join("; ")}`);
    lines.push(ESTIMATE_NOTICE.de, VAT_NOTICE.de, "");
  } else {
    lines.push("Keine Preisrechner-Konfiguration übermittelt.", "");
  }
  lines.push(`Eingegangen: ${enquiry.createdAt.toISOString()}`);

  return {
    to: recipients,
    subject: `Projektanfrage ${enquiry.reference} – ${enquiry.company}`,
    text: lines.join("\n"),
    replyTo: enquiry.email,
  };
}

/* ---------------------------- Delivery ---------------------------- */

/** Attempts delivery for one notification and records the result. */
export async function deliverNotification(db: Db, notificationId: number): Promise<NotificationOutcome> {
  const [row] = await db
    .select({ notification: notifications, enquiry: enquiries })
    .from(notifications)
    .innerJoin(enquiries, eq(notifications.enquiryId, enquiries.id))
    .where(eq(notifications.id, notificationId));
  if (!row) throw new Error(`Notification ${notificationId} not found`);
  if (row.notification.status === "sent") return "sent";

  const config = getEmailConfig();
  if (!config.ok) {
    // Keep it pending so the retry job delivers it once the provider is configured.
    await db
      .update(notifications)
      .set({ status: "pending", lastError: config.reason, nextAttemptAt: new Date(Date.now() + 15 * 60_000) })
      .where(eq(notifications.id, notificationId));
    log("warn", "enquiry.notification.not_configured", { reference: row.enquiry.reference, reason: config.reason });
    return "not_configured";
  }

  const attempts = row.notification.attempts + 1;
  try {
    const result = await config.provider.send(buildNotificationEmail(row.enquiry, config.recipients));
    await db
      .update(notifications)
      .set({ status: "sent", attempts, sentAt: new Date(), lastError: null, providerMessageId: result.id })
      .where(eq(notifications.id, notificationId));
    log("info", "enquiry.notification.sent", { reference: row.enquiry.reference, provider: config.provider.name, attempts });
    return "sent";
  } catch (error) {
    const retryable = !(error instanceof EmailSendError) || error.retryable;
    const exhausted = attempts >= MAX_ATTEMPTS || !retryable;
    await db
      .update(notifications)
      .set({
        status: exhausted ? "failed" : "pending",
        attempts,
        lastError: String((error as Error).message ?? error).slice(0, 500),
        nextAttemptAt: new Date(Date.now() + nextAttemptDelayMs(attempts)),
      })
      .where(eq(notifications.id, notificationId));
    log(exhausted ? "error" : "warn", "enquiry.notification.failed", {
      reference: row.enquiry.reference,
      provider: config.provider.name,
      attempts,
      exhausted,
      error: String((error as Error).message ?? error).slice(0, 200),
    });
    return "queued";
  }
}

export async function notificationIdFor(db: Db, enquiryId: string): Promise<number> {
  const [row] = await db.select({ id: notifications.id }).from(notifications).where(eq(notifications.enquiryId, enquiryId));
  return row.id;
}

/**
 * Retries due notifications. Claims rows first (pushes next_attempt_at) so
 * concurrent runs do not send the same email twice.
 */
export async function processDueNotifications(db: Db, limit = 20) {
  const now = new Date();
  const due = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.status, "pending"), lte(notifications.nextAttemptAt, now)))
    .orderBy(notifications.nextAttemptAt)
    .limit(limit);
  if (!due.length) return { processed: 0, sent: 0, pending: 0 };

  const ids = due.map((d) => d.id);
  const claimed = await db
    .update(notifications)
    .set({ nextAttemptAt: sql`now() + interval '5 minutes'` })
    .where(and(inArray(notifications.id, ids), lte(notifications.nextAttemptAt, now)))
    .returning({ id: notifications.id });

  let sent = 0;
  for (const { id } of claimed) {
    if ((await deliverNotification(db, id)) === "sent") sent++;
  }
  return { processed: claimed.length, sent, pending: claimed.length - sent };
}
