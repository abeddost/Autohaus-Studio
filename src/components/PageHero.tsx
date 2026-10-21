import Image from "next/image";
import type { ReactNode } from "react";
import { demoImage, type DemoImage } from "@/config/demo";
import { Accent, cx } from "./ui";

/** Night-stage page opener used by all sub pages. */
export function PageHero({
  eyebrow,
  title,
  lead,
  id,
  image,
  aside,
  children,
  size = "xl",
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  id: string;
  image?: DemoImage;
  aside?: ReactNode;
  children?: ReactNode;
  size?: "hero" | "xl" | "lg";
  className?: string;
}) {
  return (
    <section aria-labelledby={id} className={cx("grain relative isolate overflow-hidden bg-night text-bone", className)}>
      {image ? (
        <>
          <Image src={demoImage(image)} alt="" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/85 to-night/30" />
        </>
      ) : null}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_65%_at_75%_0%,rgb(236_232_225/0.12),transparent_70%)]" />
      <div className="container-x relative z-[2] pt-36 pb-20 sm:pt-44 lg:pb-28">
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <div className={aside ? "lg:col-span-8" : "lg:col-span-10"}>
            <p className="eyebrow fade-up flex items-center gap-3 text-bone-muted">
              <span aria-hidden className="h-px w-8 bg-champagne/70" />
              {eyebrow}
            </p>
            <h1 id={id} className={cx("mt-8 text-bone", size === "hero" ? "display-hero" : size === "xl" ? "display-xl" : "display-lg")}>
              <Accent text={title} tone="dark" />
            </h1>
            {lead ? <p className="lead mt-8 max-w-2xl text-bone-muted">{lead}</p> : null}
          </div>
          {aside ? <div className="lg:col-span-4">{aside}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}

