"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { AppIcon, type AppIconName } from "./icons";

export type SidebarItem = { href: string; label: string; icon: AppIconName };

/**
 * Stripe/Linear-style app shell: fixed left sidebar on lg+, top bar with a
 * slide-down menu below lg. Presentation only - pages pass their own nav items.
 */
export function AppSidebarShell({
  items,
  extraItems,
  sectionLabel,
  badge,
  footer,
  children,
}: {
  items: SidebarItem[];
  extraItems?: SidebarItem[];
  sectionLabel?: string;
  badge?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const nav = (
    <nav className="flex flex-col gap-0.5" aria-label="Main">
      {sectionLabel && <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">{sectionLabel}</p>}
      {items.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={() => setOpen(false)} />
      ))}
      {extraItems && extraItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-0.5">
          {extraItems.map((item) => (
            <NavLink key={item.href} item={item} active={isActive(item.href)} onClick={() => setOpen(false)} />
          ))}
        </div>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface text-foreground">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col fixed inset-y-0 left-0 z-30">
        <div className="h-16 px-5 flex items-center gap-2 border-b border-slate-200">
          <Logo />
          {badge}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">{nav}</div>
        <div className="px-5 py-4 border-t border-slate-200 space-y-3">{footer}</div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
            {badge}
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
          >
            <AppIcon name={open ? "x" : "menu"} className="w-5 h-5" />
          </button>
        </div>
        {open && (
          <div className="px-3 pb-4 border-t border-slate-200 pt-3 space-y-4">
            {nav}
            <div className="px-3 pt-3 border-t border-slate-200 space-y-3">{footer}</div>
          </div>
        )}
      </div>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

function NavLink({ item, active, onClick }: { item: SidebarItem; active: boolean; onClick: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 px-3 h-9 rounded-lg text-sm transition-colors",
        active ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
      )}
    >
      <AppIcon name={item.icon} className={cn("w-[18px] h-[18px]", active ? "text-accent" : "text-slate-400")} />
      {item.label}
    </Link>
  );
}

/** Account block for the sidebar footer: language, email, log out. */
export function SidebarAccount({ email, onLogout, extra }: { email?: string; onLogout?: () => void; extra?: ReactNode }) {
  return (
    <>
      <LanguageSwitcher />
      {extra}
      {email && (
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold flex items-center justify-center shrink-0 uppercase" aria-hidden="true">
            {email.charAt(0)}
          </span>
          <p className="text-xs text-slate-600 truncate" data-no-i18n>{email}</p>
        </div>
      )}
      {onLogout && (
        <button onClick={onLogout} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <AppIcon name="logout" /> Log out
        </button>
      )}
    </>
  );
}
