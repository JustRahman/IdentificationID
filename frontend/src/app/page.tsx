"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PLANS } from "@/lib/constants";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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

      {/* ── Navbar ── */}
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
            <Link href="/search" className="text-muted hover:text-foreground transition-colors">Search</Link>
            <Link href="/pricing" className="text-muted hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/faq" className="text-muted hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/login" className="text-muted hover:text-foreground transition-colors">Log in</Link>
            <LanguageSwitcher />
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

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-blue-50 via-blue-50/30 to-transparent rounded-full blur-3xl opacity-70" />
          <div className="absolute top-40 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100 to-transparent rounded-full blur-3xl opacity-40" />
        </div>

        <div className="max-w-3xl mx-auto text-center pt-20 pb-10 px-6">
          <div className="inline-flex items-center gap-2 text-xs font-medium bg-white text-accent px-3.5 py-1.5 rounded-full mb-8 border border-blue-100 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Global Product Registry · Live
          </div>

          <h1 className="text-5xl sm:text-6xl font-semibold leading-[1.05] tracking-tight mb-6">
            Identification ID
          </h1>

          <p className="text-2xl sm:text-3xl text-foreground mb-3 leading-snug max-w-2xl mx-auto font-semibold tracking-tight">
            Every product. One digital passport.
          </p>
          <p className="text-base text-muted mb-4 leading-relaxed max-w-xl mx-auto">
            The digital identity platform for physical products — every item gets a unique, verifiable ID.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4", label: "Product Registry" },
              { icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z", label: "QR Passport" },
              { icon: "M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z", label: "Verified Manufacturer Data" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-sm bg-white border border-border rounded-full px-4 py-2 shadow-sm"
              >
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon} />
                </svg>
                {label}
              </span>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-indigo-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center bg-white rounded-2xl border border-border shadow-sm focus-within:border-accent focus-within:shadow-md transition-all">
                <svg className="w-5 h-5 text-muted ml-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter a product name or ID..."
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
              <button type="button" onClick={() => setQuery("IID-4F9A-2K7Q")} className="font-mono text-foreground hover:text-accent underline-offset-4 hover:underline transition-colors">
                IID-4F9A-2K7Q
              </button>
              {" · "}
              <button type="button" onClick={() => setQuery("Air Fryer")} className="hover:text-accent transition-colors">Air Fryer</button>
              {" · "}
              <button type="button" onClick={() => setQuery("Drill")} className="hover:text-accent transition-colors">Drill</button>
            </p>
          </form>
        </div>

        {/* Goals (clearly framed as targets, not live numbers) */}
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-accent mb-4">
            Beta · Our 2026 goals
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm">
            {[
              { n: "1,200+", label: "Products — target" },
              { n: "50+", label: "Manufacturers — target" },
              { n: "30+", label: "Countries — target" },
              { n: "100%", label: "Free for consumers" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-semibold tracking-tight">{s.n}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What is Identification ID ── */}
      <section className="bg-gradient-to-b from-surface to-background py-20 px-6 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">What it is</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              A single digital passport for every product
            </h2>
            <p className="text-muted max-w-2xl mx-auto leading-relaxed">
              Identification ID is an independent, unified digital product passport and an
              international product catalog — one standard for describing a product and one passport for each item.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "M7 20l4-16m2 16l4-16M6 9h14M4 15h14",
                title: "A unique ID for every product",
                desc: "Each product gets a unique identifier that stays with it forever — from manufacturing to the consumer.",
              },
              {
                icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
                title: "All information in one place",
                desc: "Documents, manuals, certificates, and photos — all stored in one system and always available by ID.",
              },
              {
                icon: "M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z",
                title: "Consumer verification",
                desc: "Any consumer can retrieve and verify a product's full information by its ID — fast and free.",
              },
              {
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                title: "Digital product passport",
                desc: "Manufacturers get a living digital passport — update information without reprinting manuals and save on paper documentation.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For Consumers & Manufacturers split ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">For everyone</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">
              One platform — for consumers and manufacturers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consumers */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">For consumers</h3>
              <p className="text-sm text-muted mb-6">Identification ID lets consumers:</p>
              <ul className="space-y-3 text-sm mb-6">
                {[
                  "Get instant access to product data by ID",
                  "Read descriptions and usage instructions in multiple languages",
                  "Verify a product's authenticity",
                  "Use it free — no sign-up, no apps",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-accent font-medium hover:gap-2.5 transition-all">
                Find a product <span>→</span>
              </Link>
            </div>

            {/* Manufacturers */}
            <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-md hover:-translate-y-1 transition-all relative">
              <div className="absolute top-4 right-4 text-[10px] font-semibold bg-accent text-white px-2 py-0.5 rounded">
                FOR BUSINESS
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21V9l6 4V9l6 4V5l6 4v12H3zM7 17h2M13 17h2M17 17h1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">For manufacturers</h3>
              <p className="text-sm text-muted mb-6">After registering on the platform, manufacturers get:</p>
              <ul className="space-y-3 text-sm mb-6">
                {[
                  "Product registration and a unique ID for it",
                  "Manufacturer verification",
                  "A product page builder",
                  "Document and photo uploads",
                  "Automatic Identification ID generation",
                  "QR code generation",
                  "Edit information anytime",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-green-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
                Register a product <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Anti-Counterfeit ── */}
      <section className="py-20 px-6 bg-surface border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-3">Anti-Counterfeit</p>
              <h2 className="text-3xl font-semibold tracking-tight mb-4">
                Anti&#8209;Counterfeit platform
              </h2>
              <p className="text-muted mb-8 leading-relaxed">
                Identification ID is a reliable anti-counterfeit system. A unique code for every
                individual item lets anyone confirm authenticity in an instant.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: "M9 12l2 2 4-4M12 2a10 10 0 100 20 10 10 0 000-20z", text: "Confirm authenticity by the ID number on the product" },
                  { icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z", text: "A unique code for every individual item" },
                  { icon: "M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0zM9 10h4M11 8v4", text: "Instant check before buying — right in the store" },
                  { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Protect your brand's reputation from counterfeits" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-border flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                        <path d={icon} />
                      </svg>
                    </div>
                    <span className="text-sm leading-relaxed pt-1">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Fake badge mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl blur-2xl opacity-50" />
              <div className="relative bg-white border border-border rounded-2xl p-8 text-center shadow-lg">
                <div className="w-20 h-20 rounded-full bg-green-50 border-4 border-green-200 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-muted font-mono mb-1">IID-4F9A-2K7Q</p>
                <p className="text-lg font-semibold text-green-700 mb-1">Authentic product</p>
                <p className="text-sm text-muted mb-4">Verified by Identification ID</p>
                <div className="text-left space-y-2 text-sm border-t border-border pt-4">
                  {[
                    ["Manufacturer", "ACME Corp"],
                    ["Country", "United States"],
                    ["Registered", "2024-01-15"],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-muted">{label}</span>
                      <span className="font-medium">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PIM System ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">For manufacturers</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">
              A PIM system for product management
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Identification ID is a full PIM (Product Information Management) system for
              manufacturers. Everything in one place, always up to date.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[
              {
                icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4",
                title: "Stores all product data",
                desc: "A centralized repository for specifications, documents, photos, and media files.",
              },
              {
                icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z",
                title: "Generates QR / ID",
                desc: "Automatically generates a unique Identification ID and QR code for every product.",
              },
              {
                icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                title: "Updates instructions",
                desc: "Change documents and manuals without reprinting. Consumers always see the latest version.",
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "No paper documentation",
                desc: "Just print the Identification ID on the product or packaging — no more printed manuals.",
              },
              {
                icon: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
                title: "Integrates with marketplaces",
                desc: "Direct integration with major marketplaces to keep product data in sync.",
              },
              {
                icon: "M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129",
                title: "Multilingual descriptions",
                desc: "Automatic translation of descriptions and instructions — your product is clear to consumers worldwide.",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2 text-sm">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-6 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-2">Pricing</p>
            <h2 className="text-3xl font-semibold tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-muted max-w-xl mx-auto">
              Start free, then choose an annual plan as you grow.
              Consumers always use the platform for free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PLANS.map((p) => ({
              name: p.en.name,
              price: `$${p.priceCents / 100}`,
              period: p.en.period,
              desc: p.en.desc,
              features: p.en.features,
              accent: p.popular,
              premium: p.premium,
            })).map((plan) => {
              const filled = plan.accent || plan.premium;
              return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-md ${
                  plan.premium
                    ? "bg-slate-900 border-slate-900 text-white shadow-xl md:scale-[1.03]"
                    : plan.accent
                    ? "bg-accent border-accent text-white shadow-lg"
                    : "bg-white border-border"
                }`}
              >
                {plan.accent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-white text-accent px-3 py-1 rounded-full shadow border border-blue-100">
                    POPULAR
                  </div>
                )}
                {plan.premium && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-amber-400 text-slate-900 px-3 py-1 rounded-full shadow">
                    BEST VALUE
                  </div>
                )}
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${filled ? "text-white/70" : "text-muted"}`}>
                  {plan.name}
                </p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                </div>
                <p className={`text-xs mb-1 ${filled ? "text-white/70" : "text-muted"}`}>{plan.period}</p>
                <p className={`text-sm mb-5 font-medium ${filled ? "text-white/80" : "text-muted"}`}>{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg className={`w-3.5 h-3.5 shrink-0 ${filled ? "text-green-300" : "text-green-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center text-sm font-medium py-2.5 rounded-xl transition-colors ${
                    plan.premium
                      ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                      : plan.accent
                      ? "bg-white text-accent hover:bg-blue-50"
                      : "bg-accent text-white hover:bg-accent-hover"
                  }`}
                >
                  Choose plan
                </Link>
              </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-muted mt-8">
            Need a custom plan?{" "}
            <a href="mailto:support@identificationid.com" className="text-accent hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent via-blue-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 70%, white 1px, transparent 1px)",
          backgroundSize: "60px 60px, 80px 80px",
        }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-medium bg-white/10 text-white px-3 py-1.5 rounded-full mb-6 border border-white/20 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Early access · Free tier forever
          </div>
          <h2 className="text-4xl font-semibold text-white mb-4 tracking-tight">
            Ready to register your products?
          </h2>
          <p className="text-blue-100 text-base mb-8 leading-relaxed">
            Join the manufacturers already using Identification ID.
            Your first 10 products are free, no card required.
          </p>
          {earlySubmitted ? (
            <p className="text-white font-medium">Redirecting to registration...</p>
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
          <div className="flex items-center justify-center gap-4 mt-6 text-blue-100 text-xs flex-wrap">
            {["10 products free", "No credit card", "Cancel anytime"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
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
                A global online product registry. Digital product passport, anti-counterfeit protection, and an international catalog.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/search" className="text-foreground hover:text-accent transition-colors">Search products</Link></li>
                <li><Link href="/pricing" className="text-foreground hover:text-accent transition-colors">Pricing</Link></li>
                <li><Link href="/register" className="text-foreground hover:text-accent transition-colors">For manufacturers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Company</h4>
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
            <p>Product Registry · QR Passport · Verified Manufacturer Data</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
