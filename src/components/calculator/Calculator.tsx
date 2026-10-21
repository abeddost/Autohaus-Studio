"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { PACKAGE_ORDER, type Locale, type PackageId } from "@/config/pricing";
import type { Dictionary } from "@/content";
import { fill } from "@/content";
import { contactHref } from "@/i18n/routes";
import { calculateQuote, type Quote } from "@/lib/pricing/engine";
import { EMPTY_SELECTION, encodeSelection, normalizeSelection, parseSelection, type Selection } from "@/lib/pricing/selection";
import { formatEuro } from "@/lib/format";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Sync } from "../icons";
import { buttonClass, cx } from "../ui";
import { ConfiguratorPreview } from "./ConfiguratorPreview";
import { CareStep, ProjectTypeStep, ScopeStep, SummaryStep } from "./steps";
import { FullBreakdown, Notices, Totals, monthlyLabel, setupLabel } from "./Summary";

export const STORAGE_KEY = "preisrechner:v1";

type Stored = { selection: Selection; step: number };

function readStored(): Stored | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { selection?: unknown; step?: unknown };
    const selection = parseSelection(data.selection);
    const step = typeof data.step === "number" && data.step >= 0 && data.step <= 3 ? data.step : 0;
    return { selection, step: selection.projectType ? step : 0 };
  } catch {
    return null;
  }
}

/** Saves non-personal calculator state only. Exported for the enquiry page. */
export function storeSelection(selection: Selection, step = 3) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ selection, step }));
  } catch {
    /* storage unavailable – progress simply isn't persisted */
  }
}

type Props = {
  locale: Locale;
  t: Dictionary["calculator"];
  common: Dictionary["common"];
};

