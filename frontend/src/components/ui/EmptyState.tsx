import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ICONS = {
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  search: "M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z",
  photo: "M4 16l4.6-4.6a2 2 0 012.8 0L16 16m-2-2l1.6-1.6a2 2 0 012.8 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  building: "M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1",
  document: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.6a1 1 0 01.7.3l5.4 5.4a1 1 0 01.3.7V19a2 2 0 01-2 2z",
} as const;

export type EmptyIcon = keyof typeof ICONS;

/**
 * Calm empty state: icon tile, title, one line, optional action.
 *   <EmptyState icon="box" title="No products yet" description="..." action={<ButtonLink .../>} />
 */
export function EmptyState({
  icon = "box",
  title,
  description,
  action,
  compact = false,
  className,
}: {
  icon?: EmptyIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center rounded-2xl border border-dashed border-slate-300 bg-white",
        compact ? "px-5 py-8" : "px-6 py-14",
        className,
      )}
    >
      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={ICONS[icon]} />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Placeholder for a missing product photo: icon + "No photo yet". */
export function PhotoPlaceholder({ className, label = "No photo yet" }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400", className)}>
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={ICONS.photo} />
      </svg>
      <span className="text-xs">{label}</span>
    </div>
  );
}
