"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";

/**
 * QR code for a public registry path ("/p/IID-..." or "/manufacturer/MID-...").
 * Server and first client render use SITE_URL (no hydration mismatch); after
 * mount it switches to the current origin, like the old pages did.
 */
export function QrCode({ path, size = 120, alt, className }: { path: string; size?: number; alt: string; className?: string }) {
  const [origin, setOrigin] = useState(SITE_URL);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size * 2}x${size * 2}&margin=0&data=${encodeURIComponent(`${origin}${path}`)}`;
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={cn("bg-white rounded-lg border border-slate-200 p-1.5 shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );
}
