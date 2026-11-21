import type { PlanKey } from "@/lib/constants";

/**
 * Per-plan colors (restored from the pre-redesign pricing, commit 2c3b123).
 * standard = orange, popular = brand blue, best_value = dark slate + amber, enterprise = amber.
 * Every value is a full static class string so Tailwind can see it.
 * Text contrast: white on orange-600/700, blue-600 and slate-900; slate-900 on amber-400 (all AA).
 */
export type PlanTheme = {
  /** Card surface (background, border, base text color). */
  card: string;
  /** Secondary text on the card. */
  muted: string;
  /** Check-mark color on the card. */
  check: string;
  /** Call-to-action button on the card. */
  button: string;
  /** Optional pill badge shown on top of the card. */
  badge?: { label: string; className: string };
  /** Extra emphasis (e.g. Best Value is slightly larger). */
  emphasis?: string;
  /** Selected-state ring for pickers. */
  selectedRing: string;
  /** Solid swatch (dots, chips, left bars). */
  swatch: string;
};

export const PLAN_THEME: Record<PlanKey, PlanTheme> = {
  standard: {
    card: "bg-linear-to-br from-orange-600 to-orange-700 border-orange-600 text-white shadow-[0_18px_40px_-20px_rgba(234,88,12,0.75)]",
    muted: "text-white/90",
    check: "text-white",
    button: "bg-white text-orange-700 hover:bg-orange-50",
    selectedRing: "ring-orange-300",
    swatch: "bg-orange-600",
  },
  popular: {
    card: "bg-linear-to-br from-blue-600 to-blue-700 border-blue-600 text-white shadow-[0_18px_40px_-20px_rgba(37,99,235,0.8)]",
    muted: "text-white/90",
    check: "text-white",
    button: "bg-white text-accent hover:bg-blue-50",
    badge: { label: "Most popular", className: "bg-white text-accent ring-1 ring-blue-100" },
    selectedRing: "ring-blue-300",
    swatch: "bg-accent",
  },
  best_value: {
    card: "bg-slate-900 border-slate-900 text-white ring-1 ring-amber-400 shadow-[0_24px_48px_-20px_rgba(15,23,42,0.85)]",
    muted: "text-slate-300",
    check: "text-amber-400",
    button: "bg-amber-400 text-slate-900 hover:bg-amber-300",
    badge: { label: "Best value", className: "bg-amber-400 text-slate-900" },
    emphasis: "lg:scale-[1.03] z-10",
    selectedRing: "ring-amber-400",
    swatch: "bg-slate-900",
  },
  enterprise: {
    card: "bg-linear-to-br from-amber-300 to-amber-400 border-amber-400 text-slate-900 shadow-[0_18px_40px_-20px_rgba(217,119,6,0.7)]",
    muted: "text-slate-800",
    check: "text-slate-900",
    button: "bg-slate-900 text-white hover:bg-slate-800",
    selectedRing: "ring-slate-900",
    swatch: "bg-amber-400",
  },
};

/** Registry Membership colors (indigo / violet). */
export const MEMBERSHIP_THEME = {
  card: "bg-linear-to-br from-indigo-50 to-violet-50 border-2 border-indigo-300 ring-1 ring-indigo-200 shadow-[0_18px_40px_-24px_rgba(79,70,229,0.55)]",
  title: "text-indigo-950",
  body: "text-indigo-900/80",
  check: "text-indigo-600",
  badge: "bg-indigo-600 text-white",
  button: "bg-indigo-600 text-white hover:bg-indigo-700",
  divider: "border-indigo-200",
  selected: "border-indigo-500 ring-2 ring-indigo-500",
  idle: "border-indigo-200 hover:border-indigo-400",
};
