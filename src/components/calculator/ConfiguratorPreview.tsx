import { DEMO_DEALER, DEMO_VEHICLES } from "@/config/demo";
import { FIXED_PACKAGES, PLATFORM_PACKAGE, type Locale } from "@/config/pricing";
import type { Dictionary } from "@/content";
import { fill } from "@/content";
import { totalContentPages, type Selection } from "@/lib/pricing/selection";
import { BrowserFrame, DemoHero, DemoLogo, PhotoTile, StepDots, VehicleCard } from "../demo/DemoSite";
import { Calendar, Check, Inbox, Pin } from "../icons";
import { DemoBadge, cx } from "../ui";

type T = Dictionary["calculator"]["preview"];

function EditChip({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cx("pop-in absolute z-10 inline-flex items-center gap-1 rounded-full bg-champagne px-2 py-0.5 text-[clamp(0.45rem,0.75vw,0.62rem)] font-medium text-night shadow", className)}>
      ✎ {label}
    </span>
  );
}

/**
 * Live "build" preview for the configurator. Purely illustrative (aria-hidden);
 * the price bar and step panel carry the accessible information.
 */
export function ConfiguratorPreview({
  selection,
  locale,
  t,
  demoLabel,
  className,
}: {
  selection: Selection;
  locale: Locale;
  t: T;
  demoLabel: string;
  className?: string;
}) {
  const type = selection.projectType;
  const fixed = type && type !== "plattform" ? FIXED_PACKAGES[type] : null;
  const pages = fixed ? totalContentPages(fixed.id, selection.extraPages) : 5;
  const hasStock = type === "showroom" || type === "komplett";
  const hasSeller = type === "ankauf" || type === "komplett";
  const tier = fixed?.vehicleTiers?.find((x) => x.id === selection.vehicleTier);
  const stockLabel = tier
    ? tier.maxVehicles
      ? fill(t.stock, { count: tier.maxVehicles })
      : fill(t.stockMore, { count: type === "showroom" ? 200 : 100 })
    : null;

  const modules: string[] = [];
  if (fixed) modules.push(fill(t.pages, { count: pages }));
  if (hasStock && stockLabel) modules.push(stockLabel);
  if (hasSeller) modules.push(t.seller);
  if (type === "komplett") modules.push(t.inbox);
  if (selection.language) modules.push(t.language);
  if (selection.localSeo) modules.push(t.localSeo);
  if (selection.appointments === "request") modules.push(t.appointment);
  if (selection.appointments === "booking") modules.push(t.booking);
  if (selection.headlessCms) modules.push(t.cms);
  if (selection.copywritingPages) modules.push(t.copy);
  if (selection.landingPages) modules.push(fill(t.landing, { count: selection.landingPages }));
  if (type === "plattform") modules.push(t.platform);

  return (
    <div className={cx("grain relative overflow-hidden rounded-[18px] bg-night text-bone", className)}>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_0%,rgb(236_232_225/0.14),transparent_70%)]" />
      <div aria-hidden className="absolute inset-x-[10%] bottom-[6%] h-[18%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(205_179_138/0.16),transparent)] blur-2xl" />

      <div className="relative z-[2] flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-6">
        <p className="eyebrow flex items-center gap-2 text-bone-muted">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-champagne/60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-champagne" />
          </span>
          {t.label}
        </p>
        <DemoBadge label={demoLabel} />
      </div>

      <div aria-hidden className="relative z-[2] px-5 pt-6 pb-6 sm:px-9 sm:pt-8 sm:pb-9">
        {type === null ? (
          <div className="flex aspect-[16/11] flex-col items-center justify-center rounded-[10px] border border-dashed border-edge-strong text-center">
            <DemoLogo light className="text-[1.6rem] opacity-60" />
            <p className="mt-5 max-w-xs text-sm text-bone-muted">{t.empty}</p>
          </div>
        ) : type === "plattform" ? (
          <PlatformPreview selection={selection} locale={locale} t={t} />
        ) : (
          <div className="relative">
            {/* Landing pages stacked behind */}
            {Array.from({ length: Math.min(selection.landingPages, 3) }, (_, i) => (
              <div
                key={i}
                className="pop-in absolute inset-x-[4%] h-full rounded-[10px] border border-edge bg-night-3"
                style={{ top: `${-(i + 1) * 10}px`, transform: `scale(${1 - (i + 1) * 0.035})`, zIndex: -1 - i }}
              />
            ))}
            <BrowserFrame url={DEMO_DEALER.domain} tone="light" className="relative">
              <div className="relative">
                <DemoHero locale={locale} image="showroom-bright" navCount={pages} languageSwitch={selection.language} className="!aspect-[16/6]" />
                {selection.headlessCms ? <EditChip label={t.edit} className="top-[38%] right-[4%]" /> : null}
              </div>

              <div className="space-y-[3%] bg-paper p-[3.5%]">
                {hasStock ? (
                  <div key="stock" className="pop-in relative">
                    <div className="mb-[1.5%] flex items-center justify-between text-[clamp(0.5rem,0.85vw,0.7rem)]">
                      <span className="font-medium text-ink">{locale === "de" ? "Aktueller Bestand" : "Current stock"}</span>
                      {stockLabel ? <span className="rounded-full bg-ink px-[0.8em] py-[0.25em] font-mono text-white">{stockLabel}</span> : null}
                    </div>
                    <div className="grid grid-cols-3 gap-[2.5%]">
                      {DEMO_VEHICLES.slice(0, 3).map((v) => (
                        <VehicleCard key={v.id} vehicle={v} locale={locale} sizes="200px" />
                      ))}
                    </div>
                    {selection.headlessCms ? <EditChip label={t.edit} className="-top-[4%] left-[30%]" /> : null}
                  </div>
                ) : null}

                <div className={cx("grid gap-[3%]", hasSeller ? "grid-cols-5" : "grid-cols-1")}>
                  {hasSeller ? (
                    <div key="seller" className="pop-in col-span-3 rounded-[6px] bg-white p-[4%] text-ink shadow-[0_0_0_1px_rgb(18_18_18/0.07)]">
                      <p className="serif text-[clamp(0.85rem,1.6vw,1.25rem)] leading-none">{locale === "de" ? "Fahrzeug verkaufen" : "Sell your car"}</p>
                      <StepDots step={3} className="mt-[4%]" />
                      <div className="mt-[4%] grid grid-cols-5 gap-[3%]">
                        {(["sell-s3-rear", "sell-s3-wheel", "sell-s3-light", "sell-s3-interior"] as const).map((img) => (
                          <PhotoTile key={img} image={img} />
                        ))}
                        <PhotoTile />
                      </div>
                    </div>
                  ) : null}

                  <div className={cx("space-y-[4%]", hasSeller ? "col-span-2" : "grid grid-cols-3 gap-[2.5%] space-y-0")}>
                    {/* Contact & opening hours – always part of the base package */}
                    <div className="rounded-[6px] bg-white p-[5%] text-[clamp(0.45rem,0.8vw,0.66rem)] text-ink shadow-[0_0_0_1px_rgb(18_18_18/0.07)]">
                      <p className="font-medium">{locale === "de" ? "Öffnungszeiten" : "Opening hours"}</p>
                      <p className="mt-[0.3em] text-muted">{t.openingHours}</p>
                    </div>
                    {selection.localSeo ? (
                      <div key="map" className="pop-in relative overflow-hidden rounded-[6px] bg-[#e9e4d8] shadow-[0_0_0_1px_rgb(18_18_18/0.07)]">
                        <svg viewBox="0 0 120 60" className="block w-full" aria-hidden>
                          <path d="M0 40 Q30 30 60 38 T120 30" stroke="#fff" strokeWidth="4" fill="none" />
                          <path d="M40 0 L52 60" stroke="#fff" strokeWidth="3" fill="none" />
                          <path d="M90 0 Q80 30 98 60" stroke="#fff" strokeWidth="2.5" fill="none" />
                        </svg>
                        <Pin className="absolute top-[22%] left-[46%] size-[18%] text-champagne-deep" strokeWidth={2} />
                      </div>
                    ) : null}
                    {selection.appointments !== "none" ? (
                      <div key={selection.appointments} className="pop-in flex items-center gap-[0.6em] rounded-[6px] bg-ink p-[5%] text-[clamp(0.45rem,0.8vw,0.66rem)] text-white">
                        <Calendar className="size-[1.4em] shrink-0" />
                        {selection.appointments === "booking" ? t.bookOnline : t.requestDate}
                      </div>
                    ) : null}
                    {selection.copywritingPages ? (
                      <div key="copy" className="pop-in rounded-[6px] bg-white p-[5%] text-[clamp(0.45rem,0.8vw,0.66rem)] shadow-[0_0_0_1px_rgb(18_18_18/0.07)]">
                        <span className="block h-[0.4em] w-[80%] rounded-full bg-ink/80" />
                        <span className="mt-[0.5em] block h-[0.3em] w-full rounded-full bg-line-strong" />
                        <span className="mt-[0.35em] block h-[0.3em] w-[70%] rounded-full bg-line-strong" />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </BrowserFrame>

            {type === "komplett" ? (
              <div key="inbox" className="pop-in absolute -right-[3%] -bottom-[7%] w-[38%] overflow-hidden rounded-[10px] border border-edge bg-night-3 p-[2.5%] shadow-stage">
                <p className="flex items-center gap-[0.5em] text-[clamp(0.5rem,0.85vw,0.7rem)] font-medium text-bone">
                  <Inbox className="size-[1.2em]" /> {t.inbox}
                </p>
                <ul className="mt-[5%] space-y-[4%] text-[clamp(0.45rem,0.75vw,0.62rem)]">
                  {["Audi S3", "BMW M5", "VW Tiguan"].map((name, i) => (
                    <li key={name} className="flex items-center justify-between gap-2 rounded-[5px] bg-white/[0.05] px-[5%] py-[3%]">
                      <span className="text-bone">{name}</span>
                      <span className={cx("rounded-full px-[0.6em] py-[0.1em]", i === 0 ? "bg-champagne text-night" : "bg-white/10 text-bone-muted")}>
                        {i === 0 ? (locale === "de" ? "Offen" : "Open") : locale === "de" ? "Kontaktiert" : "Contacted"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {modules.length ? (
        <div className="relative z-[2] border-t border-edge px-5 py-4 sm:px-7">
          <p className="sr-only">{t.modules}:</p>
          <ul className="flex flex-wrap gap-1.5">
            {modules.map((m) => (
              <li key={m} className="pop-in inline-flex items-center gap-1.5 rounded-full border border-edge-strong px-3 py-1 text-[0.72rem] text-bone-muted">
                <Check className="size-3 text-champagne" /> {m}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function PlatformPreview({ selection, locale, t }: { selection: Selection; locale: Locale; t: T }) {
  const needs = PLATFORM_PACKAGE.possibleFeatures.filter((f) => selection.platformNeeds.includes(f.id));
  return (
    <div className="pop-in grid aspect-[16/11] grid-cols-12 overflow-hidden rounded-[10px] bg-white text-ink shadow-stage">
      <aside className="col-span-3 space-y-[8%] bg-night-3 p-[6%] text-bone">
        <DemoLogo light className="text-[clamp(0.7rem,1.3vw,1rem)]" />
        <ul className="space-y-[6%] text-[clamp(0.45rem,0.8vw,0.66rem)]">
          {t.branches.map((b, i) => (
            <li key={b} className={cx("rounded-[5px] px-[8%] py-[5%]", i === 0 ? "bg-white/10 text-bone" : "text-bone-muted")}>
              {b}
            </li>
          ))}
        </ul>
      </aside>
      <div className="col-span-9 p-[4%]">
        <div className="grid grid-cols-3 gap-[3%]">
          {[
            [t.leads, "14"],
            [locale === "de" ? "Ankauf" : "Purchases", "6"],
            [locale === "de" ? "Termine" : "Appointments", "9"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[6px] bg-paper p-[6%]">
              <p className="text-[clamp(0.42rem,0.7vw,0.6rem)] text-muted">{label}</p>
              <p className="serif mt-[0.2em] text-[clamp(1rem,2vw,1.6rem)] leading-none">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-[4%] space-y-[2%]">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-[3%] rounded-[5px] border border-line px-[3%] py-[2%]">
              <span className="size-[1.4em] rounded-full bg-paper-2 text-[clamp(0.5rem,0.9vw,0.75rem)]" />
              <span className="h-[0.45em] w-[30%] rounded-full bg-ink/70 text-[clamp(0.5rem,0.9vw,0.75rem)]" />
              <span className="ml-auto h-[0.45em] w-[15%] rounded-full bg-line-strong text-[clamp(0.5rem,0.9vw,0.75rem)]" />
            </div>
          ))}
        </div>
        {needs.length ? (
          <ul className="mt-[4%] flex flex-wrap gap-[1.5%]">
            {needs.map((n) => (
              <li key={n.id} className="pop-in rounded-full bg-champagne-soft px-[0.9em] py-[0.3em] text-[clamp(0.45rem,0.75vw,0.62rem)] text-champagne-deep">
                {n.label[locale]}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
