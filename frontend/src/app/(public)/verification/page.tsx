import Link from "next/link";
import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "How Manufacturer Verification Works — Identification ID",
  description:
    "What Identification ID checks, what each verification level means, and what it does not certify.",
};

const LEVELS = [
  {
    name: "Registered Manufacturer",
    price: "Free",
    tone: "gray",
    means: "The company created an account and received a permanent Manufacturer ID.",
    checked: ["Account created", "Manufacturer ID issued"],
  },
  {
    name: "Verified Manufacturer",
    price: "Free",
    tone: "blue",
    means:
      "Automated checks confirmed the company controls a corporate email on the same domain as its website.",
    checked: [
      "Corporate email (not a free or disposable provider)",
      "Email domain matches the company website",
      "Website is live and served over valid HTTPS",
      "Domain has mail servers and a verifiable registration date",
    ],
  },
  {
    name: "Business Verified",
    price: "Coming later",
    tone: "emerald",
    means:
      "Confirms the legal entity exists and that the account holder is connected to that company.",
    checked: [
      "Company registration in an official business registry",
      "Confirmation the representative is linked to the company",
    ],
  },
];

const toneClasses: Record<string, string> = {
  gray: "border-border bg-surface",
  blue: "border-blue-200 bg-blue-50",
  emerald: "border-emerald-200 bg-emerald-50",
};

export default function VerificationPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">Trust</p>
      <h1 className="text-3xl font-semibold tracking-tight mb-4">
        How Manufacturer Verification Works
      </h1>
      <p className="text-lg text-muted leading-relaxed mb-10">
        Every manufacturer on Identification ID can establish a verified digital identity for
        free. This page explains exactly what we check at each level — and what we do not.
      </p>

      {/* Levels */}
      <div className="space-y-4 mb-12">
        {LEVELS.map((l) => (
          <div key={l.name} className={`border rounded-xl p-6 ${toneClasses[l.tone]}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <h2 className="text-lg font-semibold">
                {l.tone !== "gray" && <span className="text-green-600 mr-1">✓</span>}
                {l.name}
              </h2>
              <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-border shrink-0">
                {l.price}
              </span>
            </div>
            <p className="text-sm text-muted mb-4">{l.means}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
              What is checked
            </p>
            <ul className="space-y-1.5">
              {l.checked.map((c) => (
                <li key={c} className="text-sm flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* How it runs */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-3">How the checks run</h2>
        <p className="text-sm text-muted leading-relaxed mb-3">
          Verification is automatic. When a manufacturer saves their company profile, we check
          the website and email address they provided — there is nothing to install, no DNS
          records to add, and no documents to upload. Results are stored on the profile and can
          be re-run at any time from the dashboard.
        </p>
        <p className="text-sm text-muted leading-relaxed">
          Each public manufacturer profile lists exactly which attributes were confirmed, so
          anyone can see what a badge is based on rather than relying on a checkmark alone.
        </p>
      </section>

      {/* The disclaimer — deliberately prominent */}
      <section className="border-2 border-amber-200 bg-amber-50 rounded-xl p-6 mb-10">
        <h2 className="text-base font-semibold mb-2">What verification does not mean</h2>
        <p className="text-sm text-amber-900 leading-relaxed mb-3">
          Verification confirms specified account, domain, or company-profile attributes checked
          by Identification ID. It does not constitute government certification, product safety
          certification, or a guarantee of product authenticity.
        </p>
        <ul className="space-y-1.5 text-sm text-amber-900">
          {[
            "It is not a government, tax, or regulatory certification.",
            "It is not a product safety, quality, or compliance certification.",
            "It does not guarantee that any individual physical item is authentic.",
            "It does not constitute an endorsement of the company or its products.",
          ].map((t) => (
            <li key={t} className="flex items-start gap-2">
              <span className="mt-0.5">•</span>
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Reporting a problem</h2>
        <p className="text-sm text-muted leading-relaxed">
          If you believe a manufacturer profile is inaccurate or misrepresents a company,
          contact us at{" "}
          <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline">
            {COMPANY.supportEmail}
          </a>
          . We review reports and can suspend a profile from the public registry.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/register" className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-accent-hover">
          Get verified — free
        </Link>
        <Link href="/pricing" className="border border-border px-6 py-3 rounded-xl text-sm font-medium hover:bg-surface">
          View plans
        </Link>
      </div>

      <p className="text-xs text-muted mt-10 pt-6 border-t border-border leading-relaxed">
        Verification is operated by {COMPANY.legalName} as part of the Identification ID
        registry. Levels and checks may be updated as the registry evolves.
      </p>
    </div>
  );
}
