import { SectionHeader } from "@/components/ui/SectionHeader";
import { IdChip } from "@/components/ui/IdChip";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";

const STEPS = [
  {
    n: "01",
    title: "Register your company",
    desc: "Create a free account and add your company details: legal name, country, website and contacts. No card needed.",
    visual: (
      <div className="space-y-2" aria-hidden="true">
        {["Company name", "Country", "Website"].map((l, i) => (
          <div key={l} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 h-9">
            <span className="text-xs text-slate-400 w-24 shrink-0">{l}</span>
            <span className="h-2 rounded-full bg-slate-200" style={{ width: `${[60, 35, 48][i]}%` }} />
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "02",
    title: "Get your Manufacturer ID",
    desc: "Your company receives a permanent Manufacturer ID and a public company page in the registry.",
    visual: (
      <div className="flex flex-col items-start gap-3">
        <IdChip label="Manufacturer ID" id="MID-XXXX-XXXX" copy={false} size="sm" />
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Public company page
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "Add products, get IID + QR",
    desc: "Each product gets an Identification ID, a QR code and an official page with specs, photos, manuals and safety information.",
    visual: (
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-5 gap-0.5 w-12 h-12 p-1.5 rounded-md border border-slate-200 bg-white shrink-0" aria-hidden="true">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className={[0, 1, 3, 4, 5, 9, 12, 15, 16, 19, 20, 21, 23, 24, 7, 17].includes(i) ? "bg-slate-800 rounded-[1px]" : ""} />
          ))}
        </div>
        <IdChip id="IID-XXXX-XXXX" copy={false} size="sm" />
      </div>
    ),
  },
];

/** Section 2 - how it works in three steps. */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps to a permanent record."
          muted="Free to look up for everyone."
          action={
            <ButtonLink href="/register" variant="secondary">
              Register your company <ArrowRight />
            </ButtonLink>
          }
        />
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
              <div className="min-h-40 bg-slate-50 border-b border-slate-200 px-6 py-6 flex items-center">
                <div className="w-full">{s.visual}</div>
              </div>
              <div className="p-6">
                <p className="text-xs font-mono tabular-nums text-accent font-semibold mb-2">{s.n}</p>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-sm text-slate-500">
          Buyers and consumers look up IDs for free - no account and no app needed.
        </p>
      </div>
    </section>
  );
}
