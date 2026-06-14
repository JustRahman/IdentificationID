"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/company", label: "Company Profile" },
  { href: "/products", label: "Products" },
  { href: "/billing", label: "Billing" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-surface text-foreground flex">
      <aside className="w-60 bg-background border-r border-border p-6 flex flex-col fixed h-full">
        <Link href="/" className="text-base font-semibold mb-8">
          Identification ID
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface"
            >
              {item.label}
            </Link>
          ))}
          {user.role === "admin" && (
            <Link
              href="/admin/companies"
              className="px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface"
            >
              Admin Panel
            </Link>
          )}
        </nav>
        <div className="mt-auto pt-4 border-t border-border space-y-3">
          <LanguageSwitcher />
          <p className="text-xs text-muted truncate">{user.email}</p>
          <button
            onClick={logout}
            className="text-sm text-muted hover:text-foreground"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-60 p-8">{children}</main>
    </div>
  );
}
