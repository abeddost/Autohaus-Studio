import Image from "next/image";
import Link from "next/link";
import { DEMO_DEALER, DEMO_VEHICLES } from "@/config/demo";
import { EMPTY_SELECTION } from "@/lib/pricing/selection";
import { FIXED_PACKAGES, PLATFORM_PACKAGE, type Locale, type PackageId } from "@/config/pricing";
import { getDictionary } from "@/content";
import { calculatorHref } from "@/i18n/routes";
import { ConfiguratorPreview } from "@/components/calculator/ConfiguratorPreview";
import { BrowserFrame, DemoHero, DemoLogo, FilterBar, PhoneFrame, PhotoTile, StepDots, VehicleCard } from "@/components/demo/DemoSite";
import { FinalCta } from "@/components/home/Sections";
import { ArrowRight, Check } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { DemoBadge, cx } from "@/components/ui";

function Visual({ id, locale }: { id: string; locale: Locale }) {
  const dict = getDictionary(locale);
  const demo = dict.common.conceptDemo;
  const badge = <DemoBadge label={demo} className="absolute -top-3 right-5 z-10" />;

  if (id === "websites") {
    return (
      <div className="relative">
        {badge}
        <BrowserFrame url={DEMO_DEALER.domain} tone="light">
          <DemoHero locale={locale} image="showroom-purple" />
          <div className="grid grid-cols-3 gap-[3%] bg-paper p-[4%] text-[clamp(0.5rem,0.85vw,0.7rem)] text-ink">
            {[
              [locale === "de" ? "Öffnungszeiten" : "Opening hours", dict.calculator.preview.openingHours],
              [locale === "de" ? "Anfahrt" : "Directions", dict.calculator.preview.route],
              ["WhatsApp", "+49 ··· ···"],
            ].map(([a, b]) => (
              <div key={a} className="rounded-[6px] bg-white p-[8%] shadow-[0_0_0_1px_rgb(18_18_18/0.07)]">
                <p className="font-medium">{a}</p>
                <p className="mt-[0.3em] text-muted">{b}</p>
              </div>
            ))}
          </div>
        </BrowserFrame>
      </div>
    );
  }
  if (id === "inventory") {
    return (
      <div className="relative">
        {badge}
        <BrowserFrame url={DEMO_DEALER.domain} tone="light">
          <FilterBar locale={locale} count={42} active={1} />
          <div className="grid grid-cols-3 gap-[2.5%] bg-paper p-[3%]">
            {DEMO_VEHICLES.slice(0, 6).map((v) => (
              <VehicleCard key={v.id} vehicle={v} locale={locale} sizes="220px" />
            ))}
          </div>
        </BrowserFrame>
      </div>
    );
  }
  if (id === "purchase") {
    return (
      <div className="relative flex justify-center">
        <DemoBadge label={demo} className="absolute -top-3 right-5 z-10" />
        <PhoneFrame className="w-full max-w-[290px]">
          <div className="flex h-full flex-col bg-white px-4 pt-9 pb-4 text-ink">
            <DemoLogo className="text-[1rem]" />
            <p className="serif mt-5 text-[1.45rem] leading-none">{dict.home.demo.seller.phoneTitle}</p>
            <StepDots step={3} className="mt-4" />
            <p className="mt-5 text-[0.66rem] font-medium text-muted">{dict.home.demo.seller.photosLabel}</p>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {(["sell-s3-rear", "sell-s3-wheel", "sell-s3-light", "sell-s3-interior", "sell-cluster"] as const).map((img) => (
                <PhotoTile key={img} image={img} />
              ))}
              <PhotoTile />
            </div>
            <div className="mt-auto rounded-full bg-ink py-2.5 text-center text-[0.72rem] font-medium text-white">{dict.home.demo.seller.next}</div>
          </div>
        </PhoneFrame>
      </div>
    );
  }
  if (id === "combined" || id === "dashboards") {
    return (
      <ConfiguratorPreview
        selection={
          id === "combined"
            ? { ...EMPTY_SELECTION, projectType: "komplett", vehicleTier: "vehicles_100" }
            : { ...EMPTY_SELECTION, projectType: "plattform", platformNeeds: ["branches", "roles", "lead_workflows", "crm"] }
        }
        locale={locale}
        t={dict.calculator.preview}
        demoLabel={demo}
      />
    );
  }
  // care – operations status card
  const m = dict.services.monitor;
  return (
    <div className="relative overflow-hidden rounded-[16px] border border-edge bg-night-2 text-bone shadow-stage">
      <div className="flex items-center justify-between border-b border-edge px-6 py-5">
        <p className="serif text-[1.6rem] leading-none">{m.title}</p>
        <DemoBadge label={demo} />
      </div>
      <ul className="divide-y divide-edge">
        {m.rows.map((row, i) => (
          <li key={row} className="flex items-center gap-4 px-6 py-4">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/60 motion-reduce:hidden" style={{ animationDelay: `${i * 400}ms` }} />
              <span className="relative inline-flex size-2.5 rounded-full bg-success" />
            </span>
            <span className="flex-1 text-[0.95rem]">{row}</span>
            <span className="font-mono text-[0.72rem] text-bone-muted">{m.ok}</span>
          </li>
        ))}
      </ul>
      <div className="relative h-36">
        <Image src="/demo/headlights-dark-sm.webp" alt="" fill sizes="600px" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-night-2 to-transparent" />
      </div>
    </div>
  );
}

