import Link from "next/link";
import { LegalMarkdown, legalToc } from "@/components/LegalMarkdown";
import { formatDate, readDocText, type LegalDoc, type LegalVersion } from "@/lib/legal";

/** Renders one version of a legal document, with version history and a table of contents. */
export function LegalDocPage({ doc, version }: { doc: LegalDoc; version: LegalVersion }) {
  const source = readDocText(doc.slug, version.version);
  const toc = legalToc(source);
  const isCurrent = version.version === doc.current;

  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <p className="text-xs mb-3">
        <Link href="/legal" className="text-accent hover:underline">Legal &amp; Trust Center</Link>
      </p>
      <h1 className="text-3xl font-semibold tracking-tight mb-2">{doc.title}</h1>
      <p className="text-xs text-muted">
        Version {version.version} · Effective {formatDate(version.effective)}
        {version.until && <> · Replaced {formatDate(version.until)}</>}
      </p>
      <p className="text-xs text-muted mb-6">
        Operated by Global Product Identification Inc., a Canadian federal corporation.
      </p>

      {!isCurrent && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-lg p-3 mb-6">
          This is an archived version, kept unchanged for the record. The current version is{" "}
          <Link href={`/legal/${doc.slug}`} className="underline">version {doc.current}</Link>.
        </div>
      )}

      {toc.length > 5 && (
        <details className="mb-8 border border-border rounded-lg p-4">
          <summary className="text-sm font-medium cursor-pointer">Contents</summary>
          <ol className="mt-3 space-y-1 text-sm">
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="text-accent hover:underline">{t.text}</a>
              </li>
            ))}
          </ol>
        </details>
      )}

      <LegalMarkdown source={source} />

      <div className="mt-12 pt-6 border-t border-border text-xs text-muted space-y-2">
        <p className="font-medium text-foreground">Version history</p>
        <ul className="space-y-1">
          {doc.versions.map((v) => (
            <li key={v.version}>
              <Link href={`/legal/${doc.slug}/${v.version}`} className="text-accent hover:underline">
                Version {v.version}
              </Link>{" "}
              - effective {formatDate(v.effective)}
              {v.until ? `, replaced ${formatDate(v.until)}` : " (current)"}
            </li>
          ))}
        </ul>
        <p>
          If this document is translated, the English version controls. See all documents in the{" "}
          <Link href="/legal" className="text-accent hover:underline">Legal &amp; Trust Center</Link>.
        </p>
      </div>
    </div>
  );
}
