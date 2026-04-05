"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LookupPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const id = query.trim().toUpperCase();
    if (id) {
      router.push(`/p/${encodeURIComponent(id)}`);
    }
  }

  return (
    <div className="max-w-lg mx-auto py-20 px-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Product Lookup</h1>
      <p className="text-muted mb-8">
        Enter an Identification ID to access verified product information.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. IID-4F9A-2K7Q"
          required
          className="flex-1 border border-border rounded-lg px-4 py-3 text-sm bg-background"
        />
        <button
          type="submit"
          className="bg-accent text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover"
        >
          Search
        </button>
      </form>
    </div>
  );
}
