"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    section: "For Consumers",
    items: [
      {
        q: "What is an Identification ID?",
        a: "An Identification ID (IID) is a unique code printed on a product's packaging — like IID-4F9A-2K7Q. You enter it on this website to instantly access the official product page: manuals, warranty info, safety certificates, and manufacturer details.",
      },
      {
        q: "Where do I find the ID on my product?",
        a: "It's usually printed on the box, label, or the product itself. It always starts with IID- followed by two groups of 4 characters, for example IID-4F9A-2K7Q.",
      },
      {
        q: "Is this free to use for consumers?",
        a: "Yes, completely free. No registration, no app, no account needed. Just enter the ID and get the information.",
      },
      {
        q: "What information can I find on a product page?",
        a: "Product name, brand, category, country of origin, manufacturer contact details, downloadable PDF manuals, warranty documents, safety certificates, and usage instructions.",
      },
      {
        q: "Can I search by product name instead of ID?",
        a: "Yes. Use the search bar on the homepage or search page to find products by name, brand, or manufacturer. The ID lookup just takes you directly to a specific product.",
      },
      {
        q: "What if the product is not found?",
        a: "The manufacturer may not have registered this product yet, or the ID was entered incorrectly. Check the ID on your packaging and try again. If it still doesn't work, the product may not be in our system.",
      },
    ],
  },
  {
    section: "For Manufacturers",
    items: [
      {
        q: "How do I register my products?",
        a: "Create an account, set up your company profile, and submit it for verification. Once verified, you can register products, upload PDF manuals, and publish them with a unique Identification ID.",
      },
      {
        q: "How long does company verification take?",
        a: "Typically 1–2 business days. You'll receive an email once your company is approved or if we need more information.",
      },
      {
        q: "What file formats are supported for documents?",
        a: "Currently PDF only, up to 20 MB per file. You can upload multiple documents per product — manuals, warranties, certificates, and more.",
      },
      {
        q: "Can I update product information after publishing?",
        a: "Yes. You can edit product details, upload new document versions, and add translations at any time without reprinting the packaging — the ID stays the same.",
      },
      {
        q: "How do I put the Identification ID on my packaging?",
        a: "You can find your product's QR code in the product Details tab. Print the ID (e.g. IID-4F9A-2K7Q) and/or the QR code on your packaging, label, or in the documentation. Customers scan or type it to reach the product page.",
      },
      {
        q: "Can I add product descriptions in multiple languages?",
        a: "Yes. Go to the Description tab in the product editor, select a language, enter your content, and use auto-translate to generate an English version automatically.",
      },
      {
        q: "Is there a free plan?",
        a: "Yes. The free plan includes your first 10 products. For more products you can upgrade to a Starter or Pro plan — see the Pricing page.",
      },
      {
        q: "What happens if I don't renew my subscription?",
        a: "Your products remain publicly accessible. You just won't be able to register new products or update existing ones until you renew.",
      },
    ],
  },
  {
    section: "Security & Trust",
    items: [
      {
        q: "How do you verify manufacturers?",
        a: "We manually review each company registration before approving it. Only verified manufacturers can publish products, which prevents fake or unverified product pages.",
      },
      {
        q: "Can anyone create a fake product page?",
        a: "No. Only verified, approved manufacturers can publish product pages. Each Identification ID is uniquely tied to a verified company.",
      },
      {
        q: "Is my data safe?",
        a: "Yes. All data is encrypted in transit (HTTPS) and at rest. File storage uses signed URLs that expire — files are not publicly accessible without a valid link.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium pr-4">{q}</span>
        <svg
          className={`w-4 h-4 text-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 border-t border-border bg-surface">
          <p className="text-sm text-muted leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <h1 className="text-3xl font-semibold mb-2 text-center">Frequently Asked Questions</h1>
      <p className="text-muted text-center text-sm mb-12">
        Can't find an answer?{" "}
        <Link href="/lookup" className="text-accent hover:underline">Search for a product</Link>
        {" "}or{" "}
        <a href="mailto:support@identificationid.com" className="text-accent hover:underline">contact us</a>.
      </p>

      <div className="space-y-10">
        {faqs.map((section) => (
          <div key={section.section}>
            <h2 className="text-base font-semibold text-muted uppercase tracking-wide mb-4">
              {section.section}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center p-6 bg-surface border border-border rounded-xl">
        <p className="text-sm font-medium mb-1">Still have questions?</p>
        <p className="text-sm text-muted mb-4">We're happy to help manufacturers and consumers alike.</p>
        <a
          href="mailto:support@identificationid.com"
          className="inline-block bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover"
        >
          Email us
        </a>
      </div>
    </div>
  );
}
