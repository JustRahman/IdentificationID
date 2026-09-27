/**
 * "Trusted by Manufacturers" — logos and short quotes from real customers.
 *
 * Hidden unless NEXT_PUBLIC_SHOW_TRUSTED_BY=true AND there is at least one
 * entry below. Only add manufacturers who are real customers and have given
 * written permission to use their logo and quote — never placeholders.
 */
interface TrustedEntry {
  company: string;
  logoUrl: string;
  quote?: string;
  author?: string; // e.g. "Jane Doe, Head of Operations"
}

const ENTRIES: TrustedEntry[] = [];

const ENABLED = process.env.NEXT_PUBLIC_SHOW_TRUSTED_BY === "true";

export function TrustedByManufacturers() {
  if (!ENABLED || ENTRIES.length === 0) return null;
  const quotes = ENTRIES.filter((e) => e.quote);

  return (
    <section className="py-12 px-6 border-t border-border">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-6">
          Trusted by Manufacturers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mb-8">
          {ENTRIES.map((e) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={e.company} src={e.logoUrl} alt={e.company} className="h-8 w-auto object-contain opacity-80" />
          ))}
        </div>
        {quotes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {quotes.map((e) => (
              <figure key={e.company} className="bg-background border border-border rounded-xl p-5">
                <blockquote className="text-sm leading-relaxed">&ldquo;{e.quote}&rdquo;</blockquote>
                <figcaption className="text-xs text-muted mt-3">
                  {e.author ? `${e.author}, ` : ""}{e.company}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
