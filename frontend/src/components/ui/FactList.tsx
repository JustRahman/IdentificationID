import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Fact {
  label: string;
  /** null / undefined / "" render as a grey "Not provided". */
  value?: ReactNode;
  /** Render the value in monospace tabular digits (IDs, codes, numbers). */
  mono?: boolean;
}

/**
 * Label / value rows with hairline dividers (Apple specs, Companies House).
 *   <FactList items={[{ label: "Brand", value: "ACME" }, { label: "Model", value: null }]} />
 * layout "split" = label left, value right (default, good in narrow boxes);
 * layout "grid"  = fixed label column (good for wide spec tables).
 */
export function FactList({
  items,
  layout = "split",
  dense = false,
  className,
}: {
  items: Fact[];
  layout?: "split" | "grid";
  dense?: boolean;
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-slate-200", className)}>
      {items.map((f) => {
        const empty = f.value === null || f.value === undefined || f.value === "";
        return (
          <div
            key={f.label}
            className={cn(
              dense ? "py-2.5" : "py-3",
              layout === "split" ? "flex items-baseline justify-between gap-4" : "grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-6",
            )}
          >
            <dt className="text-sm text-slate-500 shrink-0">{f.label}</dt>
            <dd
              className={cn(
                "text-sm min-w-0 break-words",
                layout === "split" && "text-right",
                empty ? "text-slate-400" : "text-slate-900 font-medium",
                f.mono && !empty && "font-mono tabular-nums",
              )}
            >
              {empty ? "Not provided" : f.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
