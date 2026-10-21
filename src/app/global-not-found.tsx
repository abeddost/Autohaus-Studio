import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { fontVariables } from "./fonts";
import de from "@/content/de";
import en from "@/content/en";

export const metadata: Metadata = {
  title: "404 – Seite nicht gefunden / Page not found",
  robots: { index: false },
};

/** Bilingual 404 for unmatched URLs (the app has two root layouts). */
export default function GlobalNotFound() {
  return (
    <html lang="de" className={`${fontVariables} antialiased`}>
      <body className="grain flex min-h-dvh items-center bg-night text-bone">
        <main className="container-x relative z-[2] py-24">
          <p className="serif text-[9rem] leading-none text-champagne/80 italic">404</p>
          <h1 className="display-lg mt-6">{de.notFound.title}</h1>
          <p className="lead mt-4 max-w-xl text-bone-muted">{de.notFound.text}</p>
          <Link href="/" className="mt-10 inline-flex h-12 items-center rounded-full bg-champagne px-6 font-medium text-night hover:bg-champagne-bright">
            {de.notFound.home}
          </Link>
          <div lang="en" className="mt-16 border-t border-edge pt-8">
            <h2 className="serif text-[2rem]">{en.notFound.title}</h2>
            <p className="mt-2 text-bone-muted">{en.notFound.text}</p>
            <Link href="/en" className="mt-4 inline-block text-champagne underline underline-offset-4 hover:text-champagne-bright">
              {en.notFound.home}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
