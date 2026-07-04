import Link from "next/link";
import { PLANS } from "@/lib/constants";

const THEME: Record<string, { card: string; onLight: boolean; button: string; badge?: string; badgeColor?: string }> = {
  free:       { card: "bg-green-600 border-green-600 text-white", onLight: false, button: "bg-white text-green-700 hover:bg-green-50" },
  standard:   { card: "bg-orange-500 border-orange-500 text-white", onLight: false, button: "bg-white text-orange-600 hover:bg-orange-50" },
  popular:    { card: "bg-accent border-accent text-white", onLight: false, button: "bg-white text-accent hover:bg-blue-50", badge: "Most popular", badgeColor: "text-white/90" },
  best_value: { card: "bg-slate-900 border-slate-900 text-white ring-1 ring-amber-400", onLight: false, button: "bg-amber-400 text-slate-900 hover:bg-amber-300", badge: "Best value", badgeColor: "text-amber-400" },
  enterprise: { card: "bg-amber-400 border-amber-400 text-slate-900", onLight: true, button: "bg-slate-900 text-white hover:bg-slate-800" },
};

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <h1 className="text-2xl font-semibold text-center mb-2">Pricing</h1>
      <p className="text-muted text-center mb-12">
        Start free, then choose an annual plan as you grow.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PLANS.map((p) => {
          const t = THEME[p.key] ?? { card: "bg-background border-border", onLight: true, button: "border border-border text-foreground hover:bg-surface" };
          const muted = t.onLight ? "text-slate-700" : "text-white/75";
          const check = t.onLight ? "text-slate-900" : "text-white";
          return (
          <div key={p.key} className={`rounded-xl p-6 border ${t.card}`}>
            {t.badge && (
              <span className={`text-xs font-semibold mb-3 block ${t.badgeColor}`}>
                {t.badge}
              </span>
            )}
            <h3 className="text-base font-semibold">{p.en.name}</h3>
            <p className={`text-sm mb-4 ${muted}`}>{p.en.desc}</p>
            <div className="mb-5">
              <span className="text-3xl font-semibold">${p.priceCents / 100}</span>
              <span className={`text-xs ${muted}`}> {p.en.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {p.en.features.map((f) => (
                <li key={f} className={`text-sm flex items-center gap-2 ${muted}`}>
                  <svg className={`w-4 h-4 flex-shrink-0 ${check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={`block text-center py-2.5 rounded-lg text-sm font-medium ${t.button}`}
            >
              Get Started
            </Link>
          </div>
          );
        })}
      </div>
    </div>
  );
}
