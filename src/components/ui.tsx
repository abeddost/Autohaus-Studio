import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight, ArrowUpRight } from "./icons";

export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

type Variant = "champagne" | "ghost-dark" | "ink" | "outline" | "link" | "link-dark";
/** v1 names kept as aliases so older call sites keep working. */
type LegacyVariant = "primary" | "secondary" | "ghost" | "inverse" | "inverse-outline";

const LEGACY: Record<LegacyVariant, Variant> = {
  primary: "ink",
  secondary: "outline",
  ghost: "link",
  inverse: "champagne",
  "inverse-outline": "ghost-dark",
};

const base =
  "group inline-flex items-center justify-center gap-2.5 rounded-full font-medium tracking-[-0.005em] whitespace-nowrap transition-[background-color,color,border-color,box-shadow,transform] duration-200 ease-out active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45";

const variants: Record<Variant, string> = {
  champagne:
    "bg-champagne text-night shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_10px_30px_-12px_rgb(205_179_138/0.55)] hover:bg-champagne-bright",
  "ghost-dark": "border border-edge-strong text-bone hover:border-bone/45 hover:bg-white/[0.04]",
  ink: "bg-ink text-paper hover:bg-ink-soft shadow-[0_10px_24px_-14px_rgb(0_0_0/0.6)]",
  outline: "border border-line-strong text-ink hover:border-ink bg-transparent",
  link: "text-ink hover:text-champagne-deep",
  "link-dark": "text-bone hover:text-champagne",
};

const sizes = {
  sm: "h-9 px-4 text-[0.85rem]",
  md: "h-11 px-5 text-[0.93rem]",
  lg: "h-13 px-7 text-[0.98rem]",
};

export function buttonClass(variant: Variant | LegacyVariant = "ink", size: keyof typeof sizes = "md", extra?: string) {
  const v = (variant in LEGACY ? LEGACY[variant as LegacyVariant] : variant) as Variant;
  const isLink = v === "link" || v === "link-dark";
  return cx(base, variants[v], isLink ? "h-auto px-0" : sizes[size], extra);
}

export function ButtonLink({
  href,
  variant = "ink",
  size = "md",
  arrow = false,
  className,
  children,
  ...rest
}: Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  variant?: Variant | LegacyVariant;
  size?: keyof typeof sizes;
  arrow?: boolean;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow ? <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" /> : null}
    </Link>
  );
}

export function ExternalLink({
  href,
  children,
  newTabLabel,
  className,
}: {
  href: string;
  children: ReactNode;
  newTabLabel: string;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx("group inline-flex items-center gap-1.5", className)}>
      {children}
      <ArrowUpRight className="size-[0.95em] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      <span className="sr-only">{newTabLabel}</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export function Eyebrow({
  children,
  index,
  tone = "light",
  className,
}: {
  children: ReactNode;
  index?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <p className={cx("eyebrow flex items-center gap-3", tone === "dark" ? "text-bone-muted" : "text-muted", className)}>
      {index ? <span className={tone === "dark" ? "text-champagne" : "text-champagne-deep"}>{index}</span> : null}
      {index ? <span aria-hidden className={cx("h-px w-8", tone === "dark" ? "bg-edge-strong" : "bg-line-strong")} /> : null}
      <span>{children}</span>
    </p>
  );
}

/** Renders a title with its last word set in italic champagne serif. */
export function Accent({ text, tone = "light" }: { text: string; tone?: "light" | "dark" }) {
  const trimmed = text.trim();
  const i = trimmed.lastIndexOf(" ");
  if (i < 0) return <em className={cx("italic", tone === "dark" ? "text-champagne" : "text-champagne-deep")}>{trimmed}</em>;
  return (
    <>
      {trimmed.slice(0, i)}{" "}
      <em className={cx("italic", tone === "dark" ? "text-champagne" : "text-champagne-deep")}>{trimmed.slice(i + 1)}</em>
    </>
  );
}

