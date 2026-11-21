import Link from "next/link";
import { COMPANY } from "@/lib/constants";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { FactList } from "@/components/ui/FactList";
import { PageHeader } from "@/components/marketing/PageHeader";

export const metadata = {
  title: "About - Identification ID",
  description: "Identification ID is developed and operated by Global Product Identification Inc.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="About Identification ID"
        description={
          <p>
            Identification ID is developed and operated by{" "}
            <strong className="font-semibold text-slate-900">{COMPANY.legalName}</strong>, a Canadian technology company
            building digital identity infrastructure for physical products worldwide.
          </p>
        }
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="max-w-prose space-y-12">
            <section>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">What we do</h2>
              <p className="mt-4 text-base text-slate-700 leading-relaxed">
                We give every registered product a persistent digital identity - a single Identification ID that
                links to its manufacturer-maintained product page: descriptions, manuals, certificates, images, and manufacturer details.
                Consumers look up products instantly by ID or QR code; manufacturers manage a living digital passport
                without reprinting packaging.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">The platform</h2>
              <p className="mt-4 text-base text-slate-700 leading-relaxed">
                Identification ID combines a public product registry, QR passports, manufacturer-provided data, and a
                developer API into one product-identity platform. It is designed for manufacturers, distributors,
                marketplaces, and the consumers who rely on trustworthy product information.
              </p>
            </section>

            <section className="border-t border-slate-200 pt-10">
              <h2 className="text-lg font-semibold text-slate-900">Learn more</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  { href: "/verification", t: "How verification works", d: "What each manufacturer level checks." },
                  { href: "/legal", t: "Legal & Trust Center", d: "Who we are, documents and policies." },
                  { href: "/api", t: "Developer API", d: "Read the registry from your own tools." },
                  { href: "/faq", t: "FAQ", d: "Answers for consumers and manufacturers." },
                ].map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="group block rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300"
                    >
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                        {l.t}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <span className="mt-1 block text-sm text-slate-500">{l.d}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white">
              <h2 className="px-5 pt-5 text-sm font-semibold text-slate-900">Company</h2>
              <div className="px-5 pb-2">
                <FactList
                  items={[
                    { label: "Legal entity", value: COMPANY.legalName },
                    { label: "Type", value: COMPANY.entityType },
                    { label: "Jurisdiction", value: COMPANY.jurisdiction },
                    { label: "Product", value: "Identification ID™" },
                    {
                      label: "Contact",
                      value: (
                        <a href={`mailto:${COMPANY.supportEmail}`} className="text-accent hover:underline underline-offset-4">
                          {COMPANY.supportEmail}
                        </a>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-surface p-5">
              <p className="text-sm text-slate-700">Ready to register your products?</p>
              <div className="mt-4 flex flex-col gap-2">
                <ButtonLink href="/register">
                  Get started <ArrowRight />
                </ButtonLink>
                <ButtonLink href="/api" variant="secondary">
                  Explore the developer API
                </ButtonLink>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
