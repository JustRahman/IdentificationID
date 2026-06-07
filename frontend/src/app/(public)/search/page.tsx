"use client";

import { useEffect, useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CATEGORIES as ALL_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const ID_PATTERN = /^IID-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

interface SearchResult {
  identification_id: string;
  name: string;
  category: string;
  brand: string | null;
  manufacturer: string | null;
  cover_image: string | null;
}

interface CompanyResult {
  display_name: string;
  country_code: string;
  website: string | null;
  product_count: number;
}

// Browse chips — derived from the shared category list.
const CATEGORIES = ALL_CATEGORIES.map((c) => ({ label: c.label, q: c.value }));

function ProductCard({ r }: { r: SearchResult }) {
  return (
    <Link
      href={`/p/${encodeURIComponent(r.identification_id)}`}
      className="border border-border rounded-xl overflow-hidden hover:border-accent hover:shadow-md transition-all bg-background group block"
    >
      {/* Cover image */}
      <div className="aspect-[4/3] bg-surface overflow-hidden">
        {r.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.cover_image}
            alt={r.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 12V6.75A2.25 2.25 0 0018.75 4.5H5.25A2.25 2.25 0 003 6.75V15" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-semibold group-hover:text-accent transition-colors leading-snug line-clamp-2">
            {r.name}
          </h3>
          <span className="text-xs bg-surface border border-border text-muted px-2 py-0.5 rounded shrink-0">
            {CATEGORY_LABELS[r.category] ?? r.category}
          </span>
        </div>
        <p className="text-xs text-muted mb-2">
          {[r.brand, r.manufacturer].filter(Boolean).join(" · ")}
        </p>
        <p className="text-xs font-mono text-muted/70">{r.identification_id}</p>
      </div>
    </Link>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Recommendations (shown when empty)
  const [featured, setFeatured] = useState<SearchResult[]>([]);
  const [companies, setCompanies] = useState<CompanyResult[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    setQuery(initialQ);
    if (!initialQ) {
      loadRecommendations();
      return;
    }
    if (ID_PATTERN.test(initialQ)) {
      router.replace(`/p/${encodeURIComponent(initialQ.toUpperCase())}`);
      return;
    }
    doSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  async function loadRecommendations() {
    setLoadingRecs(true);
    try {
      const [featRes, compRes] = await Promise.all([
        fetch(`${API_BASE}/public/featured?limit=8`),
        fetch(`${API_BASE}/public/companies`),
      ]);
      const featJson = await featRes.json();
      const compJson = await compRes.json();
      setFeatured(featJson.data ?? []);
      setCompanies(compJson.data ?? []);
    } catch {
      // silently fail
    } finally {
      setLoadingRecs(false);
    }
  }

  async function doSearch(q: string) {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`${API_BASE}/public/search?q=${encodeURIComponent(q)}&per_page=30`);
      const json = await res.json();
      setResults(json.data ?? []);
      setTotal(json.meta?.total ?? 0);
    } catch {
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (ID_PATTERN.test(q)) {
      router.push(`/p/${encodeURIComponent(q.toUpperCase())}`);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
    doSearch(q);
  }

  const showRecommendations = !initialQ;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header (only on the browse / empty view) */}
        {showRecommendations && (
          <div className="text-center max-w-2xl mx-auto mb-8 pt-4">
            <h1 className="text-3xl font-semibold tracking-tight mb-3">Search the Product Registry</h1>
            <p className="text-muted text-sm">
              Find any product by name, brand, or manufacturer — or paste an
              Identification ID like <span className="font-mono text-foreground">IID-4F9A-2K7Q</span> to
              open its page directly.
            </p>
          </div>
        )}

        {/* Search bar */}
        <form
          onSubmit={handleSubmit}
          className={`flex gap-2 mb-10 ${showRecommendations ? "max-w-2xl mx-auto" : "max-w-xl"}`}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name, brand, or manufacturer..."
            className="flex-1 border border-border rounded-xl px-4 py-3.5 text-sm bg-background shadow-sm focus:border-accent focus:shadow-md transition-all"
            autoFocus
          />
          <button
            type="submit"
            className="bg-accent text-white px-6 py-3.5 rounded-xl text-sm font-medium hover:bg-accent-hover shadow-sm"
          >
            Search
          </button>
        </form>

        {/* ── SEARCH RESULTS ── */}
        {!showRecommendations && (
          <>
            {searched && !loading && (
              <p className="text-sm text-muted mb-6">
                {total === 0
                  ? `No results for "${initialQ}"`
                  : `${total} result${total === 1 ? "" : "s"} for "${initialQ}"`}
              </p>
            )}

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-border rounded-xl p-5 animate-pulse bg-surface h-28" />
                ))}
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((r) => <ProductCard key={r.identification_id} r={r} />)}
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🔍</p>
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-sm text-muted mb-6">
                  Try a different name, or paste an Identification ID directly.
                </p>
                <button
                  onClick={() => router.push("/search")}
                  className="text-sm text-accent hover:underline"
                >
                  ← Browse all products
                </button>
              </div>
            )}
          </>
        )}

        {/* ── RECOMMENDATIONS (empty state) ── */}
        {showRecommendations && (
          <>
            {/* Categories */}
            <div className="mb-10">
              <h2 className="text-base font-semibold mb-4">Browse by category</h2>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ label, q }) => (
                  <Link
                    key={q}
                    href={`/search?q=${q}`}
                    className="text-sm border border-border rounded-full px-4 py-1.5 hover:bg-surface hover:border-accent hover:text-accent transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Recently added */}
            <div className="mb-10">
              <h2 className="text-base font-semibold mb-4">Recently added</h2>
              {loadingRecs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-xl p-5 animate-pulse bg-surface h-28" />
                  ))}
                </div>
              ) : featured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featured.map((r) => <ProductCard key={r.identification_id} r={r} />)}
                </div>
              ) : (
                <p className="text-sm text-muted border border-dashed border-border rounded-xl p-6 text-center">
                  No products published yet — be the first.{" "}
                  <Link href="/register" className="text-accent hover:underline">Register a product</Link>
                </p>
              )}
            </div>

            {/* Manufacturers */}
            <div>
              <h2 className="text-base font-semibold mb-4">Browse by manufacturer</h2>
              {loadingRecs ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-border rounded-xl p-4 animate-pulse bg-surface h-16" />
                  ))}
                </div>
              ) : companies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {companies.map((c) => (
                    <Link
                      key={c.display_name}
                      href={`/search?q=${encodeURIComponent(c.display_name)}`}
                      className="border border-border rounded-xl p-4 hover:border-accent hover:shadow-sm transition-all bg-background group"
                    >
                      <p className="text-sm font-semibold group-hover:text-accent transition-colors">
                        {c.display_name}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {c.country_code} · {c.product_count} product{c.product_count === 1 ? "" : "s"}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted border border-dashed border-border rounded-xl p-6 text-center">
                  No verified manufacturers yet.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}
