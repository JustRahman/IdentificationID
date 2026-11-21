import Link from "next/link";
import { cn } from "@/lib/utils";

export interface SideNavItem {
  href: string;
  label: string;
  meta?: string;
  active?: boolean;
}

/**
 * Sticky sidebar list (Trust Center documents, "On this page" anchors).
 * Sits below the 64px sticky SiteHeader (top-24). Hidden below `lg` unless `mobile` is set.
 */
export function SideNav({
  title,
  items,
  sticky = true,
  className,
}: {
  title: string;
  items: SideNavItem[];
  sticky?: boolean;
  className?: string;
}) {
  return (
    <nav aria-label={title} className={cn(sticky && "lg:sticky lg:top-24 lg:self-start", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{title}</p>
      <ul className="space-y-0.5 border-l border-slate-200">
        {items.map((it) => {
          const cls = cn(
            "-ml-px block border-l-2 py-1.5 pl-4 pr-2 text-sm transition-colors",
            it.active
              ? "border-accent text-slate-900 font-medium"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300",
          );
          const body = (
            <>
              <span className="block leading-snug">{it.label}</span>
              {it.meta && <span className="block text-xs text-slate-500 font-normal mt-0.5">{it.meta}</span>}
            </>
          );
          return (
            <li key={it.href}>
              {it.href.startsWith("#") ? (
                <a href={it.href} className={cls}>{body}</a>
              ) : (
                <Link href={it.href} className={cls} aria-current={it.active ? "page" : undefined}>{body}</Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
