import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/config/pricing";
import type { Project, Screenshot } from "@/config/projects";
import { projects } from "@/config/projects";
import { fill, getDictionary } from "@/content";
import { calculatorHref, contactHref, href, projectHref } from "@/i18n/routes";
import { BrowserFrame, PhoneFrame } from "@/components/demo/DemoSite";
import { FinalCta } from "@/components/home/Sections";
import { ArrowLeft, ArrowRight, Check } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { ProjectFeature, ProjectScreens } from "@/components/ProjectShowcase";
import { Accent, ButtonLink, ExternalLink, Section, Tag, cx } from "@/components/ui";

export function WorkIndexPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.work;
  return (
    <>
      <PageHero id="referenzen-title" eyebrow={t.hero.eyebrow} title={t.hero.title} lead={t.hero.lead}>
        {/* Fanned stage of the three genuine projects */}
        <div aria-hidden className="relative mx-auto mt-20 max-w-5xl [perspective:2200px]">
          <div className="grid grid-cols-3 gap-4 [transform-style:preserve-3d]">
            {projects.map((p, i) => (
              <div
                key={p.slug}
                className="fade-up"
                style={{ transform: `rotateY(${(1 - i) * 14}deg) translateZ(${i === 1 ? 60 : 0}px)`, ["--i" as string]: i + 2 }}
              >
                <BrowserFrame url={p.displayUrl}>
                  <div className="relative aspect-[16/10]">
                    <Image src={p.hero.desktop.src} alt="" fill sizes="340px" className="object-cover object-top" priority />
                  </div>
                </BrowserFrame>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-2 h-16 w-[80%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(205_179_138/0.18),transparent)] blur-xl" />
        </div>
      </PageHero>
      <Section tone="white">
        <div className="space-y-28 lg:space-y-40">
          {projects.map((project, i) => (
            <ProjectFeature key={project.slug} project={project} locale={locale} index={i} headingLevel="h2" />
          ))}
        </div>
      </Section>
      <FinalCta locale={locale} title={t.similar} lead={t.similarLead} />
    </>
  );
}

function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", { month: "long", year: "numeric" }).format(new Date(`${iso}T12:00:00Z`));
}

function GalleryShot({ shot, locale, url }: { shot: Screenshot; locale: Locale; url: string }) {
  if (shot.device === "mobile") {
    return (
      <figure className="mx-auto w-full max-w-[270px]">
        <PhoneFrame>
          <Image src={shot.src} alt={shot.alt[locale]} fill sizes="270px" className="object-cover object-top" />
        </PhoneFrame>
        <figcaption className="mt-5 text-center text-sm text-muted">{shot.alt[locale]}</figcaption>
      </figure>
    );
  }
  return (
    <figure>
      <BrowserFrame url={url} tone="light">
        <Image src={shot.src} alt={shot.alt[locale]} width={shot.width} height={shot.height} sizes="(min-width: 1280px) 1200px, 94vw" className="h-auto w-full" />
      </BrowserFrame>
      <figcaption className="eyebrow mt-5 text-muted">{shot.alt[locale]}</figcaption>
    </figure>
  );
}

