"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const adminNavItems = [
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/payments", label: "Payments" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-surface text-foreground flex">
      <aside className="w-60 bg-background border-r border-border p-6 flex flex-col fixed h-full">
        <Link href="/admin/companies" className="text-base font-semibold mb-1">
          Admin Panel
        </Link>
        <p className="text-xs text-muted mb-8">Identification ID</p>
        <nav className="flex flex-col gap-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2.5 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-4 border-t border-border space-y-3">
          <LanguageSwitcher />
          <Link href="/dashboard" className="block text-sm text-muted hover:text-foreground">
            Back to dashboard
          </Link>
        </div>
      </aside>
      <main className="flex-1 ml-60 p-8">{children}</main>
    </div>
  );
}
