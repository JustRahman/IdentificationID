"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PhotoPlaceholder } from "./EmptyState";

/**
 * Product photo that falls back to the clean "No photo yet" placeholder when
 * the URL is missing or fails to load. Size it with className on the parent
 * or pass className (e.g. "w-full h-full object-cover").
 */
export function ProductImage({
  src,
  alt,
  className,
  placeholderClassName,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // A server-rendered image can fail before React hydrates (onError never fires), so check once on mount.
  useEffect(() => {
    const img = ref.current;
    if (!img || !img.complete || img.naturalWidth !== 0) return;
    const t = window.setTimeout(() => setFailed(true), 0);
    return () => window.clearTimeout(t);
  }, [src]);
  if (!src || failed) return <PhotoPlaceholder className={cn("w-full h-full", placeholderClassName)} />;
  return <img ref={ref} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
}
