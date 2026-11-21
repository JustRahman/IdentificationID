import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  q: string;
  a: ReactNode;
  id?: string;
}

/**
 * Accessible accordion built on native <details>/<summary> (keyboard + screen-reader
 * support for free, works without JS, content stays in the DOM for search and translation).
 */
export function Accordion({
  items,
  openFirst = false,
  className,
}: {
  items: AccordionItem[];
  openFirst?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white divide-y divide-slate-200", className)}>
      {items.map((f, i) => (
        <details key={f.q} id={f.id} className="group px-5 sm:px-6 scroll-mt-24" open={openFirst && i === 0}>
          <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer text-[15px] font-medium text-slate-900 rounded-md">
            {f.q}
            <svg
              className="w-4 h-4 shrink-0 text-slate-400 transition-transform group-open:rotate-45"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M8 3v10M3 8h10" />
            </svg>
          </summary>
          <div className="pb-5 -mt-1 text-sm text-slate-600 leading-relaxed max-w-prose">{f.a}</div>
        </details>
      ))}
    </div>
  );
}
