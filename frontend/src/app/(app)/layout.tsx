"use client";

import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { monthYear } from "@/components/ManufacturerProfileView";
import { MembershipProvider, useMembership } from "@/lib/membership";
import { AgreementBanner } from "@/components/AgreementBanner";
import { Logo } from "@/components/layout/Logo";
import { AppSidebarShell, SidebarAccount, type SidebarItem } from "@/components/app/AppSidebar";
import { Notice } from "@/components/app/Notice";
import { ButtonLink, ArrowRight } from "@/components/ui";

const navItems: SidebarItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/company", label: "Company Profile", icon: "building" },
  { href: "/products", label: "Products", icon: "box" },
  { href: "/billing", label: "Billing", icon: "card" },
  { href: "/api-keys", label: "API Access", icon: "key" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) return <FullScreenLoading />;
  if (!user) return null;

  return (
    <MembershipProvider enabled={user.role === "manufacturer"}>
      <AppShell>{children}</AppShell>
    </MembershipProvider>
  );
}

function FullScreenLoading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        Loading...
      </div>
    </div>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { loaded, needsOnboarding, lapsed, registry } = useMembership();
  const router = useRouter();
  const pathname = usePathname();
  const onboarding = pathname.startsWith("/onboarding");

  // New manufacturers finish profile → preview → payment before the dashboard.
  useEffect(() => {
    if (loaded && needsOnboarding && !onboarding) router.replace("/onboarding");
  }, [loaded, needsOnboarding, onboarding, router]);

  if (!loaded || (needsOnboarding && !onboarding)) return <FullScreenLoading />;
  if (!user) return null;

  if (onboarding) {
    return (
      <div className="min-h-screen bg-surface text-foreground">
        <header className="bg-white border-b border-slate-200">
          <div className="flex items-center justify-between px-5 sm:px-6 h-16 max-w-4xl mx-auto">
            <Logo />
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button onClick={logout} className="text-sm text-slate-500 hover:text-slate-900">
                Log out
              </button>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-5 sm:px-6 py-10 pb-16">{children}</main>
      </div>
    );
  }

  return (
    <AppSidebarShell
      items={navItems}
      sectionLabel="Manufacturer"
      extraItems={user.role === "admin" ? [{ href: "/admin/companies", label: "Admin Panel", icon: "shield" }] : undefined}
      footer={<SidebarAccount email={user.email} onLogout={logout} />}
    >
      {lapsed && (
        <Notice
          tone="warning"
          title="Registry status: Inactive"
          className="mb-6"
          action={
            <ButtonLink href="/onboarding?step=activate" size="sm">
              Renew membership <ArrowRight />
            </ButtonLink>
          }
        >
          {registry?.last_active ? `Last active: ${monthYear(registry.last_active)}. ` : ""}
          Your Manufacturer ID, product pages and QR codes still work, but you can&apos;t
          add or edit products until you renew your membership.
        </Notice>
      )}
      {registry && <AgreementBanner />}
      {children}
    </AppSidebarShell>
  );
}
