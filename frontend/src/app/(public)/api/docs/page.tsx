import Link from "next/link";

const BASE = "https://api.identificationid.com/api/v1/partner/v1";

function Code({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 my-3">
      {title && (
        <div className="bg-slate-800 text-slate-300 text-[11px] font-mono px-4 py-1.5">{title}</div>
      )}
      <pre className="bg-slate-900 text-slate-100 text-xs font-mono p-4 overflow-x-auto leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

function Get({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">GET</span>
      <span className="text-sm font-mono break-all">{path}</span>
    </div>
  );
}

const NAV = [
  { href: "#getting-started", label: "Getting started" },
  { href: "#base-url", label: "Base URL" },
  { href: "#authentication", label: "Authentication" },
  { href: "#list-products", label: "List products" },
  { href: "#get-product", label: "Get a product" },
  { href: "#lookup", label: "Verify / lookup" },
  { href: "#stats", label: "Stats" },
  { href: "#errors", label: "Errors" },
];

export default function ApiDocsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <div className="max-w-2xl mb-12">
        <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">Developers · API Reference</p>
        <h1 className="text-4xl font-semibold tracking-tight mb-4">Identification ID API</h1>
        <p className="text-lg text-muted leading-relaxed mb-6">
          A simple REST API to read your product registry, verify products, and
          pull live stats. JSON responses, one <code className="text-sm bg-surface px-1.5 py-0.5 rounded border border-border">X-API-Key</code> header.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/register" className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent-hover">Get API access →</Link>
          <Link href="/pricing" className="border border-border px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-surface">View plans</Link>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[190px_1fr] lg:gap-12">
        {/* Sidebar nav */}
        <nav className="hidden lg:block sticky top-6 self-start text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">On this page</p>
          <ul className="space-y-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="text-muted hover:text-accent transition-colors">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main className="min-w-0 space-y-14">
          {/* Getting started */}
          <section id="getting-started" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-4">Getting started</h2>
            <ol className="space-y-3 text-sm">
              {[
                ["Register & choose a plan", "Create a manufacturer account and pick a plan that includes API access (Best Value or Enterprise)."],
                ["Create an API key", "In your dashboard, open API Access and generate a key. It's shown once — store it securely."],
                ["Call the API", "Send your key in the X-API-Key header on every request. That's it."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span><span className="font-medium text-foreground">{t}.</span> <span className="text-muted">{d}</span></span>
                </li>
              ))}
            </ol>
          </section>

          {/* Base URL */}
          <section id="base-url" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-3">Base URL</h2>
            <p className="text-sm text-muted mb-2">All endpoints are relative to:</p>
            <Code>{BASE}</Code>
            <p className="text-sm text-muted">All responses are JSON with the shape <code className="text-xs bg-surface px-1.5 py-0.5 rounded border border-border">{`{ "success": true, "data": … }`}</code>.</p>
          </section>

          {/* Authentication */}
          <section id="authentication" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-3">Authentication</h2>
            <p className="text-sm text-muted mb-2">
              Pass your API key in the <code className="text-xs bg-surface px-1.5 py-0.5 rounded border border-border">X-API-Key</code> header on every request.
              Keys look like <code className="text-xs bg-surface px-1.5 py-0.5 rounded border border-border">iid_live_…</code> and can be revoked anytime from your dashboard.
            </p>
            <Code title="Example request">{`curl ${BASE}/stats \\
  -H "X-API-Key: iid_live_your_key_here"`}</Code>
            <p className="text-sm text-muted">A missing or invalid key returns <code className="text-xs bg-surface px-1.5 py-0.5 rounded border border-border">403</code> (see Errors).</p>
          </section>

          {/* List products */}
          <section id="list-products" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-3">List products</h2>
            <Get path="/products" />
            <p className="text-sm text-muted my-3">Returns every product registered by your company, newest first.</p>
            <p className="text-sm font-medium mb-1">Query parameters</p>
            <div className="border border-border rounded-lg text-sm mb-2">
              <div className="flex gap-4 px-3 py-2 border-b border-border">
                <span className="font-mono text-xs w-20 shrink-0">status</span>
                <span className="text-muted">Optional. Filter by <code className="text-xs">published</code>, <code className="text-xs">draft</code>, or <code className="text-xs">hidden</code>.</span>
              </div>
            </div>
            <Code title="Request">{`curl "${BASE}/products?status=published" \\
  -H "X-API-Key: iid_live_…"`}</Code>
            <Code title="Response 200">{`{
  "success": true,
  "data": [
    {
      "identification_id": "IID-4F9A-2K7Q",
      "name": "ProChef Air Fryer 5.5L",
      "category": "kitchen_appliances",
      "brand": "ACME",
      "model": "AF-550",
      "status": "published",
      "view_count": 128,
      "published_at": "2026-04-19T10:00:00+00:00",
      "created_at": "2026-04-01T09:00:00+00:00"
    }
  ]
}`}</Code>
          </section>

          {/* Get product */}
          <section id="get-product" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-3">Get a product</h2>
            <Get path="/products/{identification_id}" />
            <p className="text-sm text-muted my-3">Full detail for one of your products, including images and every language translation.</p>
            <Code title="Request">{`curl ${BASE}/products/IID-4F9A-2K7Q \\
  -H "X-API-Key: iid_live_…"`}</Code>
            <Code title="Response 200">{`{
  "success": true,
  "data": {
    "identification_id": "IID-4F9A-2K7Q",
    "name": "ProChef Air Fryer 5.5L",
    "category": "kitchen_appliances",
    "brand": "ACME",
    "model": "AF-550",
    "country_of_origin": "US",
    "status": "published",
    "view_count": 128,
    "published_at": "2026-04-19T10:00:00+00:00",
    "created_at": "2026-04-01T09:00:00+00:00",
    "images": [
      { "url": "https://…/photo.jpg", "alt_text": "Main view", "display_order": 0 }
    ],
    "translations": [
      {
        "lang": "en",
        "short_description": "Large 5.5L digital air fryer.",
        "full_description": "…",
        "usage_instructions": "…"
      }
    ]
  }
}`}</Code>
          </section>

          {/* Lookup */}
          <section id="lookup" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-3">Verify / lookup</h2>
            <Get path="/lookup/{identification_id}" />
            <p className="text-sm text-muted my-3">Verify that <em>any</em> published product is authentic and see which manufacturer owns it. Great for anti-counterfeit checks.</p>
            <Code title="Request">{`curl ${BASE}/lookup/IID-4F9A-2K7Q \\
  -H "X-API-Key: iid_live_…"`}</Code>
            <Code title="Response 200">{`{
  "success": true,
  "data": {
    "identification_id": "IID-4F9A-2K7Q",
    "name": "ProChef Air Fryer 5.5L",
    "category": "kitchen_appliances",
    "brand": "ACME",
    "model": "AF-550",
    "country_of_origin": "US",
    "published_at": "2026-04-19T10:00:00+00:00",
    "manufacturer": "ACME Corp",
    "verified": true
  }
}`}</Code>
          </section>

          {/* Stats */}
          <section id="stats" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-3">Stats</h2>
            <Get path="/stats" />
            <p className="text-sm text-muted my-3">Aggregate counts for your company.</p>
            <Code title="Request">{`curl ${BASE}/stats \\
  -H "X-API-Key: iid_live_…"`}</Code>
            <Code title="Response 200">{`{
  "success": true,
  "data": {
    "total_products": 12,
    "published": 9,
    "total_views": 384
  }
}`}</Code>
          </section>

          {/* Errors */}
          <section id="errors" className="scroll-mt-6">
            <h2 className="text-2xl font-semibold mb-3">Errors</h2>
            <p className="text-sm text-muted mb-3">Errors return the matching HTTP status and a JSON body:</p>
            <Code title="Error body">{`{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Invalid API key",
    "details": {}
  }
}`}</Code>
            <div className="border border-border rounded-lg text-sm overflow-hidden mt-3">
              {[
                ["403", "FORBIDDEN", "Missing or invalid X-API-Key"],
                ["404", "NOT_FOUND", "No product with that Identification ID"],
                ["429", "RATE_LIMITED", "Too many requests — slow down"],
              ].map(([code, name, desc]) => (
                <div key={code} className="flex gap-4 px-3 py-2 border-b border-border last:border-0">
                  <span className="font-mono text-xs w-10 shrink-0">{code}</span>
                  <span className="font-mono text-xs text-muted w-32 shrink-0">{name}</span>
                  <span className="text-muted">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-surface border border-border rounded-2xl p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Ready to build?</h2>
            <p className="text-sm text-muted max-w-lg mx-auto mb-6">
              API access is included with the Best Value and Enterprise plans.
              Register, choose a plan, and generate your first key in seconds.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/register" className="bg-accent text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-accent-hover">Get started</Link>
              <Link href="/pricing" className="border border-border px-6 py-3 rounded-xl text-sm font-medium hover:bg-background">Compare plans</Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
