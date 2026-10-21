import Image from "next/image";
import type { ReactNode } from "react";
import { DEMO_DEALER, demoImage, type DemoImage, type DemoVehicle } from "@/config/demo";
import type { Locale } from "@/config/pricing";
import { formatEuro } from "@/lib/format";
import { Camera, Check, Phone, Search, Sliders } from "../icons";
import { cx } from "../ui";

/* ------------------------------------------------------------------ */
/* Device frames                                                       */
/* ------------------------------------------------------------------ */

export function BrowserFrame({
  url,
  children,
  className,
  tone = "dark",
}: {
  url?: string;
  children: ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cx(
        "overflow-hidden rounded-[10px]",
        dark ? "bg-night-3 shadow-stage" : "bg-white shadow-[0_30px_70px_-35px_rgb(0_0_0/0.45),0_0_0_1px_rgb(18_18_18/0.08)]",
        className,
      )}
    >
      <div className={cx("flex h-8 items-center gap-3 px-3.5", dark ? "border-b border-edge bg-night-3" : "border-b border-line bg-paper")}>
        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className={cx("size-2.5 rounded-full", dark ? "bg-white/12" : "bg-line-strong")} />
          ))}
        </div>
        {url ? (
          <div
            className={cx(
              "mx-auto flex h-[1.15rem] max-w-[58%] min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full px-3 font-mono text-[0.6rem]",
              dark ? "bg-white/[0.06] text-bone-muted" : "bg-white text-subtle shadow-hairline",
            )}
          >
            <span aria-hidden className="size-1.5 rounded-full bg-success/80" />
            <span className="truncate">{url}</span>
          </div>
        ) : null}
        <div className="w-10" aria-hidden />
      </div>
      {children}
    </div>
  );
}

/** Slim titanium phone. Children fill a 9:19.5 screen. */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "rounded-[2rem] bg-gradient-to-b from-[#4a4a4e] via-[#2a2a2d] to-[#3b3b3f] p-[3px] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.85)]",
        className,
      )}
    >
      <div className="rounded-[1.85rem] bg-black p-[5px]">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.55rem] bg-white">
          <div aria-hidden className="absolute top-2 left-1/2 z-20 h-[14px] w-[30%] -translate-x-1/2 rounded-full bg-black" />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Demo dealer website – "Automobile Mustermann" (fictional)           */
/* ------------------------------------------------------------------ */

const NAV = {
  de: ["Fahrzeuge", "Ankauf", "Service", "Über uns", "Kontakt", "Finanzierung", "Karriere", "Standort", "Aktionen", "Ratgeber"],
  en: ["Vehicles", "We buy", "Service", "About", "Contact", "Finance", "Careers", "Location", "Offers", "Guides"],
};

export function DemoLogo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cx("inline-flex flex-col leading-none", className)}>
      <span className={cx("serif text-[1.05em] leading-[0.9] tracking-[-0.01em]", light ? "text-white" : "text-ink")}>{DEMO_DEALER.short}</span>
      <span className={cx("mt-[0.2em] font-mono text-[0.38em] tracking-[0.34em] uppercase", light ? "text-white/70" : "text-muted")}>Automobile</span>
    </span>
  );
}

