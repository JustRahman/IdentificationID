import Link from "next/link";
import { COMPANY } from "@/lib/constants";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SideNav } from "@/components/marketing/SideNav";

const BASE = "https://api.identificationid.com/v1";

function Code({ children, title }: { children: string; title?: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-800 my-4" data-no-i18n>
      {title && (
        <div className="bg-slate-800/80 border-b border-white/10 text-slate-400 text-[11px] font-mono px-4 py-2">{title}</div>
      )}
      <pre className="bg-slate-900 text-slate-100 text-[13px] font-mono p-4 overflow-x-auto leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

function Get({ path }: { path: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold font-mono text-slate-700 ring-1 ring-inset ring-slate-200">GET</span>
      <span className="text-sm font-mono text-slate-900 break-all" data-no-i18n>{path}</span>
    </div>
  );
}

const NAV = [
  { href: "#getting-started", label: "Getting started" },
  { href: "#base-url", label: "Base URL" },
  { href: "#authentication", label: "Authentication" },
  { href: "#api-key-security", label: "API key security" },
  { href: "#rate-limits", label: "Rate limits" },
  { href: "#list-products", label: "List products" },
  { href: "#get-product", label: "Get a product" },
  { href: "#lookup", label: "Lookup" },
  { href: "#stats", label: "Stats" },
  { href: "#webhooks", label: "Webhooks" },
  { href: "#errors", label: "Errors" },
];

export default function ApiDocsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "API", href: "/api" }, { label: "Reference" }]}
        eyebrow="Developers - API Reference"
        title="Identification ID API"
        description={
          <p>
            A simple REST API to read your product registry, look up products, and
            pull live stats. JSON responses, one <code className="text-[0.9em] font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">X-API-Key</code> header.
          </p>
        }
        actions={
          <>
            <ButtonLink href="/register">Get API access <ArrowRight /></ButtonLink>
            <ButtonLink href="https://api.identificationid.com/v1/docs" target="_blank" rel="noopener noreferrer" variant="secondary">
              Interactive API (Swagger)
              <span className="sr-only">(opens in a new tab)</span>
            </ButtonLink>
            <ButtonLink href="/pricing" variant="ghost">View plans</ButtonLink>
          </>
        }
      />
    <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 sm:py-16">
      <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
        {/* Sidebar nav */}
        <SideNav title="On this page" className="hidden lg:block" items={NAV} />

        {/* Content */}
        <div className="min-w-0 max-w-3xl space-y-16">
          {/* Getting started */}
          <section id="getting-started" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-4">Getting started</h2>
            <ol className="space-y-3 text-sm">
              {[
                ["Register & choose a plan", "Create a manufacturer account and pick a plan that includes API access (Best Value or Enterprise)."],
                ["Create an API key", "In your dashboard, open API Access and generate a key. It's shown once - store it securely."],
                ["Call the API", "Send your key in the X-API-Key header on every request. That's it."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-accent text-xs font-semibold flex items-center justify-center shrink-0 tabular-nums">{i + 1}</span>
                  <span><span className="font-medium text-slate-900">{t}.</span> <span className="text-slate-600">{d}</span></span>
                </li>
              ))}
            </ol>
          </section>

          {/* Base URL */}
          <section id="base-url" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">Base URL</h2>
            <p className="text-sm text-slate-600 mb-2">All endpoints are relative to:</p>
            <Code>{BASE}</Code>
            <p className="text-sm text-slate-600">All responses are JSON with the shape <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{`{ "success": true, "data": … }`}</code>.</p>
          </section>

          {/* Authentication */}
          <section id="authentication" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">Authentication</h2>
            <p className="text-sm text-slate-600 mb-2">
              Pass your API key in the <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">X-API-Key</code> header on every request.
              Keys look like <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">iid_live_…</code> and can be revoked anytime from your dashboard.
            </p>
            <Code title="Example request">{`curl ${BASE}/stats \\
  -H "X-API-Key: iid_live_your_key_here"`}</Code>
            <p className="text-sm text-slate-600">A missing or invalid key returns <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">403</code> (see Errors).</p>
          </section>

          {/* API key security */}
          <section id="api-key-security" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">API key security</h2>
            <p className="text-sm text-slate-600 mb-3">Treat your API key like a password. A few rules:</p>
            <ul className="space-y-2 text-sm text-slate-600">
              {[
                ["Shown once", "The full key is displayed only when you create it. Copy and store it immediately - we keep only a hashed prefix and can't show it again."],
                ["Keep it server-side", "Never embed a key in frontend/browser code, mobile apps, or public repositories. Call the API from your backend only."],
                ["Store as a secret", "Keep keys in environment variables or a secrets manager, not in source control."],
                ["Revoke anytime", "If a key is exposed, revoke it in your dashboard under API Access and issue a new one - revoked keys stop working immediately."],
                ["One key per integration", "Use separate keys per app or environment so you can rotate or revoke them independently."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-2.5">
                  <span className="text-accent mt-0.5">•</span>
                  <span><span className="font-medium text-slate-900">{t}.</span> {d}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Rate limits */}
          <section id="rate-limits" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">Rate limits</h2>
            <p className="text-sm text-slate-600 mb-3">
              Requests are rate-limited per API key. If you exceed your limit you&apos;ll receive a{" "}
              <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">429</code> response - back off and retry.
            </p>
            <div className="border border-slate-200 rounded-xl bg-white text-sm overflow-hidden">
              {[
                ["Best Value", "60 requests / minute"],
                ["Enterprise", "600 requests / minute"],
              ].map(([plan, limit]) => (
                <div key={plan} className="flex gap-4 px-4 py-2.5 border-b border-slate-200 last:border-0">
                  <span className="font-medium w-28 shrink-0">{plan}</span>
                  <span className="text-slate-600">{limit}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-2">Need higher limits? <Link href="/pricing" className="text-accent hover:underline">Talk to us about Enterprise</Link>.</p>
          </section>

          {/* List products */}
          <section id="list-products" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">List products</h2>
            <Get path="/products" />
            <p className="text-sm text-slate-600 my-3">Returns every product registered by your company, newest first.</p>
            <p className="text-sm font-medium mb-1">Query parameters</p>
            <div className="border border-slate-200 rounded-xl bg-white text-sm mb-2">
              <div className="flex gap-4 px-4 py-2.5 border-b border-slate-200">
                <span className="font-mono text-xs w-20 shrink-0">status</span>
                <span className="text-slate-600">Optional. Filter by <code className="text-xs">published</code>, <code className="text-xs">draft</code>, or <code className="text-xs">hidden</code>.</span>
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
          <section id="get-product" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">Get a product</h2>
            <Get path="/products/{identification_id}" />
            <p className="text-sm text-slate-600 my-3">Full detail for one of your products, including images and every language translation.</p>
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
          <section id="lookup" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">Lookup</h2>
            <Get path="/lookup/{identification_id}" />
            <p className="text-sm text-slate-600 my-3">Check whether <em>any</em> Identification ID is registered and published, and see which manufacturer registered it.</p>
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
          <section id="stats" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">Stats</h2>
            <Get path="/stats" />
            <p className="text-sm text-slate-600 my-3">Aggregate counts for your company.</p>
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

          {/* Webhooks */}
          <section id="webhooks" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">Webhooks</h2>
            <p className="text-sm text-slate-600 mb-3">
              Register a URL in your dashboard (<span className="font-medium text-slate-900">API Access → Webhooks</span>)
              and we&apos;ll send a signed <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">POST</code> when
              a subscribed event happens.
            </p>
            <p className="text-sm font-medium mb-1">Events</p>
            <div className="border border-slate-200 rounded-xl bg-white text-sm overflow-hidden mb-3">
              {[
                ["product.published", "A product was published"],
                ["product.updated", "A product's details changed"],
                ["document.uploaded", "A document was uploaded to a product"],
              ].map(([ev, desc]) => (
                <div key={ev} className="flex gap-4 px-4 py-2.5 border-b border-slate-200 last:border-0">
                  <span className="font-mono text-xs w-44 shrink-0">{ev}</span>
                  <span className="text-slate-600">{desc}</span>
                </div>
              ))}
            </div>
            <Code title="Payload (POST body)">{`{
  "event": "product.published",
  "created_at": "2026-07-05T18:00:00+00:00",
  "data": {
    "identification_id": "IID-4F9A-2K7Q",
    "name": "ProChef Air Fryer 5.5L",
    "status": "published"
  }
}`}</Code>
            <p className="text-sm text-slate-600 mt-3 mb-1">
              Verify each delivery with the <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">X-IID-Signature</code> header
              - an HMAC-SHA256 of the raw body using your webhook signing secret:
            </p>
            <Code title="Verify (Node.js)">{`const crypto = require("crypto");
const expected = "sha256=" + crypto
  .createHmac("sha256", WEBHOOK_SECRET)
  .update(rawBody)
  .digest("hex");
// compare with req.headers["x-iid-signature"]`}</Code>
          </section>

          {/* Errors */}
          <section id="errors" className="scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 mb-3">Errors</h2>
            <p className="text-sm text-slate-600 mb-3">Errors return the matching HTTP status and a JSON body:</p>
            <Code title="Error body">{`{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Invalid API key",
    "details": {}
  }
}`}</Code>
            <div className="border border-slate-200 rounded-xl bg-white text-sm overflow-hidden mt-3">
              {[
                ["403", "FORBIDDEN", "Missing or invalid X-API-Key"],
                ["404", "NOT_FOUND", "No product with that Identification ID"],
                ["429", "RATE_LIMITED", "Too many requests - slow down"],
              ].map(([code, name, desc]) => (
                <div key={code} className="flex gap-4 px-4 py-2.5 border-b border-slate-200 last:border-0">
                  <span className="font-mono text-xs w-10 shrink-0">{code}</span>
                  <span className="font-mono text-xs text-slate-600 w-32 shrink-0">{name}</span>
                  <span className="text-slate-600">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-2xl border border-slate-200 bg-surface p-7 sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">Ready to build?</h2>
            <p className="text-sm text-slate-600 max-w-lg mb-6">
              API access is included with the Best Value and Enterprise plans.
              Register, choose a plan, and generate your first key in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <ButtonLink href="/register">Get started</ButtonLink>
              <ButtonLink href="/pricing" variant="secondary">Compare plans</ButtonLink>
            </div>
          </section>

          <p className="text-xs text-slate-500 pt-6 border-t border-slate-200">
            API provided by {COMPANY.legalName} - {COMPANY.jurisdiction}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
