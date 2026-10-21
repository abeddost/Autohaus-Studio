"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Locale } from "@/config/pricing";
import type { Dictionary } from "@/content";
import { NAV_KEYS, calculatorHref, href, translatePath } from "@/i18n/routes";
import { ArrowRight, Close, Menu } from "./icons";
import { Wordmark } from "./Wordmark";
import { buttonClass, cx } from "./ui";

type Props = {
  locale: Locale;
  nav: Dictionary["nav"];
  common: Dictionary["common"];
};

export function SiteHeader({ locale, nav, common }: Props) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation (state adjusted during render) and with Escape.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (target: string) => {
    const home = href("home", locale);
    return target === home ? pathname === home : pathname === target || pathname.startsWith(`${target}/`);
  };
  const otherLocale: Locale = locale === "de" ? "en" : "de";

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || open ? "border-b border-edge bg-night/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-[4.5rem] items-center justify-between gap-6 lg:h-20">
        <Link href={href("home", locale)} className="rounded-sm" aria-label={nav.home}>
          <Wordmark />
        </Link>

        <nav aria-label={common.mainNav} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_KEYS.map((key) => {
              const target = href(key, locale);
              const active = isActive(target);
              return (
                <li key={key}>
                  <Link
                    href={target}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "relative rounded-full px-4 py-2 text-[0.9rem] transition-colors duration-200",
                      active ? "text-bone" : "text-bone-muted hover:text-bone",
                    )}
                  >
                    {nav[key]}
                    <span
                      aria-hidden
                      className={cx(
                        "absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-champagne transition-opacity duration-300",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href={translatePath(pathname, otherLocale)}
            hrefLang={otherLocale}
            lang={otherLocale}
            className="eyebrow hidden rounded-full px-3 py-2.5 text-bone-muted transition-colors hover:text-bone sm:inline-flex"
            aria-label={`${common.languageSwitch}: ${common.otherLanguage}`}
          >
            {common.otherLanguageShort}
          </Link>
          <span className="hidden sm:block">
            <Link href={calculatorHref(locale)} className={buttonClass("champagne", "sm", "h-10 px-5")}>
              {common.ctaCalculate}
            </Link>
          </span>
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full text-bone transition-colors hover:bg-white/5 lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{open ? common.closeMenu : common.menu}</span>
          </button>
        </div>
      </div>

      <div id={panelId} hidden={!open} className="grain h-[calc(100dvh-4.5rem)] overflow-y-auto bg-night lg:hidden">
        <nav aria-label={common.mainNav} className="container-x relative z-[2] flex min-h-full flex-col py-8">
          <ul>
            {NAV_KEYS.map((key, i) => {
              const target = href(key, locale);
              return (
                <li key={key} className="border-b border-edge">
                  <Link
                    href={target}
                    aria-current={isActive(target) ? "page" : undefined}
                    className="group flex items-baseline justify-between py-5 text-bone aria-[current=page]:text-champagne"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="eyebrow text-bone-subtle">0{i + 1}</span>
                      <span className="serif text-[2.3rem] leading-none">{nav[key]}</span>
                    </span>
                    <ArrowRight className="size-5 text-bone-subtle transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pt-10">
            <Link href={calculatorHref(locale)} className={buttonClass("champagne", "lg", "w-full")}>
              {common.ctaCalculate}
            </Link>
            <Link href={translatePath(pathname, otherLocale)} hrefLang={otherLocale} lang={otherLocale} className={buttonClass("ghost-dark", "lg", "w-full")}>
              {common.otherLanguage}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
