import Link from "next/link";
import type { Locale } from "@/config/pricing";
import { site } from "@/config/site";
import { getDictionary } from "@/content";
import { NAV_KEYS, calculatorHref, href } from "@/i18n/routes";
import { CurrentYear } from "./CurrentYear";
import { ArrowRight, Mail, Phone } from "./icons";
import { Missing } from "./Missing";
import { Wordmark } from "./Wordmark";

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const { contact } = site;

  return (
    <footer className="grain relative overflow-hidden bg-night text-bone">
      <div aria-hidden className="hairline-x absolute inset-x-0 top-0 h-px" />
      <div className="container-x relative z-[2]">
        <div className="grid gap-14 py-20 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-5">
            <Wordmark />
            <p className="serif mt-8 max-w-md text-[2rem] leading-[1.08] text-bone">{t.footer.tagline}</p>
            <Link href={calculatorHref(locale)} className="group mt-8 inline-flex items-center gap-2 text-champagne hover:text-champagne-bright">
              {t.common.ctaProjectPrice}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <nav aria-label={t.footer.navTitle} className="lg:col-span-2 lg:col-start-7">
            <h2 className="eyebrow text-bone-subtle">{t.footer.navTitle}</h2>
            <ul className="mt-6 space-y-3 text-[0.95rem]">
              {NAV_KEYS.map((key) => (
                <li key={key}>
                  <Link href={href(key, locale)} className="text-bone-muted transition-colors hover:text-bone">
                    {t.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h2 className="eyebrow text-bone-subtle">{t.footer.contactTitle}</h2>
            <ul className="mt-6 space-y-3 text-[0.95rem]">
              <li className="text-bone">{site.owner.name}</li>
              {contact.email ? (
                <li>
                  <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-bone-muted hover:text-bone">
                    <Mail className="size-4" /> {contact.email}
                  </a>
                </li>
              ) : (
                <li>
                  <Missing field="E-Mail-Adresse" />
                </li>
              )}
              {contact.phone ? (
                <li>
                  <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-2 text-bone-muted hover:text-bone">
                    <Phone className="size-4" /> {contact.phoneDisplay ?? contact.phone}
                  </a>
                </li>
              ) : (
                <li>
                  <Missing field="Telefonnummer" />
                </li>
              )}
              <li>
                <Link href={href("contact", locale)} className="text-bone-muted hover:text-bone">
                  {t.common.ctaEnquire}
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="eyebrow text-bone-subtle">{t.footer.legalTitle}</h2>
            <ul className="mt-6 space-y-3 text-[0.95rem]">
              <li>
                <Link href={href("imprint", locale)} className="text-bone-muted hover:text-bone">
                  {t.nav.imprint}
                </Link>
              </li>
              <li>
                <Link href={href("privacy", locale)} className="text-bone-muted hover:text-bone">
                  {t.nav.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div aria-hidden className="serif pointer-events-none -mb-[0.18em] text-center text-[clamp(4rem,15vw,15rem)] leading-none text-bone/[0.045] select-none">
          {site.name}
        </div>

        <div className="flex flex-col gap-2 border-t border-edge py-7 text-[0.78rem] text-bone-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {site.name}
          </p>
          <p>
            {t.footer.vatNote} {t.footer.noTracking}
          </p>
        </div>
      </div>
    </footer>
  );
}
