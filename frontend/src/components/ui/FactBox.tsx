import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FactList, type Fact } from "./FactList";

/**
 * Wikipedia / Wikidata-style infobox: bordered box with a title row,
 * optional media (logo, QR) and label/value rows.
 *   <FactBox title="Registry record" items={facts} footer={<QR/>} />
 */
export function FactBox({
  title,
  subtitle,
  media,
  items,
  footer,
  sticky = false,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  media?: ReactNode;
  items: Fact[];
  footer?: ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <aside className={cn("bg-white border border-slate-200 rounded-2xl overflow-hidden", sticky && "lg:sticky lg:top-24", className)}>
      <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {media && <div className="px-5 pt-5">{media}</div>}
      <div className="px-5 py-1">
        <FactList items={items} dense />
      </div>
      {footer && <div className="px-5 py-4 border-t border-slate-200">{footer}</div>}
    </aside>
  );
}
