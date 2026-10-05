import Link from "next/link";
import { CORPORATE, LEGAL_CONTACTS, LEGAL_DOCS, formatDate } from "@/lib/legal";

export const metadata = {
  title: "Legal & Trust Center - Identification ID",
  description:
    "Who operates Identification ID, our legal documents, what Verified Manufacturer means, how to report a problem, and how we handle privacy and security.",
};

function Mail({ to }: { to: string }) {
  return <a href={`mailto:${to}`} className="text-accent hover:underline">{to}</a>;
}

export default function TrustCenterPage() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Legal &amp; Trust Center</h1>
      <p className="text-sm text-muted mb-10 max-w-2xl">
        Everything about who runs Identification ID and the rules of the registry, in one place. If you received an
        email from us, this page lets you check who we are before you reply.
      </p>

      {/* Who we are */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Who operates Identification ID</h2>
        <div className="border border-border rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted">Legal name</p>
            <p className="font-medium">{CORPORATE.legalName}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Type</p>
            <p>{CORPORATE.type}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Corporation number</p>
            <p className="font-mono">{CORPORATE.corporationNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Business number (Canada Revenue Agency)</p>
            <p className="font-mono">{CORPORATE.businessNumber}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted">Registered office</p>
            <p>{CORPORATE.registeredOffice}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-muted">Governing law of our agreements</p>
            <p>{CORPORATE.governingLaw}</p>
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          You can confirm the corporation in the public{" "}
          <a
            href="https://ised-isde.canada.ca/cc/lgcy/fdrlCrpSrch.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Corporations Canada search
          </a>{" "}
          using the corporation number above.
        </p>
      </section>

      {/* What we are and are not */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">What Identification ID is, and is not</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="border border-border rounded-xl p-5">
            <p className="font-medium mb-2">We are</p>
            <ul className="space-y-1.5 text-muted list-disc pl-5">
              <li>A private digital registry of manufacturers and their products</li>
              <li>The issuer of Manufacturer IDs, Product IDs and QR product pages</li>
              <li>A place where manufacturer-provided information is published</li>
            </ul>
          </div>
          <div className="border border-border rounded-xl p-5">
            <p className="font-medium mb-2">We are not</p>
            <ul className="space-y-1.5 text-muted list-disc pl-5">
              <li>A government registry, regulator or certification body</li>
              <li>A manufacturer, seller, importer or marketplace</li>
              <li>A guarantee that a physical product is authentic, safe or compliant</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          Product information is provided and maintained by each manufacturer, who is responsible for it.
        </p>
      </section>

      {/* Documents */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Legal documents</h2>
        <div className="divide-y divide-border border border-border rounded-xl">
          {LEGAL_DOCS.map((d) => {
            const v = d.versions.find((x) => x.version === d.current)!;
            return (
              <Link key={d.slug} href={`/legal/${d.slug}`} className="block p-5 hover:bg-surface transition-colors">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <p className="font-medium text-sm">{d.title}</p>
                  <p className="text-xs text-muted">
                    Version {d.current} · Effective {formatDate(v.effective)}
                  </p>
                </div>
                <p className="text-sm text-muted mt-1">{d.summary}</p>
              </Link>
            );
          })}
          <Link href="/cookies" className="block p-5 hover:bg-surface transition-colors">
            <p className="font-medium text-sm">Cookie Policy</p>
            <p className="text-sm text-muted mt-1">The cookies and similar technologies the website uses.</p>
          </Link>
        </div>
        <p className="text-xs text-muted mt-3">
          Every version is kept permanently. Earlier versions are linked at the bottom of each document. If a
          document is translated, the English version controls.
        </p>
      </section>

      {/* Verification */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">What &ldquo;Verified Manufacturer&rdquo; means</h2>
        <div className="border border-border rounded-xl p-5 text-sm space-y-2">
          <p>
            A manufacturer marked <strong>Verified Manufacturer</strong>{" "}has passed Identification ID&apos;s
            applicable account and manufacturer checks, for example that its email domain matches its company
            website.
          </p>
          <p className="text-muted">
            It is not a government certification, product safety approval, or a guarantee that a product is
            authentic or of good quality. Payment for membership does not buy a verified status.
          </p>
          <p>
            <Link href="/verification" className="text-accent hover:underline">How verification works</Link>
            {" · "}
            <Link href="/legal/verification-policy" className="text-accent hover:underline">
              Manufacturer Verification Policy
            </Link>
          </p>
        </div>
      </section>

      {/* Reporting */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Report a problem</h2>
        <div className="border border-border rounded-xl p-5 text-sm space-y-3">
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
          <p className="text-xs text-muted">
            See the{" "}
            <Link href="/legal/ip-policy" className="text-accent hover:underline">
              Intellectual Property &amp; Trademark Complaint Policy
            </Link>{" "}
            for what to include in a complaint.
          </p>
        </div>
      </section>

      {/* Privacy & security */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Privacy and security</h2>
        <div className="border border-border rounded-xl p-5 text-sm">
          <ul className="space-y-1.5 list-disc pl-5 text-muted">
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
              <Link href="/legal/privacy#13-how-we-disclose-information" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              .
            </li>
          </ul>
        </div>
      </section>

      {/* Outreach */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Did we email you?</h2>
        <div className="border border-border rounded-xl p-5 text-sm space-y-2">
          <p>
            We contact manufacturers whose business email is published for business enquiries, about joining the
            registry. Our emails come from <Mail to="hello@identificationid.com" />, name the sender and our address,
            and you can stop them at any time by replying &ldquo;unsubscribe&rdquo;.
          </p>
          <p className="text-muted">
            We never ask for passwords or card numbers by email. Payments are only made through the secure checkout
            on identificationid.com.
          </p>
        </div>
      </section>
    </div>
  );
}
