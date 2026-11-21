import Link from "next/link";
import { COMPANY } from "@/lib/constants";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { PageHeader } from "@/components/marketing/PageHeader";

const FEATURES = [
  {
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
    title: "Pull your product catalog",
    desc: "List every product you've registered, filter by status, and read full details - specs, images, and multilingual descriptions.",
  },
  {
    icon: "M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z",
    title: "Look up any product",
    desc: "Check whether an Identification ID is registered and published, and see which manufacturer registered it.",
  },
  {
    icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z",
    title: "Read live stats",
    desc: "Get product counts and total public views for your company, so you can surface engagement metrics in your own tools.",
  },
  {
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
    title: "Simple, fast integration",
    desc: "Clean REST endpoints, JSON responses, and a single X-API-Key header. Generate and revoke keys anytime from your dashboard.",
  },
];

const ENDPOINTS = [
  { method: "GET", path: "/v1/products", desc: "List your products (filter by status)" },
  { method: "GET", path: "/v1/products/{id}", desc: "Full product detail + images + translations" },
  { method: "GET", path: "/v1/lookup/{id}", desc: "Look up any published product" },
  { method: "GET", path: "/v1/stats", desc: "Product & view counts" },
];

export default function ApiMarketingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Developers - API"
        title="Build on the Identification ID API."
        muted="One key, plain JSON."
        description={
          <>
            <p>
              Access your product registry programmatically. Sync catalogs, look up
              products, and pull live stats - straight into your storefront,
              marketplace, or internal tools.
            </p>
            <p className="mt-3 text-sm text-slate-500">
              Identification ID - a Digital Product Identity Platform with Public Registry, QR Passports and Developer API.
            </p>
          </>
        }
        actions={
          <>
            <ButtonLink href="/register" size="lg">
              Get API access <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/api/docs" variant="secondary" size="lg">
              Read the docs
            </ButtonLink>
            <ButtonLink
              href="https://api.identificationid.com/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="lg"
            >
              Interactive API
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3.5h6.5V10M12.5 3.5L4 12" />
              </svg>
              <span className="sr-only">(opens in a new tab)</span>
            </ButtonLink>
          </>
        }
      />

      {/* Code + endpoints */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">One header. That&apos;s it.</h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Authenticate every request with your API key. Keys are created and
              revoked from your dashboard under <span className="font-medium text-slate-900">API Access</span>.
            </p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="ml-2 text-[11px] font-mono text-slate-400">terminal</span>
              </div>
              <pre className="p-5 text-[13px] font-mono leading-relaxed text-slate-100 overflow-x-auto" data-no-i18n>
                <span className="text-slate-500"># List your products</span>
                {"\n"}curl https://api.identificationid.com/v1/products \{"\n"}
                {"  "}<span className="text-blue-300">-H &quot;X-API-Key: iid_live_…&quot;</span>
              </pre>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Endpoints</h2>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200 overflow-hidden">
              {ENDPOINTS.map((e) => (
                <div key={e.path} className="flex items-start gap-3 px-5 py-4">
                  <span className="mt-0.5 shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold font-mono text-slate-700 ring-1 ring-inset ring-slate-200">
                    {e.method}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-mono text-slate-900 truncate" data-no-i18n>{e.path}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/api/docs" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline underline-offset-4">
              View full API reference <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-16 sm:py-20 bg-surface border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">What you can do</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={f.icon} />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Included in plans */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Included in Best Value &amp; Enterprise</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                API access comes with the Best Value and Enterprise plans. Register
                your company, choose a plan, and generate your first key in seconds.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <ButtonLink href="/register">Get started</ButtonLink>
              <ButtonLink href="/pricing" variant="secondary">Compare plans</ButtonLink>
            </div>
          </div>
          <p className="mt-8 text-xs text-slate-500">
            API provided by {COMPANY.legalName} - {COMPANY.jurisdiction}
          </p>
        </div>
      </section>
    </>
  );
}
