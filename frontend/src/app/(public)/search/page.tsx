"use client";

import { useEffect, useState, type FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CATEGORIES as ALL_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IID_PATTERN, MID_PATTERN } from "@/components/ui/SearchBar";
import { CompanyCard, ProductCard, type CompanyCardData, type ProductCardData } from "@/components/registry/RegistryCards";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type SearchResult = ProductCardData;
type CompanyResult = CompanyCardData;

// Browse chips - derived from the shared category list.
const CATEGORIES = ALL_CATEGORIES.map((c) => ({ label: c.label, q: c.value }));

function CardSkeletons({ n, h = "h-72" }: { n: number; h?: string }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`rounded-2xl border border-slate-200 bg-slate-50 animate-pulse ${h}`} />
      ))}
    </>
  );
}

function SectionTitle({ children, count }: { children: string; count?: number }) {
  return (
    <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-4">
      {children}
      {typeof count === "number" && <span className="ml-1.5 text-slate-400 font-normal tabular-nums">({count})</span>}
    </h2>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [matchedCompanies, setMatchedCompanies] = useState<CompanyResult[]>([]);
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
    if (IID_PATTERN.test(initialQ)) {
      router.replace(`/p/${encodeURIComponent(initialQ.toUpperCase())}`);
      return;
    }
    if (MID_PATTERN.test(initialQ)) {
      router.replace(`/manufacturer/${encodeURIComponent(initialQ.toUpperCase())}`);
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
      const [res, compRes] = await Promise.all([
        fetch(`${API_BASE}/public/search?q=${encodeURIComponent(q)}&per_page=30`),
        // Manufacturer matches come from the public company list (same API the browse view uses).
        fetch(`${API_BASE}/public/companies`).catch(() => null),
      ]);
      const json = await res.json();
      setResults(json.data ?? []);
      setTotal(json.meta?.total ?? 0);
      const compJson = compRes && compRes.ok ? await compRes.json() : { data: [] };
      const needle = q.trim().toLowerCase();
      setMatchedCompanies(
        ((compJson.data ?? []) as CompanyResult[]).filter((c) => c.display_name.toLowerCase().includes(needle)),
      );
    } catch {
      setResults([]);
      setTotal(0);
      setMatchedCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (IID_PATTERN.test(q)) {
      router.push(`/p/${encodeURIComponent(q.toUpperCase())}`);
      return;
    }
    if (MID_PATTERN.test(q)) {
      router.push(`/manufacturer/${encodeURIComponent(q.toUpperCase())}`);
      return;
    }
    router.push(`/search?q=${encodeURIComponent(q)}`);
    doSearch(q);
  }

  const showRecommendations = !initialQ;
  const queryLabel = CATEGORY_LABELS[initialQ] ?? initialQ;
  const exampleIds = featured.slice(0, 2).map((f) => f.identification_id);
  const nothingFound = !loading && searched && results.length === 0 && matchedCompanies.length === 0;

  return (
    <div className="bg-white">
      {/* ── Search header ── */}
      <div className="border-b border-slate-200 bg-surface">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12 sm:py-16">
          <div className={showRecommendations ? "max-w-3xl mx-auto text-center" : "max-w-3xl"}>
            {showRecommendations ? (
              <>
                <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 text-balance">
                  Search the registry. <span className="text-slate-400">Products, manufacturers and IDs.</span>
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
                  Find any product by name, brand or manufacturer, or paste an Identification ID or Manufacturer ID to open its page directly.
                </p>
              </>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                Search results <span className="text-slate-400">for &ldquo;{queryLabel}&rdquo;</span>
              </h1>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            role="search"
            aria-label="Search the registry"
            className={`mt-8 ${showRecommendations ? "max-w-3xl mx-auto" : "max-w-3xl"}`}
          >
            <div className="flex items-center bg-white border border-slate-300 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]">
              <svg className="w-5 h-5 ml-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <label htmlFor="search-page-input" className="sr-only">Search by product name, brand, manufacturer or ID</label>
              <input
                id="search-page-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Product, brand, manufacturer or ID"
                autoComplete="off"
                spellCheck={false}
                className="flex-1 min-w-0 bg-transparent border-none focus:outline-none px-3 py-4 text-base text-slate-900 placeholder:text-slate-400"
                style={{ boxShadow: "none" }}
                autoFocus
              />
              <button type="submit" className="shrink-0 m-1.5 h-11 px-5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
                Search
              </button>
            </div>
            <p className={`mt-3 text-sm text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1.5 ${showRecommendations ? "justify-center" : ""}`}>
              {exampleIds.length > 0 ? (
                <>
                  <span>Try</span>
                  {exampleIds.map((ex) => (
                    <Link
                      key={ex}
                      href={`/p/${ex}`}
                      data-no-i18n
                      className="font-mono tabular-nums text-[13px] text-slate-700 bg-white border border-slate-200 hover:border-blue-200 hover:text-accent rounded-md px-2 py-0.5 transition-colors"
                    >
                      {ex}
                    </Link>
                  ))}
                </>
              ) : (
                <span>
                  IDs look like <span className="font-mono tabular-nums text-slate-700" data-no-i18n>IID-XXXX-XXXX</span> (product) or{" "}
                  <span className="font-mono tabular-nums text-slate-700" data-no-i18n>MID-XXXX-XXXX</span> (manufacturer).
                </span>
              )}
            </p>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12 sm:py-16">
        {/* ── SEARCH RESULTS ── */}
        {!showRecommendations && (
          <>
            {searched && !loading && !nothingFound && (
              <p className="text-sm text-slate-500 mb-8" aria-live="polite">
                {total} product{total === 1 ? "" : "s"}
                {matchedCompanies.length > 0 &&
                  ` and ${matchedCompanies.length} manufacturer${matchedCompanies.length === 1 ? "" : "s"}`}{" "}
                for &ldquo;{queryLabel}&rdquo;
              </p>
            )}

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardSkeletons n={8} />
              </div>
            )}

            {!loading && matchedCompanies.length > 0 && (
              <section className="mb-12">
                <SectionTitle count={matchedCompanies.length}>Manufacturers</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchedCompanies.map((c) => (
                    <CompanyCard key={c.manufacturer_id || c.display_name} c={c} />
                  ))}
                </div>
              </section>
            )}

            {!loading && results.length > 0 && (
              <section>
                <SectionTitle count={total}>Products</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.map((r) => (
                    <ProductCard key={r.identification_id} p={r} />
                  ))}
                </div>
              </section>
            )}

            {nothingFound && (
              <EmptyState
                icon="search"
                title={`No results for "${queryLabel}"`}
                description="Try a different name or brand, or paste an Identification ID (IID-XXXX-XXXX) or Manufacturer ID (MID-XXXX-XXXX) directly."
                action={<ButtonLink href="/search" variant="secondary">Browse the registry</ButtonLink>}
              />
            )}
          </>
        )}

        {/* ── RECOMMENDATIONS (empty state) ── */}
        {showRecommendations && (
          <>
            {/* Categories */}
            <section className="mb-14">
              <SectionTitle>Browse by category</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ label, q }) => (
                  <Link
                    key={q}
                    href={`/search?q=${q}`}
                    className="text-sm text-slate-700 bg-white border border-slate-200 rounded-full px-4 py-1.5 hover:border-slate-300 hover:text-slate-900 transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </section>

            {/* Recently added */}
            <section className="mb-14">
              <SectionTitle>Recently added</SectionTitle>
              {loadingRecs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <CardSkeletons n={4} />
                </div>
              ) : featured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featured.map((r) => (
                    <ProductCard key={r.identification_id} p={r} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="box"
                  compact
                  title="No products published yet"
                  description="Be the first manufacturer in the registry."
                  action={<ButtonLink href="/register" variant="secondary" size="sm">Register a product</ButtonLink>}
                />
              )}
            </section>

            {/* Manufacturers */}
            <section>
              <SectionTitle>Manufacturers</SectionTitle>
              {loadingRecs ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <CardSkeletons n={3} h="h-24" />
                </div>
              ) : companies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map((c) => (
                    <CompanyCard key={c.manufacturer_id || c.display_name} c={c} />
                  ))}
                </div>
              ) : (
                <EmptyState icon="building" compact title="No manufacturers listed yet" />
              )}
            </section>
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
