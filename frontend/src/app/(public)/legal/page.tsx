import Link from "next/link";
import { CORPORATE, LEGAL_CONTACTS, LEGAL_DOCS, formatDate } from "@/lib/legal";
import { FactList } from "@/components/ui/FactList";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SideNav } from "@/components/marketing/SideNav";

export const metadata = {
  title: "Legal & Trust Center - Identification ID",
  description:
    "Who operates Identification ID, our legal documents, what Verified Manufacturer means, how to report a problem, and how we handle privacy and security.",
};

function Mail({ to }: { to: string }) {
  return <a href={`mailto:${to}`} className="text-accent hover:underline underline-offset-4">{to}</a>;
}

const SECTIONS = [
  { href: "#documents", label: "Legal documents" },
  { href: "#operator", label: "Who operates Identification ID" },
  { href: "#what-we-are", label: "What we are, and are not" },
  { href: "#verification", label: "Verified Manufacturer" },
  { href: "#report", label: "Report a problem" },
  { href: "#privacy", label: "Privacy and security" },
  { href: "#outreach", label: "Did we email you?" },
];

const H2 = "text-2xl font-semibold tracking-tight text-slate-900 mb-5";
const CARD = "rounded-2xl border border-slate-200 bg-white";

export default function TrustCenterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trust Center"
        title="Legal & Trust Center"
        description="Everything about who runs Identification ID and the rules of the registry, in one place. If you received an email from us, this page lets you check who we are before you reply."
      />

      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-14 sm:py-16 grid gap-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-14">
        <SideNav title="On this page" items={SECTIONS} className="hidden lg:block" />

        <div className="min-w-0 space-y-16">
          {/* Documents */}
          <section id="documents" className="scroll-mt-24">
            <h2 className={H2}>Legal documents</h2>
            <div className={`${CARD} overflow-hidden`}>
              <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_90px_130px] gap-6 border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-medium text-slate-500">
                <span>Document</span>
                <span>Version</span>
                <span>Effective</span>
              </div>
              <ul className="divide-y divide-slate-200">
                {LEGAL_DOCS.map((d) => {
                  const v = d.versions.find((x) => x.version === d.current)!;
                  return (
                    <li key={d.slug}>
                      <Link href={`/legal/${d.slug}`} className="group grid gap-1 sm:grid-cols-[minmax(0,1fr)_90px_130px] sm:gap-6 px-5 py-4 transition-colors hover:bg-slate-50">
                        <span className="min-w-0">
                          <span className="block text-[15px] font-medium text-slate-900 group-hover:text-accent">{d.title}</span>
                          <span className="mt-1 block text-sm text-slate-500 leading-relaxed">{d.summary}</span>
                        </span>
                        <span className="text-sm text-slate-700 tabular-nums">
                          <span className="sm:hidden text-slate-500">Version </span>{d.current}
                        </span>
                        <span className="text-sm text-slate-700">
                          <span className="sm:hidden text-slate-500">Effective </span>{formatDate(v.effective)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
                <li>
                  <Link href="/cookies" className="group grid gap-1 sm:grid-cols-[minmax(0,1fr)_90px_130px] sm:gap-6 px-5 py-4 transition-colors hover:bg-slate-50">
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium text-slate-900 group-hover:text-accent">Cookie Policy</span>
                      <span className="mt-1 block text-sm text-slate-500 leading-relaxed">The cookies and similar technologies the website uses.</span>
                    </span>
                    <span className="hidden sm:block text-sm text-slate-400">-</span>
                    <span className="hidden sm:block text-sm text-slate-400">-</span>
                  </Link>
                </li>
              </ul>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Every version is kept permanently. Earlier versions are linked at the bottom of each document. If a
              document is translated, the English version controls.
            </p>
          </section>

          {/* Who we are */}
          <section id="operator" className="scroll-mt-24">
            <h2 className={H2}>Who operates Identification ID</h2>
            <div className={`${CARD} px-5 sm:px-6`}>
              <FactList
                layout="grid"
                items={[
                  { label: "Legal name", value: CORPORATE.legalName },
                  { label: "Type", value: CORPORATE.type },
                  { label: "Corporation number", value: <span data-no-i18n>{CORPORATE.corporationNumber}</span>, mono: true },
                  { label: "Business number (Canada Revenue Agency)", value: <span data-no-i18n>{CORPORATE.businessNumber}</span>, mono: true },
                  { label: "Registered office", value: CORPORATE.registeredOffice },
                  { label: "Governing law of our agreements", value: CORPORATE.governingLaw },
                ]}
                className="[&>div]:sm:grid-cols-[260px_1fr]"
              />
            </div>
            <p className="mt-3 text-sm text-slate-500">
              You can confirm the corporation in the public{" "}
              <a
                href="https://ised-isde.canada.ca/cc/lgcy/fdrlCrpSrch.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline underline-offset-4"
              >
                Corporations Canada search
              </a>{" "}
              using the corporation number above.
            </p>
          </section>
          {/* What we are and are not */}
          <section id="what-we-are" className="scroll-mt-24">
            <h2 className={H2}>What Identification ID is, and is not</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[15px] leading-relaxed">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <p className="font-semibold text-slate-900 mb-3">We are</p>
                <ul className="space-y-1.5 text-slate-600 list-disc pl-5">
                  <li>A private digital registry of manufacturers and their products</li>
                  <li>The issuer of Manufacturer IDs, Product IDs and QR product pages</li>
                  <li>A place where manufacturer-provided information is published</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <p className="font-semibold text-slate-900 mb-3">We are not</p>
                <ul className="space-y-1.5 text-slate-600 list-disc pl-5">
                  <li>A government registry, regulator or certification body</li>
                  <li>A manufacturer, seller, importer or marketplace</li>
                  <li>A guarantee that a physical product is authentic, safe or compliant</li>
                </ul>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Product information is provided and maintained by each manufacturer, who is responsible for it.
            </p>
          </section>

          {/* Verification */}
          <section id="verification" className="scroll-mt-24">
            <h2 className={H2}>What &ldquo;Verified Manufacturer&rdquo; means</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-[15px] leading-relaxed text-slate-700 space-y-3">
              <p>
                A manufacturer marked <strong>Verified Manufacturer</strong>{" "}has passed Identification ID&apos;s
                applicable account and manufacturer checks, for example that its email domain matches its company
                website.
              </p>
              <p className="text-slate-600">
                It is not a government certification, product safety approval, or a guarantee that a product is
                authentic or of good quality. Payment for membership does not buy a verified status.
              </p>
              <p>
                <Link href="/verification" className="text-accent hover:underline underline-offset-4">How verification works</Link>
                {" · "}
                <Link href="/legal/verification-policy" className="text-accent hover:underline underline-offset-4">
                  Manufacturer Verification Policy
                </Link>
              </p>
            </div>
          </section>

          {/* Reporting */}
          <section id="report" className="scroll-mt-24">
            <h2 className={H2}>Report a problem</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-[15px] leading-relaxed text-slate-700 space-y-3">
              <p>
                Every public product page and manufacturer profile has a <strong>Report</strong>{" "}button. Use it for
                incorrect information, an unauthorized company or brand profile, trademark or copyright infringement,
                counterfeit or suspicious products, or safety concerns. Reports go to our team for review, and disputed
                records are marked &ldquo;Under review&rdquo; instead of being silently deleted.
              </p>
              <ul className="space-y-1.5">
                <li>Trademark, copyright and legal notices: <Mail to={LEGAL_CONTACTS.legal} /></li>
                <li>Abuse, impersonation and misuse of IDs or QR codes: <Mail to={LEGAL_CONTACTS.abuse} /></li>
                <li>Privacy requests and questions: <Mail to={LEGAL_CONTACTS.privacy} /></li>
                <li>Billing, cancellation and general support: <Mail to={LEGAL_CONTACTS.support} /></li>
              </ul>
              <p className="text-sm text-slate-500">
                See the{" "}
                <Link href="/legal/ip-policy" className="text-accent hover:underline underline-offset-4">
                  Intellectual Property &amp; Trademark Complaint Policy
                </Link>{" "}
                for what to include in a complaint.
              </p>
            </div>
          </section>

          {/* Privacy & security */}
          <section id="privacy" className="scroll-mt-24">
            <h2 className={H2}>Privacy and security</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-sm">
              <ul className="space-y-1.5 list-disc pl-5 text-slate-600">
                <li>All traffic to identificationid.com is encrypted (HTTPS).</li>
                <li>Payments are processed by Stripe. We never receive or store full card numbers.</li>
                <li>Uploaded documents are served through expiring links.</li>
                <li>
                  Changes to manufacturer and product records are kept in an internal change history, so the registry
                  record cannot be silently rewritten.
                </li>
                <li>We do not sell personal information.</li>
                <li>
                  Our main service providers are listed in section 13 of the{" "}
                  <Link href="/legal/privacy#13-how-we-disclose-information" className="text-accent hover:underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </li>
              </ul>
            </div>
          </section>

          {/* Outreach */}
          <section id="outreach" className="scroll-mt-24">
            <h2 className={H2}>Did we email you?</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-[15px] leading-relaxed text-slate-700 space-y-3">
              <p>
                We contact manufacturers whose business email is published for business enquiries, about joining the
                registry. Our emails come from <Mail to="hello@identificationid.com" />, name the sender and our address,
                and you can stop them at any time with the unsubscribe link in the email, on our{" "}
                <Link href="/unsubscribe" className="text-accent hover:underline underline-offset-4">unsubscribe page</Link>, or by replying
                &ldquo;unsubscribe&rdquo;. Unsubscribed addresses are added to our do-not-contact list and are never
                emailed again.
              </p>
              <p className="text-slate-600">
                We never ask for passwords or card numbers by email. Payments are only made through the secure checkout
                on identificationid.com.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
