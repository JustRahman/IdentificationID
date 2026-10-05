import { notFound } from "next/navigation";
import { LegalDocPage } from "@/components/LegalDocPage";
import { LEGAL_DOCS, getDoc, getVersion } from "@/lib/legal";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_DOCS.flatMap((d) => d.versions.map((v) => ({ slug: d.slug, version: v.version })));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; version: string }> }) {
  const { slug, version } = await params;
  const doc = getDoc(slug);
  return { title: doc ? `${doc.title} (version ${version}) - Identification ID` : "Identification ID" };
}

export default async function LegalDocVersion({
  params,
}: {
  params: Promise<{ slug: string; version: string }>;
}) {
  const { slug, version } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  const v = getVersion(doc, version);
  if (!v) notFound();
  return <LegalDocPage doc={doc} version={v} />;
}
