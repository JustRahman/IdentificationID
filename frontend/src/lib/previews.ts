/**
 * Private sample pages shown to a manufacturer before they register.
 * Built only from information the manufacturer publishes on its own website.
 * Not part of the registry: no company account, no real Identification ID,
 * not listed in search, marked noindex, reachable only by direct link.
 */
export interface PreviewProduct {
  preparedFor: string;
  sourceUrl: string;
  data: {
    identification_id: string;
    name: string;
    category: string;
    brand: string | null;
    model: string | null;
    country_of_origin: string | null;
    published_at: string | null;
    company: {
      manufacturer_id: string | null;
      registry_status: "active" | "inactive";
      last_active: string | null;
      verification_level: "registered" | "verified" | "business";
      verification_label: string;
      display_name: string;
      country_code: string;
      website: string | null;
      support_email: string | null;
      logo_url: string | null;
      description: string | null;
    };
    translation: { lang: string; short_description: string | null; full_description: string | null; usage_instructions: string | null } | null;
    translations: { lang: string; short_description: string | null; full_description: string | null; usage_instructions: string | null }[];
    images: { url: string; alt_text: string | null; display_order: number }[];
    documents: never[];
  };
}

const B760_EN = {
  lang: "en",
  short_description:
    "MagLeap Qi2.2 magnetic wireless power bank: 10000mAh, up to 25W wireless and up to 45W USB-C wired charging.",
  full_description: [
    "Qi2.2 25W Certified Wireless Charging: up to 25W fast wireless charging with Qi2.2 certification for compatible devices.",
    "45W High-Speed Wired Charging: the USB-C port delivers up to 45W wired charging for phones, tablets, and other compatible devices.",
    "10000mAh Portable Power: the high-capacity battery provides reliable power throughout the day while remaining convenient for travel.",
    "Magnetic Charging Design: the magnetic design securely aligns with compatible phones for a stable and convenient wireless charging experience.",
    "Multi-Protection Safety: built-in protection against over-temperature, overcharging, and short circuits helps keep your devices safe during charging.",
  ].join("\n\n"),
  usage_instructions:
    "Safety information (from choetech.com): built-in protection against over-temperature, overcharging and short circuits.\nFull usage instructions and warnings: see the manual at https://choetech.com/pages/choetech-manuals",
};

const B760_ZH = {
  lang: "zh",
  short_description: "MagLeap Qi2.2 磁吸无线充电宝：10000mAh，无线最高25W，USB-C有线最高45W。",
  full_description: [
    "Qi2.2 25W认证无线快充：为兼容设备提供最高25W无线快充。",
    "45W高速有线充电：USB-C接口最高45W，适用于手机、平板等兼容设备。",
    "10000mAh大容量：全天可靠供电，便于出行携带。",
    "磁吸充电设计：与兼容手机稳固对齐，无线充电更稳定方便。",
    "多重安全保护：内置过温、过充、短路保护，充电更安心。",
  ].join("\n\n"),
  usage_instructions:
    "安全信息（来自choetech.com）：内置过温、过充、短路保护。\n完整使用说明和警告请见说明书：https://choetech.com/pages/choetech-manuals",
};

export const PREVIEWS: Record<string, PreviewProduct> = {
  "SAMPLE-CHOETECH-B760": {
    preparedFor: "CHOETECH",
    sourceUrl:
      "https://choetech.com/products/choetech-b760-magleap-qi2-2-10000mah-wireless-charger-pd45w-charging",
    data: {
      identification_id: "SAMPLE-CHOETECH-B760",
      name: "CHOETECH B760 MagLeap Qi2.2 10000mAh Wireless Power Bank, PD45W (Sample)",
      category: "electronics",
      brand: "CHOETECH",
      model: "B760",
      country_of_origin: null,
      published_at: null,
      company: {
        manufacturer_id: null,
        registry_status: "active",
        last_active: null,
        verification_level: "registered",
        verification_label: "Sample - not registered",
        display_name: "CHOETECH",
        country_code: "CN",
        website: "https://choetech.com",
        support_email: "kelly@choetech.com",
        logo_url: null,
        description: "Chargers, power banks and charging accessories. Sample built from information published on choetech.com.",
      },
      translation: B760_EN,
      translations: [B760_EN, B760_ZH],
      images: [
        { url: "https://cdn.shopify.com/s/files/1/1601/7595/files/00-2_11zon-3.webp?v=1787645994", alt_text: "CHOETECH B760", display_order: 0 },
        { url: "https://cdn.shopify.com/s/files/1/1601/7595/files/01_11zon-9.webp?v=1787645994", alt_text: "CHOETECH B760", display_order: 1 },
        { url: "https://cdn.shopify.com/s/files/1/1601/7595/files/02_11zon-9.webp?v=1787645994", alt_text: "CHOETECH B760", display_order: 2 },
      ],
      documents: [],
    },
  },
};

export function getPreview(id: string): PreviewProduct | undefined {
  return PREVIEWS[id.toUpperCase()];
}
