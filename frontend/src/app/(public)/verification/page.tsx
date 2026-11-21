import Link from "next/link";
import { COMPANY, VERIFICATION_DISCLAIMER } from "@/lib/constants";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/marketing/PageHeader";
import { CheckList } from "@/components/marketing/CheckList";

export const metadata = {
  title: "How Manufacturer Verification Works - Identification ID",
  description:
    "What Identification ID checks, what each verification level means, and what it does not certify.",
};

const LEVELS: {
  name: string;
  price: string;
  tone: BadgeTone;
  icon?: "check" | "shield";
  means: string;
  checked: string[];
}[] = [
  {
    name: "Registered Manufacturer",
    price: "Included with membership",
    tone: "neutral",
    icon: "check",
    means: "The company created an account and received a permanent Manufacturer ID.",
    checked: ["Account created", "Manufacturer ID issued"],
  },
  {
    name: "Verified Manufacturer",
    price: "Included with membership",
    tone: "verified",
    icon: "shield",
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
    tone: "neutral",
    means:
      "Confirms the legal entity exists and that the account holder is connected to that company.",
    checked: [
      "Company registration in an official business registry",
      "Confirmation the representative is linked to the company",
    ],
  },
];

const NOT_MEANT = [
  "It is not a government, tax, or regulatory certification.",
  "It is not a product safety, quality, or compliance certification.",
  "It does not guarantee that any individual physical item is authentic.",
  "It does not constitute an endorsement of the company or its products.",
];

export default function VerificationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trust"
        title="How Manufacturer Verification Works"
        description="Verification is included with every Manufacturer Registry Membership at no extra cost. This page explains exactly what we check at each level - and what we do not."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Verification levels</h2>
          <ol className="mt-8 grid gap-4 lg:grid-cols-3">
            {LEVELS.map((l, i) => (
              <li key={l.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-500 tabular-nums">Level {i + 1}</span>
                  <span className="text-xs text-slate-500">{l.price}</span>
                </div>
                <h3 className="mt-4">
                  <Badge tone={l.tone} icon={l.icon} className="text-sm">
                    {l.name}
                  </Badge>
                </h3>
                <p className="mt-4 text-sm text-slate-700 leading-relaxed">{l.means}</p>
                <div className="mt-5 pt-5 border-t border-slate-200 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">What is checked</p>
                  <CheckList items={l.checked} size="sm" />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-surface border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid gap-12 lg:grid-cols-2">
          <div className="max-w-prose">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">How the checks run</h2>
            <p className="mt-4 text-base text-slate-700 leading-relaxed">
              Verification is automatic. When a manufacturer saves their company profile, we check
              the website and email address they provided - there is nothing to install, no DNS
              records to add, and no documents to upload. Results are stored on the profile and can
              be re-run at any time from the dashboard.
            </p>
            <p className="mt-4 text-base text-slate-700 leading-relaxed">
              Each public manufacturer profile lists exactly which attributes were confirmed, so
              anyone can see what a badge is based on rather than relying on a checkmark alone.
            </p>
          </div>

          {/* The disclaimer - deliberately prominent */}
          <div className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0 text-slate-500" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
                <circle cx="8" cy="8" r="6.25" />
                <path d="M8 7.25v4M8 4.9v.1" />
              </svg>
              <h2 className="text-lg font-semibold text-slate-900">What verification does not mean</h2>
            </div>
            <p className="mt-4 text-sm text-slate-700 leading-relaxed">{VERIFICATION_DISCLAIMER}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {NOT_MEANT.map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="max-w-prose">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Reporting a problem</h2>
            <p className="mt-4 text-base text-slate-700 leading-relaxed">
              If you believe a manufacturer profile is inaccurate or misrepresents a company,
              contact us at{" "}
              <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline underline-offset-4">
                {COMPANY.supportEmail}
              </a>
              . We review reports and can suspend a profile from the public registry.
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Full rules:{" "}
              <Link href="/legal/verification-policy" className="text-accent hover:underline underline-offset-4">
                Manufacturer Verification Policy
              </Link>
              .
            </p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <ButtonLink href="/register" size="lg">Get verified</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary" size="lg">View plans</ButtonLink>
          </div>

          <p className="text-xs text-slate-500 mt-12 pt-6 border-t border-slate-200 leading-relaxed">
            Verification is operated by {COMPANY.legalName} as part of the Identification ID
            registry. Levels and checks may be updated as the registry evolves.
          </p>
        </div>
      </section>
    </>
  );
}
