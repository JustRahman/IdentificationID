import { AGREEMENT_VERSION, COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Manufacturer Agreement - Identification ID",
};

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-2">
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}

export default function ManufacturerAgreementPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Manufacturer Agreement</h1>
      <p className="text-xs text-muted mb-10">Version {AGREEMENT_VERSION}</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>
          This Manufacturer Agreement (the &ldquo;Agreement&rdquo;) is a business-to-business agreement between{" "}
          <strong className="text-foreground">{COMPANY.legalName}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;), a{" "}
          {COMPANY.entityType} operating the Identification ID registry, and the company that registers as a
          manufacturer (&ldquo;Manufacturer&rdquo;, &ldquo;you&rdquo;). It applies together with our{" "}
          <a href="/terms" className="text-accent hover:underline">Terms of Service</a>; if they conflict, this
          Agreement controls for manufacturer accounts. You accept it by ticking the acceptance box before
          payment, and the person accepting confirms they are authorized to bind the Manufacturer.
        </p>

        <Section n={1} title="What we do, and what we do not do">
          <p>
            {COMPANY.legalName} operates a registry only. We provide product identifiers, QR codes, public
            product and manufacturer pages, and related registry infrastructure. We do not manufacture, sell,
            import, distribute, certify, test, endorse or warrant any product listed in the registry, and we are
            not a party to any sale between you and your customers.
          </p>
        </Section>

        <Section n={2} title="Your responsibility for content">
          <p>
            You are solely responsible for the accuracy, completeness, legality and regulatory compliance of all
            information, documents, images, manuals, certificates and claims you upload or publish (&ldquo;Your
            Content&rdquo;), including any labelling, safety, health or product-compliance requirements that apply
            in the countries where your products are sold. Product information is shown publicly as provided and
            maintained by you. Products in regulated categories may require additional verification before they
            are published.
          </p>
        </Section>

        <Section n={3} title="Rights to what you upload">
          <p>
            You confirm that you own, or have all licenses and permissions needed for, every trademark, logo,
            photo, manual, document and other material in Your Content, and that publishing it on Identification ID
            does not infringe anyone&apos;s rights. You grant us a worldwide, non-exclusive, royalty-free license to
            host, copy, display and distribute Your Content as needed to operate the registry, including through
            our public pages and API.
          </p>
        </Section>

        <Section n={4} title="Indemnification">
          <p>
            You will defend, indemnify and hold harmless {COMPANY.legalName} and its directors, officers, employees
            and agents from any claims, losses, damages, fines, costs and expenses (including reasonable legal
            fees) arising from your products, Your Content, your breach of this Agreement, or your violation of any
            law or third-party right.
          </p>
        </Section>

        <Section n={5} title="Services provided &ldquo;as is&rdquo;; limitation of liability">
          <p className="mb-2">
            The services are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any
            kind, express or implied, including merchantability, fitness for a particular purpose and
            non-infringement, to the maximum extent permitted by law.
          </p>
          <p>
            To the maximum extent permitted by law, we are not liable for any indirect, incidental, special,
            consequential or punitive damages, or for lost profits, revenue, data or goodwill. Our total liability
            arising out of or relating to this Agreement is limited to the fees you paid us in the 12 months before
            the event giving rise to the claim.
          </p>
        </Section>

        <Section n={6} title="Suspension and removal">
          <p>
            We may suspend, hide or remove any product page, document, image or manufacturer profile, or suspend
            your account, if we reasonably believe the content is false, misleading, infringing or unlawful, if we
            receive a credible report or legal request about it, or if you breach this Agreement. Where reasonable,
            we will tell you and give you a chance to correct it.
          </p>
        </Section>

        <Section n={7} title="Fees, billing and cancellation">
          <p>
            Fees for the Manufacturer Registry Membership and product plans are shown on our{" "}
            <a href="/pricing" className="text-accent hover:underline">Pricing</a> page. Billing, cancellation and
            refunds are governed by our{" "}
            <a href="/refund" className="text-accent hover:underline">Refund Policy</a>. If your membership
            lapses, your Manufacturer ID is kept and your profile is marked inactive until you renew.
          </p>
        </Section>

        <Section n={8} title="Changes to this Agreement">
          <p>
            We may update this Agreement. When we publish a new version, we will ask you to review and accept it,
            and payments may be paused until you do. The version you accepted, the time and the IP address are
            recorded.
          </p>
        </Section>

        <Section n={9} title="Governing law and language">
          <p>
            This Agreement is governed by the laws of the Province of British Columbia and the federal laws of
            Canada applicable therein, and the courts of British Columbia have exclusive jurisdiction. This
            Agreement is written in English; if it is shown in another language, the English version controls.
          </p>
        </Section>

        <Section n={10} title="Contact">
          <p>
            Questions about this Agreement:{" "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline">
              {COMPANY.supportEmail}
            </a>
            .
          </p>
        </Section>
      </div>
    </div>
  );
}
