import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy — Identification ID",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-xs text-muted mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>
          This Privacy Policy explains how <strong className="text-foreground">{COMPANY.legalName}</strong>{" "}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;), operator of the Identification ID platform, collects and uses
          information. {COMPANY.legalName} is the data controller for the platform.
        </p>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Information we collect</h2>
          <p>
            Account data (email, company profile), product content you upload (names, descriptions, documents,
            images), payment metadata processed by our payment provider, and basic usage data such as product-page
            views. Consumers can look up products without creating an account.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">How we use it</h2>
          <p>
            To operate the platform, publish your public product pages, process subscriptions, provide the API, keep
            the service secure, and communicate with you about your account.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Sharing</h2>
          <p>
            We do not sell your personal data. We share information only with service providers who help us run the
            platform (hosting, storage, payments, email) and where required by law. Product pages you publish are, by
            design, public.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Data security &amp; retention</h2>
          <p>
            Data is encrypted in transit (HTTPS) and at rest, and files are served via expiring signed URLs. We retain
            data for as long as your account is active or as needed to provide the service and meet legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Your rights</h2>
          <p>
            You may access, correct, or delete your account data by contacting us. Depending on your jurisdiction, you
            may have additional rights under applicable privacy law.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Contact</h2>
          <p>
            Privacy questions or requests:{" "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline">{COMPANY.supportEmail}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
