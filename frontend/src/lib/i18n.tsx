"use client";

// ---------------------------------------------------------------------------
// Whole-app machine translation.
// A single client-side layer that translates every visible text node into the
// selected language using the shared translateText() helper, caches results in
// localStorage, and re-applies on navigation / re-render. No per-string wiring
// needed — pick a language in the nav and the whole app follows.
//
// Note: uses the free MyMemory API (rate-limited). For production-grade,
// full-volume translation, swap translateText() for a keyed provider
// (Google/DeepL) — the rest of this layer stays the same.
// ---------------------------------------------------------------------------

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { translateText } from "@/lib/translate";

const STORAGE_LANG = "ui_lang";
const cacheKey = (lang: string) => `ui_tr_${lang}`;

interface LanguageCtx {
  lang: string;
  setLang: (lang: string) => void;
}

const Ctx = createContext<LanguageCtx | null>(null);

// Tags whose text must never be translated.
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "TEXTAREA",
  "INPUT", "SELECT", "OPTION", "SVG", "PATH",
]);

interface I18nText extends Text {
  __i18nSrc?: string;      // original English text
  __i18nApplied?: string;  // the translated text we last wrote
}

function shouldSkip(node: I18nText): boolean {
  const p = node.parentElement;
  if (!p) return true;
  if (SKIP_TAGS.has(p.tagName)) return true;
  if (p.closest("[data-no-i18n]")) return true;
  const t = (node.textContent || "").trim();
  if (t.length < 2) return true;            // tiny / punctuation
  if (!/[A-Za-z]/.test(t)) return true;     // numbers, symbols, codes
  if (/^IID-/i.test(t)) return true;        // product IDs
  if (/^\S+@\S+\.\S+$/.test(t)) return true; // emails
  return false;
}

// Run async tasks with limited concurrency to be gentle on the translation API.
async function mapLimit<T>(items: T[], limit: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");
  const cache = useRef<Record<string, string>>({});
  const observer = useRef<MutationObserver | null>(null);
  const running = useRef(false);
  const rerunQueued = useRef(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore saved language on mount.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_LANG);
    if (saved) setLangState(saved);
  }, []);

  const collect = (): I18nText[] => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const out: I18nText[] = [];
    let n = walker.nextNode();
    while (n) {
      out.push(n as I18nText);
      n = walker.nextNode();
    }
    return out;
  };

  const restoreEnglish = useCallback(() => {
    for (const node of collect()) {
      if (node.__i18nSrc !== undefined && node.textContent === node.__i18nApplied) {
        node.textContent = node.__i18nSrc;
      }
    }
  }, []);

  const translatePage = useCallback(async (target: string) => {
    if (target === "en") return;
    if (running.current) { rerunQueued.current = true; return; }
    running.current = true;

    const nodes = collect().filter((n) => !shouldSkip(n));
    const nodeSrc = new Map<I18nText, string>();
    const need = new Set<string>();

    for (const node of nodes) {
      const cur = node.textContent || "";
      // Already translated and untouched since → skip.
      if (node.__i18nApplied !== undefined && node.__i18nApplied === cur) continue;
      // New node, or React rewrote it back to source — treat current as English source.
      const src = cur;
      node.__i18nSrc = src;
      nodeSrc.set(node, src);
      const key = src.trim();
      if (cache.current[key] === undefined) need.add(key);
    }

    if (need.size) {
      await mapLimit(Array.from(need), 6, async (key) => {
        try { cache.current[key] = await translateText(key, "en", target); }
        catch { cache.current[key] = key; }
      });
      try { localStorage.setItem(cacheKey(target), JSON.stringify(cache.current)); } catch {}
    }

    // Apply translations without retriggering our own observer.
    observer.current?.disconnect();
    for (const [node, src] of nodeSrc) {
      const key = src.trim();
      const tr = cache.current[key];
      if (tr && tr !== src) {
        const lead = src.match(/^\s*/)?.[0] ?? "";
        const trail = src.match(/\s*$/)?.[0] ?? "";
        node.textContent = lead + tr + trail;
        node.__i18nApplied = node.textContent;
      }
    }
    connectObserver();

    running.current = false;
    if (rerunQueued.current) {
      rerunQueued.current = false;
      translatePage(target);
    }
  }, []);

  const connectObserver = useCallback(() => {
    if (!observer.current) {
      observer.current = new MutationObserver(() => {
        if (debounce.current) clearTimeout(debounce.current);
        debounce.current = setTimeout(() => {
          const current = localStorage.getItem(STORAGE_LANG) || "en";
          if (current !== "en") translatePage(current);
        }, 250);
      });
    }
    observer.current.observe(document.body, { childList: true, subtree: true, characterData: true });
  }, [translatePage]);

  // React to language changes.
  useEffect(() => {
    // load cache for this language
    try { cache.current = JSON.parse(localStorage.getItem(cacheKey(lang)) || "{}"); }
    catch { cache.current = {}; }

    if (lang === "en") {
      observer.current?.disconnect();
      restoreEnglish();
      return;
    }
    translatePage(lang);
    connectObserver();
    return () => observer.current?.disconnect();
  }, [lang, translatePage, connectObserver, restoreEnglish]);

  const setLang = useCallback((l: string) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_LANG, l); } catch {}
  }, []);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLanguage(): LanguageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
