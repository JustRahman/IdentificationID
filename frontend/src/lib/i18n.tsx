"use client";

// ---------------------------------------------------------------------------
// Whole-app machine translation.
// A single client-side layer that translates every visible text node into the
// selected language using the shared translateText() helper, caches results in
// localStorage, and re-applies on navigation / re-render. No per-string wiring
// needed — pick a language in the nav and the whole app follows.
//
// Translations are fetched in one batched request from our own backend
// (/translate), which caches every phrase in the database — so the external
// translation API is hit at most once per phrase across all visitors. No
// per-visitor rate limits, no request storm.
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
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

// Fetch translations for a batch of phrases from our cached backend endpoint.
async function fetchTranslations(texts: string[], target: string): Promise<Record<string, string>> {
  const res = await fetch(`${API_BASE}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, target }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return (json && json.data) || {};
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
      const list = Array.from(need);
      try {
        const data = await fetchTranslations(list, target);
        for (const key of list) cache.current[key] = data[key] ?? key;
      } catch {
        for (const key of list) cache.current[key] = key;
      }
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
