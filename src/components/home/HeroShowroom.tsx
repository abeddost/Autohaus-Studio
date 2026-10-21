"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { Locale } from "@/config/pricing";
import type { Project } from "@/config/projects";
import type { Dictionary } from "@/content";
import { fill } from "@/content";
import { calculatorHref, href, projectHref } from "@/i18n/routes";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { BrowserFrame, PhoneFrame } from "../demo/DemoSite";
import { ArrowRight } from "../icons";
import { ButtonLink, ExternalLink, RevealTitle, Tag, cx } from "../ui";

const INTERVAL_MS = 6500;

/** Stage slots: 0 = front, 1 = behind right, 2 = far behind left. */
const SLOTS: CSSProperties[] = [
  { transform: "translate3d(0,0,0) rotateY(-13deg)", filter: "brightness(1)", zIndex: 3, opacity: 1 },
  { transform: "translate3d(31%,-5%,-460px) rotateY(-13deg)", filter: "brightness(0.42)", zIndex: 2, opacity: 0.95 },
  { transform: "translate3d(-27%,-9%,-760px) rotateY(-13deg)", filter: "brightness(0.25)", zIndex: 1, opacity: 0.85 },
];

type Props = {
  locale: Locale;
  projects: Project[];
  hero: Dictionary["home"]["hero"];
  common: Dictionary["common"];
  websitesBuilt: number;
};

