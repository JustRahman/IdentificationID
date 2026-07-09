import Link from "next/link";
import { COMPANY } from "@/lib/constants";

export const metadata = {
  title: "About — Identification ID",
  description: "Identification ID is developed and operated by Global Product Identification Inc.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold tracking-tight mb-4">About Identification ID</h1>
      <p className="text-lg text-muted leading-relaxed mb-8">
        Identification ID is developed and operated by <strong className="text-foreground">{COMPANY.legalName}</strong>,
        a Canadian technology company building digital identity infrastructure for physical products worldwide.
      </p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-2">What we do</h2>
          <p className="text-muted">
            We give every physical product a unique, verifiable digital identity — a single Identification ID that
            links to its official product page: descriptions, manuals, certificates, images, and manufacturer details.
            Consumers look up products instantly by ID or QR code; manufacturers manage a living digital passport
            without reprinting packaging.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">The platform</h2>
          <p className="text-muted">
            Identification ID combines a public product registry, QR passports, verified manufacturer data, and a
            developer API into one product-identity platform. It is designed for manufacturers, distributors,
            marketplaces, and the consumers who rely on trustworthy product information.
          </p>
        </section>

        <section className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold mb-3">Company</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex gap-2"><dt className="text-muted w-32 shrink-0">Legal entity</dt><dd className="font-medium">{COMPANY.legalName}</dd></div>
            <div className="flex gap-2"><dt className="text-muted w-32 shrink-0">Type</dt><dd>{COMPANY.entityType}</dd></div>
            <div className="flex gap-2"><dt className="text-muted w-32 shrink-0">Jurisdiction</dt><dd>{COMPANY.jurisdiction} 🇨🇦</dd></div>
            <div className="flex gap-2"><dt className="text-muted w-32 shrink-0">Product</dt><dd>Identification ID™</dd></div>
            <div className="flex gap-2"><dt className="text-muted w-32 shrink-0">Contact</dt><dd><a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline">{COMPANY.supportEmail}</a></dd></div>
          </dl>
        </section>

        <p className="text-muted">
          Ready to register your products?{" "}
          <Link href="/register" className="text-accent hover:underline">Get started</Link>{" "}
          or explore the{" "}
          <Link href="/api" className="text-accent hover:underline">developer API</Link>.
        </p>
      </div>
    </div>
  );
}
