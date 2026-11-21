/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";
import { initials } from "./format";

/** Square logo tile: the company logo, or calm initials when there is none. */
export function CompanyLogo({ name, src, size = "md", className }: { name: string; src?: string | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const box = size === "lg" ? "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" : size === "md" ? "w-12 h-12 rounded-xl" : "w-9 h-9 rounded-lg";
  const text = size === "lg" ? "text-xl sm:text-2xl" : size === "md" ? "text-base" : "text-xs";
  if (src) {
    return <img src={src} alt={`${name} logo`} className={cn(box, "object-contain border border-slate-200 bg-white shrink-0 p-1", className)} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn(box, text, "shrink-0 inline-flex items-center justify-center border border-slate-200 bg-slate-50 font-semibold tracking-tight text-slate-500", className)}
    >
      {initials(name)}
    </span>
  );
}
