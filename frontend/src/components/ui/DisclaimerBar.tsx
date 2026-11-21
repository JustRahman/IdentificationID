import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const REGISTRY_NEUTRALITY_TEXT =
  "Information is published by the manufacturer. Identification ID confirms registration only.";

/**
 * Neutral grey notice (Trustpilot / Companies House style).
 *   <DisclaimerBar />                       default neutrality line
 *   <DisclaimerBar>{PRODUCT_DISCLAIMER}</DisclaimerBar>   custom legal text (keep wording verbatim)
 */
export function DisclaimerBar({ children, action, className }: { children?: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600",
        className,
      )}
    >
      <div className="flex items-start gap-2.5 flex-1 min-w-0">
        <svg className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
          <circle cx="8" cy="8" r="6.25" />
          <path d="M8 7.25v4M8 4.9v.1" />
        </svg>
        <p className="leading-relaxed">{children ?? REGISTRY_NEUTRALITY_TEXT}</p>
      </div>
      {action && <div className="shrink-0 sm:ml-auto pl-6 sm:pl-0">{action}</div>}
    </div>
  );
}
