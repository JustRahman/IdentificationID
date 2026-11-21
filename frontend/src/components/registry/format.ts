/**
 * Deterministic formatting for registry pages. Server and browser must render
 * the exact same string, so no toLocaleDateString() (that caused the React
 * hydration warning on /manufacturer/[mid] and /p/[id]).
 */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function parts(iso: string | null | undefined): { y: number; m: number; d: number } | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12) return null;
  return { y, m, d };
}

/** "2026-09-30" or "2026-09-30T16:37:27" -> "September 2026". */
export function monthYear(iso: string | null | undefined): string {
  const p = parts(iso);
  return p ? `${MONTHS[p.m - 1]} ${p.y}` : "";
}

/** -> "Sep 2026" */
export function shortMonthYear(iso: string | null | undefined): string {
  const p = parts(iso);
  return p ? `${MONTHS[p.m - 1].slice(0, 3)} ${p.y}` : "";
}

/** -> "Sep 30, 2026" */
export function fullDate(iso: string | null | undefined): string {
  const p = parts(iso);
  return p ? `${MONTHS[p.m - 1].slice(0, 3)} ${p.d}, ${p.y}` : "";
}

/** Country code -> English name ("US" -> "United States"). Falls back to the code. */
const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  try {
    return regionNames?.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** Display a website without protocol / trailing slash. */
export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/** Only ever link http(s) URLs. */
export function safeHref(url: string | null | undefined): string | null {
  return url && /^https?:\/\//i.test(url) ? url : null;
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? "")).toUpperCase() || "?";
}
