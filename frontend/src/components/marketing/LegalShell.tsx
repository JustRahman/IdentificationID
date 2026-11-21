import type { ReactNode } from "react";
import { LEGAL_DOCS, formatDate } from "@/lib/legal";
import { SideNav, type SideNavItem } from "./SideNav";

/**
 * Two-column Trust Center layout (server only - reads LEGAL_DOCS):
 * left = sticky index of every document with its current version + effective date,
 * right = page content. `active` is the current path ("/legal", "/legal/terms", "/cookies").
 */
export function LegalShell({ active, children, aside }: { active: string; children: ReactNode; aside?: ReactNode }) {
  const items: SideNavItem[] = [
    { href: "/legal", label: "Trust Center overview", active: active === "/legal" },
    ...LEGAL_DOCS.map((d) => {
      const v = d.versions.find((x) => x.version === d.current);
      return {
        href: `/legal/${d.slug}`,
        label: d.title,
        meta: `v${d.current}${v ? ` - ${formatDate(v.effective)}` : ""}`,
        active: active === `/legal/${d.slug}`,
      };
    }),
    { href: "/cookies", label: "Cookie Policy", active: active === "/cookies" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-6 py-12 sm:py-16 grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">
      <div className="hidden lg:block">
        <SideNav title="Documents" items={items} />
        {aside}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