export function Calculator({ locale, t, common }: Props) {
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState("");
  const quote = useMemo(() => calculateQuote(selection), [selection]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moveFocus = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  // Restore saved progress, then apply a project type from the URL (?typ=…).
  useEffect(() => {
    const stored = readStored();
    let next = stored?.selection ?? EMPTY_SELECTION;
    let nextStep = stored?.step ?? 0;
    const typ = new URLSearchParams(window.location.search).get("typ");
    if (typ && (PACKAGE_ORDER as string[]).includes(typ) && typ !== next.projectType) {
      next = normalizeSelection({ ...next, projectType: typ as PackageId });
      nextStep = 0;
    }
    // Browser-only state (localStorage, URL) can only be read after hydration.
    /* eslint-disable react-hooks/set-state-in-effect */
    setSelection(next);
    setStep(nextStep);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) storeSelection(selection, step);
  }, [selection, step, hydrated]);

  useEffect(() => {
    if (moveFocus.current) {
      headingRef.current?.focus();
      moveFocus.current = false;
    }
  }, [step]);

  const update = useCallback((patch: Partial<Selection>) => {
    setSelection((current) => normalizeSelection({ ...current, ...patch }));
  }, []);

  const goTo = (target: number) => {
    if (target > 0 && selection.projectType === null) {
      setStatus(t.chooseTypeFirst);
      return;
    }
    moveFocus.current = true;
    setStep(Math.min(Math.max(target, 0), 3));
    const panel = panelRef.current;
    if (panel && panel.getBoundingClientRect().top < 0) {
      panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  };

  const reset = () => {
    setSelection(EMPTY_SELECTION);
    moveFocus.current = true;
    setStep(0);
    setStatus(t.resetConfirm);
  };

  const quoteShort = common.individualQuote;
  const enquireHref = selection.projectType ? contactHref(locale, { config: encodeSelection(selection) }) : contactHref(locale);
  const stepContent = [
    <ProjectTypeStep key="type" selection={selection} update={update} t={t} locale={locale} common={common} />,
    <ScopeStep key="scope" selection={selection} update={update} t={t} locale={locale} />,
    <CareStep key="care" selection={selection} update={update} t={t} locale={locale} quote={quote} />,
    <SummaryStep key="summary" quote={quote} t={t} locale={locale} />,
  ];

  return (
    <div ref={rootRef}>
      <LiveAnnouncer quote={quote} t={t.summary} locale={locale} />
      <p className="sr-only" role="status">
        {status}
      </p>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Live preview stage */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <ConfiguratorPreview selection={selection} locale={locale} t={t.preview} demoLabel={common.conceptDemo} />
          </div>
        </div>

        {/* Step panel */}
        <div ref={panelRef} className="min-w-0 scroll-mt-28 lg:col-span-5">
          <nav aria-label={t.eyebrow}>
            <ol className="grid grid-cols-4 gap-2">
              {t.steps.map((label, i) => {
                const reachable = i === 0 || selection.projectType !== null;
                const current = i === step;
                const done = i < step && reachable;
                return (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      disabled={!reachable}
                      aria-current={current ? "step" : undefined}
                      className="group flex w-full flex-col items-start gap-2.5 text-left disabled:cursor-not-allowed"
                    >
                      <span aria-hidden className="relative h-[2px] w-full overflow-hidden rounded-full bg-line">
                        <span
                          className={cx(
                            "absolute inset-0 origin-left transition-transform duration-500",
                            current ? "scale-x-100 bg-champagne-deep" : done ? "scale-x-100 bg-ink" : "scale-x-0 bg-ink",
                          )}
                        />
                      </span>
                      <span className={cx("flex items-center gap-1.5 text-[0.78rem]", current ? "font-medium text-ink" : "text-muted group-enabled:group-hover:text-ink")}>
                        <span className="font-mono text-[0.7rem] tabular">{done ? <Check className="size-3.5" /> : `0${i + 1}`}</span>
                        <span className="hidden xl:inline">{label}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="mt-10">
            <p className="eyebrow text-subtle">{fill(t.stepOf, { current: step + 1, total: 4 })}</p>
            <h3 id={headingId} ref={headingRef} tabIndex={-1} className="display-md mt-3 outline-none">
              {t.steps[step]}
            </h3>
            <div className="mt-8">{stepContent[step]}</div>
          </div>

          {/* Step navigation (in flow – never covered by the price bar) */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <div className="flex items-center gap-1">
              {step > 0 ? (
                <button type="button" onClick={() => goTo(step - 1)} className={buttonClass("outline", "md")}>
                  <ArrowLeft className="size-4" />
                  {t.back}
                </button>
              ) : null}
              <button type="button" onClick={reset} className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:text-ink">
                <Sync className="size-4" />
                {t.reset}
              </button>
            </div>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => goTo(step + 1)}
                aria-disabled={selection.projectType === null}
                className={buttonClass("ink", "md", selection.projectType === null ? "opacity-50" : undefined)}
              >
                {t.next}: {t.steps[step + 1]}
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => goTo(0)} className={buttonClass("outline", "md")}>
                  {t.cta.edit}
                </button>
                <Link href={enquireHref} className={buttonClass("ink", "md")}>
                  {t.cta.enquire}
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <PriceBar quote={quote} t={t} locale={locale} quoteShort={quoteShort} rootRef={rootRef} enquireHref={enquireHref} />
    </div>
  );
}

/** Announces total changes politely and debounced, to avoid interrupting screen readers. */
function LiveAnnouncer({ quote, t, locale }: { quote: Quote; t: Dictionary["calculator"]["summary"]; locale: Locale }) {
  const [message, setMessage] = useState("");
  const first = useRef(true);
  const text =
    quote.mode === "empty"
      ? ""
      : quote.mode === "platform"
        ? t.livePlatform
        : quote.mode === "quote"
          ? fill(t.liveQuote, { subtotal: formatEuro(quote.knownSubtotalCents, locale) })
          : fill(t.liveRegion, { setup: formatEuro(quote.setupCents ?? 0, locale), monthly: monthlyLabel(quote, t, locale) });

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = window.setTimeout(() => setMessage(text), 700);
    return () => window.clearTimeout(timer);
  }, [text]);

  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
}

/**
 * Configurator price bar (like a car configurator): always shows setup and
 * monthly figures while the configurator is in view. "Details" expands the
 * itemised breakdown. The page reserves its height so nothing is covered.
 */
function PriceBar({
  quote,
  t,
  locale,
  quoteShort,
  rootRef,
  enquireHref,
}: {
  quote: Quote;
  t: Dictionary["calculator"];
  locale: Locale;
  quoteShort: string;
  rootRef: React.RefObject<HTMLDivElement | null>;
  enquireHref: string;
}) {
  const [inView, setInView] = useState(false);
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const panelId = useId();
  const titleId = useId();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef]);

  // Reserve space below the configurator equal to the collapsed bar height.
  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;
    const apply = () => {
      const strip = bar.querySelector<HTMLElement>("[data-bar-strip]");
      root.style.paddingBottom = inView && strip ? `${strip.offsetHeight + 24}px` : "";
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(bar);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [inView, rootRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <aside
      ref={barRef}
      aria-labelledby={titleId}
      className={cx(
        "fixed inset-x-0 bottom-0 z-40 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        inView ? "translate-y-0" : "pointer-events-none translate-y-full",
      )}
      aria-hidden={!inView}
      inert={!inView}
    >
      <div id={panelId} hidden={!open} className="container-x">
        <div className="pop-in ml-auto max-h-[58vh] max-w-2xl overflow-y-auto rounded-t-[16px] border border-b-0 border-line bg-white p-6 text-ink shadow-[0_-30px_60px_-30px_rgb(0_0_0/0.35)]">
          {quote.mode !== "empty" ? (
            <div className="space-y-6">
              <Totals quote={quote} t={t.summary} locale={locale} />
              <FullBreakdown quote={quote} t={t.summary} locale={locale} showScope={false} />
              <Notices locale={locale} compact />
            </div>
          ) : (
            <p className="text-sm text-muted">{t.summary.empty}</p>
          )}
        </div>
      </div>

      <div data-bar-strip className="grain border-t border-edge bg-night/95 text-bone backdrop-blur-xl">
        <div className="container-x relative z-[2] flex items-center gap-4 py-3.5 sm:gap-8 sm:py-4">
          <div className="hidden min-w-0 md:block">
            <p id={titleId} className="eyebrow text-bone-subtle">
              {t.summary.title}
            </p>
            <p className="serif mt-1 truncate text-[1.35rem] leading-none text-bone">{quote.packageName ?? "–"}</p>
          </div>
          <dl className="grid min-w-0 flex-1 grid-cols-2 gap-4 md:flex-none md:gap-10 md:border-l md:border-edge md:pl-8">
            <div className="min-w-0">
              <dt className="eyebrow text-[0.6rem] text-bone-subtle">{t.summary.oneTime}</dt>
              <dd className="serif mt-0.5 truncate text-[1.55rem] leading-none text-bone tabular sm:text-[1.8rem]">
                {setupLabel(quote, t.summary, locale, quoteShort)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="eyebrow text-[0.6rem] text-bone-subtle">{t.summary.monthly}</dt>
              <dd className="mt-1 truncate font-mono text-[0.88rem] text-bone-muted tabular">{monthlyLabel(quote, t.summary, locale)}</dd>
            </div>
          </dl>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className={buttonClass("ghost-dark", "sm", "h-10")}
            >
              {open ? t.summary.hideDetails : t.summary.details}
              <ChevronDown className={cx("size-4 transition-transform", open ? "rotate-0" : "rotate-180")} />
            </button>
            <span className="hidden sm:block">
              <Link
                href={enquireHref}
                className={buttonClass("champagne", "sm", cx("h-10", quote.mode === "empty" && "pointer-events-none opacity-40"))}
                aria-disabled={quote.mode === "empty"}
              >
                {t.cta.enquire}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
