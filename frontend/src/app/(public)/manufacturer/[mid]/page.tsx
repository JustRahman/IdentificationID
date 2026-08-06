"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ManufacturerProduct {
  identification_id: string;
  name: string;
  category: string;
  brand: string | null;
  cover_image: string | null;
}

interface ManufacturerData {
  manufacturer_id: string;
  display_name: string;
  legal_name: string;
  country_code: string;
  website: string | null;
  support_email: string | null;
  logo_url: string | null;
  description: string | null;
  registered_at: string | null;
  product_count: number;
  products: ManufacturerProduct[];
}

export default function ManufacturerPage({
  params,
}: {
  params: Promise<{ mid: string }>;
}) {
  const { mid } = use(params);
  const [data, setData] = useState<ManufacturerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

  function copyId() {
    if (!data) return;
    navigator.clipboard.writeText(data.manufacturer_id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/manufacturer/${data.manufacturer_id}`
      : `https://identificationid.com/manufacturer/${data.manufacturer_id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(publicUrl)}`;

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <p className="text-sm text-muted mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        {" / "}
        <Link href="/search" className="hover:underline">Registry</Link>
        {" / "}
        {data.display_name}
      </p>

      {/* Profile header */}
      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          {data.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logo_url}
              alt={`${data.display_name} logo`}
              className="w-20 h-20 rounded-xl object-contain border border-border bg-white shrink-0"
            />
          )}
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold mb-1">{data.display_name}</h1>
                <p className="text-sm text-muted">{data.legal_name}</p>
              </div>
              <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200 shrink-0">
                Registered Manufacturer
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm font-mono font-semibold">{data.manufacturer_id}</span>
              <button
                onClick={copyId}
                className="text-xs px-2 py-0.5 border border-border rounded hover:bg-surface text-muted transition-colors"
              >
                {copied ? "✓ Copied" : "Copy ID"}
              </button>
            </div>

            {data.description && (
              <p className="text-sm text-muted mt-4 leading-relaxed">{data.description}</p>
            )}
          </div>
        </div>

        {/* Details + QR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Country", value: data.country_code },
              { label: "Products", value: String(data.product_count) },
              {
                label: "In registry since",
                value: data.registered_at ? new Date(data.registered_at).toLocaleDateString() : "--",
              },
              { label: "Website", value: data.website || "--" },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-muted">{f.label}</p>
                {f.label === "Website" && data.website ? (
                  <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline break-all">
                    {data.website}
                  </a>
                ) : (
                  <p className="text-sm">{f.value}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Manufacturer QR code"
              width={120}
              height={120}
              className="border border-border rounded-lg p-1.5 bg-white shrink-0"
            />
            <div>
              <p className="text-sm font-medium mb-1">Manufacturer QR</p>
              <p className="text-xs text-muted">
                Scan to open this manufacturer&apos;s registry profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-background border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold mb-4">
          Products in the registry ({data.product_count})
        </h2>
        {data.products.length === 0 ? (
          <p className="text-sm text-muted">No published products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.products.map((p) => (
              <Link
                key={p.identification_id}
                href={`/p/${encodeURIComponent(p.identification_id)}`}
                className="border border-border rounded-xl overflow-hidden hover:border-accent hover:shadow-md transition-all bg-background group block"
              >
                <div className="aspect-[4/3] bg-surface overflow-hidden">
                  {p.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.cover_image}
                      alt={p.name}
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
                <div className="p-4">
                  <h3 className="text-sm font-semibold group-hover:text-accent transition-colors leading-snug line-clamp-2 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs font-mono text-muted/70">{p.identification_id}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted mt-6 leading-relaxed">
        A Manufacturer ID is a unique identifier assigned to a manufacturer within the
        Identification ID global product registry. It is not a government, tax, or
        internationally recognized business identifier.
      </p>
    </div>
  );
}
