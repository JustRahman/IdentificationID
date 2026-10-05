import { notFound } from "next/navigation";
import { LegalDocPage } from "@/components/LegalDocPage";
import { LEGAL_DOCS, assertAcceptanceHashes, getDoc, getVersion } from "@/lib/legal";

export const dynamicParams = false;

export function generateStaticParams() {
  assertAcceptanceHashes();
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  return { title: doc ? `${doc.title} - Identification ID` : "Identification ID" };
}

export default async function LegalDocCurrent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  const version = getVersion(doc, doc.current);
  if (!version) notFound();
  return <LegalDocPage doc={doc} version={version} />;
}
