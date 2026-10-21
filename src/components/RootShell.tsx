import type { ReactNode } from "react";
import type { Locale } from "@/config/pricing";
import { getDictionary } from "@/content";
import { fontVariables } from "@/app/fonts";
import { RevealObserver } from "./RevealObserver";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

export function RootShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = getDictionary(locale);
  return (
    <html lang={locale} className={`${fontVariables} antialiased`} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col bg-paper">
        <a
          href="#inhalt"
          className="sr-only z-[60] rounded-full bg-champagne px-5 py-2.5 text-night focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          {t.common.skipToContent}
        </a>
        <SiteHeader locale={locale} nav={t.nav} common={t.common} />
        <main id="inhalt" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <SiteFooter locale={locale} />
        <RevealObserver />
      </body>
    </html>
  );
}
