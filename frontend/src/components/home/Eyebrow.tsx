import { cn } from "@/lib/utils";
import { TONES, type Tone } from "./colors";

/** Colored eyebrow pill for homepage sections (dot + label). */
export function Eyebrow({ tone = "blue", children, className }: { tone?: Tone; children: string; className?: string }) {
  return (
    <p className={cn("mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide", TONES[tone].chip, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", TONES[tone].badge)} aria-hidden="true" />
      {children}
    </p>
  );
}
