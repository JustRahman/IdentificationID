"use client";

import { useState } from "react";

/** Share the current page: native share sheet on phones, copy link elsewhere. */
export function ShareButton({ title, label = "Share profile" }: { title: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function onClick() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled */
    }
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-accent"
    >
      <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="18" cy="5" r="2.5" />
        <circle cx="6" cy="12" r="2.5" />
        <circle cx="18" cy="19" r="2.5" />
        <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
      </svg>
      {copied ? "Link copied" : label}
    </button>
  );
}
