"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowRight } from "@/components/ui/Button";
import { Eyebrow } from "./Eyebrow";

const FAQ = [
  {
    q: "What is an Identification ID?",
    a: "An Identification ID (IID) is a permanent code for one product, in the format IID-XXXX-XXXX. It is printed on the packaging or label, often with a QR code. Enter it here to open the product page maintained by the manufacturer: specifications, manuals, warranty and safety information, and manufacturer details.",
  },
  {
    q: "Is it free for buyers and consumers?",
    a: "Yes. Looking up products and manufacturers is free. No registration, no app and no account needed.",
  },
  {
    q: "What does free registration include?",
    a: "A permanent Manufacturer ID, a public company page and 3 products with Identification IDs and QR codes, free until July 1, 2027. No card is needed and there is no automatic charge. Manufacturers registered before July 1, 2027 stay in the registry permanently.",
  },
  {
    q: "Who publishes the information on a page?",
    a: "The manufacturer. Every page is tied to a registered manufacturer account and shows which company registered it. Identification ID confirms registration and does not certify the product. If something looks wrong, use the report link on the page.",
  },
  {
    q: "Can manufacturers update a page after publishing?",
    a: "Yes. Details, documents and translations can be edited at any time without reprinting packaging - the ID stays the same.",
  },
];

/** Section 5 - short FAQ + final call to action on a vivid gradient panel. */
export function FaqAndCta() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const v = email.trim();
    if (!v) return;
    setSubmitted(true);
    router.push(`/register?email=${encodeURIComponent(v)}`);
  }

  return (
    <>
      <section id="faq" className="py-20 sm:py-24 bg-white scroll-mt-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
          <div>
          <Eyebrow tone="sky">FAQ</Eyebrow>
          <SectionHeader
            title="Questions,"
            muted="answered."
            description={
              <>
                More in the{" "}
                <Link href="/faq" className="text-accent hover:underline underline-offset-4">
                  full FAQ
                </Link>{" "}
                or email{" "}
                <a href="mailto:support@identificationid.com" className="text-accent hover:underline underline-offset-4">
                  support@identificationid.com
                </a>
                .
              </>
            }
            className="mb-0"
          />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.25)]">
            {FAQ.map((f, i) => (
              <details key={f.q} className="group px-5 sm:px-6 open:bg-linear-to-r open:from-blue-50/60 open:to-violet-50/40 first:rounded-t-2xl last:rounded-b-2xl" open={i === 0}>
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer text-[15px] font-medium text-slate-900">
                  {f.q}
                  <span className="w-7 h-7 shrink-0 rounded-full bg-violet-50 ring-1 ring-inset ring-violet-200 flex items-center justify-center group-open:bg-violet-600 group-open:ring-violet-600 transition-colors" aria-hidden="true">
                  <svg className="w-3.5 h-3.5 text-violet-700 group-open:text-white transition-transform group-open:rotate-45" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                  </span>
                </summary>
                <p className="pb-5 -mt-1 text-sm text-slate-600 leading-relaxed max-w-2xl">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24 bg-white">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 via-violet-600 to-fuchsia-600 px-6 py-14 sm:px-14 sm:py-16 shadow-[0_30px_70px_-30px_rgba(124,58,237,0.7)]">
          {/* decorative glow circles + dot pattern */}
          <div aria-hidden="true" className="pointer-events-none absolute -z-10 hidden sm:block -bottom-36 left-[20%] w-72 h-72 rounded-full bg-cyan-300/25 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -z-10 -bottom-28 right-[10%] w-96 h-96 rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -z-10 top-[-60px] right-[-60px] w-56 h-56 rounded-full border-[28px] border-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -z-10 bottom-[-40px] left-[38%] w-32 h-32 rounded-full border-[18px] border-white/10" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_60%_80%_at_80%_20%,black,transparent)]"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-[1.1] text-balance">
                Put your company in the global registry.{" "}
                <span className="text-cyan-100">Free until July 1, 2027.</span>
              </h2>
              <p className="mt-4 text-white/90 leading-relaxed">
                Get your Manufacturer ID and your first 3 product pages. No card needed, no automatic charge.
              </p>
            </div>
            <div>
              {submitted ? (
                <p className="text-white font-medium">Redirecting to registration...</p>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-1.5 rounded-2xl bg-white/15 ring-1 ring-white/30 p-2 backdrop-blur-sm">
                  <label htmlFor="cta-email" className="sr-only">
                    Work email
                  </label>
                  <input
                    id="cta-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="flex-1 min-w-0 h-12 rounded-xl border border-white bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    className="h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-amber-300 to-orange-300 px-5 text-[15px] font-semibold text-slate-900 hover:from-amber-200 hover:to-orange-200 transition-colors focus-visible:outline-white shadow-[0_8px_20px_-8px_rgba(251,146,60,0.8)]"
                  >
                    Register free <ArrowRight />
                  </button>
                </form>
              )}
              <p className="mt-3 text-sm text-white/85">
                Already registered?{" "}
                <Link href="/login" className="text-white font-semibold underline underline-offset-4 decoration-white/50 hover:decoration-white">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>
    </>
  );
}
