import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppIcon, type AppIconName } from "./icons";

type Tone = "info" | "warning" | "error" | "success" | "neutral";

const TONES: Record<Tone, { box: string; icon: string; title: string; body: string; name: AppIconName }> = {
  info: { box: "bg-blue-50/60 border-blue-200", icon: "text-blue-600", title: "text-slate-900", body: "text-slate-600", name: "info" },
  warning: { box: "bg-amber-50 border-amber-200", icon: "text-amber-600", title: "text-amber-900", body: "text-amber-800", name: "alert" },
  error: { box: "bg-red-50 border-red-200", icon: "text-red-600", title: "text-red-900", body: "text-red-700", name: "x" },
  success: { box: "bg-emerald-50 border-emerald-200", icon: "text-emerald-600", title: "text-emerald-900", body: "text-emerald-800", name: "check" },
  neutral: { box: "bg-slate-50 border-slate-200", icon: "text-slate-500", title: "text-slate-900", body: "text-slate-600", name: "info" },
};

/** Inline status banner: icon, title, body, optional action on the right. */
export function Notice({
  tone = "info",
  title,
  children,
  action,
  icon,
  className,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  icon?: AppIconName;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div className={cn("rounded-xl border px-4 py-3.5 flex items-start gap-3 flex-wrap sm:flex-nowrap", t.box, className)}>
      <AppIcon name={icon ?? t.name} className={cn("w-5 h-5 mt-0.5", t.icon)} />
      <div className="flex-1 min-w-0">
        {title && <p className={cn("text-sm font-semibold", t.title)}>{title}</p>}
        {children && <div className={cn("text-sm leading-relaxed", title ? "mt-0.5" : undefined, t.body)}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
