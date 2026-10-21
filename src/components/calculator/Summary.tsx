"use client";

import { ESTIMATE_NOTICE, VAT_NOTICE, type Locale } from "@/config/pricing";
import type { Dictionary } from "@/content";
import { fill } from "@/content";
import type { Quote } from "@/lib/pricing/engine";
import { formatEuro, formatMonthly } from "@/lib/format";
import { Alert, Check, Info } from "../icons";
import { cx } from "../ui";

type T = Dictionary["calculator"]["summary"];

export function setupLabel(quote: Quote, t: T, locale: Locale, quoteShort: string): string {
  if (quote.mode === "empty") return "–";
  if (quote.setupCents !== null) return formatEuro(quote.setupCents, locale);
  return quoteShort;
}

export function monthlyLabel(quote: Quote, t: T, locale: Locale): string {
  if (quote.mode === "empty") return "–";
  if (quote.monthly.kind === "self") return t.noMonthly;
  if (quote.monthly.cents === null) return t.monthlyTbd;
  return formatMonthly(quote.monthly.cents, locale);
}

/** Totals block – the most important figures, always visible without animation. */
export function Totals({ quote, t, locale, tone = "light" }: { quote: Quote; t: T; locale: Locale; tone?: "light" | "dark" }) {
  if (quote.mode === "empty") {
    return <p className={cx("text-[0.95rem]", tone === "dark" ? "text-on-dark-muted" : "text-muted")}>{t.empty}</p>;
  }
  const muted = tone === "dark" ? "text-on-dark-muted" : "text-muted";
  return (
    <dl className="space-y-4">
      <div>
        <dt className={cx("eyebrow", muted)}>{t.setupTotal}</dt>
        {quote.setupCents !== null ? (
          <dd className="serif mt-1.5 text-[2.6rem] leading-none tabular">{formatEuro(quote.setupCents, locale)}</dd>
        ) : (
          <dd className="mt-1.5">
            <span className="flex items-start gap-2 text-[1.05rem] leading-snug font-semibold">
              <Alert className="mt-0.5 size-[1.1rem] shrink-0 text-warning" />
              {t.quoteRequired}
            </span>
            {quote.mode === "quote" ? (
              <span className={cx("mt-3 block text-sm", muted)}>
                {t.knownSubtotal}:{" "}
                <strong className={cx("font-semibold tabular", tone === "dark" ? "text-on-dark" : "text-ink")}>
                  {formatEuro(quote.knownSubtotalCents, locale)}
                </strong>
                <span className="mt-0.5 block text-[0.8rem]">{t.knownSubtotalNote}</span>
              </span>
            ) : null}
          </dd>
        )}
      </div>
      <div>
        <dt className={cx("eyebrow", muted)}>{t.monthlyTotal}</dt>
        <dd className="mt-1 text-lg font-medium tabular">
          {monthlyLabel(quote, t, locale)}
          {quote.monthly.provisional ? <span className={cx("ml-2 text-sm font-normal", muted)}>({t.provisional})</span> : null}
        </dd>
      </div>
      {quote.discoveryCents !== null ? (
        <div className={cx("rounded-md border px-3.5 py-3", tone === "dark" ? "border-graphite-line" : "border-line bg-paper")}>
          <dt className="flex items-baseline justify-between gap-3 text-sm font-medium">
            {t.discovery}
            <span className="tabular">{formatEuro(quote.discoveryCents, locale)}</span>
          </dt>
          <dd className={cx("mt-1 text-[0.8rem]", muted)}>{t.discoveryNote}</dd>
        </div>
      ) : null}
    </dl>
  );
}

export function LineItems({ quote, t, locale }: { quote: Quote; t: T; locale: Locale }) {
  if (!quote.lineItems.length) return null;
  return (
    <div>
      <h4 className="eyebrow text-subtle">{t.lineItems}</h4>
      <ul className="mt-2.5 divide-y divide-line text-sm">
        {quote.lineItems.map((item) => (
          <li key={item.id} className="flex items-baseline justify-between gap-4 py-2">
            <span className="min-w-0">
              {item.label[locale]}
              {item.quantity > 1 ? (
                <span className="ml-1.5 text-subtle tabular">
                  {fill(t.quantity, { count: item.quantity })} {formatEuro(item.unitCents, locale)}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 font-medium tabular">{formatEuro(item.totalCents, locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function QuoteReasons({ quote, t, locale }: { quote: Quote; t: T; locale: Locale }) {
  if (!quote.quoteReasons.length && !quote.platformNeeds.length) return null;
  return (
    <div className="space-y-4">
      {quote.platformNeeds.length ? (
        <div>
          <h4 className="eyebrow text-subtle">{t.platformNeeds}</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            {quote.platformNeeds.map((need) => (
              <li key={need.de} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                {need[locale]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {quote.quoteReasons.length && quote.mode === "quote" ? (
        <div>
          <h4 className="eyebrow text-subtle">{t.quoteReasons}</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            {quote.quoteReasons.map((reason) => (
              <li key={reason.id} className="flex gap-2">
                <Alert className="mt-0.5 size-4 shrink-0 text-warning" />
                {reason.label[locale]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function Notices({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  return (
    <div className={cx("space-y-1.5 text-subtle", compact ? "text-[0.78rem]" : "text-[0.82rem]")}>
      <p className="flex gap-2">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        {ESTIMATE_NOTICE[locale]}
      </p>
      <p className="pl-[1.375rem]">{VAT_NOTICE[locale]}</p>
    </div>
  );
}

/** Complete itemised breakdown used in step 4 and in expanded summaries. */
export function FullBreakdown({ quote, t, locale, showScope = true }: { quote: Quote; t: T; locale: Locale; showScope?: boolean }) {
  return (
    <div className="space-y-6">
      <LineItems quote={quote} t={t} locale={locale} />
      <QuoteReasons quote={quote} t={t} locale={locale} />
      {showScope && quote.includedScope.length ? (
        <div>
          <h4 className="eyebrow text-subtle">{t.includedScope}</h4>
          <ul className="mt-2.5 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
            {quote.includedScope.map((item) => (
              <li key={item.de} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                {item[locale]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {quote.externalCosts.length ? (
        <div>
          <h4 className="eyebrow text-subtle">{t.externalCosts}</h4>
          <ul className="mt-2.5 space-y-1.5 text-sm text-muted">
            {quote.externalCosts.map((cost) => (
              <li key={cost.id} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-subtle" />
                {cost.label[locale]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
