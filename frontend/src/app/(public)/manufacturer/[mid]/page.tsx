import type { Metadata } from "next";
import ManufacturerPageClient from "@/components/ManufacturerPageClient";
import { SITE_URL, clip, fetchManufacturer, manufacturerJsonLd } from "@/lib/seo";

type Params = { params: Promise<{ mid: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { mid } = await params;
  const m = await fetchManufacturer(mid);
  if (!m || !m.manufacturer_id) return { title: "Manufacturer not found | Identification ID", robots: { index: false } };
  const title = `${m.manufacturer_id} - ${m.display_name} | Identification ID`;
  const description = clip(
    `Manufacturer ID ${m.manufacturer_id}: ${m.display_name}` +
      (m.legal_name && m.legal_name !== m.display_name ? ` (${m.legal_name})` : "") +
      `, ${m.country_code}. ${m.product_count} registered product${m.product_count === 1 ? "" : "s"}. ${m.description || ""}`,
  );
  const url = `${SITE_URL}/manufacturer/${m.manufacturer_id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "Identification ID", ...(m.logo_url ? { images: [m.logo_url] } : {}) },
  };
}

export default async function ManufacturerPage({ params }: Params) {
  const { mid } = await params;
  const data = await fetchManufacturer(mid);
  const jsonLd = data?.manufacturer_id ? manufacturerJsonLd(data) : null;
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ManufacturerPageClient mid={mid} initialData={data} />
    </>
  );
}
