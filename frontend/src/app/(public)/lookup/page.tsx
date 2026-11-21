"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const ID_TYPES = [
  {
    code: "IID-XXXX-XXXX",
    title: "Identification ID",
    text: "A product. Opens the official product page: photos, specifications, manuals and the manufacturer.",
  },
  {
    code: "MID-XXXX-XXXX",
    title: "Manufacturer ID",
    text: "A manufacturer. Opens the public company page with its registry record and products.",
  },
];

export default function LookupPage() {
  // Real IDs from the registry as clickable examples (never invented ones).
  const [examples, setExamples] = useState<string[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/public/featured?limit=2`)
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => setExamples(((j.data ?? []) as { identification_id: string }[]).slice(0, 2).map((p) => p.identification_id)))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-5 sm:px-6 pt-16 pb-12 sm:pt-24 text-center">
        <p className="text-sm font-medium text-accent mb-4">Registry lookup</p>
        <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-900 text-balance">
          Look up any ID. <span className="text-slate-400">Or search by name.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Paste an Identification ID or Manufacturer ID to open its page directly, or search the registry by product, brand or company name.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-5 sm:px-6 text-left">
        <SearchBar size="lg" defaultMode="id" examples={examples} exampleHint="IDs look like IID-XXXX-XXXX or MID-XXXX-XXXX" autoFocus />
      </div>

      <div className="mx-auto max-w-3xl px-5 sm:px-6 pt-14 pb-20 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ID_TYPES.map((t) => (
            <div key={t.code} className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="font-mono tabular-nums text-sm font-semibold text-slate-900" data-no-i18n>{t.code}</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{t.title}</p>
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">{t.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-sm text-slate-500 text-center">
          Not sure what you are looking for?{" "}
          <Link href="/search" className="text-accent hover:underline">Browse the registry</Link>
        </p>
      </div>
    </div>
  );
}
