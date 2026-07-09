import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service — Identification ID",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Terms of Service</h1>
      <p className="text-xs text-muted mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) are a legal agreement between you and{" "}
          <strong className="text-foreground">{COMPANY.legalName}</strong> (&ldquo;{COMPANY.product}&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;), a {COMPANY.entityType} operating the Identification ID platform.
          By creating an account or using the platform, you agree to these Terms.
        </p>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. The service</h2>
          <p>
            Identification ID lets manufacturers register products, generate unique Identification IDs and QR codes,
            upload documents and images, and publish public product pages. Consumers may look up and verify products
            free of charge.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Accounts &amp; eligibility</h2>
          <p>
            You are responsible for your account credentials and for all activity under your account. You must provide
            accurate company and product information and have the right to publish the content you upload.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. Plans &amp; payment</h2>
          <p>
            Paid plans are billed as annual subscriptions at the prices shown on our Pricing page. A free plan is
            available with a limited number of products. You may not register or publish more products than your plan
            allows. Fees are non-refundable except where required by law.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. Acceptable use</h2>
          <p>
            You agree not to upload false, misleading, unlawful, or infringing content, not to impersonate other
            companies or products, and not to misuse the API or attempt to disrupt the platform.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Content &amp; ownership</h2>
          <p>
            You retain ownership of the product content you upload and grant us the license needed to host and display
            it on the platform. &ldquo;Identification ID&rdquo; and related marks are trademarks of {COMPANY.legalName}.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Disclaimers &amp; liability</h2>
          <p>
            The platform is provided &ldquo;as is&rdquo;. To the maximum extent permitted by law, {COMPANY.legalName}
            is not liable for indirect or consequential damages arising from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">7. Governing law</h2>
          <p>
            These Terms are governed by the laws of {COMPANY.jurisdiction}, without regard to conflict-of-law rules.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">8. Contact</h2>
          <p>
            Questions about these Terms:{" "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline">{COMPANY.supportEmail}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
