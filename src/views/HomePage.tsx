import type { Locale } from "@/config/pricing";
import { projects } from "@/config/projects";
import { site } from "@/config/site";
import { getDictionary } from "@/content";
import { href } from "@/i18n/routes";
import { ConceptDemo } from "@/components/demo/ConceptDemo";
import { HeroShowroom } from "@/components/home/HeroShowroom";
import {
  CalculatorTeaser,
  CareOverview,
  Faq,
  FinalCta,
  PackageOverview,
  Positioning,
  ProcessSteps,
  ServiceAreas,
} from "@/components/home/Sections";
import { JsonLd } from "@/components/JsonLd";
import { ProjectFeature } from "@/components/ProjectShowcase";
import { ButtonLink, Section, SectionHeading } from "@/components/ui";

export function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <>
      <JsonLd locale={locale} />

      {/* Hero – showroom stage with the genuine client projects */}
      <HeroShowroom locale={locale} projects={projects} hero={t.home.hero} common={t.common} websitesBuilt={site.dealershipWebsitesBuilt} />

      {/* 01 Specialist positioning */}
      <Positioning locale={locale} />

      {/* 02 Service lines */}
      <ServiceAreas locale={locale} />

      {/* 03 Selected client projects */}
      <Section tone="white" labelledBy="kundenprojekte">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading index="03" eyebrow={t.home.projects.eyebrow} title={t.home.projects.title} lead={t.home.projects.lead} id="kundenprojekte" />
          <ButtonLink href={href("work", locale)} variant="outline" arrow>
            {t.home.projects.all}
          </ButtonLink>
        </div>
        <div className="mt-20 space-y-28 lg:mt-24 lg:space-y-40">
          {projects.map((project, i) => (
            <ProjectFeature key={project.slug} project={project} locale={locale} index={i} />
          ))}
        </div>
      </Section>

      {/* 04 Concept demo */}
      <Section tone="night-2" labelledBy="demo" className="overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(50%_60%_at_50%_0%,rgb(236_232_225/0.08),transparent_70%)]" />
        <SectionHeading index="04" eyebrow={t.home.demo.eyebrow} title={t.home.demo.title} lead={t.home.demo.lead} id="demo" tone="dark" />
        <div className="mt-14">
          <ConceptDemo t={t.home.demo} locale={locale} demoLabel={t.common.conceptDemo} />
        </div>
      </Section>

      {/* 05 Packages */}
      <PackageOverview locale={locale} />

      {/* 06 Configurator teaser */}
      <CalculatorTeaser locale={locale} />

      {/* 07 Process */}
      <ProcessSteps locale={locale} />

      {/* 08 Ongoing care */}
      <CareOverview locale={locale} />

      {/* 09 FAQ */}
      <Faq locale={locale} />

      {/* Final CTA */}
      <FinalCta locale={locale} />
    </>
  );
}
