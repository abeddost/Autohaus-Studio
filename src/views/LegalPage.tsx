import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { marked } from "marked";
import type { Locale } from "@/config/pricing";
import { fill, getDictionary } from "@/content";
import { showMissingMarkers } from "@/components/Missing";

export type LegalDoc = "impressum" | "datenschutz";

export function legalFileName(doc: LegalDoc, locale: Locale) {
  return `${doc}.${locale}.md`;
}

/** Reads approved legal text from src/content/legal. Returns null if it has not been supplied. */
export async function loadLegalDocument(doc: LegalDoc, locale: Locale): Promise<string | null> {
  "use cache";
  cacheLife("max");
  try {
    const file = path.join(process.cwd(), "src", "content", "legal", legalFileName(doc, locale));
    const markdown = await readFile(file, "utf8");
    if (!markdown.trim()) return null;
    return await marked.parse(markdown, { gfm: true });
  } catch {
    return null;
  }
}

export async function LegalPage({ doc, locale }: { doc: LegalDoc; locale: Locale }) {
  const dict = getDictionary(locale);
  const title = doc === "impressum" ? dict.meta.pages.imprint.title : dict.meta.pages.privacy.title;
  const html = await loadLegalDocument(doc, locale);

  return (
    <>
      <section aria-labelledby="legal-title" className="grain relative bg-night text-bone">
        <div className="container-x relative z-[2] pt-36 pb-16 sm:pt-44 lg:pb-20">
          <h1 id="legal-title" className="display-xl">
            {title}
          </h1>
        </div>
      </section>
      <section className="bg-paper">
        <div className="container-x py-16 sm:py-20 lg:py-24">
          {html ? (
            <div
              className="legal-prose max-w-3xl"
              // Trusted, repository-managed content (src/content/legal/*.md).
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <div className="max-w-2xl rounded-[16px] border border-line-strong bg-white p-10">
              <p className="serif text-[2rem] leading-tight">{dict.legal.pending}</p>
              <p className="mt-3 text-muted">{dict.legal.pendingText}</p>
              {showMissingMarkers() ? (
                <p className="mt-6 rounded-md border border-dashed border-warning/60 bg-warning/10 p-4 font-mono text-[0.8rem] text-warning">
                  {fill(dict.legal.devNote, { file: legalFileName(doc, locale) })}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
