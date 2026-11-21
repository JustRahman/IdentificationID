import Link from "next/link";
import { PLANS, REGISTRY_MEMBERSHIP } from "@/lib/constants";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";

const FREE_INCLUDES = [
  "Permanent Manufacturer ID and public company page",
  "3 product pages, each with an Identification ID and QR code",
  "No card needed, no automatic charge",
  "Registered before July 1, 2027? Your company stays in the registry permanently",
];

const usd = (cents: number) => `$${cents / 100}`;

/** Section 4 - the free offer first, paid plans muted beside it. Prices come from constants. */
export function OfferPricing() {
  return (
    <section id="pricing" className="py-20 sm:py-24 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeader
          eyebrow="Pricing"
          title="Start free."
          muted="Pay only when your catalog grows."
          description="Looking up products and manufacturers is always free for everyone."
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-start">
          {/* Free offer - the one elevated card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)] relative overflow-hidden">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />
            <Badge tone="info">Free registration offer</Badge>
            <h3 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
              Manufacturer ID + 3 products
              <span className="block text-slate-400">free until July 1, 2027</span>
            </h3>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-5xl font-semibold tracking-tight text-slate-900 tabular-nums">$0</span>
              <span className="text-sm text-slate-500">until July 1, 2027</span>
            </div>
            <ul className="mt-7 space-y-3">
              {FREE_INCLUDES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-[15px] text-slate-700">
                  <svg className="w-5 h-5 mt-px shrink-0 text-accent" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 10.5l3.2 3.2L15 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <ButtonLink href="/register" size="lg">
                Register free <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/founding-manufacturers" variant="secondary" size="lg">
                Offer details
              </ButtonLink>
            </div>
          </div>

          {/* Paid plans - muted */}
          <div className="rounded-2xl border border-slate-200 bg-surface p-6 sm:p-7">
            <h3 className="text-sm font-semibold text-slate-900">Paid plans</h3>
            <p className="mt-1 text-sm text-slate-500">For more than 3 products, or to keep an active membership after the free period.</p>
            <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
              <div className="py-3 flex items-baseline justify-between gap-4">
                <dt className="text-sm text-slate-700">Registry Membership</dt>
                <dd className="text-sm text-slate-900 font-medium tabular-nums text-right">
                  {usd(REGISTRY_MEMBERSHIP.priceCents)}/mo <span className="text-slate-500 font-normal">or {usd(REGISTRY_MEMBERSHIP.annualPriceCents)}/yr</span>
                </dd>
              </div>
              {PLANS.map((p) => (
                <div key={p.key} className="py-3 flex items-baseline justify-between gap-4">
                  <dt className="text-sm text-slate-700">
                    {p.en.name}
                    <span className="block text-xs text-slate-500">{p.en.desc}</span>
                  </dt>
                  <dd className="text-sm text-slate-900 font-medium tabular-nums text-right whitespace-nowrap">
                    {usd(p.priceCents)}
                    <span className="text-slate-500 font-normal">{p.perProduct ? " / product / mo" : " / mo"}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs text-slate-500">Product plans are billed annually.</p>
            <Link href="/pricing" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline underline-offset-4">
              Compare all plans <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
