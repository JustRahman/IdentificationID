import Link from "next/link";
import { CATEGORY_LABELS } from "@/lib/constants";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductImage } from "@/components/ui/ProductImage";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { countryName, type FeaturedProduct, type RegistryCompany } from "./data";
import { TONES, categoryTone, nameTone } from "./colors";
import { Eyebrow } from "./Eyebrow";

/** Show a total count only once it is meaningful (avoid "1 manufacturer"). */
const COUNT_THRESHOLD = 10;

/** Section 3 - real companies and products from the public API. Never fake data. */
export function RegistryShowcase({ products, companies }: { products: FeaturedProduct[]; companies: RegistryCompany[] }) {
  const hasAny = products.length > 0 || companies.length > 0;
  const shownProducts = products.slice(0, 4);
  const shownCompanies = companies.slice(0, 6);

  return (
    <section id="registry" className="py-20 sm:py-24 bg-white scroll-mt-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <Eyebrow tone="emerald">In the registry</Eyebrow>
        <SectionHeader
          title="Registered manufacturers and products."
          muted={companies.length >= COUNT_THRESHOLD ? `${companies.length} companies so far.` : "Added as they join."}
          action={
            hasAny ? (
              <ButtonLink href="/search" variant="secondary">
                Browse the registry <ArrowRight />
              </ButtonLink>
            ) : undefined
          }
        />

        {!hasAny && (
          <EmptyState
            icon="building"
            title="The registry opened in 2026"
            description="The first manufacturers are registering now. Register before July 1, 2027 and your company is listed free, permanently."
            action={<ButtonLink href="/register">Register your company</ButtonLink>}
          />
        )}

        {shownProducts.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Products</h3>
            <ul className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
              {shownProducts.map((p) => {
                const t = TONES[categoryTone(p.category)];
                return (
                <li key={p.identification_id}>
                  {/* gradient border appears on hover */}
                  <Link
                    href={`/p/${p.identification_id}`}
                    className="group block h-full rounded-2xl p-px bg-slate-200 hover:bg-linear-to-br hover:from-blue-500 hover:via-violet-500 hover:to-teal-400 hover:shadow-[0_18px_40px_-20px_rgba(79,70,229,0.5)] transition-shadow"
                  >
                    <div className="h-full rounded-[15px] bg-white overflow-hidden">
                    <div aria-hidden="true" className={cn("h-1 bg-linear-to-r", t.bar)} />
                    <div className="aspect-[4/3] bg-slate-50 border-b border-slate-200 overflow-hidden">
                      <ProductImage
                        src={p.cover_image}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      {CATEGORY_LABELS[p.category] && (
                        <span className={cn("inline-flex max-w-full truncate rounded-full px-2 py-0.5 text-[11px] font-medium mb-2", t.chip)}>
                          {CATEGORY_LABELS[p.category]}
                        </span>
                      )}
                      <p className="text-xs text-slate-500 truncate">{p.brand || p.manufacturer}</p>
                      <p className="mt-0.5 font-medium text-slate-900 truncate group-hover:text-accent transition-colors">{p.name}</p>
                      <p className={cn("mt-2 text-xs font-mono tabular-nums font-semibold", t.text)} data-no-i18n>{p.identification_id}</p>
                    </div>
                    </div>
                  </Link>
                </li>
                );
              })}
            </ul>
          </div>
        )}

        {shownCompanies.length > 0 && (
          <div className={shownProducts.length > 0 ? "mt-12" : ""}>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Manufacturers</h3>
            <ul className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200 overflow-hidden shadow-[0_10px_30px_-20px_rgba(15,23,42,0.25)]">
              {shownCompanies.map((c) => (
                <li key={c.manufacturer_id}>
                  <Link
                    href={`/manufacturer/${c.manufacturer_id}`}
                    className="group grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_1fr_auto_auto] items-center gap-x-4 gap-y-1 px-4 sm:px-5 py-4 hover:bg-linear-to-r hover:from-blue-50/70 hover:to-violet-50/70 transition-colors"
                  >
                    <span className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold", TONES[nameTone(c.display_name)].icon)} aria-hidden="true">
                      {c.display_name.trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-900 truncate group-hover:text-accent transition-colors">{c.display_name}</span>
                      <span className="block text-sm text-slate-500 truncate">
                        {countryName(c.country_code) ?? "Country not provided"}
                        {" - "}
                        {c.product_count} product{c.product_count === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="hidden sm:block rounded-md bg-slate-50 ring-1 ring-inset ring-slate-200 px-2 py-0.5 text-sm font-mono tabular-nums font-semibold text-slate-700" data-no-i18n>
                      {c.manufacturer_id}
                    </span>
                    <svg className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