export function ProjectDetailPage({ project, locale }: { project: Project; locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.work;
  const desktopGallery = project.gallery.filter((s) => s.device === "desktop");
  const mobileGallery = project.gallery.filter((s) => s.device === "mobile");
  const others = projects.filter((p) => p.slug !== project.slug);

  return (
    <>
      <section aria-labelledby="projekt-title" className="grain relative isolate overflow-hidden bg-night text-bone">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_70%_10%,rgb(236_232_225/0.13),transparent_70%)]" />
        <div className="container-x relative z-[2] pt-32 pb-20 sm:pt-36 lg:pb-28">
          <Link href={href("work", locale)} className="inline-flex items-center gap-2 text-sm text-bone-muted hover:text-bone">
            <ArrowLeft className="size-4" />
            {t.back}
          </Link>
          <div className="mt-12 grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Tag tone="accent-dark">{dict.common.clientProject}</Tag>
              <h1 id="projekt-title" className="display-hero mt-7">
                {project.name}
              </h1>
              <p className="eyebrow mt-6 text-bone-muted">{project.sector[locale]}</p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <p className="eyebrow text-bone-subtle">{t.liveSite}</p>
              <ExternalLink href={project.url} newTabLabel={dict.common.opensInNewTab} className="serif mt-3 text-[1.8rem] leading-none text-bone hover:text-champagne">
                {project.displayUrl}
              </ExternalLink>
            </div>
          </div>
          <div className="mt-16">
            <ProjectScreens project={project} locale={locale} tone="dark" priority />
            <p className="mt-6 text-sm text-bone-subtle">{fill(t.screenshotNote, { date: formatDate(project.verifiedAt, locale) })}</p>
          </div>
        </div>
      </section>

      <Section tone="paper">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="space-y-14 lg:col-span-7">
            <div>
              <h2 className="eyebrow text-champagne-deep">{t.overview}</h2>
              <p className="serif mt-5 text-[2rem] leading-[1.18]">{project.overview[locale]}</p>
            </div>
            <div className="grid gap-10 border-t border-line-strong pt-10 sm:grid-cols-2">
              <div>
                <h2 className="eyebrow text-subtle">{t.need}</h2>
                <p className="mt-4 text-[1.02rem] text-ink-soft">{project.need[locale]}</p>
              </div>
              <div>
                <h2 className="eyebrow text-subtle">{t.contribution}</h2>
                <p className="mt-4 text-[1.02rem] text-ink-soft">{project.contribution[locale]}</p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-[16px] bg-ink p-8 text-paper">
              <h2 className="eyebrow text-champagne">{t.features}</h2>
              <ul className="mt-6 divide-y divide-white/10">
                {project.features.map((feature) => (
                  <li key={feature.de} className="flex gap-3 py-3.5 text-[0.95rem]">
                    <Check className="mt-1 size-4 shrink-0 text-champagne" />
                    {feature[locale]}
                  </li>
                ))}
              </ul>
              <ul className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li key={tag.de}>
                    <Tag tone="dark">{tag[locale]}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {project.gallery.length ? (
        <Section tone="white" labelledBy="galerie">
          <h2 id="galerie" className="display-lg">
            <Accent text={t.gallery} />
          </h2>
          <div className="mt-16 space-y-20">
            {desktopGallery.map((shot) => (
              <div key={shot.src} className="reveal">
                <GalleryShot shot={shot} locale={locale} url={project.displayUrl} />
              </div>
            ))}
            {mobileGallery.length ? (
              <div className={cx("reveal grid gap-14", mobileGallery.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "")}>
                {mobileGallery.map((shot) => (
                  <GalleryShot key={shot.src} shot={shot} locale={locale} url={project.displayUrl} />
                ))}
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      <section aria-labelledby="aehnliches-projekt" className="grain relative bg-night text-bone">
        <div className="container-x relative z-[2] grid gap-14 py-24 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-7">
            <h2 id="aehnliches-projekt" className="display-lg">
              <Accent text={t.similar} tone="dark" />
            </h2>
            <p className="lead mt-6 text-bone-muted">{t.similarLead}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href={contactHref(locale, { projekt: project.slug })} variant="champagne" size="lg" arrow>
                {t.similar}
              </ButtonLink>
              <ButtonLink href={calculatorHref(locale)} variant="ghost-dark" size="lg">
                {dict.common.ctaProjectPrice}
              </ButtonLink>
            </div>
          </div>
          <div className="lg:col-span-5">
            <h3 className="eyebrow text-bone-subtle">{t.otherProjects}</h3>
            <ul className="mt-6 divide-y divide-edge border-y border-edge">
              {others.map((p) => (
                <li key={p.slug}>
                  <Link href={projectHref(p.slug, locale)} className="group flex items-center gap-5 py-5">
                    <span className="relative h-14 w-24 shrink-0 overflow-hidden rounded-[6px] bg-night-3">
                      <Image src={p.hero.desktop.src} alt="" fill sizes="96px" className="object-cover object-top" />
                    </span>
                    <span className="flex-1">
                      <span className="serif block text-[1.5rem] leading-none">{p.name}</span>
                      <span className="mt-1.5 block text-sm text-bone-muted">{p.sector[locale]}</span>
                    </span>
                    <ArrowRight className="size-5 text-bone-subtle transition-transform group-hover:translate-x-1 group-hover:text-champagne" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
