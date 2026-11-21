import Link from "next/link";
import { REGISTRY_MEMBERSHIP } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { FactList } from "@/components/ui/FactList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CheckList } from "@/components/marketing/CheckList";
import { Accordion } from "@/components/marketing/Accordion";
import { MembershipCard, PlanCardGrid } from "@/components/marketing/PlanCards";

const FREE_INCLUDES = [
  "Permanent Manufacturer ID and public company page",
  "3 product pages, each with an Identification ID and QR code",
  "No card needed, no automatic charge",
  "Registered before July 1, 2027? Your company stays in the registry permanently",
];

export default function PricingPage() {
  const monthly = REGISTRY_MEMBERSHIP.priceCents / 100;
  const annual = REGISTRY_MEMBERSHIP.annualPriceCents / 100;

  const billingFaq = [
    {
      q: "Do I need a card to register?",
      a: "No. Free registration (Manufacturer ID + 3 products) needs no card and no payment details are collected during the free period. Nothing is charged automatically.",
    },
    {
      q: "What happens on July 1, 2027?",
      a: (
        <>
          You decide whether to keep an active membership: ${monthly}/month or ${annual}/year. We will contact you with the
          options before then. Manufacturers registered before July 1, 2027 stay in the registry permanently. See the{" "}
          <Link href="/founding-manufacturers" className="text-accent hover:underline underline-offset-4">offer terms</Link>.
        </>
      ),
    },
    {
      q: "How do the Registry Membership and product plans fit together?",
      a: "Every manufacturer has a Manufacturer Registry Membership. Popular, Best Value and Enterprise include it. Standard is billed in addition to it, per product. Your first 3 Product IDs are included at no additional cost.",
    },
    {
      q: "How am I billed?",
      a: `The Registry Membership is $${monthly}/month or $${annual}/year. Product plans are annual subscriptions. Payments are processed by Stripe; we never receive or store full card numbers.`,
    },
    {
      q: "What happens if my membership lapses?",
      a: "Your Manufacturer ID is permanent. The ID, product pages and QR codes keep working - your profile is marked Inactive and adding or editing products pauses until you renew.",
    },
    {
      q: "Can I cancel or get a refund?",
      a: (
        <>
          Cancellations and refunds follow our{" "}
          <Link href="/legal/refund" className="text-accent hover:underline underline-offset-4">Refund Policy</Link>. For
          billing questions email{" "}
          <a href="mailto:support@identificationid.com" className="text-accent hover:underline underline-offset-4">
            support@identificationid.com
          </a>
          .
        </>
      ),
    },
    {
      q: "Do consumers pay anything?",
      a: "No. Looking up and verifying products and manufacturers is always free, with no account needed.",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Start free."
        muted="Pay only when your catalog grows."
        description="Manufacturers register free until July 1, 2027. Add a paid plan only if you need more products. Consumers always look up and verify products for free."
      />

      {/* 1. Free offer - the one elevated card */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)]">
            <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />
            <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
              <div className="p-7 sm:p-10">
                <Badge tone="info">Free registration offer</Badge>
                <h2 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-tight text-balance">
                  Manufacturer ID + 3 products
                  <span className="block text-slate-400">free until July 1, 2027</span>
                </h2>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-slate-900 tabular-nums">$0</span>
                  <span className="text-sm text-slate-500">until July 1, 2027</span>
                </div>
                <CheckList items={FREE_INCLUDES} className="mt-7" />
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <ButtonLink href="/register" size="lg">
                    Register free <ArrowRight />
                  </ButtonLink>
                  <ButtonLink href="/founding-manufacturers" variant="secondary" size="lg">
                    Offer details
                  </ButtonLink>
                </div>
              </div>
              <div className="border-t lg:border-t-0 lg:border-l border-slate-200 bg-surface p-7 sm:p-10">
                <h3 className="text-sm font-semibold text-slate-900">At a glance</h3>
                <FactList
                  className="mt-3"
                  items={[
                    { label: "Payment at signup", value: "$0 - no card" },
                    { label: "Free until", value: "July 1, 2027" },
                    { label: "Products included", value: "3" },
                    { label: "Automatic charge", value: "None" },
                    { label: "Stay in the registry", value: "Permanently" },
                    { label: "Limit", value: "One per company" },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Paid plans - colored membership + plan cards */}
      <section className="py-16 sm:py-20 bg-surface border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <SectionHeader
            eyebrow="Paid plans"
            title="For larger catalogs."
            muted="Optional."
            description="For more than 3 products, or to keep an active membership after the free period."
          />

          {/* Registry Membership - indigo / violet */}
          <MembershipCard className="mt-2" />

          {/* Product plans - per-plan colors */}
          <div className="mt-14 mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">Product plans</h3>
            <p className="text-sm text-slate-500 max-w-xl sm:text-right">
              Popular, Best Value and Enterprise include the Registry Membership. Standard is billed in addition to it.
            </p>
          </div>
          <PlanCardGrid />
          <p className="mt-8 text-sm text-slate-500">
            Prices in USD. Product plans are annual subscriptions. API access is included with Best Value and Enterprise -{" "}
            <Link href="/api" className="text-accent hover:underline underline-offset-4">see the API</Link>.
          </p>
        </div>
      </section>

      {/* 3. Billing FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
          <SectionHeader
            eyebrow="Billing"
            title="Billing questions,"
            muted="answered."
            description={
              <>
                More in the{" "}
                <Link href="/faq" className="text-accent hover:underline underline-offset-4">full FAQ</Link> and the{" "}
                <Link href="/legal" className="text-accent hover:underline underline-offset-4">Trust Center</Link>.
              </>
            }
            className="mb-0"
          />
          <Accordion items={billingFaq} openFirst />
        </div>
      </section>
    </>
  );
}
