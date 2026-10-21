import Image from "next/image";
import type { Locale } from "@/config/pricing";
import { site } from "@/config/site";
import { fill, getDictionary } from "@/content";
import { FinalCta } from "@/components/home/Sections";
import { Check } from "@/components/icons";
import { Missing } from "@/components/Missing";
import { Accent, Section, SectionHeading } from "@/components/ui";

export function AboutPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.about;
  const initials = site.owner.name
    .split(" ")
    .map((part) => part[0])
    .join("");
  const count = String(site.dealershipWebsitesBuilt).padStart(2, "0");

  return (
    <>
      <section aria-labelledby="ueber-title" className="grain relative isolate overflow-hidden bg-night text-bone">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_80%_10%,rgb(236_232_225/0.14),transparent_70%)]" />
        <div className="container-x relative z-[2] grid items-end gap-14 pt-36 pb-20 sm:pt-44 lg:grid-cols-12 lg:pb-28">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-3 text-bone-muted">
              <span aria-hidden className="h-px w-8 bg-champagne/70" />
              {t.hero.eyebrow}
            </p>
            <h1 id="ueber-title" className="display-hero mt-8">
              <Accent text={site.owner.name} tone="dark" />
            </h1>
            <p className="eyebrow mt-6 text-bone-muted">{site.owner.role[locale]}</p>
            <p className="lead mt-8 max-w-xl text-bone-muted">{t.hero.lead}</p>
          </div>
          <div className="lg:col-span-5">
            {site.owner.portrait ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-night-3 shadow-stage">
                <Image src={site.owner.portrait} alt={fill(t.portraitAlt, { name: site.owner.name })} fill sizes="(min-width: 1024px) 440px, 92vw" className="object-cover" priority />
              </div>
            ) : (
              <div className="relative flex aspect-[4/5] max-h-[460px] w-full flex-col justify-between overflow-hidden rounded-[16px] border border-edge bg-gradient-to-b from-night-3 to-night p-8 shadow-stage lg:max-h-none">
                <div aria-hidden className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(60%_70%_at_50%_0%,rgb(205_179_138/0.16),transparent_70%)]" />
                <span className="relative self-start">
                  <Missing field="Porträtfoto (site.owner.portrait)" />
                </span>
                <span aria-hidden className="serif relative text-center text-[9rem] leading-none text-champagne/90 italic">
                  {initials.toLowerCase()}
                </span>
                <p className="eyebrow relative text-center text-bone-subtle">{site.name}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Section tone="paper">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="serif text-[9rem] leading-[0.8] text-ink tabular">{count}</p>
            <p className="eyebrow mt-5 max-w-[16rem] text-muted">{dict.home.hero.facts[0].replace("{count} ", "")}</p>
          </div>
          <div className="space-y-7 lg:col-span-8">
            {t.intro.map((paragraph, i) => (
              <p key={paragraph} className={i === 0 ? "serif text-[2.1rem] leading-[1.18]" : "lead text-ink-soft"}>
                {fill(paragraph, { count: site.dealershipWebsitesBuilt })}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="night" labelledBy="arbeitsweise">
        <SectionHeading index="02" eyebrow={dict.nav.about} title={t.principlesTitle} id="arbeitsweise" tone="dark" size="md" />
        <ol className="mt-16 grid border-t border-edge sm:grid-cols-2">
          {t.principles.map((p, i) => (
            <li key={p.title} className="reveal border-b border-edge py-10 sm:odd:border-r sm:odd:pr-12 sm:even:pl-12">
              <span className="serif text-[3rem] leading-none text-champagne tabular">0{i + 1}</span>
              <h3 className="serif mt-5 text-[1.9rem] leading-none">{p.title}</h3>
              <p className="mt-4 max-w-md text-bone-muted">{p.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="white" labelledBy="technik">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading index="03" eyebrow={dict.nav.about} title={t.techTitle} id="technik" size="md" />
            <p className="mt-6 text-muted">{t.techLead}</p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label={t.techTitle}>
              {["JavaScript", "TypeScript", "Node.js"].map((tech) => (
                <li key={tech} className="rounded-full border border-ink px-4 py-1.5 font-mono text-[0.8rem]">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
          <ul className="border-t border-ink lg:col-span-7">
            {t.techPoints.map((point) => (
              <li key={point} className="flex gap-4 border-b border-line-strong py-6 text-[1.1rem]">
                <Check className="mt-1.5 size-4 shrink-0 text-champagne-deep" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <FinalCta locale={locale} />
    </>
  );
}
