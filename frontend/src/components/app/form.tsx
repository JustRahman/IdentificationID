import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared class strings for app form controls (presentation only). */
export const inputClass =
  "w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs " +
  "hover:border-slate-400 disabled:bg-slate-50 disabled:text-slate-500";
export const textareaClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs hover:border-slate-400 leading-relaxed";
export const selectClass = inputClass + " pr-8";
export const labelClass = "block text-sm font-medium text-slate-800 mb-1.5";
export const helpClass = "text-xs text-slate-500 mt-1.5 leading-relaxed";

/** Label + control + help/error. `htmlFor` should match the control id when given. */
export function Field({
  label,
  htmlFor,
  required,
  help,
  error,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  required?: boolean;
  help?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
        {required && <span className="text-red-600 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600 mt-1.5">{error}</p> : help ? <p className={helpClass}>{help}</p> : null}
    </div>
  );
}

/** Red error box for form-level errors. */
export function FormError({ children, className }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <div role="alert" className={cn("rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700", className)}>
      {children}
    </div>
  );
}
