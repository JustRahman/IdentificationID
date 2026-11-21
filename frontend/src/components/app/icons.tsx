import { cn } from "@/lib/utils";

/** Outline icons (24px grid, stroke) for the app shell and admin. */
const PATHS = {
  home: "M3 10.5L12 3l9 7.5M5 9v11h5v-6h4v6h5V9",
  building: "M3 21h18M5 21V7l7-4 7 4v14M9 9h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1",
  box: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  card: "M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7zm0 3h18M7 15h3",
  key: "M15 7a3 3 0 11-6 0 3 3 0 016 0zm-3 3v11m0-4h3m-3-3h2",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z",
  flag: "M5 21V4m0 0h11l-1.5 4L16 12H5",
  ban: "M5.6 5.6l12.8 12.8M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  lock: "M6 11h12v9H6v-9zm2 0V8a4 4 0 118 0v3",
  logout: "M15 17l5-5-5-5m5 5H9m3 9H5a2 2 0 01-2-2V5a2 2 0 012-2h7",
  back: "M10 19l-7-7 7-7m-7 7h18",
  plus: "M12 5v14M5 12h14",
  external: "M14 4h6v6m0-6L10 14M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5",
  check: "M5 13l4 4L19 7",
  x: "M6 18L18 6M6 6l12 12",
  alert: "M12 9v4m0 4h.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  info: "M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  clock: "M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z",
  mail: "M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z",
  menu: "M4 6h16M4 12h16M4 18h16",
} as const;

export type AppIconName = keyof typeof PATHS;

export function AppIcon({ name, className }: { name: AppIconName; className?: string }) {
  return (
    <svg className={cn("w-4 h-4 shrink-0", className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
