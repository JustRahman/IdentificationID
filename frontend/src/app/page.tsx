"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const ID_PATTERN = /^IID-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [earlyEmail, setEarlyEmail] = useState("");
  const [earlySubmitted, setEarlySubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleEarlyAccess(e: FormEvent) {
    e.preventDefault();
    const email = earlyEmail.trim();
    if (!email) return;
    setEarlySubmitted(true);
    router.push(`/register?email=${encodeURIComponent(email)}`);
  }

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
      {/* Navbar — sticky with scroll shadow */}
      <nav
        className={`sticky top-0 z-50 bg-background/80 backdrop-blur-md transition-all ${
          scrolled ? "border-b border-border shadow-sm" : "border-b border-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-bold">
              ID
            </span>
            <span>Identification ID</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm">
            <Link href="/search" className="text-muted hover:text-foreground transition-colors">
              Search
            </Link>
            <Link href="/pricing" className="text-muted hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/faq" className="text-muted hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="/login" className="text-muted hover:text-foreground transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors shadow-sm"
            >
              For Manufacturers
            </Link>
          </div>
          <Link
            href="/register"
            className="md:hidden bg-accent text-white px-3 py-1.5 rounded-lg text-xs font-medium"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero — gradient backdrop */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-blue-50 via-blue-50/30 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute top-40 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100 to-transparent rounded-full blur-3xl opacity-40" />
        </div>

        <div className="max-w-3xl mx-auto text-center pt-20 pb-10 px-6">
          <div className="inline-flex items-center gap-2 text-xs font-medium bg-white text-accent px-3.5 py-1.5 rounded-full mb-8 border border-blue-100 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Verified product information · Live
          </div>

          <h1 className="text-5xl sm:text-6xl font-semibold leading-[1.05] tracking-tight mb-6">
            Find any product.
            <br />
            <span className="bg-gradient-to-r from-accent to-indigo-600 bg-clip-text text-transparent">
              Know what you bought.
            </span>
          </h1>

          <p className="text-lg text-muted mb-10 leading-relaxed max-w-xl mx-auto">
            Search by product name or paste an Identification ID to instantly access
            manuals, specs, certificates, and verified manufacturer info.
          </p>

          {/* Search bar with integrated icon */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-indigo-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center bg-white rounded-2xl border border-border shadow-sm focus-within:border-accent focus-within:shadow-md transition-all">
                <svg
                  className="w-5 h-5 text-muted ml-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search 'Air Fryer' or paste IID-4F9A-2K7Q..."
                  className="flex-1 px-4 py-4 text-sm bg-transparent border-none focus:outline-none focus:ring-0"
                  style={{ boxShadow: "none" }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="m-1.5 bg-accent text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-accent-hover whitespace-nowrap transition-colors shadow-sm"
                >
                  Search →
                </button>
              </div>
            </div>

            <p className="text-xs text-muted mt-4">
              Try:{" "}
              <button
                type="button"
                onClick={() => setQuery("IID-4F9A-2K7Q")}
                className="font-mono text-foreground hover:text-accent underline-offset-4 hover:underline transition-colors"
              >
                IID-4F9A-2K7Q
              </button>
              {" · "}
              <button
                type="button"
                onClick={() => setQuery("Air Fryer")}
                className="hover:text-accent transition-colors"
              >
                Air Fryer
              </button>
              {" · "}
              <button
                type="button"
                onClick={() => setQuery("Drill")}
                className="hover:text-accent transition-colors"
              >
                Drill
              </button>
            </p>
          </form>
        </div>

        {/* Trust stats bar */}
        <div className="max-w-3xl mx-auto px-6 pb-4">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm">
            {[
              { n: "1,200+", label: "Verified products" },
              { n: "50+", label: "Trusted manufacturers" },
              { n: "30+", label: "Countries" },
              { n: "100%", label: "Free for consumers" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-semibold tracking-tight">{s.n}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-20">
          <p className="text-xs text-muted text-center mb-4 uppercase tracking-wider font-semibold">
            Or browse by category
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              {
                label: "Kitchen", q: "kitchen_appliances",
                path: "M8 2v4M12 2v4M16 2v4M4 10h16M5 6h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1z",
              },
              {
                label: "Power Tools", q: "power_tools",
                path: "M14.7 6.3a1 1 0 010 1.4l-1 1 2.6 2.6-4.3 4.3-2.6-2.6-5 5a2 2 0 11-2.8-2.8l5-5-2.6-2.6 4.3-4.3 2.6 2.6 1-1a1 1 0 011.4 0l1.4 1.4z",
              },
              {
                label: "Electronics", q: "electronics",
                path: "M7 4a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H7zM11 18h2",
              },
              {
                label: "Furniture", q: "furniture",
                path: "M4 18v2M20 18v2M3 10h18v6H3zM5 10V7a2 2 0 012-2h10a2 2 0 012 2v3",
              },
              {
                label: "Clothing", q: "clothing",
                path: "M8 3l-5 4 2 3 3-2v13h8V8l3 2 2-3-5-4-1 2a3 3 0 01-6 0l-1-2z",
              },
              {
                label: "Toys", q: "toys",
                path: "M12 2a5 5 0 00-5 5v3a5 5 0 0010 0V7a5 5 0 00-5-5zM4 17a4 4 0 014-4h8a4 4 0 014 4v4H4v-4z",
              },
              {
                label: "Sports", q: "sports",
                path: "M12 2a10 10 0 100 20 10 10 0 000-20zM12 2l2 5h5l-4 3.5 1.5 5.5L12 13l-4.5 3L9 10.5 5 7h5l2-5z",
              },
              {
                label: "Automotive", q: "automotive",
                path: "M5 11l2-5h10l2 5M3 16h18v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3zM7 16v2M17 16v2",
              },
            ].map(({ label, q, path }) => (
              <Link
                key={q}
                href={`/search?q=${q}`}
                className="group text-sm bg-white border border-border rounded-full pl-3 pr-4 py-1.5 hover:border-accent hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d={path} />
                </svg>
                <span className="group-hover:text-accent transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Product showcase preview — real-ish mockup */}
      <section className="bg-gradient-to-b from-surface to-background py-20 px-6 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">What you'll see</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">Every product, fully documented</h2>
            <p className="text-muted max-w-xl mx-auto">
              No more lost manuals or missing warranty cards. Every registered product comes with complete, verified information.
            </p>
          </div>

          {/* Mock product card */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl blur-2xl opacity-50" />
            <div className="relative bg-white border border-border rounded-2xl shadow-lg overflow-hidden">
              {/* Fake browser bar */}
              <div className="border-b border-border px-4 py-2.5 flex items-center gap-2 bg-surface">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-background border border-border rounded-md px-3 py-1 text-xs text-muted font-mono ml-3 truncate">
                  identificationid.com/p/IID-4F9A-2K7Q
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">ProChef Air Fryer 5.5L</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-surface text-muted px-2 py-1 rounded border border-border">
                        Kitchen Appliances
                      </span>
                      <span className="text-xs font-mono text-muted">IID-4F9A-2K7Q</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 flex items-center gap-1.5 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Verified
                  </span>
                </div>

                <p className="text-sm text-muted mb-6 leading-relaxed">
                  Large 5.5L digital air fryer with 8 cooking presets. Cook with up to 80% less fat than traditional frying.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Brand", value: "ACME" },
                    { label: "Model", value: "AF-550" },
                    { label: "Made in", value: "United States" },
                    { label: "Manufacturer", value: "ACME Corp" },
                  ].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs text-muted mb-0.5">{f.label}</p>
                      <p className="text-sm font-medium">{f.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: "User Manual (PDF)",
                      path: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M8 13h8M8 17h8M8 9h2",
                    },
                    {
                      label: "Warranty",
                      path: "M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4zM9 12l2 2 4-4",
                    },
                    {
                      label: "Safety Certificate",
                      path: "M12 15a3 3 0 100-6 3 3 0 000 6zM12 15v5M9 20h6M4 4h16v10H4z",
                    },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="flex items-center gap-2 text-xs border border-border rounded-lg px-3 py-2 bg-surface"
                    >
                      <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                        <path d={d.path} />
                      </svg>
                      <span className="font-medium">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — timeline layout */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">Simple flow</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
              Three steps, zero friction
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              No app to install, no account needed. Just find your product and get what you need.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

            {[
              {
                step: "1",
                iconPath: "M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z",
                title: "Search or scan",
                desc: "Type a product name, or enter the Identification ID printed on the packaging.",
              },
              {
                step: "2",
                iconPath: "M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z",
                title: "Find your product",
                desc: "Browse verified results — only registered manufacturers can publish here.",
              },
              {
                step: "3",
                iconPath: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM14 2v6h6M8 13h8M8 17h8",
                title: "Access everything",
                desc: "Manuals, warranties, safety certificates, and manufacturer contacts — in seconds.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="relative inline-flex items-center justify-center mb-5">
                  <div className="w-12 h-12 bg-white border-2 border-accent text-accent rounded-full flex items-center justify-center text-sm font-bold relative z-10">
                    {item.step}
                  </div>
                </div>
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.iconPath} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience split — cleaner cards */}
      <section className="py-20 px-6 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">Built for everyone</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
              One platform. Two sides. Zero headaches.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consumers */}
            <div className="relative bg-background border border-border rounded-2xl p-8 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2l-2 5v13a2 2 0 002 2h12a2 2 0 002-2V7l-2-5H6zM4 7h16M9 11a3 3 0 006 0" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">For consumers</h3>
              <p className="text-sm text-muted mb-6">
                Find manuals, verify authenticity, and get support — without registering.
              </p>
              <ul className="space-y-3 text-sm mb-6">
                {[
                  "Find manuals without registering",
                  "Verify authenticity before you buy",
                  "Download warranties and certificates",
                  "Works for any registered product",
                  "No app required — just the website",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 text-sm text-accent font-medium hover:gap-2.5 transition-all"
              >
                Start searching <span>→</span>
              </Link>
            </div>

            {/* Manufacturers */}
            <div className="relative bg-background border border-border rounded-2xl p-8 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="absolute top-4 right-4 text-[10px] font-semibold bg-accent text-white px-2 py-0.5 rounded">
                POPULAR
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21V9l6 4V9l6 4V5l6 4v12H3zM7 17h2M13 17h2M17 17h1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">For manufacturers</h3>
              <p className="text-sm text-muted mb-6">
                Register once, connect every customer who buys your product.
              </p>
              <ul className="space-y-3 text-sm mb-6">
                {[
                  "Register products with unique IDs",
                  "Upload manuals, specs, certificates",
                  "Update info anytime — no reprinting",
                  "Auto-translate descriptions globally",
                  "Track product lookups and analytics",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Register as Manufacturer <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">Use cases</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
              Real problems, solved in seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                iconPath: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12l8.73-5.04M12 22V12",
                title: "Lost the manual?",
                desc: "Just paste the ID from the packaging. The original manual is one click away — no digging through drawers.",
              },
              {
                iconPath: "M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4zM9 12l2 2 4-4",
                title: "Check warranty?",
                desc: "See the warranty terms, expiration, and claim instructions directly from the manufacturer.",
              },
              {
                iconPath: "M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0zM9 10h4M11 8v4",
                title: "Verify before buying?",
                desc: "Scan the ID in the store to confirm it's a genuine, registered product from a verified manufacturer.",
              },
            ].map((u) => (
              <div
                key={u.title}
                className="group bg-white border border-border rounded-2xl p-6 hover:border-accent hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d={u.iconPath} />
                  </svg>
                </div>
                <h3 className="text-base font-semibold mb-2">{u.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Access — richer CTA */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-blue-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px, 80px 80px",
        }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium bg-white/10 text-white px-3 py-1.5 rounded-full mb-6 border border-white/20 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Limited early access · Free forever tier
          </div>
          <h2 className="text-4xl font-semibold text-white mb-4 tracking-tight">
            Ready to register your products?
          </h2>
          <p className="text-blue-100 text-base mb-8 leading-relaxed">
            Join the manufacturers already building with Identification ID.
            Your first 10 products are on us — no credit card required.
          </p>
          {earlySubmitted ? (
            <p className="text-white font-medium">Redirecting you to registration...</p>
          ) : (
            <form onSubmit={handleEarlyAccess} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={earlyEmail}
                onChange={(e) => setEarlyEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 border border-white/30 rounded-xl px-4 py-3.5 text-sm bg-white/95 text-foreground placeholder:text-muted focus:bg-white"
              />
              <button
                type="submit"
                className="bg-white text-accent px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-50 whitespace-nowrap shadow-lg transition-colors"
              >
                Get Started →
              </button>
            </form>
          )}
          <div className="flex items-center justify-center gap-4 mt-6 text-blue-100 text-xs">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Free up to 10 products
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Cancel anytime
            </span>
          </div>
        </div>
      </section>

      {/* Footer — multi-column */}
      <footer className="border-t border-border py-12 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-3">
                <span className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center text-xs font-bold">
                  ID
                </span>
                <span>Identification ID</span>
              </Link>
              <p className="text-sm text-muted max-w-xs leading-relaxed">
                The verified digital passport for every product. Search, scan, and know exactly what you bought.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/search" className="text-foreground hover:text-accent transition-colors">Search products</Link></li>
                <li><Link href="/pricing" className="text-foreground hover:text-accent transition-colors">Pricing</Link></li>
                <li><Link href="/register" className="text-foreground hover:text-accent transition-colors">For manufacturers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="text-foreground hover:text-accent transition-colors">FAQ</Link></li>
                <li><Link href="/login" className="text-foreground hover:text-accent transition-colors">Log in</Link></li>
                <li>
                  <a href="mailto:support@identificationid.com" className="text-foreground hover:text-accent transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2 pt-6 border-t border-border text-xs text-muted">
            <p>© {new Date().getFullYear()} Identification ID. All rights reserved.</p>
            <p>Designed and built in Vancouver, Canada.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