/** Hero headline with masked word-by-word rise. Accessible text stays intact. */
export function RevealTitle({
  text,
  className,
  id,
  as: Tag = "h1",
  accentLast = true,
}: {
  text: string;
  className?: string;
  id?: string;
  as?: "h1" | "h2";
  accentLast?: boolean;
}) {
  const words = text.trim().split(/\s+/);
  return (
    <Tag id={id} className={className} aria-label={text}>
      <span aria-hidden>
        {words.map((word, i) => {
          const last = accentLast && i === words.length - 1;
          return (
            <span key={`${word}-${i}`} className="line-mask">
              <span className="line-rise" style={{ "--i": i } as React.CSSProperties}>
                {last ? <em className="text-champagne italic">{word}</em> : word}
              </span>
              {i < words.length - 1 ? " " : null}
            </span>
          );
        })}
      </span>
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  index,
  title,
  lead,
  id,
  tone = "light",
  className,
  as: Heading = "h2",
  size = "lg",
  accent = true,
}: {
  eyebrow?: string;
  index?: string;
  title: string;
  lead?: string;
  id?: string;
  tone?: "light" | "dark";
  className?: string;
  as?: "h1" | "h2";
  size?: "hero" | "xl" | "lg" | "md";
  accent?: boolean;
}) {
  const sizeClass = { hero: "display-hero", xl: "display-xl", lg: "display-lg", md: "display-md" }[size];
  return (
    <div className={cx("max-w-3xl", className)}>
      {eyebrow ? <Eyebrow index={index} tone={tone}>{eyebrow}</Eyebrow> : null}
      <Heading id={id} className={cx(eyebrow && "mt-6", sizeClass, tone === "dark" ? "text-bone" : "text-ink")}>
        {accent ? <Accent text={title} tone={tone} /> : title}
      </Heading>
      {lead ? <p className={cx("lead mt-6 max-w-2xl", tone === "dark" ? "text-bone-muted" : "text-muted")}>{lead}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

export function Tag({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" | "accent" | "accent-dark" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[0.76rem] leading-none font-medium",
        tone === "light" && "border-line-strong/70 text-ink-soft",
        tone === "dark" && "border-edge-strong text-bone-muted",
        tone === "accent" && "border-champagne-deep/30 bg-champagne-soft text-champagne-deep",
        tone === "accent-dark" && "border-champagne/30 bg-champagne/10 text-champagne",
      )}
    >
      {children}
    </span>
  );
}

/** Mandatory label for illustrative interfaces. */
export function DemoBadge({ label, className, tone = "dark" }: { label: string; className?: string; tone?: "dark" | "light" }) {
  return (
    <span
      className={cx(
        "eyebrow inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.62rem] backdrop-blur-md",
        tone === "dark" ? "border-champagne/35 bg-night/70 text-champagne" : "border-champagne-deep/30 bg-white/85 text-champagne-deep",
        className,
      )}
    >
      <span aria-hidden className={cx("size-1.5 rounded-full", tone === "dark" ? "bg-champagne" : "bg-champagne-deep")} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

export function Section({
  children,
  className,
  tone = "paper",
  id,
  labelledBy,
  bleed = false,
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "paper-2" | "white" | "night" | "night-2";
  id?: string;
  labelledBy?: string;
  bleed?: boolean;
}) {
  const dark = tone === "night" || tone === "night-2";
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx(
        "relative py-24 sm:py-28 lg:py-36",
        tone === "paper" && "bg-paper text-ink",
        tone === "paper-2" && "bg-paper-2 text-ink",
        tone === "white" && "bg-white text-ink",
        tone === "night" && "grain bg-night text-bone",
        tone === "night-2" && "grain bg-night-2 text-bone",
        className,
      )}
    >
      {bleed ? children : <div className={cx("container-x", dark && "relative z-[2]")}>{children}</div>}
    </section>
  );
}
