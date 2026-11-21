import Link from "next/link";
import type { ProductData } from "@/components/ProductPageClient";
import { SearchBar } from "@/components/ui/SearchBar";
import { ProductPreviewCard } from "./ProductPreviewCard";

/** Section 1 - search-first hero (GS1) with a framed real product page (Attio/Stripe). */
export function HomeHero({ preview, examples }: { preview: ProductData | null; examples: string[] }) {
  return (
    <section className="relative overflow-hidden">
      {/* calm background: faint grid fading out + soft blue wash */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(ellipse_70%_55%_at_50%_0%,black,transparent)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div className="absolute left-1/2 top-[-240px] -translate-x-1/2 w-[1100px] h-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(37,99,235,0.10),transparent)]" />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-6 pt-14 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/founding-manufacturers"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white pl-1.5 pr-3 py-1 text-sm text-slate-700 shadow-xs hover:border-slate-300 transition-colors"
          >
            <span className="hidden sm:inline rounded-full bg-blue-50 text-accent text-xs font-medium px-2 py-0.5">Manufacturers</span>
            <span className="pl-1.5 sm:pl-0">Free registration until July 1, 2027</span>
            <svg className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </Link>

          <h1 className="mt-7 sm:-mx-24 text-[2.1rem] leading-[1.08] sm:text-[3.6rem] sm:leading-[1.03] font-semibold tracking-[-0.035em] text-slate-900 text-balance">
            <span className="sm:whitespace-nowrap">Every manufacturer. Every product.</span>{" "}
            <span className="text-slate-400 sm:block">One permanent ID.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto text-pretty">
            Identification ID is a global encyclopedia of manufacturers and products. Look up any registered company or
            product by name or ID, with information published by the manufacturer.
          </p>

          <div className="mt-9 max-w-2xl mx-auto text-left">
            <SearchBar
              size="lg"
              examples={examples}
              exampleHint="IDs look like IID-XXXX-XXXX (product) or MID-XXXX-XXXX (manufacturer)."
              className="[&_[role=tablist]]:flex [&_[role=tablist]]:w-fit [&_[role=tablist]]:mx-auto sm:[&_[role=tablist]]:mx-0"
            />
          </div>
        </div>

        <div className="mt-14 sm:mt-16 pb-4 sm:pb-6 mx-auto max-w-5xl">
          <ProductPreviewCard product={preview} />
        </div>
      </div>
    </section>
  );
}
