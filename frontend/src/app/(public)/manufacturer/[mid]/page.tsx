"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ManufacturerProfileView } from "@/components/ManufacturerProfileView";
import type { ManufacturerProfile } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ManufacturerPage({
  params,
}: {
  params: Promise<{ mid: string }>;
}) {
  const { mid } = use(params);
  const [data, setData] = useState<ManufacturerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `${API_BASE}/public/manufacturers/${encodeURIComponent(mid)}`
        );
        if (!res.ok) {
          setError("Manufacturer not found");
          return;
        }
        const json = await res.json();
        setData(json.data);
      } catch {
        setError("Failed to load manufacturer");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [mid]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6">
        <p className="text-sm text-muted">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Manufacturer Not Found</h1>
        <p className="text-muted mb-6">{error || "No manufacturer with this ID."}</p>
        <Link href="/search" className="text-accent hover:underline text-sm">
          Browse the registry
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <p className="text-sm text-muted mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        {" / "}
        <Link href="/search" className="hover:underline">Registry</Link>
        {" / "}
        {data.display_name}
      </p>
      <ManufacturerProfileView data={data} />
    </div>
  );
}