export function HeroShowroom({ locale, projects, hero, common, websitesBuilt }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const running = !paused && !hovering && !reduced;
  const project = projects[active];

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % projects.length), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [running, projects.length, active]);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || reduced) return;
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      onPointerMove={onPointerMove}
      className="grain relative isolate overflow-hidden bg-night text-bone"
      style={{ "--mx": "70%", "--my": "35%" } as CSSProperties}
    >
      {/* Lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(55%_60%_at_68%_0%,rgb(236_232_225/0.16),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_var(--mx)_var(--my),rgb(205_179_138/0.09),transparent_60%)] transition-[background] duration-300" />
        <div className="absolute top-0 right-[8%] h-[85%] w-[55%] bg-[conic-gradient(from_180deg_at_50%_0%,transparent_165deg,rgb(236_232_225/0.07)_180deg,transparent_195deg)] blur-md" />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-transparent via-night-2/60 to-night-2" />
        <div className="absolute right-[-10%] bottom-[16%] h-[30%] w-[75%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(205_179_138/0.13),transparent)] blur-2xl" />
      </div>

      <div className="container-x relative z-[2] grid items-center gap-14 pt-32 pb-16 sm:pt-36 lg:min-h-[100svh] lg:grid-cols-12 lg:gap-6 lg:pt-28 lg:pb-10">
        {/* Copy */}
        <div className="lg:col-span-6 xl:col-span-5">
          <p className="eyebrow fade-up flex items-center gap-3 text-bone-muted" style={{ "--i": 0 } as CSSProperties}>
            <span aria-hidden className="h-px w-8 bg-champagne/70" />
            {hero.eyebrow}
          </p>
          <RevealTitle text={hero.title} id="hero-title" className="display-hero mt-8 max-w-[11ch] text-bone" />
          <p className="lead fade-up mt-8 max-w-md text-bone-muted" style={{ "--i": 6 } as CSSProperties}>
            {hero.lead}
          </p>
          <div className="fade-up mt-10 flex flex-wrap gap-3" style={{ "--i": 7 } as CSSProperties}>
            <ButtonLink href={calculatorHref(locale)} variant="champagne" size="lg" arrow>
              {common.ctaProjectPrice}
            </ButtonLink>
            <ButtonLink href={href("work", locale)} variant="ghost-dark" size="lg">
              {common.ctaReferences}
            </ButtonLink>
          </div>
        </div>

        {/* Showroom stage */}
        <div
          className="relative lg:col-span-6 lg:-mr-[8vw] xl:col-span-7"
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocusCapture={() => setHovering(true)}
          onBlurCapture={() => setHovering(false)}
        >
          <div role="group" aria-roledescription="carousel" aria-label={hero.stage.label} className="relative">
            <div className="relative aspect-[16/11] [perspective:2400px] [perspective-origin:30%_40%]">
              {projects.map((p, i) => {
                const slot = (i - active + projects.length) % projects.length;
                return (
                  <div
                    key={p.slug}
                    aria-hidden={slot !== 0}
                    className="absolute inset-x-0 top-[6%] [transform-style:preserve-3d] transition-[transform,filter,opacity] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={SLOTS[slot]}
                  >
                    <BrowserFrame url={p.displayUrl}>
                      <div className="relative aspect-[16/10] bg-night-3">
                        <Image
                          src={p.hero.desktop.src}
                          alt={p.hero.desktop.alt[locale]}
                          fill
                          priority={i === 0}
                          sizes="(min-width: 1280px) 820px, (min-width: 1024px) 56vw, 94vw"
                          className="object-cover object-top"
                        />
                      </div>
                    </BrowserFrame>
                    {/* Floor reflection */}
                    <div
                      aria-hidden
                      className="pointer-events-none mt-1 h-[30%] overflow-hidden opacity-[0.16] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
                    >
                      <div className="relative aspect-[16/10] -scale-y-100 blur-[1px]">
                        <Image src={p.hero.desktop.src} alt="" fill sizes="40vw" className="object-cover object-top" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Active project's phone */}
              {project.hero.mobile ? (
                <div key={project.slug} className="pop-in absolute right-[4%] bottom-[2%] z-10 w-[18%] min-w-[84px] lg:right-[14%]">
                  <PhoneFrame>
                    <Image
                      src={project.hero.mobile.src}
                      alt={project.hero.mobile.alt[locale]}
                      fill
                      sizes="180px"
                      className="object-cover object-top"
                    />
                  </PhoneFrame>
                </div>
              ) : null}
            </div>

            {/* Caption + controls */}
            <div className="relative mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between lg:mr-[8vw]">
              <div aria-live={running ? "off" : "polite"} className="min-w-0">
                <div className="flex items-center gap-3">
                  <Tag tone="accent-dark">{common.clientProject}</Tag>
                  <span className="eyebrow text-bone-subtle">
                    {fill(hero.stage.count, { current: active + 1, total: projects.length })}
                  </span>
                </div>
                <p key={project.slug} className="serif slide-in mt-3 text-[2rem] leading-none">
                  {project.name}
                </p>
                <p className="mt-2 text-sm text-bone-muted">{project.sector[locale]}</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <Link href={projectHref(project.slug, locale)} className="group inline-flex items-center gap-2 text-bone hover:text-champagne">
                    {common.viewProject}
                    <span className="sr-only">: {project.name}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <ExternalLink href={project.url} newTabLabel={common.opensInNewTab} className="text-bone-muted hover:text-bone">
                    {common.visitWebsite}
                  </ExternalLink>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {projects.map((p, i) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={fill(hero.stage.show, { name: p.name })}
                      aria-current={i === active ? "true" : undefined}
                      className="group relative flex h-8 w-10 items-center"
                    >
                      <span className="relative block h-[2px] w-full overflow-hidden rounded-full bg-white/15">
                        <span
                          key={`${active}-${running}`}
                          className={cx(
                            "absolute inset-0 origin-left rounded-full bg-champagne",
                            i < active || (i === active && !running) ? "scale-x-100" : "scale-x-0",
                          )}
                          style={
                            i === active && running
                              ? { animation: `progress ${INTERVAL_MS}ms linear forwards` }
                              : undefined
                          }
                        />
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPaused((v) => !v)}
                  aria-pressed={paused}
                  aria-label={paused ? hero.stage.play : hero.stage.pause}
                  className="flex size-10 items-center justify-center rounded-full border border-edge-strong text-bone-muted transition-colors hover:border-bone/40 hover:text-bone"
                >
                  {paused || reduced ? (
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                      <path d="M8 5.5v13l10.5-6.5z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                      <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spec strip */}
      <div className="relative z-[2] border-t border-edge">
        <dl className="container-x grid grid-cols-2 lg:grid-cols-4">
          {hero.spec.map((item, i) => (
            <div
              key={item.label}
              className={cx(
                "fade-up flex flex-col gap-2 py-7 lg:py-9",
                i % 2 === 1 && "pl-5 sm:pl-8",
                i > 0 && "lg:border-l lg:border-edge lg:pl-8",
                i > 1 && "max-lg:border-t max-lg:border-edge",
                i % 2 === 1 && "max-lg:border-l max-lg:border-edge",
              )}
              style={{ "--i": 8 + i } as CSSProperties}
            >
              <dt className="order-2 text-[0.85rem] leading-snug text-bone-muted">{item.label}</dt>
              <dd className="serif order-1 text-[2.4rem] leading-none text-bone tabular">
                {fill(item.value, { count: String(websitesBuilt).padStart(2, "0") })}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
