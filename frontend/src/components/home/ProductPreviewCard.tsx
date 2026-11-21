/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ProductData } from "@/components/ProductPageClient";
import { CATEGORY_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { IdChip } from "@/components/ui/IdChip";
import { FactList } from "@/components/ui/FactList";
import { ProductImage } from "@/components/ui/ProductImage";
import { countryName } from "./data";

/**
 * Framed "browser window" showing a real product page from the registry
 * (Attio / Stripe hero pattern). Falls back to a clearly labelled layout
 * example with placeholder IDs when the registry has no public product yet.
 */
export function ProductPreviewCard({ product }: { product: ProductData | null }) {
  const p = product;
  const iid = p?.identification_id ?? "IID-XXXX-XXXX";
  const mid = p?.company.manufacturer_id ?? "MID-XXXX-XXXX";
  const image = p?.images?.slice().sort((a, b) => a.display_order - b.display_order)[0];
  const url = `identificationid.com/p/${iid}`;

  return (
    <div className="relative">
      {/* soft colored glow behind the window */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-6 top-10 bottom-6 rounded-[40px] bg-linear-to-r from-blue-400/30 via-violet-400/30 to-teal-300/30 blur-3xl" />
      <FloatingDecor />
      <div className="relative rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_30px_70px_-24px_rgba(79,70,229,0.35)] overflow-hidden">
        <div aria-hidden="true" className="h-1 bg-linear-to-r from-blue-500 via-violet-500 to-teal-400" />
        {/* window chrome */}
        <div className="flex items-center gap-3 px-4 h-11 border-b border-slate-200 bg-slate-50/80">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 flex justify-center min-w-0">
            <span className="inline-flex items-center gap-1.5 max-w-full truncate rounded-md bg-white border border-slate-200 px-3 h-6 text-xs text-slate-500 font-mono" data-no-i18n>
              <svg className="w-3 h-3 shrink-0 text-slate-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
                <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
              </svg>
              <span className="truncate">{url}</span>
            </span>
          </div>
          <span className="w-12 hidden sm:block" aria-hidden="true" />
        </div>

        {/* page body */}
        <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="p-5 sm:p-6 md:border-r border-slate-200">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <ProductImage src={image?.url} alt={image?.alt_text || p?.name || "Product photo"} className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 p-3 flex items-center gap-3">
              {p ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&margin=0&data=${encodeURIComponent(`https://identificationid.com/p/${iid}`)}`}
                  alt={`QR code for ${iid}`}
                  className="w-14 h-14 shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-14 shrink-0 rounded-md bg-slate-100" aria-hidden="true" />
              )}
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Scan to open this page</p>
                <p className="text-xs font-mono tabular-nums text-slate-900 font-semibold truncate" data-no-i18n>{iid}</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 text-left">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {p ? (
                <Badge tone={p.company.verification_level === "registered" ? "neutral" : "verified"} icon="check" size="xs">
                  {p.company.verification_label || "Registered manufacturer"}
                </Badge>
              ) : (
                <Badge tone="pending" size="xs" dot>
                  Layout example
                </Badge>
              )}
              {p && <span className="text-xs text-slate-500">{CATEGORY_LABELS[p.category] ?? p.category}</span>}
            </div>
            <p className="text-sm text-slate-500">{p?.brand || p?.company.display_name || "Brand"}</p>
            <p className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 leading-tight">
              {p?.name ?? "Product name"}
            </p>
            <div className="mt-3">
              <IdChip label="Identification ID" id={iid} size="sm" copy={!!p} />
            </div>
            {p?.translation?.short_description && (
              <p className="mt-4 text-sm text-slate-600 leading-relaxed line-clamp-2">{p.translation.short_description}</p>
            )}
            <FactList
              className="mt-4 border-t border-slate-200"
              dense
              items={[
                { label: "Model", value: p ? p.model : "-", mono: true },
                { label: "Country of origin", value: p ? countryName(p.country_of_origin) : "-" },
                { label: "Manuals & documents", value: p ? (p.documents?.length ? `${p.documents.length} file${p.documents.length === 1 ? "" : "s"}` : null) : "-" },
              ]}
            />
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Manufacturer</p>
                <p className="text-sm font-medium text-slate-900 truncate">{p?.company.display_name ?? "Company name"}</p>
              </div>
              <span className="text-xs font-mono tabular-nums font-semibold text-slate-700 shrink-0" data-no-i18n>{mid}</span>
            </div>
          </div>
        </div>
      </div>

      {p && (
        <p className="relative mt-5 text-center text-sm text-slate-500">
          A real product page from the registry.{" "}
          <Link href={`/p/${p.identification_id}`} className="text-accent font-medium hover:underline underline-offset-4">
            Open it
          </Link>
        </p>
      )}
    </div>
  );
}

/**
 * Decorative tilted mini cards around the preview (desktop only, aria-hidden).
 * Format examples only (MID-XXXX-XXXX), no invented data or numbers.
 */
function FloatingDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none select-none hidden lg:block">
      {/* Manufacturer ID chip - top left */}
      <div className="absolute -left-20 top-24 z-10 -rotate-6 rounded-xl border border-blue-100 bg-white/95 px-3.5 py-2.5 shadow-[0_14px_30px_-12px_rgba(37,99,235,0.45)]">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">Manufacturer ID</p>
        <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900" data-no-i18n>MID-XXXX-XXXX</p>
      </div>

      {/* QR tile - right */}
      <div className="absolute -right-14 top-40 z-10 rotate-6 rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 p-2.5 shadow-[0_18px_36px_-14px_rgba(168,85,247,0.7)]">
        <div className="grid grid-cols-5 gap-[3px] w-16 h-16 p-2 rounded-lg bg-white">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className={QR_CELLS.has(i) ? "bg-violet-900 rounded-[1px]" : ""} />
          ))}
        </div>
        <p className="mt-1.5 text-center text-[10px] font-semibold text-white">QR code</p>
      </div>

      {/* Registered badge - bottom left */}
      <div className="absolute -left-24 bottom-28 z-10 rotate-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/95 pl-1.5 pr-3.5 py-1.5 shadow-[0_14px_30px_-12px_rgba(5,150,105,0.5)]">
        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8.5l2.5 2.5L12 5.5" />
          </svg>
        </span>
        <span className="text-xs font-semibold text-emerald-800">Registered</span>
      </div>

      {/* Product page chip - bottom right */}
      <div className="absolute -right-12 bottom-3 z-10 -rotate-3 inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-white/95 px-3 py-2 shadow-[0_14px_30px_-12px_rgba(245,158,11,0.55)]">
        <span className="w-6 h-6 rounded-md bg-linear-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center">
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 2.5h5l2.5 2.5v8.5h-7.5z" />
            <path d="M6.5 8h3.5M6.5 10.5h3.5" />
          </svg>
        </span>
        <span className="text-xs font-semibold text-slate-800">Official product page</span>
      </div>
    </div>
  );
}

const QR_CELLS = new Set([0, 1, 3, 4, 5, 7, 9, 12, 15, 16, 17, 19, 20, 21, 23, 24]);
