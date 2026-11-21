import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-lg transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  // Solid brand blue - one primary action per view.
  primary: "bg-accent text-white shadow-sm hover:bg-accent-hover",
  // Outline - secondary action (e.g. "Search ID").
  secondary: "bg-white text-slate-900 border border-slate-300 shadow-xs hover:bg-slate-50 hover:border-slate-400",
  // Text-only - tertiary action.
  ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
  // Slate-900 solid - use sparingly on light backgrounds.
  dark: "bg-slate-900 text-white shadow-sm hover:bg-slate-800",
  // White solid - for use on the navy band only.
  inverse: "bg-white text-slate-900 shadow-sm hover:bg-slate-100",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type CommonProps = { variant?: ButtonVariant; size?: ButtonSize; className?: string; children: ReactNode };

/** <button> with design-system styling. */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

/** Next.js <Link> (internal) or <a> (external / mailto) styled as a button. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = buttonClasses(variant, size, className);
  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={cls} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

/** Small right arrow used inside buttons and text links. */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={cn("w-4 h-4 shrink-0", className)} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}
