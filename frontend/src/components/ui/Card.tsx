import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Surface card: white, 1px slate-200 hairline, rounded-2xl.
 * `elevated` adds the soft shadow - use it on the ONE primary card of a view.
 * `interactive` adds a hover border for cards that are links.
 */
export function Card({
  elevated = false,
  interactive = false,
  padding = "md",
  className,
  children,
  ...rest
}: {
  elevated?: boolean;
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-2xl",
        elevated && "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)]",
        interactive && "transition-colors hover:border-slate-300",
        padding === "sm" && "p-4",
        padding === "md" && "p-6",
        padding === "lg" && "p-8",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
