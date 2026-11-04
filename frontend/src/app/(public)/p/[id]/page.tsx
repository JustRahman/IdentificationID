import type { Metadata } from "next";
import ProductPageClient, { type ProductData } from "@/components/ProductPageClient";
import { getPreview } from "@/lib/previews";
import { SITE_URL, clip, fetchProduct, productJsonLd } from "@/lib/seo";

type Params = { params: Promise<{ id: string }> };

async function load(id: string): Promise<ProductData | null> {
  const preview = getPreview(id);
  if (preview) return preview.data as ProductData;
  return fetchProduct(id);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const p = await load(id);
  if (!p) return { title: "Product not found | Identification ID", robots: { index: false } };
  const mid = p.company.manufacturer_id;
  const title = `${p.identification_id} - ${p.name} | Identification ID`;
  const description = clip(
    `Identification ID ${p.identification_id}: ${p.name} by ${p.company.display_name}` +
      (mid ? ` (Manufacturer ID ${mid})` : "") +
      `. ${p.translation?.short_description || ""}`,
  );
  const url = `${SITE_URL}/p/${p.identification_id}`;
  const image = [...p.images].sort((a, b) => a.display_order - b.display_order)[0]?.url;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: getPreview(id) ? { index: false, follow: false } : undefined,
    openGraph: { title, description, url, type: "website", siteName: "Identification ID", ...(image ? { images: [image] } : {}) },
  };
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  const data = await load(id);
  const jsonLd = data && !getPreview(id) ? productJsonLd(data) : null;
  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <ProductPageClient id={id} initialData={data} />
    </>
  );
}
