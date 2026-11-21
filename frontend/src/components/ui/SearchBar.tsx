"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tabs } from "./Tabs";

export const IID_PATTERN = /^IID-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
export const MID_PATTERN = /^MID-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

export type SearchMode = "product" | "company" | "id";

const MODES: { id: SearchMode; label: string; placeholder: string }[] = [
  { id: "product", label: "Product", placeholder: "Product name, brand or model" },
  { id: "company", label: "Company", placeholder: "Manufacturer name" },
  { id: "id", label: "ID", placeholder: "IID-XXXX-XXXX or MID-XXXX-XXXX" },
];

/** Where a query goes. IDs open their page directly; text goes to /search?q=. */
export function searchHref(raw: string): string | null {
  const q = raw.trim();
  if (!q) return null;
  if (IID_PATTERN.test(q)) return `/p/${encodeURIComponent(q.toUpperCase())}`;
  if (MID_PATTERN.test(q)) return `/manufacturer/${encodeURIComponent(q.toUpperCase())}`;
  return `/search?q=${encodeURIComponent(q)}`;
}

/**
 * Registry search with Product / Company / ID modes and clickable example IDs.
 *   <SearchBar size="lg" examples={["IID-GGX3-794V"]} />
 *   <SearchBar size="md" showModes={false} />
 * Routing (unchanged from the old homepage): IID-... -> /p/<id>, MID-... -> /manufacturer/<id>,
 * anything else -> /search?q=<text>.
 */
export function SearchBar({
  size = "lg",
  showModes = true,
  defaultMode = "product",
  examples = [],
  exampleHint,
  autoFocus = false,
  className,
}: {
  size?: "md" | "lg";
  showModes?: boolean;
  defaultMode?: SearchMode;
  /** Real IDs from the registry. Clicking one opens it. */
  examples?: string[];
  /** Shown when there are no real examples, e.g. "IDs look like IID-XXXX-XXXX". */
  exampleHint?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<SearchMode>(defaultMode);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const current = MODES.find((m) => m.id === mode) ?? MODES[0];

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (mode === "id" && !IID_PATTERN.test(q) && !MID_PATTERN.test(q)) {
      setError("IDs look like IID-XXXX-XXXX (product) or MID-XXXX-XXXX (manufacturer). Searching the registry instead.");
    }
    const href = searchHref(q);
    if (href) router.push(href);
  }

  return (
    <div className={cn("w-full", className)}>
      {showModes && (
        <Tabs
          variant="segmented"
          ariaLabel="Search by"
          idPrefix="search-mode"
          items={MODES.map((m) => ({ id: m.id, label: m.label }))}
          value={mode}
          onChange={(id) => {
            setMode(id as SearchMode);
            setError("");
          }}
          className="mb-3"
        />
      )}
      <form onSubmit={onSubmit} role="search" aria-label="Search the registry">
        <div
          className={cn(
            "flex items-center bg-white border border-slate-300 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow]",
            "focus-within:border-accent focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.12)]",
          )}
        >
          <svg className={cn("text-slate-400 shrink-0", size === "lg" ? "w-5 h-5 ml-4" : "w-4 h-4 ml-3.5")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <path d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <label htmlFor="registry-search" className="sr-only">
            {current.placeholder}
          </label>
          <input
            id="registry-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            placeholder={current.placeholder}
            autoFocus={autoFocus}
            autoComplete="off"
            spellCheck={false}
            className={cn(
              "flex-1 min-w-0 bg-transparent border-none focus:outline-none text-slate-900 placeholder:text-slate-400",
              size === "lg" ? "px-3 py-4 text-base" : "px-3 py-2.5 text-sm",
              mode === "id" && "font-mono",
            )}
            style={{ boxShadow: "none" }}
          />
          <button
            type="submit"
            className={cn(
              "shrink-0 bg-accent text-white font-medium rounded-lg hover:bg-accent-hover transition-colors",
              size === "lg" ? "m-1.5 h-11 px-5 text-sm" : "m-1 h-8 px-3.5 text-sm",
            )}
          >
            Search
          </button>
        </div>
      </form>
      {error && <p className="mt-2 text-xs text-slate-500">{error}</p>}
      {(examples.length > 0 || exampleHint) && (
        <p className="mt-3 text-sm text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {examples.length > 0 ? (
            <>
              <span>Try</span>
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    const href = searchHref(ex);
                    if (href) router.push(href);
                  }}
                  data-no-i18n
                  className="font-mono tabular-nums text-[13px] text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-accent rounded-md px-2 py-0.5 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </>
          ) : (
            <span>{exampleHint}</span>
          )}
        </p>
      )}
    </div>
  );
}
