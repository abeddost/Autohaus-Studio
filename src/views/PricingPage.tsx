import { DISCOVERY, EXTERNAL_COSTS, HOURLY_RATE_CENTS, PLATFORM_PACKAGE, VAT_NOTICE, type Locale } from "@/config/pricing";
import { getDictionary } from "@/content";
import { CALCULATOR_ANCHOR, calculatorHref } from "@/i18n/routes";
import { formatEuro } from "@/lib/format";
import { Calculator } from "@/components/calculator/Calculator";
import { CareOverview, Faq, FinalCta, PackageOverview } from "@/components/home/Sections";
import { Check } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { ButtonLink, Section, SectionHeading, Tag } from "@/components/ui";

export function PricingPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.pricing;
  const pricingFaq = dict.home.faq.items.filter((_, i) => [2, 3, 4, 7].includes(i));

  return (
    <>
      <PageHero
        id="preise-title"
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        image="bmw-matte-front"
        aside={<p className="text-sm text-bone-subtle lg:text-right">{VAT_NOTICE[locale]}</p>}
      />

      {/* Website configurator */}
      <section id={CALCULATOR_ANCHOR} aria-labelledby="rechner-title" className="scroll-mt-16 bg-paper-2 py-20 sm:py-24 lg:py-28">
        <div className="container-x">
          <div className="mb-14 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <SectionHeading index="01" eyebrow={dict.calculator.eyebrow} title={dict.calculator.title} id="rechner-title" />
            </div>
            <p className="self-end text-muted lg:col-span-5">{dict.calculator.lead}</p>
          </div>
          <Calculator locale={locale} t={dict.calculator} common={dict.common} />
        </div>
      </section>

      {/* Package spec sheet */}
      <PackageOverview locale={locale} index="02" />

      {/* Platform & discovery */}
      <Section tone="night" labelledBy="plattform">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="03" eyebrow={t.discovery.eyebrow} title={t.discovery.title} id="plattform" tone="dark" size="md" />
            <p className="mt-6 text-bone-muted">{PLATFORM_PACKAGE.summary[locale]}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {PLATFORM_PACKAGE.possibleFeatures.map((f) => (
                <li key={f.id}>
                  <Tag tone="dark">{f.label[locale]}</Tag>
                </li>
              ))}
            </ul>
            <ButtonLink href={calculatorHref(locale, "plattform")} variant="champagne" className="mt-10" arrow>
              {t.calculate}
            </ButtonLink>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            <div className="reveal rounded-[14px] border border-edge p-8">
              <p className="eyebrow text-bone-subtle">{t.discovery.free}</p>
              <p className="serif mt-5 text-[3rem] leading-none italic text-bone">{t.discovery.freePrice}</p>
              <p className="mt-5 text-[0.95rem] text-bone-muted">{t.discovery.freeText}</p>
            </div>
            <div className="reveal rounded-[14px] border border-champagne/35 bg-gradient-to-b from-champagne/[0.08] to-transparent p-8">
              <p className="eyebrow text-champagne">{t.discovery.paid}</p>
              <p className="serif mt-5 text-[3rem] leading-none text-bone tabular">
                {formatEuro(DISCOVERY.priceCents, locale)} <span className="font-sans text-sm text-bone-muted">{dict.common.net}</span>
              </p>
              <p className="mt-5 text-[0.95rem] text-bone-muted">{t.discovery.paidText}</p>
            </div>
          </div>
        </div>
      </Section>

      <CareOverview locale={locale} headingId="betrieb-preise" index="04" />

      {/* External costs */}
      <Section tone="paper" labelledBy="fremdkosten">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading index="05" eyebrow={dict.home.packages.eyebrow} title={t.externalTitle} lead={t.externalLead} id="fremdkosten" size="md" />
          </div>
          <ul className="border-t border-ink lg:col-span-7">
            {Object.entries(EXTERNAL_COSTS).map(([id, label]) => (
              <li key={id} className="flex gap-4 border-b border-line-strong py-5 text-[1rem]">
                <Check className="mt-1 size-4 shrink-0 text-champagne-deep" />
                {label[locale]}
              </li>
            ))}
            <li className="flex gap-4 border-b border-line-strong py-5 text-[1rem]">
              <Check className="mt-1 size-4 shrink-0 text-champagne-deep" />
              <span>
                {t.additionalWork}: <span className="font-mono tabular">{formatEuro(HOURLY_RATE_CENTS, locale)}</span>/h {dict.common.net}
              </span>
            </li>
          </ul>
        </div>
      </Section>

      <Faq locale={locale} items={pricingFaq} index="06" />
      <FinalCta locale={locale} />
    </>
  );
}
