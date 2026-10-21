import { boolean, index, integer, jsonb, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Project enquiries. Stored before any notification is attempted. */
export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    locale: text("locale").notNull(),
    name: text("name").notNull(),
    company: text("company").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    website: text("website"),
    message: text("message").notNull(),
    contactMethod: text("contact_method").notNull(),
    nextStep: text("next_step"),
    projectRef: text("project_ref"),
    /** Normalised calculator selection (non-personal). */
    selection: jsonb("selection"),
    /** Server-side recalculated quote snapshot at the time of the enquiry. */
    quote: jsonb("quote"),
    setupCents: integer("setup_cents"),
    knownSubtotalCents: integer("known_subtotal_cents"),
    monthlyCents: integer("monthly_cents"),
    needsQuote: boolean("needs_quote").notNull().default(false),
    status: text("status").notNull().default("new"),
  },
  (t) => [index("enquiries_created_at_idx").on(t.createdAt)],
);

/** Notification outbox with retry state. */
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    enquiryId: uuid("enquiry_id")
      .notNull()
      .references(() => enquiries.id, { onDelete: "cascade" }),
    channel: text("channel").notNull().default("email"),
    /** pending | sent | failed | not_configured */
    status: text("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    providerMessageId: text("provider_message_id"),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("notifications_due_idx").on(t.status, t.nextAttemptAt)],
);

/** Submission attempts for rate limiting (salted IP hash only, no raw IPs). */
export const submissionAttempts = pgTable(
  "submission_attempts",
  {
    id: serial("id").primaryKey(),
    ipHash: text("ip_hash").notNull(),
    outcome: text("outcome").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("submission_attempts_ip_idx").on(t.ipHash, t.createdAt)],
);
