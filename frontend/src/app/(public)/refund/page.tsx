import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Refund Policy - Identification ID",
};

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Refund Policy</h1>
      <p className="text-xs text-muted mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>
          This Refund Policy explains how billing, cancellation and refunds work for paid services on the
          Identification ID platform, operated by{" "}
          <strong className="text-foreground">{COMPANY.legalName}</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;). It
          forms part of our <a href="/terms" className="text-accent hover:underline">Terms of Service</a>.
          Looking up and verifying products is always free for consumers.
        </p>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">1. Manufacturer Registry Membership</h2>
          <p className="mb-2">
            Every manufacturer needs an active Manufacturer Registry Membership. It is billed in advance on one of
            two schedules:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Monthly - $5 per month.</strong> Renews automatically each month
              until cancelled.
            </li>
            <li>
              <strong className="text-foreground">Yearly - $49 per year.</strong> Renews automatically each year until
              cancelled.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">2. Yearly product plans</h2>
          <p>
            Product plans (Standard, Popular, Best Value and Enterprise) are annual subscriptions billed in advance
            and renew automatically each year until cancelled. Popular, Best Value and Enterprise include the
            Registry Membership; Standard is billed in addition to it.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">3. How to cancel</h2>
          <p>
            You can cancel at any time by emailing{" "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline">{COMPANY.supportEmail}</a>{" "}
            from your account email address, including your company name and Manufacturer ID. Cancellation stops
            future renewals and takes effect at the end of the period you have already paid for; you keep full
            access until then.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">4. After cancellation</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your Manufacturer ID stays yours permanently. It is never deleted or reissued to anyone else.</li>
            <li>
              Your public manufacturer profile is marked <strong className="text-foreground">Inactive</strong> and shows
              &ldquo;Registry status: Inactive&rdquo; and the month you were last active.
            </li>
            <li>Existing product pages, links and QR codes keep working.</li>
            <li>You can&apos;t add or edit products until you renew. You can renew at any time to reactivate.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">5. Refunds</h2>
          <p>
            Refund requests are reviewed case by case and must be made within 14 days of the first charge for the
            membership or plan concerned. To request one, email{" "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline">{COMPANY.supportEmail}</a>{" "}
            with your Manufacturer ID and the reason for the request. Approved refunds are returned to the original
            payment method. Outside that window, and for renewals, payments are generally non-refundable. Nothing in
            this policy limits any rights you have under applicable consumer protection law.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">6. Contact</h2>
          <p>
            Questions about billing or refunds:{" "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline">{COMPANY.supportEmail}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
