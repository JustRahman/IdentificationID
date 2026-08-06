import Link from "next/link";
import { PLANS, REGISTRY_MEMBERSHIP } from "@/lib/constants";

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

      {/* Manufacturer Registry Membership — optional add-on (highlighted) */}
      <div className="mt-12">
        <div className="relative rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-violet-50 border-2 border-indigo-300 ring-1 ring-indigo-200 shadow-md">
          <div className="absolute -top-3 left-6 text-[10px] font-bold bg-indigo-600 text-white px-3 py-1 rounded-full shadow">
            OPTIONAL ADD-ON
          </div>
          <div className="flex items-start justify-between gap-6 flex-wrap mt-2">
            <div className="flex-1 min-w-[260px]">
              <h2 className="text-lg font-semibold mb-1 text-indigo-950">{REGISTRY_MEMBERSHIP.en.name}</h2>
              <p className="text-sm text-indigo-900/70 mb-4">{REGISTRY_MEMBERSHIP.en.desc}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {REGISTRY_MEMBERSHIP.en.features.map((f) => (
                  <li key={f} className="text-sm text-indigo-900/80 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-center shrink-0">
              <div>
                <span className="text-3xl font-bold text-indigo-950">
                  ${REGISTRY_MEMBERSHIP.priceCents / 100}
                </span>
                <span className="text-sm text-indigo-900/60">{REGISTRY_MEMBERSHIP.en.period}</span>
              </div>
              <p className="text-xs text-indigo-700 font-medium mt-1 mb-4">{REGISTRY_MEMBERSHIP.en.annualNote}</p>
              <Link
                href="/register"
                className="block text-center px-6 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Join the registry
              </Link>
            </div>
          </div>
          <p className="text-xs text-indigo-900/60 mt-5 pt-4 border-t border-indigo-200">
            Your Manufacturer ID is free and permanent. Membership activates your public
            manufacturer profile, QR code and registry visibility — if it lapses, the ID
            keeps working and the profile is simply marked inactive.
          </p>
        </div>
      </div>
    </div>
  );
}
