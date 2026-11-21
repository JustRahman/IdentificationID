import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Bulleted list with blue check marks (single brand colour, no green / multicolour). */
export function CheckList({
  items,
  columns = 1,
  size = "md",
  className,
}: {
  items: ReactNode[];
  columns?: 1 | 2;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <ul className={cn("grid gap-x-8", size === "sm" ? "gap-y-2" : "gap-y-3", columns === 2 && "sm:grid-cols-2", className)}>
      {items.map((item, i) => (
        <li key={i} className={cn("flex items-start gap-3 text-slate-700", size === "sm" ? "text-sm" : "text-[15px]")}>
          <svg
            className={cn("shrink-0 text-accent", size === "sm" ? "w-4 h-4 mt-0.5" : "w-5 h-5 mt-px")}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 10.5l3.2 3.2L15 7" />
          </svg>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}
