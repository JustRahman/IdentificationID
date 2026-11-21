import Link from "next/link";
import { COMPANY } from "@/lib/constants";
import { LegalShell } from "@/components/marketing/LegalShell";

export const metadata = {
  title: "Cookie Policy - Identification ID",
};

export default function CookiesPage() {
  return (
    <LegalShell active="/cookies">
      <article className="max-w-prose">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
          <Link href="/legal" className="hover:text-slate-900 hover:underline underline-offset-4">Legal &amp; Trust Center</Link>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-balance">Cookie Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: {new Date().getFullYear()}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-7 text-slate-700">
          <p>
            This Cookie Policy explains how <strong className="font-semibold text-slate-900">{COMPANY.legalName}</strong>, operator of
            the Identification ID platform, uses cookies and similar local storage.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">What we use</h2>
            <ul className="list-disc pl-5 space-y-2 marker:text-slate-400">
              <li><strong className="font-semibold text-slate-900">Essential</strong> - sign-in sessions and security. The platform cannot work without these.</li>
              <li><strong className="font-semibold text-slate-900">Preferences</strong> - remembering your chosen interface language and cached translations (stored locally in your browser).</li>
              <li><strong className="font-semibold text-slate-900">Analytics</strong> - aggregate, non-identifying usage such as product-page view counts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">What we don&apos;t do</h2>
            <p>
              We do not use advertising cookies, third-party ad networks, or cross-site tracking. Consumers can look up
              products without signing in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Managing cookies</h2>
            <p>
              You can clear or block cookies and local storage in your browser settings. Disabling essential cookies will
              prevent you from signing in.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Contact</h2>
            <p>
              Questions:{" "}
              <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline underline-offset-4">{COMPANY.supportEmail}</a>.
            </p>
          </section>
        </div>
      </article>
    </LegalShell>
  );
}
