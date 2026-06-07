// ── Product categories (single source of truth) ──
export const CATEGORIES = [
  { value: "electronics", label: "Electronics" },
  { value: "home_appliances", label: "Home Appliances" },
  { value: "kitchen_appliances", label: "Kitchen Appliances" },
  { value: "power_tools", label: "Power Tools" },
  { value: "furniture", label: "Furniture" },
  { value: "clothing", label: "Clothing" },
  { value: "toys", label: "Toys" },
  { value: "sports", label: "Sports" },
  { value: "automotive", label: "Automotive" },
  { value: "medical", label: "Medical" },
  { value: "other", label: "Other" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
);

export const ID_FORMAT_EXAMPLE = "IID-4F9A-2K7Q";

// ── Supported description languages (single source of truth) ──
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "ru", label: "Russian" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "ar", label: "Arabic" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
] as const;

// ── Pricing plans (single source of truth) ──
// `priceCents` is canonical; surfaces render `$${priceCents / 100}` so prices
// can never drift between the homepage, pricing page, and billing page.
export type PlanKey = "free" | "starter" | "pro";

export interface PlanLabels {
  name: string;
  period: string;
  desc: string;
  features: string[];
}

export interface PlanTier {
  key: PlanKey;
  priceCents: number;
  productLimit: number; // -1 = unlimited
  popular: boolean;
  en: PlanLabels;
  ru: PlanLabels;
}

export const PLANS: PlanTier[] = [
  {
    key: "free",
    priceCents: 0,
    productLimit: 10,
    popular: false,
    en: {
      name: "Free",
      period: "",
      desc: "For trying it out",
      features: ["10 products", "Product page", "QR code", "Email support"],
    },
    ru: {
      name: "Free",
      period: "",
      desc: "Для пробы",
      features: ["10 товаров", "Карточка товара", "QR-код", "Email-поддержка"],
    },
  },
  {
    key: "starter",
    priceCents: 2900,
    productLimit: 100,
    popular: true,
    en: {
      name: "Starter",
      period: "/ mo",
      desc: "For growing businesses",
      features: ["100 products", "Document uploads", "Multi-language", "Priority support"],
    },
    ru: {
      name: "Starter",
      period: "/ месяц",
      desc: "Для растущего бизнеса",
      features: ["100 товаров", "Загрузка документов", "Мультиязычность", "Приоритетная поддержка"],
    },
  },
  {
    key: "pro",
    priceCents: 9900,
    productLimit: -1,
    popular: false,
    en: {
      name: "Pro",
      period: "/ mo",
      desc: "For large manufacturers",
      features: ["Unlimited products", "All Starter features", "API access", "Dedicated support"],
    },
    ru: {
      name: "Pro",
      period: "/ месяц",
      desc: "Для крупных производителей",
      features: ["Неограниченно товаров", "Все функции Starter", "API-доступ", "Выделенная поддержка"],
    },
  },
];

/** Format a plan's price for display, e.g. "$29". */
export function formatPlanPrice(plan: PlanTier): string {
  return `$${plan.priceCents / 100}`;
}
