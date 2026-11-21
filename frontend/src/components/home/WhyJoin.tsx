import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowRight } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { TONES, type Tone } from "./colors";
import { Eyebrow } from "./Eyebrow";

const ICONS: Record<string, React.ReactNode> = {
  id: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6.5 15.5c.6-1.2 1.5-1.8 2.5-1.8s1.9.6 2.5 1.8M14 10h4M14 13h3" />
    </>
  ),
  qr: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.2-4.2M9 9.5l1.5 1.5L13.5 8" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1.5" />
      <path d="M3 9h18M12 9v11M12 9c-1.5-3-5-3.5-5-1.2C7 9 9.5 9 12 9zM12 9c1.5-3 5-3.5 5-1.2C17 9 14.5 9 12 9z" />
    </>
  ),
  compare: (
    <>
      <rect x="3" y="5" width="7" height="14" rx="1.5" />
      <rect x="14" y="5" width="7" height="14" rx="1.5" />
      <path d="M10 12h4M12.5 10.5L14 12l-1.5 1.5" />
    </>
  ),
};

const TILE_BG: Record<Tone, string> = {
  blue: "from-blue-100/80 border-blue-200/70",
  violet: "from-violet-100/80 border-violet-200/70",
  emerald: "from-emerald-100/80 border-emerald-200/70",
  amber: "from-amber-100/80 border-amber-200/70",
  sky: "from-sky-100/80 border-sky-200/70",
  rose: "from-rose-100/80 border-rose-200/70",
  teal: "from-teal-100/80 border-teal-200/70",
  indigo: "from-indigo-100/80 border-indigo-200/70",
};

const BENEFITS: { tone: Tone; icon: keyof typeof ICONS; title: string; desc: string }[] = [
  {
    tone: "blue",
    icon: "id",
    title: "A permanent Manufacturer ID",
    desc: "Your company gets its own MID-XXXX-XXXX code and a public company page in a global registry.",
  },
  {
    tone: "violet",
    icon: "qr",
    title: "A page and QR for every product",
    desc: "Each product gets an Identification ID, a QR code and an official page with specs, photos, manuals and safety information.",
  },
  {
    tone: "emerald",
    icon: "search",
    title: "Easy to find online",
    desc: "Public, structured pages that search engines and AI tools can discover and read.",
  },
  {
    tone: "amber",
    icon: "gift",
    title: "Free until July 1, 2027",
    desc: "Manufacturer ID and 3 products. No card needed and no automatic charge.",
  },
];

/** Section - why manufacturers join (honest benefits) + one tile for buyers. */
export function WhyJoin() {
  return (
    <section id="why-join" className="relative py-20 sm:py-24 scroll-mt-16 overflow-hidden isolate border-y border-violet-100 bg-linear-to-br from-blue-50 via-violet-50 to-emerald-50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-50 [mask-image:radial-gradient(ellipse_60%_70%_at_80%_0%,black,transparent)]"
        style={{ backgroundImage: "radial-gradient(rgba(124,58,237,0.25) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
      />
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Eyebrow tone="violet">Why manufacturers join</Eyebrow>
        <SectionHeader title="One registration." muted="A lasting public record for your company and products." />

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => {
            const t = TONES[b.tone];
            return (
              <li
                key={b.title}
                className={cn("group relative overflow-hidden rounded-2xl border bg-linear-to-b to-white p-6", TILE_BG[b.tone], " shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-18px_rgba(79,70,229,0.35)] hover:-translate-y-0.5 transition-transform")}
              >
                <div aria-hidden="true" className={cn("absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl", t.soft)} />
                <span className={cn("relative w-11 h-11 rounded-xl flex items-center justify-center", t.icon)} aria-hidden="true">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[b.icon]}
                  </svg>
                </span>
                <h3 className="relative mt-5 text-base font-semibold tracking-tight text-slate-900">{b.title}</h3>
                <p className="relative mt-2 text-sm text-slate-600 leading-relaxed">{b.desc}</p>
              </li>
            );
          })}
        </ul>

        {/* for buyers - honest wording, no protection claims */}
        <div className="mt-4 rounded-2xl p-px bg-linear-to-r from-sky-400 via-cyan-400 to-teal-400">
          <div className="rounded-[15px] bg-white/90 backdrop-blur-sm px-6 py-5 sm:px-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <span className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", TONES.sky.icon)} aria-hidden="true">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                {ICONS.compare}
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sky-700">For buyers</p>
              <h3 className="mt-0.5 text-base font-semibold tracking-tight text-slate-900">Check the original</h3>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Compare any product with its manufacturer&apos;s official page and report suspected fakes.
              </p>
            </div>
            <Link
              href="/lookup"
              className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg bg-sky-50 px-4 h-10 text-sm font-medium text-sky-800 ring-1 ring-inset ring-sky-200 hover:bg-sky-100 transition-colors whitespace-nowrap"
            >
              Look up an ID <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
