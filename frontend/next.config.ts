import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Legal documents moved to the versioned Legal & Trust Center (/legal).
  async redirects() {
    return [
      { source: "/terms", destination: "/legal/terms", permanent: true },
      { source: "/manufacturer-agreement", destination: "/legal/terms", permanent: true },
      { source: "/privacy", destination: "/legal/privacy", permanent: true },
      { source: "/refund", destination: "/legal/refund", permanent: true },
      { source: "/trust", destination: "/legal", permanent: true },
    ];
  },
};

export default nextConfig;
