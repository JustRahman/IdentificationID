import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppIcon } from "./icons";

/** App page header: optional back link, title, one-line description, actions on the right. */
export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-3">
          <AppIcon name="back" className="w-3.5 h-3.5" /> {back.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 text-balance">{title}</h1>
          {description && <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-2xl">{description}</p>}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
