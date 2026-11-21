import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/constants";
import { ProductImage } from "@/components/ui/ProductImage";
import { CompanyLogo } from "./CompanyLogo";
import { countryName, prettyUrl } from "./format";

export interface ProductCardData {
  identification_id: string;
  name: string;
  category: string;
  brand: string | null;
  manufacturer?: string | null;
  cover_image: string | null;
}

/** Product result / grid card: photo (or "No photo yet"), name, brand, IID. */
export function ProductCard({ p, showMaker = true }: { p: ProductCardData; showMaker?: boolean }) {
  const meta = [p.brand, showMaker && p.manufacturer !== p.brand ? p.manufacturer : null].filter(Boolean).join(" - ");
  return (
    <Link
      href={`/p/${encodeURIComponent(p.identification_id)}`}
      className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden transition-colors hover:border-slate-300"
    >
      <div className="aspect-[4/3] bg-slate-50 overflow-hidden border-b border-slate-200">
        <ProductImage src={p.cover_image} alt={p.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-500 mb-1">{CATEGORY_LABELS[p.category] ?? p.category}</p>
        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-accent transition-colors">{p.name}</h3>
        {meta && <p className="text-xs text-slate-500 mt-1 truncate">{meta}</p>}
        <p className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">Identification ID</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800" data-no-i18n>{p.identification_id}</span>
        </p>
      </div>
    </Link>
  );
}

export interface CompanyCardData {
  display_name: string;
  manufacturer_id?: string | null;
  country_code: string;
  website: string | null;
  product_count: number;
  logo_url?: string | null;
}

/** Manufacturer result card: logo tile, name, country, product count, MID. */
export function CompanyCard({ c }: { c: CompanyCardData }) {
  const href = c.manufacturer_id ? `/manufacturer/${encodeURIComponent(c.manufacturer_id)}` : `/search?q=${encodeURIComponent(c.display_name)}`;
  return (
    <Link href={href} className="group flex items-start gap-3.5 bg-white border border-slate-200 rounded-2xl p-4 transition-colors hover:border-slate-300">
      <CompanyLogo name={c.display_name} src={c.logo_url} size="md" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-accent transition-colors">{c.display_name}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">
          {[countryName(c.country_code), `${c.product_count} product${c.product_count === 1 ? "" : "s"}`, c.website ? prettyUrl(c.website) : null]
            .filter(Boolean)
            .join(" - ")}
        </p>
        {c.manufacturer_id && (
          <p className="mt-2 text-xs">
            <span className="text-slate-500">Manufacturer ID </span>
            <span className="font-mono tabular-nums font-semibold text-slate-800" data-no-i18n>{c.manufacturer_id}</span>
          </p>
        )}
      </div>
    </Link>
  );
}
