import Image from "next/image";
import { site } from "@/config/site";
import { cx } from "./ui";

/** Serif wordmark with a fine monogram, used until a logo file is configured (site.logo). */
export function Wordmark({ tone = "dark", className }: { tone?: "light" | "dark"; className?: string }) {
  if (site.logo) {
    return <Image src={site.logo} alt={site.name} width={180} height={32} className={cx("h-7 w-auto", className)} priority />;
  }
  const [first, ...rest] = site.name.split(" ");
  const dark = tone === "dark";
  return (
    <span className={cx("inline-flex items-center gap-3 whitespace-nowrap", className)}>
      <span
        aria-hidden
        className={cx(
          "relative flex size-9 items-center justify-center rounded-full border",
          dark ? "border-champagne/50 text-champagne" : "border-champagne-deep/50 text-champagne-deep",
        )}
      >
        <span className="serif text-[1.15rem] leading-none italic">aw</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cx("serif text-[1.42rem] leading-[0.9]", dark ? "text-bone" : "text-ink")}>{first}</span>
        <span className={cx("eyebrow mt-1 text-[0.56rem] tracking-[0.32em]", dark ? "text-bone-muted" : "text-muted")}>{rest.join(" ")}</span>
      </span>
    </span>
  );
}
