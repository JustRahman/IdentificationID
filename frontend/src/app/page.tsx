import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TrustedByManufacturers } from "@/components/TrustedByManufacturers";
import { HomeHero } from "@/components/home/HomeHero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { WhyJoin } from "@/components/home/WhyJoin";
import { RegistryShowcase } from "@/components/home/RegistryShowcase";
import { OfferPricing } from "@/components/home/OfferPricing";
import { FaqAndCta } from "@/components/home/FaqAndCta";
import { getHomeData } from "@/components/home/data";

// Title and description come from the root layout (unchanged); only the canonical is added here.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function LandingPage() {
  const { products, companies, preview } = await getHomeData();
  // Clickable example IDs under the search box: real registry IDs only.
  const examples = products.slice(0, 2).map((p) => p.identification_id);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <HomeHero preview={preview} examples={examples} />
        <HowItWorks />
        <WhyJoin />
        <RegistryShowcase products={products} companies={companies} />
        {/* Feature-flagged, real customers only (hidden by default). */}
        <TrustedByManufacturers />
        <OfferPricing />
        <FaqAndCta />
      </main>
      <SiteFooter />
    </div>
  );
}
