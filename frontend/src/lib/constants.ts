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
export type PlanKey = "free" | "standard" | "popular" | "best_value" | "enterprise";

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
  perProduct: boolean; // price is per product per month
  popular: boolean; // carries the "POPULAR" badge
  premium: boolean; // carries the premium/dark "BEST VALUE" treatment
  en: PlanLabels;
  ru: PlanLabels;
}

export const PLANS: PlanTier[] = [
  {
    key: "free",
    priceCents: 0,
    productLimit: 3,
    perProduct: false,
    popular: false,
    premium: false,
    en: {
      name: "Free",
      period: "",
      desc: "Try it out",
      features: ["3 products", "Unique ID", "QR code", "Product page"],
    },
    ru: {
      name: "Free",
      period: "",
      desc: "Для пробы",
      features: ["3 товара", "Уникальный ID", "QR-код", "Карточка товара"],
    },
  },
  {
    key: "standard",
    priceCents: 300,
    productLimit: -1,
    perProduct: true,
    popular: false,
    premium: false,
    en: {
      name: "Standard",
      period: "per product / mo · billed annually",
      desc: "Pay only per product",
      features: ["Pay per product", "Unique ID", "QR code", "Product page"],
    },
    ru: {
      name: "Standard",
      period: "за товар / мес · годовая подписка",
      desc: "Оплата за товар",
      features: ["Оплата за товар", "Уникальный ID", "QR-код", "Карточка товара"],
    },
  },
  {
    key: "popular",
    priceCents: 2900,
    productLimit: 100,
    perProduct: false,
    popular: true,
    premium: false,
    en: {
      name: "Popular",
      period: "/ mo · billed annually",
      desc: "For growing businesses",
      features: ["Up to 100 products", "Document uploads", "Multi-language", "Priority support"],
    },
    ru: {
      name: "Popular",
      period: "/ мес · годовая подписка",
      desc: "Для растущего бизнеса",
      features: ["До 100 товаров", "Загрузка документов", "Мультиязычность", "Приоритетная поддержка"],
    },
  },
  {
    key: "best_value",
    priceCents: 9900,
    productLimit: 500,
    perProduct: false,
    popular: false,
    premium: true,
    en: {
      name: "Best Value",
      period: "/ mo · billed annually",
      desc: "For large manufacturers",
      features: ["Up to 500 products", "All Popular features", "API access"],
    },
    ru: {
      name: "Best Value",
      period: "/ мес · годовая подписка",
      desc: "Для крупных производителей",
      features: ["До 500 товаров", "Все функции Popular", "API-доступ"],
    },
  },
  {
    key: "enterprise",
    priceCents: 29900,
    productLimit: -1,
    perProduct: false,
    popular: false,
    premium: false,
    en: {
      name: "Enterprise",
      period: "/ mo · billed annually",
      desc: "Individual / Custom",
      features: ["Unlimited products", "API access", "Dedicated support"],
    },
    ru: {
      name: "Enterprise",
      period: "/ мес · годовая подписка",
      desc: "Индивидуально / под заказ",
      features: ["Неограниченно товаров", "API-доступ", "Выделенная поддержка"],
    },
  },
];

/** Format a plan's price for display, e.g. "$29". */
export function formatPlanPrice(plan: PlanTier): string {
  return `$${plan.priceCents / 100}`;
}