export function DemoHeader({
  locale,
  navCount = 5,
  languageSwitch = false,
  overlay = false,
  className,
}: {
  locale: Locale;
  navCount?: number;
  languageSwitch?: boolean;
  overlay?: boolean;
  className?: string;
}) {
  const all = NAV[locale].slice(0, Math.min(navCount, NAV[locale].length));
  const items = all.slice(0, 5);
  const more = all.length - items.length;
  return (
    <div
      className={cx(
        "@container flex items-center justify-between gap-4 px-[4%] py-[2.2%] text-[clamp(0.5rem,0.9vw,0.72rem)] whitespace-nowrap",
        overlay ? "absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/55 to-transparent text-white" : "border-b border-line bg-white text-ink",
        className,
      )}
    >
      <DemoLogo light={overlay} className="text-[1.5em]" />
      <div className="hidden items-center gap-[1.6em] @[34rem]:flex">
        {items.map((item) => (
          <span key={item} className={overlay ? "text-white/85" : "text-ink-soft"}>
            {item}
          </span>
        ))}
        {more > 0 ? (
          <span key={`more-${more}`} className={cx("pop-in rounded-full px-[0.6em] py-[0.15em] font-mono", overlay ? "bg-white/15 text-white" : "bg-paper-2 text-ink")}>
            +{more}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-[0.8em]">
        {languageSwitch ? (
          <span className={cx("pop-in rounded-full border px-[0.7em] py-[0.25em] font-mono text-[0.85em]", overlay ? "border-white/40" : "border-line-strong")}>
            DE · EN
          </span>
        ) : null}
        <Phone className="size-[1.2em]" />
        <span className={cx("hidden rounded-full px-[1em] py-[0.45em] font-medium @[26rem]:inline", overlay ? "bg-white text-ink" : "bg-ink text-white")}>
          {locale === "de" ? "Fahrzeug verkaufen" : "Sell your car"}
        </span>
      </div>
    </div>
  );
}

export function DemoHero({
  locale,
  image = "showroom-bright",
  navCount,
  languageSwitch,
  priority = false,
  className,
}: {
  locale: Locale;
  image?: DemoImage;
  navCount?: number;
  languageSwitch?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={cx("relative aspect-[16/7] overflow-hidden bg-night", className)}>
      <Image src={demoImage(image)} alt="" fill sizes="(min-width: 1024px) 720px, 92vw" className="object-cover" priority={priority} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
      <DemoHeader locale={locale} navCount={navCount} languageSwitch={languageSwitch} overlay />
      <div className="absolute bottom-[12%] left-[4%] max-w-[55%] text-white">
        <p className="font-mono text-[clamp(0.42rem,0.7vw,0.6rem)] tracking-[0.3em] uppercase opacity-75">{DEMO_DEALER.city}</p>
        <p className="serif mt-[0.4em] text-[clamp(1rem,2.6vw,2.2rem)] leading-[0.95]">
          {locale === "de" ? (
            <>
              Ihr nächstes Fahrzeug <em className="italic">wartet.</em>
            </>
          ) : (
            <>
              Your next car is <em className="italic">waiting.</em>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export function FilterBar({ locale, active = 0, count }: { locale: Locale; active?: number; count: number }) {
  const chips = locale === "de" ? ["Alle", "SUV", "Limousine", "Coupé"] : ["All", "SUV", "Saloon", "Coupé"];
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-[4%] py-[2.4%] text-[clamp(0.5rem,0.85vw,0.7rem)]">
      <div className="flex items-center gap-[0.5em]">
        {chips.map((chip, i) => (
          <span
            key={chip}
            className={cx(
              "rounded-full border px-[0.9em] py-[0.35em] transition-colors duration-300",
              i === active ? "border-ink bg-ink text-white" : "border-line-strong text-ink-soft",
            )}
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-[0.8em] text-muted">
        <span className="font-mono tabular">
          {count} {locale === "de" ? "Fahrzeuge" : "vehicles"}
        </span>
        <span className="hidden items-center gap-[0.4em] rounded-full border border-line-strong px-[0.8em] py-[0.35em] sm:inline-flex">
          <Sliders className="size-[1.1em]" /> {locale === "de" ? "Filter" : "Filters"}
        </span>
        <span className="hidden items-center gap-[0.4em] rounded-full border border-line-strong px-[0.8em] py-[0.35em] md:inline-flex">
          <Search className="size-[1.1em]" />
        </span>
      </div>
    </div>
  );
}

const nf = (locale: Locale) => new Intl.NumberFormat(locale === "de" ? "de-DE" : "en-GB");
export const ps = (kw: number) => Math.round(kw * 1.35962);

export type CardState = "updated" | "new" | "sold" | undefined;

export function VehicleCard({
  vehicle,
  locale,
  state,
  priceCents,
  sizes = "240px",
  className,
}: {
  vehicle: DemoVehicle;
  locale: Locale;
  state?: CardState;
  priceCents?: number;
  sizes?: string;
  className?: string;
}) {
  const price = priceCents ?? vehicle.priceCents;
  return (
    <div
      className={cx(
        "group relative overflow-hidden rounded-[6px] bg-white text-ink shadow-[0_0_0_1px_rgb(18_18_18/0.07)] transition-[box-shadow,opacity,transform] duration-500",
        state === "updated" && "shadow-[0_0_0_2px_var(--color-champagne-deep)]",
        state === "new" && "pop-in shadow-[0_0_0_2px_var(--color-champagne-deep)]",
        state === "sold" && "opacity-60",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
        <Image
          src={demoImage(vehicle.image, "sm")}
          alt=""
          fill
          sizes={sizes}
          className={cx("object-cover transition-transform duration-700 group-hover:scale-[1.04]", state === "sold" && "grayscale")}
        />
        <span className="absolute top-[6%] left-[6%] rounded-full bg-white/90 px-[0.7em] py-[0.25em] font-mono text-[clamp(0.45rem,0.7vw,0.6rem)] text-ink">
          {vehicle.firstReg}
        </span>
        {state === "sold" ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="rotate-[-8deg] rounded-[4px] border-2 border-white px-[0.8em] py-[0.2em] font-mono text-[clamp(0.6rem,1vw,0.85rem)] tracking-[0.2em] text-white uppercase">
              {locale === "de" ? "Verkauft" : "Sold"}
            </span>
          </span>
        ) : null}
        {state === "updated" || state === "new" ? (
          <span className="absolute top-[6%] right-[6%] rounded-full bg-champagne-deep px-[0.7em] py-[0.25em] text-[clamp(0.45rem,0.7vw,0.6rem)] font-medium text-white">
            {state === "new" ? (locale === "de" ? "Neu" : "New") : locale === "de" ? "Preis aktualisiert" : "Price updated"}
          </span>
        ) : null}
      </div>
      <div className="p-[6%] text-[clamp(0.55rem,0.9vw,0.78rem)]">
        <p className="font-mono text-[0.78em] tracking-[0.14em] text-muted uppercase">{vehicle.make}</p>
        <p className="mt-[0.2em] truncate font-medium">{vehicle.model}</p>
        <p className="mt-[0.4em] truncate text-[0.82em] text-muted tabular">
          {nf(locale).format(vehicle.km)} km · {vehicle.powerKw} kW ({ps(vehicle.powerKw)} PS) · {vehicle.fuel[locale]}
        </p>
        <p key={price} className="serif mt-[0.5em] text-[1.6em] leading-none tabular">
          {formatEuro(price, locale)}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Seller form (Ankauf) – static rendering for previews                */
/* ------------------------------------------------------------------ */

export const SELLER_STEPS = {
  de: ["Fahrzeug", "Zustand", "Fotos", "Kontakt"],
  en: ["Vehicle", "Condition", "Photos", "Contact"],
};

export function StepDots({ step, total = 4, className }: { step: number; total?: number; className?: string }) {
  return (
    <div className={cx("grid gap-[3px]", className)} style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }} aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cx("h-[3px] rounded-full transition-colors duration-500", i < step ? "bg-ink" : "bg-line")} />
      ))}
    </div>
  );
}

export function PhotoTile({ image, uploaded = true, progress }: { image?: DemoImage; uploaded?: boolean; progress?: number }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-[5px] bg-paper-2">
      {image ? <Image src={demoImage(image, "sm")} alt="" fill sizes="120px" className={cx("object-cover transition-opacity duration-500", uploaded ? "opacity-100" : "opacity-50")} /> : null}
      {!image ? (
        <span className="absolute inset-0 flex items-center justify-center rounded-[5px] border border-dashed border-line-strong text-subtle">
          <Camera className="size-[30%]" />
        </span>
      ) : null}
      {image && uploaded ? (
        <span className="absolute right-[6%] bottom-[6%] flex size-[24%] items-center justify-center rounded-full bg-white text-success shadow">
          <Check className="size-[70%]" strokeWidth={2.4} />
        </span>
      ) : null}
      {image && !uploaded && progress !== undefined ? (
        <span className="absolute inset-x-[8%] bottom-[10%] h-[5%] overflow-hidden rounded-full bg-white/60">
          <span className="block h-full origin-left bg-white" style={{ transform: `scaleX(${progress})` }} />
        </span>
      ) : null}
    </div>
  );
}
