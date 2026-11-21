import Link from "next/link";
import { LegalMarkdown, legalToc } from "@/components/LegalMarkdown";
import { LegalShell } from "@/components/marketing/LegalShell";
import { Badge } from "@/components/ui/Badge";
import { formatDate, readDocText, type LegalDoc, type LegalVersion } from "@/lib/legal";
import { cn } from "@/lib/utils";

/** Renders one version of a legal document, with version history and a table of contents. */
export function LegalDocPage({ doc, version }: { doc: LegalDoc; version: LegalVersion }) {
  const source = readDocText(doc.slug, version.version);
  const toc = legalToc(source);
  const isCurrent = version.version === doc.current;

  return (
    <LegalShell active={`/legal/${doc.slug}`}>
      <article>
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
          <Link href="/legal" className="hover:text-slate-900 hover:underline underline-offset-4">Legal &amp; Trust Center</Link>
        </nav>
        <h1 className="max-w-3xl text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight text-balance">
          {doc.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
          {isCurrent ? (
            <Badge tone="info" dot>Current version</Badge>
          ) : (
            <Badge tone="neutral">Archived version</Badge>
          )}
          <span>
            Version <span className="font-medium text-slate-900 tabular-nums">{version.version}</span>
          </span>
          <span aria-hidden="true" className="hidden sm:inline text-slate-300">|</span>
          <span>
            Effective <span className="font-medium text-slate-900">{formatDate(version.effective)}</span>
          </span>
          {version.until && (
            <>
              <span aria-hidden="true" className="hidden sm:inline text-slate-300">|</span>
              <span>Replaced {formatDate(version.until)}</span>
            </>
          )}
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Operated by Global Product Identification Inc., a Canadian federal corporation.
        </p>

        {!isCurrent && (
          <div role="note" className="mt-6 max-w-prose rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            This is an archived version, kept unchanged for the record. The current version is{" "}
            <Link href={`/legal/${doc.slug}`} className="font-medium text-accent underline underline-offset-4">version {doc.current}</Link>.
          </div>
        )}

        {toc.length > 5 && (
          <details className="group mt-8 max-w-prose rounded-xl border border-slate-200 bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-slate-900">
              Contents
              <span className="text-xs font-normal text-slate-500">
                {toc.length} sections
                <svg className="ml-2 inline w-3.5 h-3.5 text-slate-400 transition-transform group-open:rotate-180" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" />
                </svg>
              </span>
            </summary>
            <ol className="border-t border-slate-200 px-5 py-4 space-y-1.5 text-sm">
              {toc.map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="text-slate-700 hover:text-accent hover:underline underline-offset-4">{t.text}</a>
                </li>
              ))}
            </ol>
          </details>
        )}

        <div className="mt-10 max-w-prose">
          <LegalMarkdown source={source} />
        </div>

        <section aria-labelledby="version-history" className="mt-16 max-w-prose border-t border-slate-200 pt-8">
          <h2 id="version-history" className="text-lg font-semibold tracking-tight text-slate-900">Version history</h2>
          <p className="mt-1 text-sm text-slate-500">Every version is kept permanently and unchanged.</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-medium">Version</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Effective</th>
                  <th scope="col" className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {doc.versions.map((v) => {
                  const viewing = v.version === version.version;
                  return (
                    <tr key={v.version} className={cn(viewing && "bg-blue-50/40")}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/legal/${doc.slug}/${v.version}`}
                          className="font-medium text-accent tabular-nums hover:underline underline-offset-4"
                          aria-current={viewing ? "page" : undefined}
                        >
                          Version {v.version}
                        </Link>
                        {viewing && <span className="ml-2 text-xs text-slate-500">(viewing)</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{formatDate(v.effective)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {v.until ? `Replaced ${formatDate(v.until)}` : "Current"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            If this document is translated, the English version controls. See all documents in the{" "}
            <Link href="/legal" className="text-accent hover:underline underline-offset-4">Legal &amp; Trust Center</Link>.
          </p>
        </section>
      </article>
    </LegalShell>
  );
}
