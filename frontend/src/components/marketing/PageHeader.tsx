import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Top band for marketing / info / legal pages (same two-tone headline as the homepage).
 *   <PageHeader eyebrow="Pricing" title="Start free." muted="Pay when you grow." description="..." actions={<ButtonLink .../>} />
 * `crumbs` renders a small breadcrumb above the eyebrow (last item is the current page, not a link).
 */
export function PageHeader({
  eyebrow,
  title,
  muted,
  description,
  actions,
  crumbs,
  align = "left",
  size = "default",
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  muted?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  crumbs?: { label: string; href?: string }[];
  align?: "left" | "center";
  size?: "default" | "narrow";
  children?: ReactNode;
  className?: string;
}) {
  const center = align === "center";
  return (
    <header className={cn("border-b border-slate-200 bg-white", className)}>
      <div className={cn("mx-auto w-full px-5 sm:px-6 pt-12 pb-12 sm:pt-20 sm:pb-16", size === "narrow" ? "max-w-3xl" : "max-w-6xl")}>
        <div className={cn(center ? "mx-auto max-w-3xl text-center" : "max-w-3xl")}>
          {crumbs && crumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol className={cn("flex flex-wrap items-center gap-1.5 text-sm text-slate-500", center && "justify-center")}>
                {crumbs.map((c, i) => (
                  <li key={c.label} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 3.5L10.5 8 6 12.5" />
                      </svg>
                    )}
                    {c.href ? (
                      <Link href={c.href} className="hover:text-slate-900 hover:underline underline-offset-4">
                        {c.label}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-slate-700">{c.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}
          {eyebrow && <p className="text-sm font-medium text-accent mb-3">{eyebrow}</p>}
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900 leading-[1.08] text-balance">
            {title}
            {muted && <span className="text-slate-400"> {muted}</span>}
          </h1>
          {description && (
            <div className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed text-pretty">{description}</div>
          )}
          {actions && (
            <div className={cn("mt-8 flex flex-col sm:flex-row flex-wrap gap-3", center && "sm:justify-center")}>{actions}</div>
          )}
        </div>
        {children}
      </div>
    </header>
  );
}
