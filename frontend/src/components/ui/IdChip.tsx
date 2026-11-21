"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Copy-to-clipboard icon button. Shows "Copied" for 1.5s. */
export function CopyButton({ value, label = "Copy", className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked - ignore
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `${label} ${value}`}
      title={copied ? "Copied" : label}
      className={cn(
        "inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0",
        className,
      )}
    >
      {copied ? (
        <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="5.25" y="5.25" width="8" height="8" rx="1.5" />
          <path d="M10.75 5.25V3.75a1.5 1.5 0 00-1.5-1.5h-5.5a1.5 1.5 0 00-1.5 1.5v5.5a1.5 1.5 0 001.5 1.5h1.5" />
        </svg>
      )}
    </button>
  );
}

/**
 * A registry ID shown the official way: plain label + bold monospace ID + copy.
 *   <IdChip label="Manufacturer ID" id="MID-K3NA-G66C" />
 *   <IdChip label="Identification ID" id="IID-GGX3-794V" href="/p/IID-GGX3-794V" size="sm" />
 *   <IdChip id="MID-XXXX-XXXX" copy={false} variant="plain" />  (format example)
 * variant "boxed" = bordered chip, "plain" = inline text (Companies House style).
 */
export function IdChip({
  id,
  label,
  href,
  copy = true,
  size = "md",
  variant = "boxed",
  className,
}: {
  id: string;
  label?: string;
  href?: string;
  copy?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "boxed" | "plain";
  className?: string;
}) {
  const idCls = cn(
    "font-mono tabular-nums font-semibold tracking-tight text-slate-900",
    size === "sm" && "text-[13px]",
    size === "md" && "text-sm",
    size === "lg" && "text-base sm:text-lg",
    href && "hover:text-accent underline-offset-4 hover:underline",
  );
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 max-w-full",
        variant === "boxed" && "rounded-lg border border-slate-200 bg-white pl-3 pr-1 shadow-xs",
        variant === "boxed" && (size === "sm" ? "h-8" : size === "lg" ? "h-11" : "h-9"),
        className,
      )}
    >
      {label && <span className={cn("text-slate-500", size === "sm" ? "text-xs" : "text-sm")}>{label}</span>}
      {href ? (
        <Link href={href} className={idCls} data-no-i18n>
          {id}
        </Link>
      ) : (
        <span className={idCls} data-no-i18n>{id}</span>
      )}
      {copy ? <CopyButton value={id} label="Copy ID" /> : variant === "boxed" && <span className="w-2" aria-hidden="true" />}
    </span>
  );
}
