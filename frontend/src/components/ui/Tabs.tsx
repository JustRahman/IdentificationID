"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  /** Optional count pill, e.g. Products (3). */
  count?: number;
}

/**
 * Controlled tabs with count pills and arrow-key navigation.
 *   const [tab, setTab] = useState("overview");
 *   <Tabs items={[{id:"overview",label:"Overview"},{id:"products",label:"Products",count:3}]} value={tab} onChange={setTab} />
 *   {tab === "overview" && <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">...</div>}
 * variant "underline" (page sections) or "segmented" (compact switcher, e.g. search modes).
 */
export function Tabs({
  items,
  value,
  onChange,
  variant = "underline",
  ariaLabel,
  idPrefix = "tab",
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: "underline" | "segmented";
  ariaLabel?: string;
  idPrefix?: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % items.length;
    if (e.key === "ArrowLeft") next = (i - 1 + items.length) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onChange(items[next].id);
      refs.current[next]?.focus();
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        variant === "underline" && "flex gap-6 border-b border-slate-200 overflow-x-auto",
        variant === "segmented" && "inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1",
        className,
      )}
    >
      {items.map((t, i) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-${t.id}`}
            aria-selected={active}
            aria-controls={`${idPrefix}panel-${t.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap transition-colors",
              variant === "underline" &&
                cn("-mb-px border-b-2 py-3", active ? "border-accent text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"),
              variant === "segmented" &&
                cn("rounded-lg px-3.5 py-1.5", active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"),
            )}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                className={cn(
                  "rounded-full px-1.5 min-w-5 text-center text-[11px] tabular-nums leading-5",
                  active ? "bg-blue-50 text-accent" : "bg-slate-100 text-slate-500",
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
