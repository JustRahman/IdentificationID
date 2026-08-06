"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { LANGUAGES } from "@/lib/constants";
import { translateText } from "@/lib/translate";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface TranslationFields {
  lang: string;
  short_description: string | null;
  full_description: string | null;
  usage_instructions: string | null;
}

interface ProductImage {
  url: string;
  alt_text: string | null;
  display_order: number;
}

interface ProductData {
  identification_id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  country_of_origin: string | null;
  published_at: string | null;
  company: {
    manufacturer_id: string | null;
    display_name: string;
    country_code: string;
    website: string | null;
    support_email: string | null;
    logo_url: string | null;
    description: string | null;
  };
  translation: TranslationFields | null;
  translations: TranslationFields[];
  images: ProductImage[];
  documents: {
    id: string;
    doc_type: string;
    title: string | null;
    versions: {
      version: number;
      file_name: string;
      size_bytes: number;
      created_at: string;
      file_url: string | null;
    }[];
  }[];
}

type DescFields = { short: string; full: string; usage: string };

function toFields(t: TranslationFields | null): DescFields {
  return {
    short: t?.short_description || "",
    full: t?.full_description || "",
    usage: t?.usage_instructions || "",
  };
}

function hasContent(f: DescFields): boolean {
  return !!(f.short || f.full || f.usage);
}

