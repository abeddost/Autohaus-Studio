import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/config/pricing";
import type { Project } from "@/config/projects";
import { getDictionary } from "@/content";
import { projectHref } from "@/i18n/routes";
import { BrowserFrame, PhoneFrame } from "./demo/DemoSite";
import { ArrowRight } from "./icons";
import { ExternalLink, Tag, cx } from "./ui";

/** Desktop + overlapping phone screenshot composition of a genuine project. */
export function ProjectScreens({
  project,
  locale,
  priority = false,
  tone = "light",
  className,
}: {
  project: Project;
  locale: Locale;
  priority?: boolean;
  tone?: "light" | "dark";
  className?: string;
}) {
  const { desktop, mobile } = project.hero;
  return (
    <div className={cx("relative", mobile && "pr-[11%] pb-[8%]", className)}>
      <BrowserFrame url={project.displayUrl} tone={tone}>
        <div className="relative aspect-[16/10] bg-paper-2">
          <Image
            src={desktop.src}
            alt={desktop.alt[locale]}
            fill
            sizes="(min-width: 1280px) 820px, (min-width: 1024px) 62vw, 94vw"
            className="object-cover object-top"
            priority={priority}
          />
        </div>
      </BrowserFrame>
      {mobile ? (
        <PhoneFrame className="absolute right-0 bottom-0 w-[22%] min-w-[86px]">
          <Image src={mobile.src} alt={mobile.alt[locale]} fill sizes="(min-width: 1024px) 200px, 24vw" className="object-cover object-top" />
        </PhoneFrame>
      ) : null}
    </div>
  );
}

/** Editorial project row with large genuine screenshots. */
export function ProjectFeature({
  project,
  locale,
  index,
  headingLevel = "h3",
  priority = false,
}: {
  project: Project;
  locale: Locale;
  index: number;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}) {
  const t = getDictionary(locale);
  const reversed = index % 2 === 1;
  const Heading = headingLevel;
  const headingId = `projekt-${project.slug}`;

  return (
    <article aria-labelledby={headingId} className="reveal grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
      <div className={cx("lg:col-span-7", reversed && "lg:order-2")}>
        <Link
          href={projectHref(project.slug, locale)}
          tabIndex={-1}
          aria-hidden
          className="block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1"
        >
          <ProjectScreens project={project} locale={locale} priority={priority} />
        </Link>
      </div>
      <div className={cx("lg:col-span-5", reversed && "lg:order-1")}>
        <div className="flex items-center gap-4">
          <span className="serif text-[3.2rem] leading-none text-champagne-deep/70 tabular">{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden className="h-px flex-1 bg-line-strong" />
          <Tag tone="accent">{t.common.clientProject}</Tag>
        </div>
        <Heading id={headingId} className="display-md mt-7">
          {project.name}
        </Heading>
        <p className="eyebrow mt-3 text-muted">{project.sector[locale]}</p>
        <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">{project.summary[locale]}</p>
        <ul className="mt-7 flex flex-wrap gap-2" aria-label={t.work.features}>
          {project.tags.map((tag) => (
            <li key={tag.de}>
              <Tag>{tag[locale]}</Tag>
            </li>
          ))}
        </ul>
        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3">
          <Link href={projectHref(project.slug, locale)} className="group inline-flex items-center gap-2 font-medium text-ink hover:text-champagne-deep">
            {t.common.viewProject}
            <span className="sr-only">: {project.name}</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <ExternalLink href={project.url} newTabLabel={t.common.opensInNewTab} className="text-muted hover:text-ink">
            {t.common.visitWebsite}
            <span className="sr-only">: {project.displayUrl}</span>
          </ExternalLink>
        </div>
      </div>
    </article>
  );
}
