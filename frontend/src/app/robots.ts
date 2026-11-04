import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const PRIVATE = ["/admin", "/dashboard", "/onboarding", "/billing", "/products", "/company", "/api-keys", "/unsubscribe"];

// Search engines and AI assistants are welcome to read and cite public pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      ...["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot", "Bingbot"].map(
        (ua) => ({ userAgent: ua, allow: "/", disallow: PRIVATE }),
      ),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
