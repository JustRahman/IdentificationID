"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumb } from "@/components/registry/Breadcrumb";
import { ManufacturerProfileView } from "@/components/ManufacturerProfileView";
import type { ManufacturerProfile } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/** Rendered on the server with initialData (so search engines and AI crawlers see the content). */
export default function ManufacturerPageClient({
  mid,
  initialData,
}: {
  mid: string;
  initialData: ManufacturerProfile | null;
}) {
  const [data, setData] = useState<ManufacturerProfile | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) return;
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
  }, [mid, initialData]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-16">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-20">
        <h1 className="sr-only">Manufacturer not found</h1>
        <EmptyState
          icon="building"
          title="Manufacturer not found"
          description={error && error !== "Manufacturer not found" ? error : "No manufacturer with this ID. Check the ID format: MID-XXXX-XXXX."}
          action={<ButtonLink href="/search" variant="secondary">Browse the registry</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 pt-8 pb-20 sm:pt-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Registry", href: "/search" },
          { label: data.display_name },
        ]}
      />
      <div className="mt-6 sm:mt-8">
        <ManufacturerProfileView data={data} />
      </div>
    </div>
  );
}
