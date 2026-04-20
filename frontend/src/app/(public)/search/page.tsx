"use client";

import { useEffect, useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const ID_PATTERN = /^IID-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

interface SearchResult {
  identification_id: string;
  name: string;
  category: string;
  brand: string | null;
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

  useEffect(() => {
    if (!initialQ) return;
    if (ID_PATTERN.test(initialQ)) {
      router.replace(`/p/${encodeURIComponent(initialQ.toUpperCase())}`);
      return;
    }
    doSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  async function doSearch(q: string) {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${API_BASE}/public/search?q=${encodeURIComponent(q)}&per_page=30`
      );
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

  const categoryLabel: Record<string, string> = {
    electronics: "Electronics",
    home_appliances: "Home Appliances",
    medical: "Medical",
    other: "Other",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8 max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name or ID…"
            className="flex-1 border border-border rounded-lg px-4 py-3 text-sm bg-background"
            autoFocus
          />
          <button
            type="submit"
            className="bg-accent text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover"
          >
            Search
          </button>
        </form>
        {/* Status line */}
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
            {results.map((r) => (
              <Link
                key={r.identification_id}
                href={`/p/${encodeURIComponent(r.identification_id)}`}
                className="border border-border rounded-xl p-5 hover:border-accent hover:shadow-sm transition-all bg-background group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold group-hover:text-accent transition-colors leading-snug">
                    {r.name}
                  </h3>
                  <span className="text-xs bg-surface border border-border text-muted px-2 py-0.5 rounded shrink-0">
                    {categoryLabel[r.category] ?? r.category}
                  </span>
                </div>
                {r.brand && (
                  <p className="text-xs text-muted mb-3">{r.brand}</p>
                )}
                <p className="text-xs font-mono text-muted">{r.identification_id}</p>
              </Link>
            ))}
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-xl font-semibold mb-2">No products found</h2>
            <p className="text-sm text-muted mb-6">
              Try a different name, or paste an Identification ID directly.
            </p>
            <Link href="/" className="text-sm text-accent hover:underline">
              ← Back to home
            </Link>
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔎</p>
            <h2 className="text-xl font-semibold mb-2">Search for a product</h2>
            <p className="text-sm text-muted">
              Type a product name above to get started.
            </p>
          </div>
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
