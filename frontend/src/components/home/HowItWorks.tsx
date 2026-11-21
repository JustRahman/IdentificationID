import { SectionHeader } from "@/components/ui/SectionHeader";
import { IdChip } from "@/components/ui/IdChip";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { TONES, type Tone } from "./colors";
import { Eyebrow } from "./Eyebrow";

const STEPS: { n: string; tone: Tone; title: string; desc: string; visual: React.ReactNode }[] = [
  {
    n: "1",
    tone: "blue",
    title: "Register your company",
    desc: "Create a free account and add your company details: legal name, country, website and contacts. No card needed.",
    visual: (
      <div className="space-y-2" aria-hidden="true">
        {["Company name", "Country", "Website"].map((l, i) => (
          <div key={l} className="flex items-center gap-3 rounded-lg border border-blue-100 bg-white px-3 h-9 shadow-xs">
            <span className="text-xs text-slate-500 w-24 shrink-0">{l}</span>
            <span className="h-2 rounded-full bg-linear-to-r from-blue-300 to-sky-200" style={{ width: `${[60, 35, 48][i]}%` }} />
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "2",
    tone: "violet",
    title: "Get your Manufacturer ID",
    desc: "Your company receives a permanent Manufacturer ID and a public company page in the registry.",
    visual: (
      <div className="flex flex-col items-start gap-3">
        <IdChip label="Manufacturer ID" id="MID-XXXX-XXXX" copy={false} size="sm" className="border-violet-200!" />
        <div className="inline-flex items-center gap-2 rounded-full bg-white border border-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" aria-hidden="true" />
          Public company page
        </div>
      </div>
    ),
  },
  {
    n: "3",
    tone: "emerald",
    title: "Add products, get IID + QR",
    desc: "Each product gets an Identification ID, a QR code and an official page with specs, photos, manuals and safety information.",
    visual: (
      <div className="flex items-center gap-3">
        <div className="grid grid-cols-5 gap-0.5 w-12 h-12 p-1.5 rounded-md border border-emerald-200 bg-white shrink-0" aria-hidden="true">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className={[0, 1, 3, 4, 5, 9, 12, 15, 16, 19, 20, 21, 23, 24, 7, 17].includes(i) ? "bg-emerald-800 rounded-[1px]" : ""} />
          ))}
        </div>
        <IdChip id="IID-XXXX-XXXX" copy={false} size="sm" className="border-emerald-200!" />
      </div>
    ),
  },
];

/** Section 2 - how it works in three colored steps joined by a gradient line. */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24 scroll-mt-16 bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Eyebrow tone="blue">How it works</Eyebrow>
        <SectionHeader
          title="Three steps to a permanent record."
          muted="Free to look up for everyone."
          action={
            <ButtonLink href="/register" variant="secondary">
              Register your company <ArrowRight />
            </ButtonLink>
          }
        />
        <ol className="relative grid gap-6 md:gap-5 md:grid-cols-3">
          {/* connecting gradient line through the number badges (desktop) */}
          <span aria-hidden="true" className="hidden md:block absolute top-5 left-8 right-8 h-0.5 rounded-full bg-linear-to-r from-blue-500 via-violet-500 to-emerald-500 opacity-60" />
          {STEPS.map((s) => {
            const t = TONES[s.tone];
            return (
              <li key={s.n} className="relative flex flex-col">
                <span
                  className={cn("relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold tabular-nums ring-4 ring-white mb-4", t.icon)}
                  aria-hidden="true"
                >
                  {s.n}
                </span>
                <div className="flex-1 rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-[0_16px_40px_-20px_rgba(15,23,42,0.25)] transition-shadow">
                  <div aria-hidden="true" className={cn("h-1 bg-linear-to-r", t.bar)} />
                  <div className={cn("min-h-40 border-b px-6 py-6 flex items-center", t.tile)}>
                    <div className="w-full">{s.visual}</div>
                  </div>
                  <div className="p-6">
                    <p className={cn("text-xs font-semibold mb-2", t.text)}>
                      Step {s.n}
                    </p>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">{s.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 text-sm text-slate-500">
          Buyers and consumers look up IDs for free - no account and no app needed.
        </p>
      </div>
    </section>
  );
}