export function ServicesPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.services;
  const packageName = (id: PackageId) => (id === "plattform" ? PLATFORM_PACKAGE.name : FIXED_PACKAGES[id].name);

  return (
    <>
      <PageHero id="leistungen-title" eyebrow={t.hero.eyebrow} title={t.hero.title} lead={t.hero.lead} image="showroom-dark">
        <nav aria-label={t.hero.eyebrow} className="mt-14">
          <ol className="flex flex-wrap gap-2">
            {t.items.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="inline-flex items-center gap-2.5 rounded-full border border-edge-strong bg-night/40 px-4 py-2 text-sm text-bone-muted backdrop-blur transition-colors hover:border-champagne/50 hover:text-bone"
                >
                  <span className="font-mono text-[0.68rem] text-champagne tabular">0{i + 1}</span>
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </PageHero>

      {t.items.map((item, i) => {
        const dark = i % 2 === 1;
        return (
          <section
            key={item.id}
            id={item.id}
            aria-labelledby={`${item.id}-title`}
            className={cx("relative scroll-mt-20 py-24 lg:py-32", dark ? "grain bg-night text-bone" : i % 4 === 0 ? "bg-paper" : "bg-white")}
          >
            <div className={cx("container-x grid items-center gap-14 lg:grid-cols-12 lg:gap-16", dark && "relative z-[2]")}>
              <div className={cx("lg:col-span-5", dark && "lg:order-2")}>
                <p className={cx("eyebrow flex items-center gap-3", dark ? "text-bone-muted" : "text-muted")}>
                  <span className={dark ? "text-champagne" : "text-champagne-deep"}>0{i + 1}</span>
                  <span aria-hidden className={cx("h-px w-8", dark ? "bg-edge-strong" : "bg-line-strong")} />
                  {t.benefitLabel}
                </p>
                <h2 id={`${item.id}-title`} className="display-lg mt-7">
                  {item.title}
                </h2>
                <p className={cx("lead mt-7", dark ? "text-bone-muted" : "text-ink-soft")}>{item.benefit}</p>
                <p className={cx("eyebrow mt-10", dark ? "text-bone-subtle" : "text-subtle")}>{t.receiveLabel}</p>
                <ul className={cx("mt-4 border-t", dark ? "border-edge" : "border-line-strong")}>
                  {item.receive.map((point) => (
                    <li key={point} className={cx("flex gap-3 border-b py-3.5 text-[0.97rem]", dark ? "border-edge" : "border-line")}>
                      <Check className={cx("mt-1 size-4 shrink-0", dark ? "text-champagne" : "text-champagne-deep")} />
                      {point}
                    </li>
                  ))}
                </ul>
                <p className={cx("mt-6 text-[0.88rem]", dark ? "text-bone-subtle" : "text-muted")}>
                  <span className="eyebrow mr-2">{t.techLabel}</span>
                  {item.tech}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-2">
                  <span className={cx("eyebrow mr-1", dark ? "text-bone-subtle" : "text-subtle")}>{t.packageLabel}</span>
                  {item.packages.map((id) => (
                    <Link
                      key={id}
                      href={calculatorHref(locale, id)}
                      className={cx(
                        "group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[0.82rem] transition-colors",
                        dark ? "border-edge-strong text-bone-muted hover:border-champagne/60 hover:text-champagne" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink",
                      )}
                    >
                      {packageName(id as PackageId)}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>
              <div className={cx("reveal lg:col-span-7", dark && "lg:order-1")}>
                <Visual id={item.id} locale={locale} />
              </div>
            </div>
          </section>
        );
      })}

      <FinalCta locale={locale} />
    </>
  );
}
