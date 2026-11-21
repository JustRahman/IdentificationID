/**
 * Homepage color system (colorful refresh, Nov 2026).
 * Each tone is a full static class set so Tailwind can see every class.
 * Text on tinted surfaces uses the -700 shade (AA on -50 backgrounds).
 */
export type Tone = "blue" | "violet" | "emerald" | "amber" | "sky" | "rose" | "teal" | "indigo";

export const TONES: Record<
  Tone,
  { chip: string; tile: string; icon: string; badge: string; bar: string; soft: string; ring: string; text: string }
> = {
  blue: {
    chip: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    tile: "bg-blue-50 border-blue-100",
    icon: "bg-blue-600 text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.7)]",
    badge: "bg-blue-600 text-white",
    bar: "from-blue-500 to-sky-400",
    soft: "bg-blue-100/70",
    ring: "ring-blue-200",
    text: "text-blue-700",
  },
  violet: {
    chip: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
    tile: "bg-violet-50 border-violet-100",
    icon: "bg-violet-600 text-white shadow-[0_6px_16px_-6px_rgba(124,58,237,0.7)]",
    badge: "bg-violet-600 text-white",
    bar: "from-violet-500 to-fuchsia-400",
    soft: "bg-violet-100/70",
    ring: "ring-violet-200",
    text: "text-violet-700",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    tile: "bg-emerald-50 border-emerald-100",
    icon: "bg-emerald-600 text-white shadow-[0_6px_16px_-6px_rgba(5,150,105,0.7)]",
    badge: "bg-emerald-600 text-white",
    bar: "from-emerald-500 to-teal-400",
    soft: "bg-emerald-100/70",
    ring: "ring-emerald-200",
    text: "text-emerald-700",
  },
  amber: {
    chip: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
    tile: "bg-amber-50 border-amber-100",
    icon: "bg-linear-to-br from-amber-500 to-orange-500 text-white shadow-[0_6px_16px_-6px_rgba(245,158,11,0.8)]",
    badge: "bg-amber-500 text-white",
    bar: "from-amber-400 to-orange-400",
    soft: "bg-amber-100/70",
    ring: "ring-amber-200",
    text: "text-amber-800",
  },
  sky: {
    chip: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
    tile: "bg-sky-50 border-sky-100",
    icon: "bg-sky-600 text-white shadow-[0_6px_16px_-6px_rgba(2,132,199,0.7)]",
    badge: "bg-sky-600 text-white",
    bar: "from-sky-500 to-cyan-400",
    soft: "bg-sky-100/70",
    ring: "ring-sky-200",
    text: "text-sky-700",
  },
  rose: {
    chip: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    tile: "bg-rose-50 border-rose-100",
    icon: "bg-rose-600 text-white shadow-[0_6px_16px_-6px_rgba(225,29,72,0.7)]",
    badge: "bg-rose-600 text-white",
    bar: "from-rose-500 to-pink-400",
    soft: "bg-rose-100/70",
    ring: "ring-rose-200",
    text: "text-rose-700",
  },
  teal: {
    chip: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
    tile: "bg-teal-50 border-teal-100",
    icon: "bg-teal-600 text-white shadow-[0_6px_16px_-6px_rgba(13,148,136,0.7)]",
    badge: "bg-teal-600 text-white",
    bar: "from-teal-500 to-emerald-400",
    soft: "bg-teal-100/70",
    ring: "ring-teal-200",
    text: "text-teal-700",
  },
  indigo: {
    chip: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
    tile: "bg-indigo-50 border-indigo-100",
    icon: "bg-indigo-600 text-white shadow-[0_6px_16px_-6px_rgba(79,70,229,0.7)]",
    badge: "bg-indigo-600 text-white",
    bar: "from-indigo-500 to-violet-400",
    soft: "bg-indigo-100/70",
    ring: "ring-indigo-200",
    text: "text-indigo-700",
  },
};

/** One fixed color per product category, so a category always looks the same. */
const CATEGORY_TONE: Record<string, Tone> = {
  electronics: "blue",
  home_appliances: "teal",
  kitchen_appliances: "amber",
  power_tools: "rose",
  furniture: "amber",
  clothing: "violet",
  toys: "rose",
  sports: "emerald",
  automotive: "indigo",
  medical: "sky",
  pharmaceuticals: "sky",
  food_beverage: "emerald",
  baby_children: "violet",
  other: "indigo",
};

export function categoryTone(category: string | null | undefined): Tone {
  return (category && CATEGORY_TONE[category]) || "indigo";
}

/** Stable color for a company initial tile (by name), so it never flickers between renders. */
const NAME_TONES: Tone[] = ["blue", "violet", "emerald", "amber", "sky", "rose", "teal", "indigo"];
export function nameTone(name: string): Tone {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return NAME_TONES[h % NAME_TONES.length];
}

/** Brand gradient used for text, ribbons and the final CTA. */
export const BRAND_GRADIENT_TEXT =
  "bg-linear-to-r from-blue-600 via-violet-600 to-teal-600 bg-clip-text text-transparent";
