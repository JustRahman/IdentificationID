import Link from "next/link";
import type { ProductData } from "@/components/ProductPageClient";
import { SearchBar } from "@/components/ui/SearchBar";
import { ProductPreviewCard } from "./ProductPreviewCard";
import { BRAND_GRADIENT_TEXT } from "./colors";

/** Section 1 - search-first hero on a soft color mesh, with a framed real product page. */
export function HomeHero({ preview, examples }: { preview: ProductData | null; examples: string[] }) {
  return (
    <section className="relative overflow-hidden isolate">
      {/* static gradient mesh (blurred blobs) + dotted pattern; pure CSS, no motion */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-b from-blue-50/80 via-white to-white" />
        <div className="absolute -top-40 -left-32 w-[560px] h-[560px] rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute -top-24 right-[-120px] w-[600px] h-[520px] rounded-full bg-violet-400/30 blur-3xl" />
        <div className="absolute top-[260px] left-[30%] w-[520px] h-[420px] rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute top-[620px] -left-24 w-[420px] h-[420px] rounded-full bg-teal-300/25 blur-3xl" />
        <div className="absolute top-[560px] right-[-80px] w-[460px] h-[460px] rounded-full bg-fuchsia-300/25 blur-3xl" />
        <div
          className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_10%,black,transparent)]"
          style={{
            backgroundImage: "radial-gradient(rgba(79,70,229,0.22) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-6 pt-14 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/founding-manufacturers"
            className="group inline-flex rounded-full p-px bg-linear-to-r from-blue-500 via-violet-500 to-teal-400 shadow-[0_6px_20px_-8px_rgba(124,58,237,0.55)]"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 pl-1.5 pr-3 py-1 text-sm text-slate-700 group-hover:bg-white transition-colors">
              <span className="hidden sm:inline rounded-full bg-linear-to-r from-blue-600 to-violet-600 text-white text-xs font-semibold px-2.5 py-0.5">
                Manufacturers
              </span>
              <span className="pl-1.5 sm:pl-0 font-medium">Free registration until July 1, 2027</span>
              <svg className="w-3.5 h-3.5 text-violet-500 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </span>
          </Link>

          <h1 className="mt-7 sm:-mx-24 text-[2.1rem] leading-[1.08] sm:text-[3.6rem] sm:leading-[1.05] font-semibold tracking-[-0.035em] text-slate-900 text-balance">
            <span className="sm:whitespace-nowrap">Every manufacturer. Every product.</span>{" "}
            <span className={`${BRAND_GRADIENT_TEXT} sm:block pb-1`}>One permanent ID.</span>
          </h1>

          <p className="mt-5 text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto text-pretty">
            Identification ID is a global encyclopedia of manufacturers and products. Look up any registered company or
            product by name or ID, with information published by the manufacturer.
          </p>

          {/* floating search card with a soft colored glow */}
          <div className="relative mt-9 max-w-2xl mx-auto text-left">
            <div aria-hidden="true" className="absolute -inset-3 sm:-inset-4 rounded-[28px] bg-linear-to-r from-blue-400/35 via-violet-400/35 to-teal-300/35 blur-2xl" />
            <div className="relative rounded-2xl border border-white/80 bg-white/75 backdrop-blur-md p-3 sm:p-4 shadow-[0_20px_50px_-24px_rgba(79,70,229,0.45)]">
              <SearchBar
                size="lg"
                examples={examples}
                exampleHint="IDs look like IID-XXXX-XXXX (product) or MID-XXXX-XXXX (manufacturer)."
                className={[
                  "[&_[role=tablist]]:flex [&_[role=tablist]]:w-fit [&_[role=tablist]]:mx-auto sm:[&_[role=tablist]]:mx-0",
                  // tinted example ID chips
                  "[&_button[data-no-i18n]]:bg-violet-50 [&_button[data-no-i18n]]:text-violet-700 [&_button[data-no-i18n]]:ring-1 [&_button[data-no-i18n]]:ring-inset [&_button[data-no-i18n]]:ring-violet-200",
                  "[&_button[data-no-i18n]:hover]:bg-violet-100 [&_button[data-no-i18n]:hover]:text-violet-800",
                  "[&_button[type=submit]]:bg-linear-to-r [&_button[type=submit]]:from-blue-600 [&_button[type=submit]]:to-violet-600 [&_button[type=submit]:hover]:from-blue-700 [&_button[type=submit]:hover]:to-violet-700",
                ].join(" ")}
              />
            </div>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 pb-6 sm:pb-10 mx-auto max-w-5xl">
          <ProductPreviewCard product={preview} />
        </div>
      </div>
    </section>
  );
}
