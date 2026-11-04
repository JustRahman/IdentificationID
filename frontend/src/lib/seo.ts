/** Server-side helpers for public pages: data fetching, canonical URLs, structured data. */
import type { ManufacturerProfile } from "@/types";
import type { ProductData } from "@/components/ProductPageClient";

export const SITE_URL = "https://identificationid.com";
export const API_BASE =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

export const fetchProduct = (id: string) =>
  getJson<ProductData>(`/public/products/${encodeURIComponent(id)}`);

export const fetchManufacturer = (mid: string) =>
  getJson<ManufacturerProfile>(`/public/manufacturers/${encodeURIComponent(mid)}`);

export const fetchSitemapEntries = () =>
  getJson<{ products: { id: string; updated: string | null }[]; manufacturers: { id: string; updated: string | null }[] }>(
    "/public/sitemap",
  );

export function clip(text: string | null | undefined, max = 155): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
}

/** schema.org Product with its Identification ID and manufacturer (with Manufacturer ID). */
export function productJsonLd(p: ProductData) {
  const url = `${SITE_URL}/p/${p.identification_id}`;
  const mid = p.company.manufacturer_id;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": url,
    url,
    name: p.name,
    productID: p.identification_id,
    identifier: [{ "@type": "PropertyValue", propertyID: "Identification ID", value: p.identification_id }],
    ...(p.model ? { model: p.model, mpn: p.model } : {}),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    category: p.category,
    description: clip(p.translation?.short_description || p.translation?.full_description, 500) || undefined,
    image: [...p.images].sort((a, b) => a.display_order - b.display_order).map((i) => i.url),
    ...(p.country_of_origin ? { countryOfOrigin: p.country_of_origin } : {}),
    manufacturer: {
      "@type": "Organization",
      name: p.company.display_name,
      ...(mid
        ? {
            "@id": `${SITE_URL}/manufacturer/${mid}`,
            url: `${SITE_URL}/manufacturer/${mid}`,
            identifier: { "@type": "PropertyValue", propertyID: "Manufacturer ID", value: mid },
          }
        : {}),
      ...(p.company.website ? { sameAs: [p.company.website] } : {}),
    },
  };
}

/** schema.org Organization for a manufacturer, with its Manufacturer ID and products. */
export function manufacturerJsonLd(m: ManufacturerProfile) {
  const url = `${SITE_URL}/manufacturer/${m.manufacturer_id}`;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": url,
    url,
    name: m.display_name,
    ...(m.legal_name ? { legalName: m.legal_name } : {}),
    identifier: { "@type": "PropertyValue", propertyID: "Manufacturer ID", value: m.manufacturer_id },
    ...(m.description ? { description: clip(m.description, 500) } : {}),
    ...(m.logo_url ? { logo: m.logo_url } : {}),
    ...(m.website ? { sameAs: [m.website] } : {}),
    ...(m.support_email ? { email: m.support_email } : {}),
    address: { "@type": "PostalAddress", addressCountry: m.country_code },
    ...(m.brands?.length ? { brand: m.brands.map((b) => ({ "@type": "Brand", name: b })) } : {}),
    ...(m.products?.length
      ? {
          makesOffer: m.products.map((p) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Product",
              name: p.name,
              productID: p.identification_id,
              url: `${SITE_URL}/p/${p.identification_id}`,
            },
          })),
        }
      : {}),
  };
}
