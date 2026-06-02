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
export type PlanKey = "basic" | "small_business" | "medium" | "enterprise";

export interface PlanLabels {
  name: string;
  period: string;
  desc: string;
  features: string[];
}

export interface PlanTier {
  key: PlanKey;
  priceCents: number;
  perProduct: boolean;
  productLimit: number; // -1 = unlimited
  popular: boolean;
  en: PlanLabels;
  ru: PlanLabels;
}

export const PLANS: PlanTier[] = [
  {
    key: "basic",
    priceCents: 300,
    perProduct: true,
    productLimit: -1,
    popular: false,
    en: {
      name: "Basic",
      period: "per product / mo",
      desc: "For individual products",
      features: ["Pay per product", "Unique ID", "QR code", "Product page"],
    },
    ru: {
      name: "Basic",
      period: "за товар / мес",
      desc: "Для единичных товаров",
      features: ["Оплата за товар", "Уникальный ID", "QR-код", "Карточка товара"],
    },
  },
  {
    key: "small_business",
    priceCents: 2900,
    perProduct: false,
    productLimit: 50,
    popular: false,
    en: {
      name: "Small Business",
      period: "/ mo",
      desc: "Up to 50 products",
      features: ["Up to 50 products", "All Basic features", "Document uploads", "Multi-language"],
    },
    ru: {
      name: "Small Business",
      period: "/ месяц",
      desc: "До 50 товаров",
      features: ["До 50 товаров", "Все функции Basic", "Загрузка документов", "Мультиязычность"],
    },
  },
  {
    key: "medium",
    priceCents: 9900,
    perProduct: false,
    productLimit: 500,
    popular: true,
    en: {
      name: "Medium",
      period: "/ mo",
      desc: "Up to 500 products",
      features: ["Up to 500 products", "All Small features", "PIM system", "Marketplace integration"],
    },
    ru: {
      name: "Medium",
      period: "/ месяц",
      desc: "До 500 товаров",
      features: ["До 500 товаров", "Все функции Small", "PIM-система", "Интеграция маркетплейсов"],
    },
  },
  {
    key: "enterprise",
    priceCents: 29900,
    perProduct: false,
    productLimit: -1,
    popular: false,
    en: {
      name: "Enterprise",
      period: "/ mo",
      desc: "Unlimited",
      features: ["Unlimited products", "All Medium features", "API access", "Priority support"],
    },
    ru: {
      name: "Enterprise",
      period: "/ месяц",
      desc: "Без ограничений",
      features: ["Неограниченно товаров", "Все функции Medium", "API-доступ", "Приоритетная поддержка"],
    },
  },
];

/** Format a plan's price for display, e.g. "$3", with per-product note handled by caller. */
export function formatPlanPrice(plan: PlanTier): string {
  return `$${plan.priceCents / 100}`;
}
