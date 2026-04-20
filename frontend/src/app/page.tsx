"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const ID_PATTERN = /^IID-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (ID_PATTERN.test(q)) {
      router.push(`/p/${encodeURIComponent(q.toUpperCase())}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <Link href="/" className="text-lg font-semibold">
            Identification ID
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/pricing" className="text-muted hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="text-muted hover:text-foreground">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover"
            >
              For Manufacturers
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-2xl mx-auto text-center pt-20 pb-16 px-6">
        <div className="inline-block text-xs font-medium bg-blue-50 text-accent px-3 py-1 rounded-full mb-6 border border-blue-100">
          Verified product information
        </div>
        <h1 className="text-4xl font-semibold leading-tight mb-4">
          Find any product.
          <br />
          Know what you bought.
        </h1>
        <p className="text-lg text-muted mb-10 leading-relaxed">
          Search by product name or scan an Identification ID to instantly access
          manuals, specs, certificates, and manufacturer info.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto">
          <div className="flex gap-2 shadow-sm">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, e.g. Air Fryer, or paste an ID..."
              className="flex-1 border border-border rounded-xl px-4 py-3.5 text-sm bg-background"
              autoFocus
            />
            <button
              type="submit"
              className="bg-accent text-white px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-accent-hover whitespace-nowrap"
            >
              Search
            </button>
          </div>
          <p className="text-xs text-muted mt-3">
            Tip: paste an ID like{" "}
            <span
              className="font-mono text-foreground cursor-pointer hover:text-accent"
              onClick={() => setQuery("IID-4F9A-2K7Q")}
            >
              IID-4F9A-2K7Q
            </span>{" "}
            to go directly to a product
          </p>
        </form>
      </section>

      {/* Categories shortcut */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <p className="text-xs text-muted text-center mb-4 uppercase tracking-wide font-medium">
          Browse popular categories
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: "Kitchen Appliances", q: "kitchen_appliances" },
            { label: "Power Tools",        q: "power_tools" },
            { label: "Electronics",        q: "electronics" },
            { label: "Furniture",          q: "furniture" },
            { label: "Clothing",           q: "clothing" },
            { label: "Toys",               q: "toys" },
            { label: "Sports",             q: "sports" },
            { label: "Automotive",         q: "automotive" },
          ].map(({ label, q }) => (
            <Link
              key={q}
              href={`/search?q=${q}`}
              className="text-sm border border-border rounded-full px-4 py-1.5 hover:bg-surface hover:border-accent hover:text-accent transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface border-y border-border py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center mb-12">
            How it works for consumers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Search or scan",
                desc: "Type a product name in the search bar, or enter the Identification ID printed on your product's packaging.",
              },
              {
                step: "2",
                title: "Find your product",
                desc: "Browse verified results. Every product listed here comes from a registered, authenticated manufacturer.",
              },
              {
                step: "3",
                title: "Access everything",
                desc: "View manuals, warranty info, safety certificates, specs, and manufacturer contact details — in seconds.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-semibold">
                  {item.step}
                </div>
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For consumers / manufacturers split */}
      <section className="max-w-4xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface border border-border rounded-xl p-8">
            <div className="text-2xl mb-4">🛍️</div>
            <h3 className="text-lg font-semibold mb-4">For consumers</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li>✓ Find manuals without registering</li>
              <li>✓ Verify authenticity before you buy</li>
              <li>✓ Download PDFs — warranty, manual, certificates</li>
              <li>✓ Works for any registered product worldwide</li>
              <li>✓ No app required — just the website</li>
            </ul>
          </div>
          <div className="bg-surface border border-border rounded-xl p-8">
            <div className="text-2xl mb-4">🏭</div>
            <h3 className="text-lg font-semibold mb-4">For manufacturers</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li>✓ Register products and get a unique ID</li>
              <li>✓ Upload manuals, specs, and certificates</li>
              <li>✓ Update info anytime — no reprinting needed</li>
              <li>✓ Multi-language descriptions auto-translated</li>
              <li>✓ Track how often customers look up your products</li>
            </ul>
            <Link
              href="/register"
              className="inline-block mt-6 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover"
            >
              Register as Manufacturer →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted">
          <span className="font-semibold text-foreground">Identification ID</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/search" className="hover:text-foreground">Search Products</Link>
            <Link href="/login" className="hover:text-foreground">Manufacturer Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
