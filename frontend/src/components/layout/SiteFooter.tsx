"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY, copyrightLine } from "@/lib/constants";
import { Logo } from "./Logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Registry",
    links: [
      { href: "/search", label: "Search products" },
      { href: "/lookup", label: "Look up an ID" },
      { href: "/verification", label: "Verification" },
      { href: "/api", label: "API" },
    ],
  },
  {
    title: "Manufacturers",
    links: [
      { href: "/founding-manufacturers", label: "Free registration" },
      { href: "/register", label: "Register your company" },
      { href: "/pricing", label: "Pricing" },
      { href: "/login", label: "Log in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/faq", label: "FAQ" },
      { href: `mailto:${COMPANY.supportEmail}`, label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal", label: "Legal & Trust Center" },
      { href: "/legal/terms", label: "Terms & Manufacturer Agreement" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/refund", label: "Refund Policy" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

/** Calm public footer: columns, legal entity line, report link. */
export function SiteFooter() {
  const pathname = usePathname();
  const reportHref = `mailto:${COMPANY.supportEmail}?subject=${encodeURIComponent("Report a problem on a page")}&body=${encodeURIComponent(
    `Page: https://identificationid.com${pathname}\n\nWhat is wrong:\n`,
  )}`;

  return (
    <footer className="mt-auto border-t border-slate-200 bg-surface">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-10">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-xs">
              A global encyclopedia of manufacturers and products. Permanent Manufacturer IDs and Identification IDs,
              with information published by the manufacturer.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h2 className="text-xs font-semibold text-slate-900 mb-3">{col.title}</h2>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith("mailto:") ? (
                      <a href={l.href} className="text-slate-600 hover:text-slate-900 transition-colors">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-slate-600 hover:text-slate-900 transition-colors">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-sm text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
          <svg className="w-4 h-4 text-slate-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 14V2.5M3 2.5h8.5l-1.75 3 1.75 3H3" />
          </svg>
          <span>Something wrong on this page?</span>
          <a href={reportHref} className="font-medium text-accent hover:underline underline-offset-4">
            Report it
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p>
            Identification ID&trade; is a product of {COMPANY.legalName} - {COMPANY.entityType}.
          </p>
          <p>{copyrightLine()}</p>
        </div>
      </div>
    </footer>
  );
}
