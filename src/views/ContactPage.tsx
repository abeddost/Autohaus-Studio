import type { Locale } from "@/config/pricing";
import { site } from "@/config/site";
import { getDictionary } from "@/content";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { Mail, Phone } from "@/components/icons";
import { Missing } from "@/components/Missing";
import { PageHero } from "@/components/PageHero";

export function ContactPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const t = dict.contact;
  const { email, phone, phoneDisplay } = site.contact;

  return (
    <>
      <PageHero
        id="kontakt-title"
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        image="headlights-dark"
        aside={
          <div className="lg:text-right">
            <p className="eyebrow text-bone-subtle">{t.direct}</p>
            <p className="serif mt-4 text-[1.6rem] leading-none text-bone">{site.owner.name}</p>
            <ul className="mt-4 space-y-2 lg:flex lg:flex-col lg:items-end">
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className="inline-flex items-center gap-2 text-bone-muted hover:text-champagne">
                    <Mail className="size-4" /> {email}
                  </a>
                </li>
              ) : (
                <li>
                  <Missing field="E-Mail-Adresse (site.contact.email)" />
                </li>
              )}
              {phone ? (
                <li>
                  <a href={`tel:${phone}`} className="inline-flex items-center gap-2 text-bone-muted hover:text-champagne">
                    <Phone className="size-4" /> {phoneDisplay ?? phone}
                  </a>
                </li>
              ) : (
                <li>
                  <Missing field="Telefonnummer (site.contact.phone)" />
                </li>
              )}
            </ul>
          </div>
        }
      />
      <section className="bg-paper-2 py-16 sm:py-24">
        <div className="container-x">
          <EnquiryForm locale={locale} t={t} calcT={dict.calculator} common={dict.common} />
        </div>
      </section>
    </>
  );
}
