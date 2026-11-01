import Link from "next/link";
import { REGISTRY_MEMBERSHIP } from "@/lib/constants";

export const metadata = {
  title: "Founding Manufacturers Program - Identification ID",
  description:
    "The first 100 manufacturers get the Identification ID Registry Membership free for 6 months. No card needed, no automatic charge.",
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
  ["Who can join", "The first 100 approved manufacturers"],
  ["Free period", "6 months from activation"],
  ["Payment at signup", "$0 - no card needed"],
  ["After 6 months", `Optional: continue for $${REGISTRY_MEMBERSHIP.priceCents / 100}/month or $${REGISTRY_MEMBERSHIP.annualPriceCents / 100}/year`],
  ["Automatic charge", "None. Nothing renews unless you choose to pay"],
  ["If you don't continue", "Your Manufacturer ID, product pages and QR codes keep working; your profile is marked Inactive and editing pauses until you renew"],
  ["Limit", "One free Founding membership per company (legal entity)"],
];

export default function FoundingManufacturersPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Founding Manufacturers Program</p>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">Become a Founding Manufacturer</h1>
      <p className="text-lg text-muted leading-relaxed mb-8">
        Join the first 100 manufacturers building a global encyclopedia of manufacturers and products -
        a Wikipedia-style directory where product information comes directly from the manufacturer.
      </p>

      <div className="rounded-2xl p-6 bg-green-50 border-2 border-green-300 mb-10">
        <p className="text-4xl font-bold text-green-950 mb-1">6 months free</p>
        <p className="text-sm text-green-900/80 mb-5">No card needed. No automatic charges after the free period.</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 mb-6">
          {INCLUDED.map((f) => (
            <li key={f} className="text-sm text-green-950 flex items-start gap-2">
              <span className="text-green-600">✓</span>
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/register"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          Join the Founding Manufacturers Program
        </Link>
      </div>

      <h2 className="text-lg font-semibold mb-4">Program terms</h2>
      <dl className="divide-y divide-border border border-border rounded-xl mb-10">
        {RULES.map(([k, v]) => (
          <div key={k} className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 px-5 py-3">
            <dt className="text-sm font-medium">{k}</dt>
            <dd className="text-sm text-muted sm:col-span-2">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="text-xs text-muted space-y-2 leading-relaxed">
        <p>
          This is a limited, temporary program, not a permanent free plan. Identification ID is an independent
          directory operated by Global Product Identification Inc. It is not affiliated with Wikipedia and is not a
          government registry, regulator or certification body.
        </p>
        <p>
          Product pages and QR codes add information next to the labels and printed instructions your products
          are legally required to carry - they do not replace them. See our{" "}
          <Link href="/legal" className="text-accent hover:underline">Trust Center</Link> for the full terms.
        </p>
      </div>
    </div>
  );
}
