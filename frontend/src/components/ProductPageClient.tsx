"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, LANGUAGES, VERIFICATION_DISCLAIMER } from "@/lib/constants";
import { PublicPageNotice } from "@/components/PublicPageNotice";
import { translateText } from "@/lib/translate";
import { getPreview } from "@/lib/previews";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { IdChip } from "@/components/ui/IdChip";
import { FactList } from "@/components/ui/FactList";
import { Tabs } from "@/components/ui/Tabs";
import { DisclaimerBar } from "@/components/ui/DisclaimerBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage as Photo } from "@/components/ui/ProductImage";
import { Breadcrumb } from "@/components/registry/Breadcrumb";
import { CompanyLogo } from "@/components/registry/CompanyLogo";
import { QrCode } from "@/components/registry/QrCode";
import { countryName, fullDate, monthYear, prettyUrl, safeHref } from "@/components/registry/format";

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

export interface ProductData {
  identification_id: string;
  under_review?: boolean;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  country_of_origin: string | null;
  published_at: string | null;
  company: {
    manufacturer_id: string | null;
    registry_status: "active" | "inactive";
    last_active: string | null;
    verification_level: "registered" | "verified" | "business";
    verification_label: string;
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

function seedFrom(data: ProductData): { seeded: Record<string, DescFields>; stored: Set<string> } {
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
  return { seeded, stored };
}

/** Rendered on the server with initialData (so search engines and AI crawlers see the content). */
export default function ProductPageClient({
  id,
  initialData,
}: {
  id: string;
  initialData: ProductData | null;
}) {
  const initialSeed = initialData ? seedFrom(initialData) : null;
  const [product, setProduct] = useState<ProductData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState("");

  // Image gallery
  const [activeImage, setActiveImage] = useState(0);

  // Section tabs
  const [tab, setTab] = useState("specs");

  // Language / translation
  const [activeLang, setActiveLang] = useState("en");
  const [translating, setTranslating] = useState(false);
  // cache[lang] = translated/stored fields; machine = set of langs that were auto-translated
  const [cache, setCache] = useState<Record<string, DescFields>>(initialSeed?.seeded ?? {});
  const [machineLangs, setMachineLangs] = useState<Set<string>>(new Set());
  const [storedLangs, setStoredLangs] = useState<Set<string>>(initialSeed?.stored ?? new Set());

  useEffect(() => {
    if (initialData) return; // already rendered from server data
    async function load() {
      try {
        const preview = getPreview(id);
        let data: ProductData;
        if (preview) {
          data = preview.data as ProductData;
        } else {
          const res = await fetch(`${API_BASE}/public/products/${encodeURIComponent(id)}`);
          if (!res.ok) {
            setError("Product not found");
            return;
          }
          const json = await res.json();
          data = json.data;
        }
        setProduct(data);
        const { seeded, stored } = seedFrom(data);
        setCache(seeded);
        setStoredLangs(stored);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, initialData]);

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
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-16">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-20">
        <h1 className="sr-only">Product not found</h1>
        <EmptyState
          icon="search"
          title="Product not found"
          description={error && error !== "Product not found" ? error : "No product with this ID. Check the ID format: IID-XXXX-XXXX."}
          action={<ButtonLink href="/lookup" variant="secondary">Try another lookup</ButtonLink>}
        />
      </div>
    );
  }

  const images = [...product.images].sort((a, b) => a.display_order - b.display_order);
  const desc = cache[activeLang] || cache.en || { short: "", full: "", usage: "" };
  const isMachine = machineLangs.has(activeLang);
  const hasAnyDesc = hasContent(desc);

  const preview = getPreview(id);
  const company = product.company;
  const mid = company.manufacturer_id;
  const category = CATEGORY_LABELS[product.category] ?? product.category;
  const websiteHref = safeHref(company.website);
  const inactive = company.registry_status === "inactive";
  const docCount = product.documents.length;
  const current = images[activeImage] ?? images[0];

  const langSelect = (where: string) => (
    <div className="flex items-center gap-2">
      {isMachine && <Badge tone="neutral" size="xs">Machine translated</Badge>}
      <label className="sr-only" htmlFor={`lang-${where}`}>Description language</label>
      <select
        id={`lang-${where}`}
        value={activeLang}
        onChange={(e) => selectLang(e.target.value)}
        disabled={translating}
        className="text-sm border border-slate-200 rounded-lg pl-2.5 pr-7 h-8 bg-white text-slate-700 hover:border-slate-300 disabled:opacity-50"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
            {storedLangs.has(l.code) ? " ✓" : ""}
          </option>
        ))}
      </select>
    </div>
  );

  const midLink = mid ? (
    preview ? (
      <span className="inline-flex items-center gap-2">
        <span data-no-i18n>{mid}</span>
        <Badge tone="pending" size="xs">Sample</Badge>
      </span>
    ) : (
      <Link href={`/manufacturer/${mid}`} className="text-accent hover:underline" data-no-i18n>{mid}</Link>
    )
  ) : null;

  const specs = [
    { label: "Identification ID", value: <span data-no-i18n>{product.identification_id}</span>, mono: true },
    { label: "Product name", value: product.name },
    { label: "Brand", value: product.brand },
    { label: "Model", value: product.model, mono: true },
    { label: "Category", value: category },
    { label: "Country of origin", value: countryName(product.country_of_origin) },
    { label: "Manufacturer", value: company.display_name },
    { label: "Manufacturer ID", value: midLink, mono: true },
    { label: "Published", value: product.published_at ? fullDate(product.published_at) : preview ? "Not published (sample)" : null },
  ];

  const tabs = [
    { id: "specs", label: "Specifications" },
    { id: "docs", label: "Manuals & documents", count: docCount },
    { id: "safety", label: "Safety" },
    { id: "maker", label: "Manufacturer" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 pt-8 pb-20 sm:pt-10">
      {preview && (
        <div role="note" className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge tone="pending" dot>Sample page</Badge>
            <p className="font-semibold">样例页面 / Sample preview for {preview.preparedFor}</p>
          </div>
          <p className="text-amber-900/85 leading-relaxed">
            本页面根据贵司官网公开信息制作，仅供预览，未在注册表中发布。页面上的产品识别号和制造商识别号为样例，正式加入后会分配正式ID。
            This private sample was built from information published on{" "}
            <a href={preview.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">the manufacturer&apos;s website</a>.
            It is not published in the registry. The Identification ID (IID-SMPL-B760) and Manufacturer ID shown are sample IDs; real ones are issued when the manufacturer joins.
          </p>
        </div>
      )}

      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Lookup", href: "/lookup" },
          ...(mid && !preview ? [{ label: company.display_name, href: `/manufacturer/${mid}` }] : []),
          { label: product.name },
        ]}
      />

      {/* ── Hero: gallery + identity ── */}
      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
            <Photo
              key={current?.url ?? "none"}
              src={current?.url}
              alt={current?.alt_text || product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 flex-wrap" role="group" aria-label="Product photos">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-pressed={i === activeImage}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-slate-50 transition-colors ${
                    i === activeImage ? "border-accent" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Photo src={img.url} alt={img.alt_text || `${product.name} ${i + 1}`} className="w-full h-full object-cover" placeholderClassName="[&>span]:hidden" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="min-w-0">
          <p className="text-sm text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
            {product.brand && <span className="font-medium text-slate-700">{product.brand}</span>}
            {product.brand && <span className="text-slate-300" aria-hidden="true">/</span>}
            <span>{category}</span>
          </p>
          <h1
            className={`mt-2 font-semibold tracking-tight text-slate-900 text-balance ${
              product.name.length > 48 ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl"
            }`}
          >
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link href="/verification" title={VERIFICATION_DISCLAIMER} className="rounded-full">
              <Badge
                tone={preview ? "pending" : company.verification_level === "registered" ? "neutral" : "verified"}
                icon={preview ? undefined : "check"}
                dot={!!preview}
              >
                {company.verification_label || "Registered Manufacturer"}
              </Badge>
            </Link>
            {inactive && <Badge tone="neutral" dot>Manufacturer inactive</Badge>}
          </div>

          {desc.short && <p className="mt-5 text-base text-slate-600 leading-relaxed">{desc.short}</p>}

          {/* Identification ID - shown large so buyers, sellers and manufacturers notice it */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)] p-5 flex items-center gap-5">
            <QrCode path={`/p/${product.identification_id}`} size={96} alt={`QR code for ${product.identification_id}`} />
            <div className="min-w-0">
              <p className="text-sm text-slate-500">Identification ID</p>
              <div className="-ml-0.5 mt-0.5">
                <IdChip id={product.identification_id} size="lg" variant="plain" />
              </div>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                {preview
                  ? "Sample ID for this preview. A real Identification ID is issued when the manufacturer joins."
                  : "Scan to open this product page. Data provided by the manufacturer."}
              </p>
            </div>
          </div>

          {/* Manufacturer card */}
          <div className="mt-4 rounded-2xl border border-slate-200 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-3">Manufacturer</p>
            <div className="flex items-start gap-3.5">
              <CompanyLogo name={company.display_name} src={company.logo_url} size="md" />
              <div className="min-w-0 flex-1">
                {mid && !preview ? (
                  <Link href={`/manufacturer/${mid}`} className="text-base font-semibold text-slate-900 hover:text-accent">
                    {company.display_name}
                  </Link>
                ) : (
                  <p className="text-base font-semibold text-slate-900">{company.display_name}</p>
                )}
                <p className="text-sm text-slate-500 mt-0.5">
                  {[countryName(company.country_code), company.website ? prettyUrl(company.website) : null].filter(Boolean).join(" - ")}
                </p>
                {mid && (
                  <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-xs text-slate-500 w-full sm:w-auto">Manufacturer ID</span>
                    <IdChip id={mid} size="sm" href={preview ? undefined : `/manufacturer/${mid}`} />
                    {preview && <Badge tone="pending" size="xs">Sample ID</Badge>}
                  </div>
                )}
                {inactive && (
                  <p className="mt-2 text-sm text-slate-500">
                    Registry status: Inactive
                    {company.last_active && ` - Last active: ${monthYear(company.last_active)}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs items={tabs} value={tab} onChange={setTab} idPrefix="product-tab" ariaLabel="Product sections" className="mt-14" />

      <div className="mt-8">
        {/* All panels stay in the HTML (hidden) so crawlers see the full record. */}
        <section role="tabpanel" id="product-tabpanel-specs" aria-labelledby="product-tab-specs" hidden={tab !== "specs"}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-2">Specifications</h2>
              <FactList layout="grid" items={specs} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">Description</h2>
                {hasAnyDesc && langSelect("description")}
              </div>
              {!hasAnyDesc ? (
                <p className="text-sm text-slate-400">No description provided.</p>
              ) : translating ? (
                <p className="text-sm text-slate-500">Translating...</p>
              ) : desc.full ? (
                <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-line">{desc.full}</p>
              ) : (
                <p className="text-sm text-slate-400">No full description provided.</p>
              )}
            </div>
          </div>
        </section>

        <section role="tabpanel" id="product-tabpanel-docs" aria-labelledby="product-tab-docs" hidden={tab !== "docs"}>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-4">Manuals &amp; documents</h2>
          {docCount === 0 ? (
            <EmptyState icon="document" compact title="No documents available" description="Manuals, certificates and safety sheets appear here when the manufacturer publishes them." />
          ) : (
            <ul className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
              {product.documents.map((doc) => {
                const latest = doc.versions[0];
                return (
                  <li key={doc.id} className="flex items-center gap-4 px-4 sm:px-5 py-4 bg-white">
                    <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0" aria-hidden="true">
                      <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{doc.title || doc.doc_type}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Type: {doc.doc_type} - {doc.versions.length} version(s)
                        {latest && ` - ${(latest.size_bytes / 1024).toFixed(0)} KB`}
                      </p>
                    </div>
                    {latest?.file_url && (
                      <a
                        href={latest.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 h-8 shrink-0"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section role="tabpanel" id="product-tabpanel-safety" aria-labelledby="product-tab-safety" hidden={tab !== "safety"}>
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Usage &amp; safety instructions</h2>
            {desc.usage && langSelect("safety")}
          </div>
          {translating ? (
            <p className="text-sm text-slate-500">Translating...</p>
          ) : desc.usage ? (
            <div className="max-w-3xl rounded-2xl border border-slate-200 p-5 sm:p-6">
              <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-line">{desc.usage}</p>
            </div>
          ) : (
            <EmptyState icon="document" compact title="No safety information provided" description="The manufacturer has not published usage or safety instructions for this product yet." />
          )}
        </section>

        <section role="tabpanel" id="product-tabpanel-maker" aria-labelledby="product-tab-maker" hidden={tab !== "maker"}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-start">
            <div className="min-w-0">
              <div className="flex items-center gap-3.5 mb-4">
                <CompanyLogo name={company.display_name} src={company.logo_url} size="md" />
                <h2 className="text-lg font-semibold tracking-tight text-slate-900">{company.display_name}</h2>
              </div>
              {company.description ? (
                <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-line">{company.description}</p>
              ) : (
                <p className="text-sm text-slate-400">No company description provided.</p>
              )}
              {mid && !preview && (
                <div className="mt-6">
                  <ButtonLink href={`/manufacturer/${mid}`} variant="secondary" size="sm">View manufacturer profile</ButtonLink>
                </div>
              )}
            </div>
            <FactList
              layout="grid"
              items={[
                { label: "Company", value: company.display_name },
                { label: "Manufacturer ID", value: midLink, mono: true },
                { label: "Country", value: countryName(company.country_code) },
                {
                  label: "Website",
                  value: company.website ? (
                    websiteHref ? (
                      <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">
                        {prettyUrl(company.website)}
                      </a>
                    ) : (
                      company.website
                    )
                  ) : null,
                },
                {
                  label: "Support email",
                  value: company.support_email ? (
                    <a href={`mailto:${company.support_email}`} className="text-accent hover:underline break-all">{company.support_email}</a>
                  ) : null,
                },
                { label: "Registry status", value: inactive ? "Inactive" : preview ? "Sample - not registered" : "Active" },
                ...(inactive && company.last_active ? [{ label: "Last active", value: monthYear(company.last_active) }] : []),
              ]}
            />
          </div>
        </section>
      </div>

      {preview ? (
        <DisclaimerBar className="mt-12" />
      ) : (
        <PublicPageNotice targetType="product" targetId={product.identification_id} underReview={!!product.under_review} />
      )}
    </div>
  );
}
