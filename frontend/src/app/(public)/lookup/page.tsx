"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ID_PATTERN = /^IID-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;

export default function LookupPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
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
    <div className="max-w-lg mx-auto py-20 px-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Product Lookup</h1>
      <p className="text-muted mb-8 text-sm">
        Search by product name or paste an Identification ID.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Air Fryer or IID-4F9A-2K7Q"
          required
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
      <p className="text-xs text-muted">
        Paste an ID like{" "}
        <span
          className="font-mono text-foreground cursor-pointer hover:text-accent"
          onClick={() => setQuery("IID-4F9A-2K7Q")}
        >
          IID-4F9A-2K7Q
        </span>{" "}
        to go directly to a product.{" "}
        <Link href="/" className="text-accent hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
