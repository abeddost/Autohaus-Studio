import Image from "next/image";
import Link from "next/link";
import { demoImage, type DemoImage } from "@/config/demo";
import {
  CARE_FEATURES,
  CARE_LIMITS,
  FIXED_PACKAGES,
  PACKAGE_ORDER,
  PLATFORM_PACKAGE,
  VAT_NOTICE,
  type Locale,
  type PackageId,
} from "@/config/pricing";
import { EMPTY_SELECTION } from "@/lib/pricing/selection";
import { fill, getDictionary } from "@/content";
import { calculatorHref, href } from "@/i18n/routes";
import { formatEuro, formatMonthly } from "@/lib/format";
import { ConfiguratorPreview } from "../calculator/ConfiguratorPreview";
import { ArrowRight, Check, Plus } from "../icons";
import { PACKAGE_ICONS } from "../packageIcons";
import { Accent, ButtonLink, Eyebrow, Section, SectionHeading, cx } from "../ui";

/* --------------------------- 02 Manifest --------------------------- */

export function Positioning({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home.positioning;
  return (
    <Section tone="paper" labelledBy="positionierung">
      <Eyebrow index="01">{t.eyebrow}</Eyebrow>
      <h2 id="positionierung" className="display-xl reveal mt-8 max-w-5xl">
        <Accent text={t.title} />
      </h2>
      <div className="mt-16 grid gap-12 lg:mt-24 lg:grid-cols-12 lg:gap-16">
        <p className="lead reveal text-ink-soft lg:col-span-5">{t.body}</p>
        <dl className="grid gap-x-12 sm:grid-cols-2 lg:col-span-7">
          {t.benefits.map((benefit, i) => (
            <div key={benefit.title} className="reveal border-t border-line-strong py-7">
              <dt className="flex items-baseline gap-4">
                <span className="serif text-[1.6rem] leading-none text-champagne-deep tabular">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[1.05rem] font-medium tracking-[-0.01em]">{benefit.title}</span>
              </dt>
              <dd className="mt-3 pl-11 text-[0.97rem] text-muted">{benefit.text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

/* --------------------------- 03 Service lines ---------------------- */

const SERVICE_LINES: Record<string, { anchor: string; image: DemoImage }> = {
  sales: { anchor: "inventory", image: "showroom-dark" },
  purchase: { anchor: "purchase", image: "sell-s3-rear" },
  apps: { anchor: "dashboards", image: "light-lines" },
};

export function ServiceAreas({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.home.services;
  return (
    <Section tone="night" labelledBy="leistungsbereiche">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading index="02" eyebrow={t.eyebrow} title={t.title} id="leistungsbereiche" tone="dark" size="lg" />
        <ButtonLink href={href("services", locale)} variant="ghost-dark" arrow>
          {dict.common.ctaServices}
        </ButtonLink>
      </div>
      <div className="mt-16 grid gap-5 md:grid-cols-3 lg:mt-20">
        {t.items.map((item, i) => {
          const line = SERVICE_LINES[item.key];
          return (
            <article
              key={item.key}
              className="reveal group relative flex min-h-[34rem] flex-col overflow-hidden rounded-[14px] border border-edge bg-night-3"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <Image
                src={demoImage(line.image)}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover opacity-70 transition-[transform,opacity] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:opacity-85"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-night/10 via-night/75 to-night" />
              <div className="relative z-[2] flex flex-1 flex-col p-7 lg:p-8">
                <div className="flex items-center justify-between">
                  <span className="eyebrow text-champagne">{String(i + 1).padStart(2, "0")}</span>
                  <span className="eyebrow text-bone-muted">{item.title}</span>
                </div>
                <div className="mt-auto">
                  <h3 className="serif text-[2.35rem] leading-[1.02] text-bone">{item.headline}</h3>
                  <p className="mt-4 text-[0.95rem] text-bone-muted">{item.text}</p>
                  <ul className="mt-6 space-y-2 border-t border-edge pt-5 text-[0.9rem] text-bone">
                    {item.points.map((point) => (
                      <li key={point} className="flex gap-2.5">
                        <Check className="mt-1 size-3.5 shrink-0 text-champagne" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`${href("services", locale)}#${line.anchor}`}
                    className="mt-7 inline-flex items-center gap-2 text-sm text-bone hover:text-champagne"
                  >
                    {dict.common.ctaServices}
                    <span className="sr-only">: {item.title}</span>
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-champagne transition-transform duration-700 group-hover:scale-x-100" />
            </article>
          );
        })}
      </div>
    </Section>
  );
}

/* --------------------------- 05 Package spec sheet ---------------- */

export function PackageOverview({ locale, index = "05" }: { locale: Locale; index?: string }) {
  const dict = getDictionary(locale);
  const t = dict.home.packages;
  const v = t.values;

  const cell = (id: PackageId, row: keyof typeof t.rows): string => {
    if (id === "plattform") return row === "care" ? t.onRequest : v.individual;
    const pkg = FIXED_PACKAGES[id];
    switch (row) {
      case "pages":
        return String(pkg.includedPages);
      case "stock":
        if (id === "showroom") return `${fill(v.upTo, { count: 50 })} · ${fill(v.upgrade, { count: 200 })}`;
        if (id === "komplett") return fill(v.upTo, { count: 100 });
        return v.none;
      case "seller":
        return id === "ankauf" || id === "komplett" ? v.included : v.none;
      case "team":
        return id === "ankauf" ? v.admin : id === "komplett" ? v.staff : v.none;
      case "care":
        return `${formatMonthly(pkg.care.monthlyCents, locale)}${pkg.care.required ? "" : ` · ${t.careOptional}`}`;
    }
  };

  return (
    <Section tone="paper" labelledBy="pakete">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <SectionHeading index={index} eyebrow={t.eyebrow} title={t.title} lead={t.lead} id="pakete" />
        <ButtonLink href={href("pricing", locale)} variant="outline" arrow>
          {dict.common.ctaPricing}
        </ButtonLink>
      </div>

      <div className="scrollbar-none -mx-5 mt-16 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:mt-20 lg:overflow-visible lg:px-0">
        <div className="grid min-w-[62rem] grid-cols-5 border-t border-ink">
          {PACKAGE_ORDER.map((id, col) => {
            const Icon = PACKAGE_ICONS[id];
            const isPlatform = id === "plattform";
            const pkg = isPlatform ? PLATFORM_PACKAGE : FIXED_PACKAGES[id];
            return (
              <div
                key={id}
                className={cx(
                  "reveal group flex flex-col px-5 pt-8 pb-6 transition-colors duration-500 hover:bg-white",
                  col > 0 && "border-l border-line",
                  isPlatform && "bg-ink text-paper hover:bg-ink",
                )}
              >
                <Icon className={cx("size-6", isPlatform ? "text-champagne" : "text-champagne-deep")} />
                <h3 className="serif mt-6 text-[1.75rem] leading-none">{pkg.name}</h3>
                <p className={cx("mt-2 min-h-[2.6em] text-[0.85rem]", isPlatform ? "text-paper/60" : "text-muted")}>{pkg.intent[locale]}</p>
                <p className={cx("eyebrow mt-6", isPlatform ? "text-paper/50" : "text-subtle")}>{t.setup}</p>
                <p className="serif mt-2 min-h-[2.5rem] text-[2.3rem] leading-none tabular">
                  {isPlatform ? (
                    <span className="text-[1.45rem] italic">{dict.common.individualQuote}</span>
                  ) : (
                    <>
                      <span className={cx("mr-1.5 align-top font-sans text-[0.8rem]", isPlatform ? "" : "text-muted")}>{dict.common.from}</span>
                      {formatEuro(FIXED_PACKAGES[id as Exclude<PackageId, "plattform">].setupCents, locale)}
                    </>
                  )}
                </p>
                <dl className={cx("mt-7 flex-1 divide-y border-y text-[0.84rem]", isPlatform ? "divide-white/10 border-white/10" : "divide-line border-line")}>
                  {(Object.keys(t.rows) as (keyof typeof t.rows)[]).map((row) => (
                    <div key={row} className="py-3">
                      <dt className={cx("font-mono text-[0.62rem] tracking-[0.12em] uppercase", isPlatform ? "text-paper/45" : "text-subtle")}>{t.rows[row]}</dt>
                      <dd className="mt-1 tabular">{cell(id, row)}</dd>
                    </div>
                  ))}
                </dl>
                <Link
                  href={calculatorHref(locale, id)}
                  className={cx(
                    "mt-6 inline-flex items-center justify-between gap-2 rounded-full border px-4 py-2.5 text-[0.85rem] font-medium transition-colors",
                    isPlatform ? "border-white/20 hover:border-champagne hover:text-champagne" : "border-line-strong hover:border-ink",
                  )}
                >
                  {t.configure}
                  <span className="sr-only">: {pkg.name}</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-6 text-sm text-subtle">{VAT_NOTICE[locale]}</p>
    </Section>
  );
}

/* --------------------------- 06 Configurator teaser --------------- */

export function CalculatorTeaser({ locale, index = "06" }: { locale: Locale; index?: string }) {
  const dict = getDictionary(locale);
  const t = dict.home.teaser;
  return (
    <Section tone="night" labelledBy="konfigurator-teaser">
      <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading index={index} eyebrow={t.eyebrow} title={t.title} lead={t.lead} id="konfigurator-teaser" tone="dark" />
          <ul className="mt-10 divide-y divide-edge border-y border-edge">
            {PACKAGE_ORDER.map((id) => {
              const Icon = PACKAGE_ICONS[id];
              const pkg = id === "plattform" ? PLATFORM_PACKAGE : FIXED_PACKAGES[id];
              const price = id === "plattform" ? dict.calculator.quoteLabel : `${dict.common.from} ${formatEuro(FIXED_PACKAGES[id].setupCents, locale)}`;
              return (
                <li key={id}>
                  <Link href={calculatorHref(locale, id)} className="group flex items-center gap-4 py-4 transition-colors hover:text-champagne">
                    <Icon className="size-5 shrink-0 text-bone-muted transition-colors group-hover:text-champagne" />
                    <span className="min-w-0 flex-1 text-[0.98rem]">{pkg.intent[locale]}</span>
                    <span className="text-right font-mono text-[0.8rem] text-bone-muted tabular">{price}</span>
                    <ArrowRight className="size-4 shrink-0 text-bone-subtle transition-transform group-hover:translate-x-1 group-hover:text-champagne" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <ButtonLink href={calculatorHref(locale)} variant="champagne" size="lg" className="mt-10" arrow>
            {t.start}
          </ButtonLink>
        </div>
        <div className="reveal lg:col-span-7">
          <ConfiguratorPreview
            selection={{ ...EMPTY_SELECTION, projectType: "komplett", vehicleTier: "vehicles_100", language: true, localSeo: true }}
            locale={locale}
            t={dict.calculator.preview}
            demoLabel={dict.common.conceptDemo}
          />
        </div>
      </div>
    </Section>
  );
}

/* --------------------------- 07 Process ---------------------------- */

export function ProcessSteps({ locale, index = "07" }: { locale: Locale; index?: string }) {
  const t = getDictionary(locale).home.process;
  return (
    <Section tone="paper-2" labelledBy="ablauf">
      <SectionHeading index={index} eyebrow={t.eyebrow} title={t.title} id="ablauf" />
      <ol className="mt-20 grid gap-y-14 md:grid-cols-4">
        {t.steps.map((step, i) => (
          <li key={step.title} className="reveal relative md:pr-10" style={{ transitionDelay: `${i * 110}ms` }}>
            <div className="flex items-center gap-4">
              <span className="serif text-[5.5rem] leading-[0.8] text-ink tabular">{i + 1}</span>
              {i < t.steps.length - 1 ? (
                <span aria-hidden className="hidden h-px flex-1 bg-gradient-to-r from-line-strong to-transparent md:block" />
              ) : null}
            </div>
            <h3 className="mt-6 text-[1.15rem] font-medium tracking-[-0.015em]">{step.title}</h3>
            <p className="mt-2 text-[0.97rem] text-muted">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* --------------------------- 08 Care ------------------------------ */

export function CareOverview({ locale, headingId = "betreuung", index = "08" }: { locale: Locale; headingId?: string; index?: string }) {
  const dict = getDictionary(locale);
  const t = dict.home.care;
  const rows = (["praesenz", "showroom", "ankauf", "komplett"] as const).map((id) => FIXED_PACKAGES[id]);
  return (
    <Section tone="night" labelledBy={headingId}>
      <div className="grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading index={index} eyebrow={t.eyebrow} title={t.title} lead={t.lead} id={headingId} tone="dark" size="md" />
          <h3 className="eyebrow mt-12 text-bone-subtle">{t.included}</h3>
          <ul className="mt-5 space-y-3.5">
            {CARE_FEATURES.map((f) => (
              <li key={f.de} className="flex gap-3 text-[0.97rem] text-bone">
                <Check className="mt-1 size-4 shrink-0 text-champagne" />
                {f[locale]}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal lg:col-span-7">
          <div className="overflow-hidden rounded-[14px] border border-edge bg-night-2">
            <table className="w-full text-left text-[0.95rem]">
              <caption className="sr-only">{t.plan}</caption>
              <thead>
                <tr className="border-b border-edge">
                  <th scope="col" className="eyebrow px-6 py-5 font-medium text-bone-subtle">
                    {t.plan}
                  </th>
                  <th scope="col" className="eyebrow px-6 py-5 font-medium text-bone-subtle">
                    {t.fee}
                  </th>
                  <th scope="col" className="eyebrow hidden px-6 py-5 font-medium text-bone-subtle sm:table-cell">
                    {t.time}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {rows.map((pkg) => (
                  <tr key={pkg.id} className="transition-colors hover:bg-white/[0.02]">
                    <th scope="row" className="px-6 py-5 font-normal">
                      <span className="serif text-[1.35rem] leading-none text-bone">{pkg.name}</span>
                      {!pkg.care.required ? <span className="ml-2 text-sm text-bone-subtle">({dict.home.packages.careOptional})</span> : null}
                      {pkg.id === "showroom" ? <span className="mt-1 block text-[0.8rem] text-bone-muted">{dict.pricing.vehicleUpgrade}</span> : null}
                    </th>
                    <td className="px-6 py-5 font-mono text-bone tabular">{formatMonthly(pkg.care.monthlyCents, locale)}</td>
                    <td className="hidden px-6 py-5 font-mono text-bone-muted tabular sm:table-cell">{pkg.care.includedMinutes} min</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="px-6 py-5 font-normal">
                    <span className="serif text-[1.35rem] leading-none text-bone">{PLATFORM_PACKAGE.name}</span>
                  </th>
                  <td className="px-6 py-5 text-bone-muted" colSpan={2}>
                    {dict.pricing.platformCare}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-[0.92rem] text-bone-muted">{CARE_LIMITS[locale]}</p>
          <p className="mt-2 text-[0.8rem] text-bone-subtle">{VAT_NOTICE[locale]}</p>
        </div>
      </div>
    </Section>
  );
}

/* --------------------------- 09 FAQ ------------------------------- */

export function Faq({ locale, items, index = "09" }: { locale: Locale; items?: { q: string; a: string }[]; index?: string }) {
  const t = getDictionary(locale).home.faq;
  const list = items ?? t.items;
  return (
    <Section tone="paper" labelledBy="faq">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHeading index={index} eyebrow={t.eyebrow} title={t.title} id="faq" />
          </div>
        </div>
        <ul className="border-t border-ink lg:col-span-8">
          {list.map((item) => (
            <li key={item.q} className="border-b border-line-strong">
              <details className="group">
                <summary className="flex cursor-pointer items-start justify-between gap-8 py-7 transition-colors hover:text-champagne-deep">
                  <span className="serif text-[1.55rem] leading-[1.15]">{item.q}</span>
                  <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong transition-transform duration-300 group-open:rotate-45">
                    <Plus className="size-4" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-8 text-[1.02rem] leading-relaxed text-muted">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* --------------------------- Final CTA ---------------------------- */

export function FinalCta({ locale, title, lead }: { locale: Locale; title?: string; lead?: string }) {
  const dict = getDictionary(locale);
  const t = dict.home.finalCta;
  return (
    <section aria-labelledby="final-cta" className="grain relative isolate overflow-hidden bg-night text-bone">
      <Image src={demoImage("headlights-dark")} alt="" fill sizes="100vw" className="-z-10 object-cover object-center opacity-80" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/80 to-night/20" />
      <div className="container-x relative z-[2] py-32 lg:py-44">
        <Eyebrow tone="dark">{t.eyebrow}</Eyebrow>
        <h2 id="final-cta" className="display-xl mt-8 max-w-4xl">
          <Accent text={title ?? t.title} tone="dark" />
        </h2>
        <p className="lead mt-8 max-w-xl text-bone-muted">{lead ?? t.lead}</p>
        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href={calculatorHref(locale)} variant="champagne" size="lg" arrow>
            {dict.common.ctaProjectPrice}
          </ButtonLink>
          <ButtonLink href={href("contact", locale)} variant="ghost-dark" size="lg">
            {dict.common.ctaEnquire}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
