import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "info" | "verified" | "pending" | "error";

const TONES: Record<BadgeTone, { pill: string; dot: string }> = {
  neutral: { pill: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
  info: { pill: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  // green only for verified / active
  verified: { pill: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  // amber only for pending / sample
  pending: { pill: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  // red only for errors
  error: { pill: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-500" },
};

/**
 * Small status pill. Examples:
 *   <Badge tone="verified" icon="check">Registered manufacturer - since Nov 2026</Badge>
 *   <Badge tone="pending" dot>Sample page</Badge>
 */
export function Badge({
  tone = "neutral",
  dot = false,
  icon,
  size = "sm",
  className,
  children,
}: {
  tone?: BadgeTone;
  dot?: boolean;
  icon?: "check" | "shield";
  size?: "xs" | "sm";
  className?: string;
  children: ReactNode;
}) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset whitespace-nowrap",
        size === "xs" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        t.pill,
        className,
      )}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", t.dot)} aria-hidden="true" />}
      {icon === "check" && (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      )}
      {icon === "shield" && (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8 1.75l5 2v4c0 3.2-2.2 5.4-5 6.5-2.8-1.1-5-3.3-5-6.5v-4l5-2z" />
          <path d="M5.75 8l1.6 1.6L10.5 6.4" />
        </svg>
      )}
      {children}
    </span>
  );
}
