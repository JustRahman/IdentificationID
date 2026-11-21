import Link from "next/link";
import { REGISTRY_MEMBERSHIP } from "@/lib/constants";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { FactList } from "@/components/ui/FactList";
import { DisclaimerBar } from "@/components/ui/DisclaimerBar";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CheckList } from "@/components/marketing/CheckList";

export const metadata = {
  title: "Free registration until July 1, 2027 - Identification ID",
  description:
    "Free manufacturer registration on Identification ID: Manufacturer ID + 3 products free until July 1, 2027. No card needed, no automatic charge. Manufacturers registered before July 1, 2027 stay in the registry permanently.",
};

const INCLUDED = [
  "Permanent Manufacturer ID",
  "Your first 3 Product IDs",
  "Public manufacturer profile",
  "Product pages with specifications, images, manuals and safety information",
  "A QR code for every product",
  "No payment details collected during the free period",
];

const RULES: [string, string][] = [
  ["Who can join", "Any manufacturer that registers before July 1, 2027"],
  ["Free until", "July 1, 2027"],
  ["What's free", "Manufacturer ID, public company profile and 3 products with Identification IDs, pages and QR codes"],
  ["Payment at signup", "$0 - no card needed"],
  ["Stay in the registry", "Manufacturers registered before July 1, 2027 always stay in the registry: the Manufacturer ID, product pages and QR codes are permanent"],
  ["After July 1, 2027", `You decide whether to keep an active membership: $${REGISTRY_MEMBERSHIP.priceCents / 100}/month or $${REGISTRY_MEMBERSHIP.annualPriceCents / 100}/year. We will contact you with the options before then`],
  ["Automatic charge", "None. Nothing renews unless you choose to pay"],
  ["If you don't continue", "Your Manufacturer ID, product pages and QR codes keep working; your profile is marked Inactive and editing pauses until you renew"],
  ["Limit", "One free registration per company (legal entity)"],
];

const STEPS = [
  ["Register your company", "Create an account and fill in your company profile."],
  ["Get your Manufacturer ID", "A permanent MID-XXXX-XXXX and a public company page."],
  ["Add up to 3 products", "Each gets an Identification ID, a product page and a QR code."],
];

export default function FoundingManufacturersPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Pricing", href: "/pricing" }, { label: "Free registration" }]}
        eyebrow="Free registration offer"
        title="Register your company"
        muted="free until July 1, 2027."
        description="Join the manufacturers building a global encyclopedia of manufacturers and products - a Wikipedia-style directory where product information comes directly from the manufacturer."
        actions={
          <>
            <ButtonLink href="/register" size="lg">
              Register for free <ArrowRight />
            </ButtonLink>
            <ButtonLink href="#terms" variant="secondary" size="lg">
              Read the terms
            </ButtonLink>
          </>
        }
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
          {/* Terms table */}
          <div id="terms" className="scroll-mt-24 order-2 lg:order-1">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Program terms</h2>
            <p className="mt-2 text-sm text-slate-500">The full conditions of the free registration offer.</p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 sm:px-6">
              <FactList layout="grid" items={RULES.map(([label, value]) => ({ label, value }))} className="[&_dd]:font-normal [&_dd]:text-slate-700 [&_dd]:leading-relaxed" />
            </div>

            <div className="mt-8 space-y-3 text-sm text-slate-500 leading-relaxed max-w-prose">
              <p>
                This is a limited-time offer, not a permanent free plan. Identification ID is an independent
                directory operated by Global Product Identification Inc. It is not affiliated with Wikipedia and is not a
                government registry, regulator or certification body.
              </p>
              <p>
                Product pages and QR codes add information next to the labels and printed instructions your products
                are legally required to carry - they do not replace them. See our{" "}
                <Link href="/legal" className="text-accent hover:underline underline-offset-4">Trust Center</Link> for the full terms.
              </p>
            </div>
          </div>

          {/* Summary card */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-24">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)]">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />
              <p className="text-sm font-medium text-slate-500">Free until July 1, 2027</p>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-semibold tracking-tight text-slate-900 tabular-nums">$0</span>
                <span className="text-sm text-slate-500">no card needed</span>
              </p>
              <p className="mt-2 text-sm text-slate-600">No automatic charges after the free period.</p>
              <h3 className="mt-6 text-sm font-semibold text-slate-900">What&apos;s included</h3>
              <CheckList items={INCLUDED} size="sm" className="mt-3" />
              <ButtonLink href="/register" size="lg" className="mt-7 w-full">
                Register for free <ArrowRight />
              </ButtonLink>
              <p className="mt-3 text-center text-xs text-slate-500">
                Already registered?{" "}
                <Link href="/login" className="text-accent hover:underline underline-offset-4">Log in</Link>
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-surface border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">How it works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-accent tabular-nums">
                  {i + 1}
                </span>
                <p className="mt-4 font-semibold text-slate-900">{t}</p>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{d}</p>
              </li>
            ))}
          </ol>
          <DisclaimerBar className="mt-10" />
        </div>
      </section>
    </>
  );
}
