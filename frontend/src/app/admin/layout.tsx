"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { AppSidebarShell, SidebarAccount, type SidebarItem } from "@/components/app/AppSidebar";
import { AppIcon } from "@/components/app/icons";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const adminNavItems: SidebarItem[] = [
  { href: "/admin/companies", label: "Companies", icon: "building" },
  { href: "/admin/products", label: "Products", icon: "box" },
  { href: "/admin/payments", label: "Payments", icon: "card" },
  { href: "/admin/reports", label: "Reports", icon: "flag" },
  { href: "/admin/do-not-contact", label: "Do not contact", icon: "ban" },
  { href: "/admin/audit", label: "Audit trail", icon: "list" },
  { href: "/admin/security", label: "Security", icon: "lock" },
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
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <AppSidebarShell
      items={adminNavItems}
      sectionLabel="Admin Panel"
      badge={<span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 ring-1 ring-slate-200 rounded px-1.5 py-0.5">Admin</span>}
      footer={
        <SidebarAccount
          email={user.email}
          extra={
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
              <AppIcon name="back" /> Back to dashboard
            </Link>
          }
        />
      }
    >
      {children}
    </AppSidebarShell>
  );
}