export default function PublicProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Image gallery
  const [activeImage, setActiveImage] = useState(0);

  // Copy-ID
  const [copied, setCopied] = useState(false);
  function copyId() {
    if (!product) return;
    navigator.clipboard.writeText(product.identification_id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Language / translation
  const [activeLang, setActiveLang] = useState("en");
  const [translating, setTranslating] = useState(false);
  // cache[lang] = translated/stored fields; machine = set of langs that were auto-translated
  const [cache, setCache] = useState<Record<string, DescFields>>({});
  const [machineLangs, setMachineLangs] = useState<Set<string>>(new Set());
  const [storedLangs, setStoredLangs] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/public/products/${encodeURIComponent(id)}`);
        if (!res.ok) {
          setError("Product not found");
          return;
        }
        const json = await res.json();
        const data: ProductData = json.data;
        setProduct(data);

        // Seed the cache with all stored translations that have content.
        const seeded: Record<string, DescFields> = {};
        const stored = new Set<string>();
        for (const t of data.translations || []) {
          const f = toFields(t);
          if (hasContent(f)) {
            seeded[t.lang] = f;
            stored.add(t.lang);
          }
        }
        // Ensure an English baseline exists (fall back to the picked translation).
        if (!seeded.en && data.translation) {
          seeded.en = toFields(data.translation);
          if (hasContent(seeded.en)) stored.add("en");
        }
        setCache(seeded);
        setStoredLangs(stored);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function selectLang(lang: string) {
    setActiveLang(lang);
    if (cache[lang]) return; // already have it (stored or previously translated)

    // Machine-translate from the English baseline.
    const base = cache.en;
    if (!base) return;
    setTranslating(true);
    try {
      const [short, full, usage] = await Promise.all([
        translateText(base.short, "en", lang),
        translateText(base.full, "en", lang),
        translateText(base.usage, "en", lang),
      ]);
      setCache((prev) => ({ ...prev, [lang]: { short, full, usage } }));
      setMachineLangs((prev) => new Set(prev).add(lang));
    } catch {
      // On failure, fall back to English so the page is never blank.
      setActiveLang("en");
    } finally {
      setTranslating(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Product Not Found</h1>
        <p className="text-muted mb-6">{error || "No product with this ID."}</p>
        <Link href="/lookup" className="text-accent hover:underline text-sm">
          Try another lookup
        </Link>
      </div>
    );
  }

  const images = [...product.images].sort((a, b) => a.display_order - b.display_order);
  const desc = cache[activeLang] || cache.en || { short: "", full: "", usage: "" };
  const isMachine = machineLangs.has(activeLang);
  const hasAnyDesc = hasContent(desc);

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <p className="text-sm text-muted mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        {" / "}
        <Link href="/lookup" className="hover:underline">Lookup</Link>
        {" / "}
        {product.name}
      </p>

      {/* Image gallery */}
      {images.length > 0 && (
        <div className="bg-background border border-border rounded-xl p-4 mb-6">
          <div className="aspect-[4/3] bg-surface rounded-lg overflow-hidden mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeImage]?.url}
              alt={images[activeImage]?.alt_text || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === activeImage ? "border-accent" : "border-border hover:border-muted"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.alt_text || `${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
            <span className="text-xs bg-surface text-muted px-2 py-1 rounded border border-border">
              {product.category}
            </span>
          </div>
          <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            Verified Manufacturer
          </span>
        </div>

        {desc.short && (
          <p className="text-sm text-muted mb-6">{desc.short}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-muted mb-4">Product Details</h3>
            {[
              { label: "Identification ID", value: product.identification_id },
              { label: "Brand", value: product.brand || "--" },
              { label: "Model", value: product.model || "--" },
              { label: "Country of Origin", value: product.country_of_origin || "--" },
              { label: "Published", value: product.published_at ? new Date(product.published_at).toLocaleDateString() : "--" },
            ].map((field) => (
              <div key={field.label} className="mb-3">
                <p className="text-xs text-muted">{field.label}</p>
                <p className="text-sm">{field.value}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted mb-4">Manufacturer</h3>
            {(product.company.logo_url || product.company.description) && (
              <div className="flex items-start gap-3 mb-4">
                {product.company.logo_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.company.logo_url}
                    alt={`${product.company.display_name} logo`}
                    className="w-12 h-12 rounded-lg object-contain border border-border bg-white shrink-0"
                  />
                )}
                {product.company.description && (
                  <p className="text-xs text-muted leading-relaxed">{product.company.description}</p>
                )}
              </div>
            )}
            {[
              { label: "Company", value: product.company.display_name },
              { label: "Country", value: product.company.country_code },
              { label: "Website", value: product.company.website || "--" },
              { label: "Support Email", value: product.company.support_email || "--" },
            ].map((field) => (
              <div key={field.label} className="mb-3">
                <p className="text-xs text-muted">{field.label}</p>
                <p className="text-sm">{field.value}</p>
              </div>
            ))}
            {product.company.manufacturer_id && (
              <div className="mb-3">
                <p className="text-xs text-muted">Manufacturer ID</p>
                <Link
                  href={`/manufacturer/${product.company.manufacturer_id}`}
                  className="text-sm font-mono text-accent hover:underline"
                >
                  {product.company.manufacturer_id} →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="mt-6 pt-6 border-t border-border flex items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
              typeof window !== "undefined"
                ? `${window.location.origin}/p/${product.identification_id}`
                : `https://identificationid.com/p/${product.identification_id}`
            )}`}
            alt="QR Code"
            width={120}
            height={120}
            className="border border-border rounded-lg p-1.5 bg-white shrink-0"
          />
          <div>
            <p className="text-sm font-medium mb-1">Scan to share</p>
            <p className="text-xs text-muted mb-2">Point your phone camera at this code to open this product page instantly.</p>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-muted">{product.identification_id}</p>
              <button
                onClick={copyId}
                className="text-xs px-2 py-0.5 border border-border rounded hover:bg-surface text-muted transition-colors"
              >
                {copied ? "✓ Copied" : "Copy ID"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Language selector + description */}
      {hasAnyDesc && (
        <div className="bg-background border border-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h3 className="text-sm font-semibold text-muted">Description</h3>
            <div className="flex items-center gap-2">
              {isMachine && (
                <span className="text-xs text-muted bg-surface border border-border px-2 py-0.5 rounded">
                  machine translated
                </span>
              )}
              <select
                value={activeLang}
                onChange={(e) => selectLang(e.target.value)}
                disabled={translating}
                className="text-xs border border-border rounded-lg px-2 py-1 bg-background disabled:opacity-50"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                    {storedLangs.has(l.code) ? " ✓" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {translating ? (
            <p className="text-sm text-muted">Translating…</p>
          ) : (
            <>
              {desc.full && <p className="text-sm whitespace-pre-line mb-6">{desc.full}</p>}
              {desc.usage && (
                <>
                  <h4 className="text-sm font-semibold text-muted mb-2">Usage Instructions</h4>
                  <p className="text-sm whitespace-pre-line">{desc.usage}</p>
                </>
              )}
            </>
          )}
        </div>
      )}

      <div className="bg-background border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted mb-4">Documents</h3>
        {product.documents.length === 0 ? (
          <p className="text-sm text-muted">No documents available.</p>
        ) : (
          <div className="space-y-3">
            {product.documents.map((doc) => {
              const latest = doc.versions[0];
              return (
                <div key={doc.id} className="p-3 border border-border rounded-lg flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{doc.title || doc.doc_type}</p>
                    <p className="text-xs text-muted">
                      Type: {doc.doc_type} · {doc.versions.length} version(s)
                      {latest && ` · ${(latest.size_bytes / 1024).toFixed(0)} KB`}
                    </p>
                  </div>
                  {latest?.file_url && (
                    <a
                      href={latest.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-hover transition-colors flex items-center gap-1 shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
