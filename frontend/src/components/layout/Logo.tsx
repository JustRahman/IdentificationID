import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark: blue "ID" tile + name. tone="light" for dark backgrounds. */
export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight whitespace-nowrap shrink-0", className)} aria-label="Identification ID home">
      <span className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center text-[11px] font-bold tracking-normal shadow-sm" aria-hidden="true">
        ID
      </span>
      <span className={cn("text-[15px]", tone === "light" ? "text-white" : "text-slate-900")}>Identification ID</span>
    </Link>
  );
}
