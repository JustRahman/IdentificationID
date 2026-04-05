"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

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
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-muted">
          <span className="font-semibold text-foreground">Identification ID</span>
          <p>Digital passport for every product</p>
        </div>
      </footer>
    </div>
  );
}
