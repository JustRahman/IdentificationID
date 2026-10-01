"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { monthYear } from "@/components/ManufacturerProfileView";
import { MembershipProvider, useMembership } from "@/lib/membership";
import { AgreementBanner } from "@/components/AgreementBanner";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/company", label: "Company Profile" },
  { href: "/products", label: "Products" },
  { href: "/billing", label: "Billing" },
  { href: "/api-keys", label: "API Access" },
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
      <p className="text-sm text-muted">Loading...</p>
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
        <header className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
          <Link href="/" className="text-base font-semibold">Identification ID</Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button onClick={logout} className="text-sm text-muted hover:text-foreground">
              Log out
            </button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-6 pb-12">{children}</main>
      </div>
    );
  }

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
      <main className="flex-1 ml-60 p-8">
        {lapsed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-amber-800">Registry status: Inactive</p>
              <p className="text-xs text-amber-700 mt-0.5">
                {registry?.last_active ? `Last active: ${monthYear(registry.last_active)}. ` : ""}
                Your Manufacturer ID, product pages and QR codes still work, but you can&apos;t
                add or edit products until you renew your membership.
              </p>
            </div>
            <Link
              href="/onboarding?step=activate"
              className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 font-medium shrink-0"
            >
              Renew membership →
            </Link>
          </div>
        )}
        {registry && <AgreementBanner />}
        {children}
      </main>
    </div>
  );
}
