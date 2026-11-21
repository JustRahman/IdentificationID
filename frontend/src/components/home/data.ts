/** Server-side data for the homepage. Real registry data only; empty on any error. */
import type { ProductData } from "@/components/ProductPageClient";

const API_BASE =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface FeaturedProduct {
  identification_id: string;
  name: string;
  category: string;
  brand: string | null;
  manufacturer: string;
  cover_image: string | null;
}

export interface RegistryCompany {
  display_name: string;
  manufacturer_id: string;
  country_code: string | null;
  website: string | null;
  product_count: number;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export async function getHomeData() {
  const [featured, companies] = await Promise.all([
    getJson<FeaturedProduct[]>("/public/featured?limit=8"),
    getJson<RegistryCompany[]>("/public/companies"),
  ]);
  const products = Array.isArray(featured) ? featured : [];
  // Hero preview: the first featured product that has a photo, else the first one.
  const pick = products.find((p) => p.cover_image) ?? products[0];
  const preview = pick ? await getJson<ProductData>(`/public/products/${encodeURIComponent(pick.identification_id)}`) : null;
  return {
    products,
    companies: Array.isArray(companies) ? companies : [],
    preview,
  };
}

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  try {
    return regionNames?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}
