import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Accordion } from "@/components/marketing/Accordion";
import { SideNav } from "@/components/marketing/SideNav";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const faqs = [
  {
    section: "For Consumers",
    items: [
      {
        q: "What is an Identification ID?",
        a: "An Identification ID (IID) is a unique code printed on a product's packaging - like IID-4F9A-2K7Q. You enter it on this website to access the product page maintained by the manufacturer: manuals, warranty info, safety certificates, and manufacturer details.",
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
        a: "Create an account, set up your company profile, then register your products - upload PDF manuals and photos, and each product gets its unique Identification ID. Until July 1, 2027 your Manufacturer ID and first 3 products are free with no card needed; for more products choose a plan and complete the payment, then publish your product pages.",
      },
      {
        q: "What file formats are supported for documents?",
        a: "Currently PDF only, up to 20 MB per file. You can upload multiple documents per product - manuals, warranties, certificates, and more.",
      },
      {
        q: "Can I update product information after publishing?",
        a: "Yes. You can edit product details, upload new document versions, and add translations at any time without reprinting the packaging - the ID stays the same.",
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
        q: "How much does it cost?",
        a: "Registration is free until July 1, 2027: Manufacturer ID + 3 products, no card needed and no automatic charge. Manufacturers registered before July 1, 2027 stay in the registry permanently. After that, or for more products, the Manufacturer Registry Membership is $5/month or $49/year. It includes your permanent Manufacturer ID, public profile, manufacturer QR code, API visibility, basic analytics, and your first 3 Product IDs at no additional cost. For more products: Standard $3 per product / mo (billed in addition to the membership), Popular $29/mo (up to 100 products), Best Value $99/mo (up to 500), Enterprise $299/mo (individual) - these three include the membership. Product plans are annual subscriptions - see the Pricing page. Looking up and verifying products is always free for consumers.",
      },
      {
        q: "What happens if I don't renew my membership?",
        a: "Your Manufacturer ID is permanent and is never deleted, and your product pages and QR codes keep working. Your public profile is marked \"Registry status: Inactive\" with the month you were last active, and you can't add or edit products until you renew. See our Refund Policy for cancellations and refunds.",
      },
    ],
  },
  {
    section: "Security & Trust",
    items: [
      {
        q: "How is product information kept trustworthy?",
        a: "Every product page is tied to a registered manufacturer account and its unique Identification ID, and each page shows which company registered it. Product information is provided and maintained by the manufacturer; Identification ID does not certify it. If something looks wrong, use \"Report incorrect information\" on the page.",
      },
      {
        q: "Can anyone create a fake product page?",
        a: "Product pages can only be created from a registered manufacturer account with an active membership, and every Identification ID is tied to the company that registered it. Products in regulated categories are reviewed before they are published.",
      },
      {
        q: "Is my data safe?",
        a: "Yes. All data is encrypted in transit (HTTPS). Uploaded files are served only through long, random links that cannot be guessed, and admin access is protected with two-step verification.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <PageHeader
        eyebrow="Help"
        title="Frequently asked questions"
        description={
          <p>
            Can&apos;t find an answer?{" "}
            <Link href="/lookup" className="text-accent hover:underline underline-offset-4">Search for a product</Link>
            {" "}or{" "}
            <a href="mailto:support@identificationid.com" className="text-accent hover:underline underline-offset-4">contact us</a>.
          </p>
        }
      />

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-6 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
          <SideNav
            title="Topics"
            className="hidden lg:block"
            items={faqs.map((s) => ({ href: `#${slug(s.section)}`, label: s.section }))}
          />

          <div className="min-w-0 max-w-3xl space-y-14">
            {faqs.map((section) => (
              <section key={section.section} id={slug(section.section)} aria-labelledby={`${slug(section.section)}-h`} className="scroll-mt-24">
                <h2 id={`${slug(section.section)}-h`} className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 mb-5">
                  {section.section}
                </h2>
                <Accordion items={section.items} />
              </section>
            ))}

            <div className="rounded-2xl border border-slate-200 bg-surface p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
              <div>
                <p className="font-semibold text-slate-900">Still have questions?</p>
                <p className="mt-1 text-sm text-slate-600">We&apos;re happy to help manufacturers and consumers alike.</p>
              </div>
              <ButtonLink href="mailto:support@identificationid.com" variant="secondary">
                Email us
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
