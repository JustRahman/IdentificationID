"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const NAV = [
  { href: "/search", label: "Registry" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/founding-manufacturers", label: "For manufacturers" },
  { href: "/pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

/** Slim sticky public header with desktop nav and a mobile menu. */
export function SiteHeader() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75 border-b transition-colors",
        scrolled || open ? "border-slate-200" : "border-transparent",
      )}
    >
      {/* colorful brand hairline (all pages) */}
      <div aria-hidden="true" className="h-0.5 bg-linear-to-r from-blue-600 via-violet-600 to-teal-500" />
      <div className="mx-auto max-w-6xl px-5 sm:px-6 h-16 flex items-center gap-8">
        <Logo />

        <nav aria-label="Main" className="hidden xl:flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "px-3 py-2 rounded-md transition-colors whitespace-nowrap",
                isActive(item.href) ? "text-slate-900 font-medium" : "text-slate-600 hover:text-slate-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-2 ml-auto">
          <LanguageSwitcher className="mr-1" />
          {!user && (
            <Link href="/login" className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Log in
            </Link>
          )}
          <ButtonLink href="/lookup" variant="secondary" size="sm" className="h-9">
            <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
              <path d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search ID
          </ButtonLink>
          {user ? (
            <ButtonLink href="/dashboard" size="sm" className="h-9">
              Dashboard
            </ButtonLink>
          ) : (
            <ButtonLink href="/register" size="sm" className="h-9">
              Register free
            </ButtonLink>
          )}
        </div>

        {/* Mobile */}
        <div className="flex xl:hidden items-center gap-2 ml-auto">
          <ButtonLink href="/lookup" variant="secondary" size="sm" aria-label="Search ID">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
              <path d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </ButtonLink>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3.5 6h13M3.5 10h13M3.5 14h13" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-menu" className="xl:hidden border-t border-slate-200 bg-white">
          <nav aria-label="Mobile" className="mx-auto max-w-6xl px-5 py-3 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "py-3 text-[15px] border-b border-slate-100",
                  isActive(item.href) ? "text-slate-900 font-medium" : "text-slate-700",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/lookup" className="py-3 text-[15px] text-slate-700 border-b border-slate-100">
              Search by ID
            </Link>
            {!user && (
              <Link href="/login" className="py-3 text-[15px] text-slate-700 border-b border-slate-100">
                Log in
              </Link>
            )}
            <div className="py-4 flex items-center justify-between gap-3">
              <LanguageSwitcher />
              {user ? (
                <ButtonLink href="/dashboard" size="md">
                  Dashboard
                </ButtonLink>
              ) : (
                <ButtonLink href="/register" size="md">
                  Register free
                </ButtonLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
