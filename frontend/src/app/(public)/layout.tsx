"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { COMPANY, copyrightLine } from "@/lib/constants";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <Link href="/" className="text-lg font-semibold">
            Identification ID
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/lookup" className="text-muted hover:text-foreground">
              Lookup
            </Link>
            <Link href="/pricing" className="text-muted hover:text-foreground">
              Pricing
            </Link>
            <Link href="/faq" className="text-muted hover:text-foreground">
              FAQ
            </Link>
            <LanguageSwitcher />
            {user ? (
              <Link
                href="/dashboard"
                className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-muted hover:text-foreground">
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      <main>{children}</main>
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between text-sm text-muted flex-wrap gap-4">
            <span className="font-semibold text-foreground">Identification ID™</span>
            <div className="flex gap-5 flex-wrap">
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/search" className="hover:text-foreground">Search</Link>
              <Link href="/api" className="hover:text-foreground">API</Link>
              <Link href="/faq" className="hover:text-foreground">FAQ</Link>
              <Link href="/verification" className="hover:text-foreground">Verification</Link>
              <Link href="/about" className="hover:text-foreground">About</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-xs text-muted space-y-1">
            <p>Identification ID™ is a product of {COMPANY.legalName}</p>
            <p>{copyrightLine()} · {COMPANY.entityType} · {COMPANY.jurisdiction} 🇨🇦</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
