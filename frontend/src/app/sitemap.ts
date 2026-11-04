import type { MetadataRoute } from "next";
import { SITE_URL, fetchSitemapEntries } from "@/lib/seo";
import { LEGAL_DOCS } from "@/lib/legal";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = ["", "/founding-manufacturers", "/pricing", "/search", "/lookup", "/about", "/faq", "/verification", "/api", "/legal"].map(
    (path) => ({ url: `${SITE_URL}${path}`, lastModified: now }),
  );
  const legal = LEGAL_DOCS.map((d) => ({ url: `${SITE_URL}/legal/${d.slug}`, lastModified: now }));
  const entries = await fetchSitemapEntries();
  const manufacturers = (entries?.manufacturers ?? []).map((m) => ({
    url: `${SITE_URL}/manufacturer/${m.id}`,
    lastModified: m.updated ? new Date(m.updated) : now,
  }));
  const products = (entries?.products ?? []).map((p) => ({
    url: `${SITE_URL}/p/${p.id}`,
    lastModified: p.updated ? new Date(p.updated) : now,
  }));
  return [...staticPages, ...legal, ...manufacturers, ...products];
}
