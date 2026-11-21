import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Page container: max-w-6xl with responsive side padding. */
export function Container({ className, children, size = "default" }: { className?: string; children: ReactNode; size?: "default" | "narrow" }) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-6", size === "narrow" ? "max-w-3xl" : "max-w-6xl", className)}>
      {children}
    </div>
  );
}

/** Section wrapper with the standard vertical rhythm (py-20 / py-24). */
export function Section({
  id,
  tone = "white",
  className,
  children,
}: {
  id?: string;
  tone?: "white" | "surface";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-20 sm:py-24 scroll-mt-16",
        tone === "surface" && "bg-surface border-y border-slate-200",
        className,
      )}
    >
      {children}
    </section>
  );
}
