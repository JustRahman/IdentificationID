import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section heading with the two-tone Stripe/Ramp headline.
 *   <SectionHeader eyebrow="How it works" title="Three steps." muted="One permanent record." description="..." />
 * `muted` is the grey second clause rendered in the same line as `title`.
 */
export function SectionHeader({
  eyebrow,
  title,
  muted,
  description,
  align = "left",
  as: Tag = "h2",
  action,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  muted?: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 sm:mb-12",
        align === "center" && "text-center mx-auto max-w-2xl",
        !!action && align === "left" && "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className={cn(align === "left" && "max-w-2xl")}>
        {eyebrow && <p className="text-sm font-medium text-accent mb-3">{eyebrow}</p>}
        <Tag className="text-[1.75rem] sm:text-4xl font-semibold tracking-tight text-slate-900 leading-[1.1] text-balance">
          {title}
          {muted && <span className="text-slate-400"> {muted}</span>}
        </Tag>
        {description && <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed text-pretty">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
