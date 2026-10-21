import { getDictionary } from "@/content";
import { href } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  const t = getDictionary("de").notFound;
  return (
    <section className="grain relative flex min-h-[80vh] items-center bg-night text-bone">
      <div className="container-x relative z-[2] pt-32 pb-24">
        <p className="serif text-[9rem] leading-none text-champagne/80 italic">404</p>
        <h1 className="display-lg mt-6">{t.title}</h1>
        <p className="lead mt-5 max-w-xl text-bone-muted">{t.text}</p>
        <ButtonLink href={href("home", "de")} variant="champagne" className="mt-10" arrow>
          {t.home}
        </ButtonLink>
      </div>
    </section>
  );
}
