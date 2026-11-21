"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowRight } from "@/components/ui/Button";

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

/** Section 5 - short FAQ + final call to action (the one navy band on the page). */
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
      <section id="faq" className="py-20 sm:py-24 bg-surface border-t border-slate-200 scroll-mt-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
          <SectionHeader
            eyebrow="FAQ"
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
          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200">
            {FAQ.map((f, i) => (
              <details key={f.q} className="group px-5 sm:px-6" open={i === 0}>
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer text-[15px] font-medium text-slate-900">
                  {f.q}
                  <svg className="w-4 h-4 shrink-0 text-slate-400 transition-transform group-open:rotate-45" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
                    <path d="M8 3v10M3 8h10" />
                  </svg>
                </summary>
                <p className="pb-5 -mt-1 text-sm text-slate-600 leading-relaxed max-w-2xl">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24 bg-surface">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-14 sm:px-14 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.07] [mask-image:radial-gradient(ellipse_60%_80%_at_80%_20%,black,transparent)]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-[1.1] text-balance">
                Put your company in the global registry.{" "}
                <span className="text-slate-400">Free until July 1, 2027.</span>
              </h2>
              <p className="mt-4 text-slate-300 leading-relaxed">
                Get your Manufacturer ID and your first 3 product pages. No card needed, no automatic charge.
              </p>
            </div>
            <div>
              {submitted ? (
                <p className="text-white font-medium">Redirecting to registration...</p>
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
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
                    className="flex-1 min-w-0 h-12 rounded-lg border border-white/15 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 text-[15px] font-medium text-white hover:bg-accent-hover transition-colors focus-visible:outline-white"
                  >
                    Register free <ArrowRight />
                  </button>
                </form>
              )}
              <p className="mt-3 text-sm text-slate-400">
                Already registered?{" "}
                <Link href="/login" className="text-white hover:underline underline-offset-4">
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
