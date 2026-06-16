"use client";

import { useLanguage } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/constants";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, translating } = useLanguage();
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} data-no-i18n>
      {translating ? (
        <svg className="w-4 h-4 text-accent shrink-0 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      )}
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        disabled={translating}
        aria-label="Language"
        className="text-sm bg-transparent border border-border rounded-lg px-2 py-1 cursor-pointer hover:border-accent focus:outline-none focus:border-accent disabled:opacity-60 disabled:cursor-wait"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {translating && l.code === lang ? `${l.label} …` : l.label}
          </option>
        ))}
      </select>
    </span>
  );
}
