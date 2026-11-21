import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Card with a header row (title, description, action) and a body. Use `flush` for tables / divide-y lists. */
export function Panel({
  title,
  description,
  action,
  flush = false,
  className,
  bodyClassName,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("bg-white border border-slate-200 rounded-2xl", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-200">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold text-slate-900 tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn(flush ? "" : "p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

/** Table classes: wrap <table> in <div className={tableWrap}>. */
export const tableWrap = "overflow-x-auto";
export const tableClass = "w-full text-sm";
export const theadClass = "bg-slate-50/80 text-left text-xs font-medium text-slate-500 border-b border-slate-200";
export const thClass = "px-4 py-2.5 font-medium whitespace-nowrap";
export const tbodyClass = "divide-y divide-slate-100";
export const tdClass = "px-4 py-3 align-top text-slate-700";

/** Small stat tile. */
export function StatCard({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "default" | "good" | "warn" | "bad" | "muted" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight tabular-nums",
          tone === "good" && "text-emerald-700",
          tone === "warn" && "text-amber-700",
          tone === "bad" && "text-red-700",
          tone === "muted" && "text-slate-400",
          (!tone || tone === "default") && "text-slate-900",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
