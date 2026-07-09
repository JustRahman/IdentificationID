import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "Cookie Policy — Identification ID",
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold tracking-tight mb-2">Cookie Policy</h1>
      <p className="text-xs text-muted mb-10">Last updated: {new Date().getFullYear()}</p>

      <div className="space-y-6 text-sm leading-relaxed text-muted">
        <p>
          This Cookie Policy explains how <strong className="text-foreground">{COMPANY.legalName}</strong>, operator of
          the Identification ID platform, uses cookies and similar local storage.
        </p>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">What we use</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><strong className="text-foreground">Essential</strong> — sign-in sessions and security. The platform cannot work without these.</li>
            <li><strong className="text-foreground">Preferences</strong> — remembering your chosen interface language and cached translations (stored locally in your browser).</li>
            <li><strong className="text-foreground">Analytics</strong> — aggregate, non-identifying usage such as product-page view counts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">What we don&apos;t do</h2>
          <p>
            We do not use advertising cookies, third-party ad networks, or cross-site tracking. Consumers can look up
            products without signing in.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Managing cookies</h2>
          <p>
            You can clear or block cookies and local storage in your browser settings. Disabling essential cookies will
            prevent you from signing in.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-foreground mb-2">Contact</h2>
          <p>
            Questions:{" "}
            <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline">{COMPANY.supportEmail}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
