import Link from "next/link";
import { COMPANY } from "@/lib/constants";

const FEATURES = [
  {
    icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
    title: "Pull your product catalog",
    desc: "List every product you've registered, filter by status, and read full details — specs, images, and multilingual descriptions.",
  },
  {
    icon: "M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z",
    title: "Verify any product",
    desc: "Check whether any Identification ID is real and published, and see which verified manufacturer owns it — perfect for anti-counterfeit checks.",
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
  { method: "GET", path: "/v1/lookup/{id}", desc: "Verify any published product" },
  { method: "GET", path: "/v1/stats", desc: "Product & view counts" },
];

export default function ApiMarketingPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">Developers · API</p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-5">
          Build on the Identification ID API
        </h1>
        <p className="text-lg text-muted leading-relaxed mb-5">
          Access your product registry programmatically. Sync catalogs, verify
          products, and pull live stats — straight into your storefront,
          marketplace, or internal tools.
        </p>
        <p className="text-sm font-medium text-foreground bg-surface border border-border rounded-xl px-4 py-3 mb-8 max-w-xl mx-auto">
          Identification ID — a Digital Product Identity Platform with Public Registry, QR Passports and Developer API.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/register"
            className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-accent-hover shadow-sm"
          >
            Get API access →
          </Link>
          <Link
            href="/api/docs"
            className="border border-border px-6 py-3 rounded-xl text-sm font-medium hover:bg-surface"
          >
            Read the docs
          </Link>
          <a
            href="https://api.identificationid.com/v1/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border px-6 py-3 rounded-xl text-sm font-medium hover:bg-surface"
          >
            Interactive API ↗
          </a>
        </div>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-background border border-border rounded-2xl p-6">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                <path d={f.icon} />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Code + endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 items-start">
        <div>
          <h2 className="text-xl font-semibold mb-3">One header. That&apos;s it.</h2>
          <p className="text-sm text-muted mb-4 leading-relaxed">
            Authenticate every request with your API key. Keys are created and
            revoked from your dashboard under <span className="font-medium text-foreground">API Access</span>.
          </p>
          <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono overflow-x-auto">
            <div className="text-slate-400"># List your products</div>
            <div>curl https://api.identificationid.com/v1/products \</div>
            <div className="pl-4 text-emerald-300">-H &quot;X-API-Key: iid_live_…&quot;</div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">Endpoints</h2>
          <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
            {ENDPOINTS.map((e) => (
              <div key={e.path} className="flex items-start gap-3 px-4 py-3">
                <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                  {e.method}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-mono truncate">{e.path}</p>
                  <p className="text-xs text-muted">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/api/docs" className="inline-flex items-center gap-1.5 text-sm text-accent font-medium mt-4 hover:gap-2.5 transition-all">
            View full API reference <span>→</span>
          </Link>
        </div>
      </div>

      {/* Included in plans */}
      <div className="bg-surface border border-border rounded-2xl p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Included in Best Value &amp; Enterprise</h2>
        <p className="text-sm text-muted max-w-xl mx-auto mb-6">
          API access comes with the Best Value and Enterprise plans. Register
          your company, choose a plan, and generate your first key in seconds.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/register"
            className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-accent-hover"
          >
            Get started
          </Link>
          <Link
            href="/pricing"
            className="border border-border px-6 py-3 rounded-xl text-sm font-medium hover:bg-background"
          >
            Compare plans
          </Link>
        </div>
      </div>

      <p className="text-center text-xs text-muted mt-10">
        API provided by {COMPANY.legalName} · {COMPANY.jurisdiction} 🇨🇦
      </p>
    </div>
  );
}
