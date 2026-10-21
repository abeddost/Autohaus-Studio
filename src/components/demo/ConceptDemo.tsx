"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  DEMO_DEALER,
  DEMO_NEW_LISTINGS,
  DEMO_SELLER_ENQUIRIES,
  DEMO_VEHICLES,
  demoImage,
  type DemoImage,
  type DemoSellerEnquiry,
  type DemoVehicle,
} from "@/config/demo";
import type { Locale } from "@/config/pricing";
import type { Dictionary } from "@/content";
import { fill } from "@/content";
import { formatEuro } from "@/lib/format";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Check, Inbox, Note, Plus, Sync, Workflow } from "../icons";
import { DemoBadge, buttonClass, cx } from "../ui";
import {
  BrowserFrame,
  DemoHero,
  DemoLogo,
  FilterBar,
  PhoneFrame,
  PhotoTile,
  SELLER_STEPS,
  StepDots,
  VehicleCard,
  type CardState,
} from "./DemoSite";

type DemoT = Dictionary["home"]["demo"];
type TabId = "sync" | "seller" | "inbox";

const nf = (locale: Locale) => new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB");
const clock = (locale: Locale) =>
  new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date());

export function ConceptDemo({ t, locale, demoLabel }: { t: DemoT; locale: Locale; demoLabel: string }) {
  const [tab, setTab] = useState<TabId>("sync");
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs: { id: TabId; label: string; icon: typeof Sync }[] = [
    { id: "sync", label: t.tabs.sync, icon: Sync },
    { id: "seller", label: t.tabs.seller, icon: Inbox },
    { id: "inbox", label: t.tabs.inbox, icon: Workflow },
  ];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    setTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label={t.title} className="scrollbar-none -mx-1 flex max-w-full gap-1 overflow-x-auto rounded-full border border-edge bg-night-2/80 p-1">
          {tabs.map((item, i) => {
            const selected = tab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                type="button"
                id={`${baseId}-tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${item.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(item.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={cx(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[0.88rem] font-medium whitespace-nowrap transition-colors duration-300 sm:px-5",
                  selected ? "bg-bone text-night" : "text-bone-muted hover:text-bone",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            );
          })}
        </div>
        <DemoBadge label={`${demoLabel} · ${locale === "de" ? "Beispieldaten" : "Sample data"}`} />
      </div>

      <div role="tabpanel" id={`${baseId}-panel-${tab}`} aria-labelledby={`${baseId}-tab-${tab}`} tabIndex={0} className="mt-10 rounded-xl outline-offset-8">
        {tab === "sync" ? <SyncDemo t={t.sync} locale={locale} /> : null}
        {tab === "seller" ? <SellerDemo t={t.seller} locale={locale} /> : null}
        {tab === "inbox" ? <InboxDemo t={t.inbox} locale={locale} /> : null}
      </div>
    </div>
  );
}

/* ================================================================== */
/* 1 · Inventory sync                                                  */
/* ================================================================== */

type Listing = DemoVehicle & { sold: boolean };
type SiteItem = { vehicle: DemoVehicle; priceCents: number; state?: CardState };

const INITIAL: Listing[] = DEMO_VEHICLES.slice(0, 6).map((v) => ({ ...v, sold: false }));
const toSite = (list: Listing[]): SiteItem[] => list.filter((l) => !l.sold).map((l) => ({ vehicle: l, priceCents: l.priceCents }));

function SyncDemo({ t, locale }: { t: DemoT["sync"]; locale: Locale }) {
  const reduced = useReducedMotion();
  const [source, setSource] = useState<Listing[]>(INITIAL);
  const [site, setSite] = useState<SiteItem[]>(() => toSite(INITIAL));
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<{ time: string; text: string }[]>([]);
  const [nextNew, setNextNew] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const diff = useMemo(() => {
    const live = source.filter((l) => !l.sold);
    const shown = site.filter((s) => s.state !== "sold");
    const shownIds = new Set(shown.map((s) => s.vehicle.id));
    const liveIds = new Set(live.map((l) => l.id));
    const added = live.filter((l) => !shownIds.has(l.id));
    const removed = shown.filter((s) => !liveIds.has(s.vehicle.id));
    const updated = live.filter((l) => {
      const s = shown.find((x) => x.vehicle.id === l.id);
      return s && s.priceCents !== l.priceCents;
    });
    return { live, added, removed, updated, total: added.length + removed.length + updated.length };
  }, [source, site]);

  const runSync = () => {
    if (running || diff.total === 0) return;
    setRunning(true);
    const apply = () => {
      const removedIds = new Set(diff.removed.map((r) => r.vehicle.id));
      const updatedIds = new Set(diff.updated.map((u) => u.id));
      const next: SiteItem[] = site
        .filter((s) => s.state !== "sold")
        .map((s) => {
          if (removedIds.has(s.vehicle.id)) return { ...s, state: "sold" as const };
          const live = diff.live.find((l) => l.id === s.vehicle.id);
          if (live && updatedIds.has(live.id)) return { vehicle: live, priceCents: live.priceCents, state: "updated" as const };
          return { ...s, state: undefined };
        });
      for (const added of diff.added) next.unshift({ vehicle: added, priceCents: added.priceCents, state: "new" });
      setSite(next);
      const text = fill(t.logEntry, { updated: diff.updated.length, added: diff.added.length, removed: diff.removed.length });
      setLog((entries) => [{ time: clock(locale), text }, ...entries].slice(0, 4));
      setAnnouncement(text);
      setRunning(false);
      timers.current.push(
        window.setTimeout(() => setSite((items) => items.filter((i) => i.state !== "sold").map((i) => ({ ...i, state: undefined }))), reduced ? 1200 : 2400),
      );
    };
    if (reduced) apply();
    else timers.current.push(window.setTimeout(apply, 900));
  };

  const reducePrice = (id: string) =>
    setSource((list) => list.map((l) => (l.id === id ? { ...l, priceCents: Math.max(1_000_000, l.priceCents - 150_000) } : l)));
  const markSold = (id: string) => setSource((list) => list.map((l) => (l.id === id ? { ...l, sold: true } : l)));
  const addListing = () => {
    const template = DEMO_NEW_LISTINGS[nextNew % DEMO_NEW_LISTINGS.length];
    setSource((list) => [{ ...template, id: `${template.id}-${nextNew}`, sold: false }, ...list]);
    setNextNew((n) => n + 1);
  };
  const reset = () => {
    timers.current.forEach(window.clearTimeout);
    setSource(INITIAL);
    setSite(toSite(INITIAL));
    setLog([]);
    setNextNew(0);
    setRunning(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Backend */}
      <div className="flex flex-col self-start rounded-xl border border-edge bg-night-2 lg:sticky lg:top-24 lg:col-span-4">
        <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-4">
          <div>
            <h3 className="text-[0.95rem] font-medium text-bone">{t.sourceTitle}</h3>
            <p className="eyebrow mt-1 text-bone-subtle">{t.sourceNote}</p>
          </div>
          <span className="flex size-8 items-center justify-center rounded-full border border-edge text-bone-muted">
            <Sync className={cx("size-4", running && "animate-spin")} />
          </span>
        </div>
        <ul className="scrollbar-none max-h-[26rem] flex-1 divide-y divide-edge overflow-y-auto">
          {source.map((l) => (
            <li key={l.id} className={cx("flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3 transition-opacity duration-500", l.sold && "opacity-40")}>
              <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-[4px] bg-night-3">
                <Image src={demoImage(l.image, "sm")} alt="" fill sizes="56px" className={cx("object-cover", l.sold && "grayscale")} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.85rem] text-bone">
                  {l.make} {l.model}
                </span>
                <span className="block font-mono text-[0.68rem] text-bone-muted tabular">
                  {nf(locale).format(l.km)} km · {formatEuro(l.priceCents, locale)}
                </span>
              </span>
              {l.sold ? (
                <span className="eyebrow text-bone-subtle">{t.sold}</span>
              ) : (
                <span className="ml-auto flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => reducePrice(l.id)}
                    className="rounded-full border border-edge px-2.5 py-1 text-[0.68rem] text-bone-muted transition-colors hover:border-champagne/50 hover:text-champagne"
                  >
                    −1.500 €<span className="sr-only">: {t.actionPrice}, {l.model}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => markSold(l.id)}
                    className="rounded-full border border-edge px-2.5 py-1 text-[0.68rem] text-bone-muted transition-colors hover:border-champagne/50 hover:text-champagne"
                  >
                    {t.actionSold}
                    <span className="sr-only">: {l.model}</span>
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
        <div className="space-y-3 border-t border-edge p-5">
          <button
            type="button"
            onClick={addListing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-edge-strong py-2.5 text-[0.85rem] text-bone-muted transition-colors hover:border-champagne/50 hover:text-champagne"
          >
            <Plus className="size-4" /> {t.actionAdd}
          </button>
          <button type="button" onClick={runSync} disabled={running || diff.total === 0} className={buttonClass("champagne", "md", "w-full")}>
            <Sync className={cx("size-4", running && "animate-spin")} />
            {running ? t.running : t.run}
          </button>
          <p className="text-center font-mono text-[0.68rem] text-bone-muted" aria-live="polite">
            {diff.total ? fill(t.pending, { count: diff.total }) : t.noPending}
          </p>
          <div className="border-t border-edge pt-3">
            <p className="eyebrow text-bone-subtle">{t.log}</p>
            {log.length ? (
              <ol className="mt-2 space-y-1">
                {log.map((entry, i) => (
                  <li key={`${entry.time}-${i}`} className="slide-in flex gap-3 font-mono text-[0.66rem] text-bone-muted tabular">
                    <span className="text-champagne">{entry.time}</span>
                    <span>{entry.text}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-[0.75rem] text-bone-subtle">{t.logEmpty}</p>
            )}
          </div>
          <button type="button" onClick={reset} className="text-[0.72rem] text-bone-subtle underline-offset-4 hover:text-bone hover:underline">
            {t.reset}
          </button>
        </div>
      </div>

      {/* Dealer website */}
      <div className="lg:col-span-8">
        <BrowserFrame url={DEMO_DEALER.domain} tone="light">
          <DemoHero locale={locale} image="showroom-dark" className="!aspect-[16/5]" />
          <FilterBar locale={locale} count={site.filter((s) => s.state !== "sold").length} />
          <ul className="grid grid-cols-2 gap-[2.4%] bg-paper px-[3%] pt-[1%] pb-[3%] md:grid-cols-3">
            {site.map((item) => (
              <li key={item.vehicle.id}>
                <VehicleCard vehicle={item.vehicle} priceCents={item.priceCents} locale={locale} state={item.state} sizes="(min-width: 1024px) 260px, 45vw" />
              </li>
            ))}
          </ul>
        </BrowserFrame>
        <p className="mt-5 max-w-2xl text-sm text-bone-muted">{t.explainer}</p>
      </div>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}

/* ================================================================== */
/* 2 · Seller enquiry (Ankauf)                                         */
/* ================================================================== */

const SELL = DEMO_SELLER_ENQUIRIES[0];

function SellerDemo({ t, locale }: { t: DemoT["seller"]; locale: Locale }) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [conditions, setConditions] = useState<string[]>([t.conditions[0], t.conditions[1]]);
  const [uploaded, setUploaded] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const steps = SELLER_STEPS[locale];

  const upload = () => {
    if (uploading || uploaded >= SELL.photos.length) return;
    if (reduced) {
      setUploaded(SELL.photos.length);
      return;
    }
    setUploading(true);
    SELL.photos.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setUploaded(i + 1);
          if (i === SELL.photos.length - 1) setUploading(false);
        }, 420 * (i + 1)),
      );
    });
  };

  const restart = () => {
    timers.current.forEach(window.clearTimeout);
    setStep(0);
    setUploaded(0);
    setUploading(false);
    setSubmitted(false);
    setConditions([t.conditions[0], t.conditions[1]]);
  };

  const field = (label: string, value: string) => (
    <div>
      <p className="text-[0.62rem] font-medium text-muted">{label}</p>
      <p className="mt-1 rounded-[6px] border border-line-strong bg-white px-2.5 py-2 text-[0.72rem] text-ink">{value}</p>
    </div>
  );

  return (
    <div className="grid items-start gap-10 lg:grid-cols-12">
      <div className="flex justify-center lg:col-span-5">
        <PhoneFrame className="w-full max-w-[310px]">
          <div className="flex h-full flex-col bg-white px-4 pt-9 pb-4 text-ink">
            <div className="flex items-center justify-between">
              <DemoLogo className="text-[1rem]" />
              <span className="font-mono text-[0.55rem] text-subtle">{DEMO_DEALER.city}</span>
            </div>
            {submitted ? (
              <div className="pop-in flex flex-1 flex-col items-center justify-center text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
                  <Check className="size-7" strokeWidth={2} />
                </span>
                <p className="serif mt-5 text-[1.6rem] leading-none">{t.sent}</p>
                <p className="mt-3 px-2 text-[0.72rem] text-muted">{t.sentText}</p>
                <button type="button" onClick={restart} className="mt-6 rounded-full border border-line-strong px-4 py-2 text-[0.72rem] font-medium hover:border-ink">
                  {t.restart}
                </button>
              </div>
            ) : (
              <>
                <p className="serif mt-5 text-[1.45rem] leading-none">{t.phoneTitle}</p>
                <div className="mt-3 flex items-center justify-between font-mono text-[0.58rem] text-subtle">
                  <span>{steps[step]}</span>
                  <span>
                    {step + 1} / {steps.length}
                  </span>
                </div>
                <StepDots step={step + 1} total={steps.length} className="mt-2" />

                <div key={step} className="slide-in mt-5 flex-1 space-y-3">
                  {step === 0 ? (
                    <>
                      {field(t.vehicleLabel, SELL.vehicle)}
                      <div className="grid grid-cols-2 gap-2">
                        {field(t.regLabel, SELL.firstReg)}
                        {field(t.kmLabel, `${nf(locale).format(SELL.km)} km`)}
                      </div>
                    </>
                  ) : null}
                  {step === 1 ? (
                    <div>
                      <p className="text-[0.66rem] font-medium text-muted">{t.conditionLabel}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {t.conditions.map((c) => {
                          const on = conditions.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setConditions((list) => (on ? list.filter((x) => x !== c) : [...list, c]))}
                              className={cx(
                                "rounded-full border px-2.5 py-1.5 text-[0.66rem] transition-colors",
                                on ? "border-ink bg-ink text-white" : "border-line-strong text-ink-soft hover:border-ink",
                              )}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                  {step === 2 ? (
                    <div>
                      <p className="text-[0.66rem] font-medium text-muted">{t.photosLabel}</p>
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {Array.from({ length: 6 }, (_, i) => (
                          <PhotoTile key={i} image={i < uploaded ? SELL.photos[i] : undefined} />
                        ))}
                      </div>
                      <p className="mt-2 font-mono text-[0.58rem] text-subtle">{fill(t.photosHint, { count: uploaded })}</p>
                      {uploaded < SELL.photos.length ? (
                        <button
                          type="button"
                          onClick={upload}
                          disabled={uploading}
                          className="mt-2 w-full rounded-full border border-dashed border-line-strong py-2 text-[0.68rem] font-medium text-ink hover:border-ink disabled:opacity-50"
                        >
                          {t.addPhotos}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                  {step === 3 ? (
                    <>
                      <p className="text-[0.66rem] font-medium text-muted">{t.contactLabel}</p>
                      {field(t.nameLabel, SELL.contact)}
                      {field(t.phoneLabel, "0170 •••• ••• ••")}
                    </>
                  ) : null}
                </div>

                <div className="mt-4 flex gap-2">
                  {step > 0 ? (
                    <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded-full border border-line-strong px-4 py-2.5 text-[0.72rem] font-medium">
                      {t.back}
                    </button>
                  ) : null}
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s + 1)}
                      disabled={step === 2 && uploaded === 0}
                      className="flex-1 rounded-full bg-ink py-2.5 text-[0.72rem] font-medium text-white transition-opacity disabled:opacity-40"
                    >
                      {t.next}
                    </button>
                  ) : (
                    <button type="button" onClick={() => setSubmitted(true)} className="flex-1 rounded-full bg-ink py-2.5 text-[0.72rem] font-medium text-white">
                      {t.submit}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </PhoneFrame>
      </div>

      <div className="lg:col-span-7">
        <div className="overflow-hidden rounded-xl bg-white text-ink shadow-stage">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <p className="font-medium">{t.inboxTitle}</p>
            <DemoLogo className="text-[0.95rem]" />
          </div>
          <ul className="divide-y divide-line" aria-live="polite">
            {submitted ? (
              <EnquiryRow enquiry={{ ...SELL, received: clockShort(locale) }} locale={locale} conditions={conditions} photos={uploaded} fresh badge={t.newBadge} stored={t.stored} />
            ) : (
              <li className="flex items-center gap-3 px-5 py-6 text-sm text-subtle">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-champagne-deep/50" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-champagne-deep" />
                </span>
                {t.waiting}
              </li>
            )}
            <EnquiryRow enquiry={DEMO_SELLER_ENQUIRIES[1]} locale={locale} />
          </ul>
        </div>
        <p className="mt-5 max-w-2xl text-sm text-bone-muted">{t.explainer}</p>
      </div>
    </div>
  );
}

function clockShort(locale: Locale) {
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function EnquiryRow({
  enquiry,
  locale,
  conditions,
  photos,
  fresh = false,
  badge,
  stored,
}: {
  enquiry: DemoSellerEnquiry;
  locale: Locale;
  conditions?: string[];
  photos?: number;
  fresh?: boolean;
  badge?: string;
  stored?: string;
}) {
  const shown = enquiry.photos.slice(0, photos ?? enquiry.photos.length);
  return (
    <li className={cx("px-5 py-5", fresh && "slide-in bg-champagne-soft/50")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-medium">
            {enquiry.vehicle}
            {fresh && badge ? <span className="rounded-full bg-champagne-deep px-2 py-0.5 text-[0.62rem] font-medium text-white">{badge}</span> : null}
          </p>
          <p className="mt-1 font-mono text-[0.7rem] text-muted tabular">
            EZ {enquiry.firstReg} · {nf(locale).format(enquiry.km)} km · {enquiry.contact}
          </p>
          <p className="mt-1.5 text-[0.8rem] text-ink-soft">{conditions?.length ? conditions.join(" · ") : enquiry.condition[locale]}</p>
        </div>
        <span className="shrink-0 font-mono text-[0.7rem] text-subtle tabular">{enquiry.received}</span>
      </div>
      {shown.length ? (
        <div className="mt-3 flex gap-1.5">
          {shown.map((img) => (
            <span key={img} className="relative size-12 overflow-hidden rounded-[4px] bg-paper-2 sm:size-14">
              <Image src={demoImage(img, "sm")} alt="" fill sizes="56px" className="object-cover" />
            </span>
          ))}
        </div>
      ) : null}
      {fresh && stored ? (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[0.72rem] font-medium text-success">
          <Check className="size-3.5" /> {stored}
        </p>
      ) : null}
    </li>
  );
}

/* ================================================================== */
/* 3 · Team inbox                                                      */
/* ================================================================== */

type Status = "open" | "contacted" | "closed";
type TeamEnquiry = DemoSellerEnquiry & { status: Status; notes: string[] };

function InboxDemo({ t, locale }: { t: DemoT["inbox"]; locale: Locale }) {
  const [items, setItems] = useState<TeamEnquiry[]>(() =>
    DEMO_SELLER_ENQUIRIES.map((e, i) => ({
      ...e,
      status: i === 0 ? "open" : "contacted",
      notes: i === 1 ? [locale === "de" ? "Rückruf am Nachmittag vereinbart" : "Call-back arranged for the afternoon"] : [],
    })),
  );
  const [selectedId, setSelectedId] = useState(items[0].id);
  const [photo, setPhoto] = useState<DemoImage>(items[0].photos[0]);
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState(false);
  const noteId = useId();
  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  const select = (id: string) => {
    const next = items.find((i) => i.id === id)!;
    setSelectedId(id);
    setPhoto(next.photos[0]);
  };
  const setStatus = (status: Status) => setItems((list) => list.map((i) => (i.id === selectedId ? { ...i, status } : i)));
  const addNote = () => {
    const text = draft.trim();
    if (!text) return;
    setItems((list) => list.map((i) => (i.id === selectedId ? { ...i, notes: [...i.notes, text.slice(0, 200)] } : i)));
    setDraft("");
  };
  const exportCsv = () => {
    setToast(true);
    window.setTimeout(() => setToast(false), 2200);
  };
  const statusStyle: Record<Status, string> = {
    open: "bg-champagne-soft text-champagne-deep",
    contacted: "bg-warning/10 text-warning",
    closed: "bg-success/10 text-success",
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white text-ink shadow-stage">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-4">
          <DemoLogo className="text-[0.95rem]" />
          <span className="h-5 w-px bg-line" aria-hidden />
          <p className="font-medium">{t.title}</p>
        </div>
        <div className="flex items-center gap-3">
          {toast ? (
            <span role="status" className="pop-in text-[0.75rem] text-success">
              {t.exported}
            </span>
          ) : null}
          <button type="button" onClick={exportCsv} className="rounded-full border border-line-strong px-3.5 py-1.5 text-[0.75rem] font-medium hover:border-ink">
            {t.exportCsv}
          </button>
        </div>
      </div>
      <div className="grid md:grid-cols-12">
        <ul className="divide-y divide-line border-line md:col-span-4 md:border-r">
          {items.map((item) => {
            const active = item.id === selectedId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => select(item.id)}
                  aria-current={active ? "true" : undefined}
                  className={cx("flex w-full items-center gap-3 px-5 py-4 text-left transition-colors", active ? "bg-paper" : "hover:bg-paper/60")}
                >
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-[5px] bg-paper-2">
                    <Image src={demoImage(item.photos[0], "sm")} alt="" fill sizes="44px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.88rem] font-medium">{item.vehicle}</span>
                    <span className="block font-mono text-[0.66rem] text-subtle tabular">
                      {item.received} · {item.photos.length} {t.photos}
                    </span>
                  </span>
                  <span className={cx("rounded-full px-2 py-0.5 text-[0.64rem] font-medium", statusStyle[item.status])}>{t.statuses[item.status]}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="grid gap-6 p-5 md:col-span-8 lg:grid-cols-2">
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[6px] bg-paper-2">
              <Image key={photo} src={demoImage(photo)} alt="" fill sizes="(min-width: 1024px) 380px, 90vw" className="pop-in object-cover" />
            </div>
            <div className="mt-2 flex gap-1.5">
              {selected.photos.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setPhoto(img)}
                  aria-pressed={photo === img}
                  aria-label={t.photos}
                  className={cx("relative size-12 overflow-hidden rounded-[4px] ring-offset-2 transition", photo === img ? "ring-2 ring-ink" : "opacity-75 hover:opacity-100")}
                >
                  <Image src={demoImage(img, "sm")} alt="" fill sizes="48px" className="object-cover" />
                </button>
              ))}
            </div>
            <dl className="mt-5 space-y-2 text-[0.85rem]">
              {(
                [
                  [t.fields.vehicle, selected.vehicle],
                  [t.fields.registration, selected.firstReg],
                  [t.fields.mileage, `${nf(locale).format(selected.km)} km`],
                  [t.fields.condition, selected.condition[locale]],
                  [t.fields.contact, selected.contact],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="grid grid-cols-[7.5rem_1fr] gap-2">
                  <dt className="text-subtle">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <fieldset>
              <legend className="eyebrow text-subtle">{t.statusLabel}</legend>
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-full border border-line bg-paper p-1">
                {(["open", "contacted", "closed"] as const).map((status) => (
                  <label
                    key={status}
                    className="flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 py-2 text-[0.74rem] text-muted transition-colors has-[:checked]:bg-ink has-[:checked]:text-white has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-champagne"
                  >
                    <input type="radio" name={`team-status-${selected.id}`} value={status} checked={selected.status === status} onChange={() => setStatus(status)} className="sr-only" />
                    {selected.status === status ? <Check className="size-3.5" /> : null}
                    {t.statuses[status]}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="eyebrow mt-6 flex items-center gap-1.5 text-subtle">
              <Note className="size-3.5" /> {t.notes}
            </p>
            {selected.notes.length ? (
              <ul className="mt-2 space-y-1.5">
                {selected.notes.map((note, i) => (
                  <li key={i} className="slide-in rounded-[6px] bg-paper px-3 py-2 text-[0.82rem]">
                    {note}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[0.82rem] text-subtle">{t.noNotes}</p>
            )}
            <label htmlFor={noteId} className="sr-only">
              {t.notes}
            </label>
            <textarea
              id={noteId}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder={t.notePlaceholder}
              className="mt-3 w-full resize-none rounded-[8px] border border-line-strong bg-white px-3 py-2 text-sm placeholder:text-subtle focus:border-ink focus:outline-none"
            />
            <button type="button" onClick={addNote} disabled={!draft.trim()} className="mt-2 rounded-full bg-ink px-4 py-2 text-[0.78rem] font-medium text-white disabled:opacity-35">
              {t.addNote}
            </button>
            <p className="mt-6 text-[0.78rem] text-muted">{t.explainer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
