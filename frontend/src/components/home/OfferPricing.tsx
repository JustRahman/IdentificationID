import Link from "next/link";
import { PlanMiniGrid } from "@/components/marketing/PlanCards";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { BRAND_GRADIENT_TEXT } from "./colors";
import { Eyebrow } from "./Eyebrow";

const FREE_INCLUDES = [
  "Permanent Manufacturer ID and public company page",
  "3 product pages, each with an Identification ID and QR code",
  "No card needed, no automatic charge",
  "Registered before July 1, 2027? Your company stays in the registry permanently",
];

const CHECK_COLORS = ["bg-blue-600", "bg-violet-600", "bg-emerald-600", "bg-amber-500"];

/** Section 4 - the free offer first, colored paid plans beside it. Prices come from constants. */
export function OfferPricing() {
  return (
    <section id="pricing" className="relative py-20 sm:py-24 scroll-mt-16 overflow-hidden isolate bg-linear-to-b from-violet-50/70 via-white to-blue-50/60 border-y border-violet-100">
      <div aria-hidden="true" className="pointer-events-none absolute -z-10 -top-32 left-[10%] w-[520px] h-[420px] rounded-full bg-violet-300/25 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -z-10 bottom-[-120px] right-[5%] w-[480px] h-[380px] rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Eyebrow tone="amber">Pricing</Eyebrow>
        <SectionHeader
          title="Start free."
          muted="Pay only when your catalog grows."
          description="Looking up products and manufacturers is always free for everyone."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-start">
          {/* Free offer - the one elevated card, gradient border + glow */}
          <div className="relative">
          <div aria-hidden="true" className="absolute -inset-2 rounded-[28px] bg-linear-to-br from-blue-400/40 via-violet-400/40 to-teal-300/40 blur-2xl" />
          <div className="relative rounded-2xl p-[1.5px] bg-linear-to-br from-blue-500 via-violet-500 to-teal-400 shadow-[0_24px_60px_-28px_rgba(79,70,229,0.6)]">
          <div className="relative rounded-[15px] bg-white p-7 sm:p-9 overflow-hidden">
            {/* ribbon */}
            <span className="absolute top-0 right-0 rounded-bl-2xl bg-linear-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white shadow-sm">
              Free until July 1, 2027
            </span>
            <Badge tone="info">Free registration offer</Badge>
            <h3 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
              Manufacturer ID + 3 products
              <span className="block text-slate-400">free until July 1, 2027</span>
            </h3>
            <div className="mt-6 flex items-baseline gap-2">
              <span className={`text-6xl font-bold tracking-tight tabular-nums ${BRAND_GRADIENT_TEXT}`}>$0</span>
              <span className="text-sm text-slate-500">until July 1, 2027</span>
            </div>
            <ul className="mt-7 space-y-3">
              {FREE_INCLUDES.map((f, i) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-slate-700">
                  <span className={`w-5 h-5 mt-px shrink-0 rounded-full flex items-center justify-center text-white ${CHECK_COLORS[i % CHECK_COLORS.length]}`} aria-hidden="true">
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 10.5l3.2 3.2L15 7" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <ButtonLink href="/register" size="lg" className="bg-linear-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 shadow-[0_10px_24px_-10px_rgba(124,58,237,0.7)]">
                Register free <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/founding-manufacturers" variant="secondary" size="lg">
                Offer details
              </ButtonLink>
            </div>
          </div>
          </div>
          </div>

          {/* Paid plans - colored mini-grid (same per-plan colors as /pricing) */}
          <div className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur-sm p-5 sm:p-6 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.25)]">
            <h3 className="text-sm font-semibold text-slate-900">Paid plans</h3>
            <p className="mt-1 text-sm text-slate-500">For more than 3 products, or to keep an active membership after the free period.</p>
            <PlanMiniGrid className="mt-5" />
            <p className="mt-4 text-xs text-slate-500">Product plans are billed annually.</p>
            <Link href="/pricing" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline underline-offset-4">
              Compare all plans <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
