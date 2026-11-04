import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://identificationid.com"),
  title: "Identification ID - Global Encyclopedia of Manufacturers and Products",
  description:
    "A global encyclopedia of manufacturers and products. Manufacturers publish company profiles and product pages with manuals, safety info and QR codes; anyone can look them up.",
};


const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://identificationid.com/#org",
      name: "Identification ID",
      legalName: "Global Product Identification Inc.",
      url: "https://identificationid.com",
      email: "hello@identificationid.com",
      address: { "@type": "PostalAddress", addressCountry: "CA" },
      description:
        "Global encyclopedia of manufacturers and products. Each manufacturer gets a permanent Manufacturer ID (MID-XXXX-XXXX) and each product a permanent Identification ID (IID-XXXX-XXXX).",
    },
    {
      "@type": "WebSite",
      "@id": "https://identificationid.com/#website",
      url: "https://identificationid.com",
      name: "Identification ID",
      publisher: { "@id": "https://identificationid.com/#org" },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: "https://identificationid.com/search?q={search_term_string}" },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }} />
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
