import Link from "next/link";
import { PLANS } from "@/lib/constants";

const plans = PLANS.map((p) => ({
  name: p.en.name,
  price: `$${p.priceCents / 100}`,
  period: p.en.period,
  desc: p.en.desc,
  features: p.en.features,
  popular: p.popular,
  premium: p.premium,
}));

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-2xl font-semibold text-center mb-2">Pricing</h1>
      <p className="text-muted text-center mb-12">
        Simple annual pricing. Choose a plan when you register your products.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl p-6 border ${
              plan.premium
                ? "bg-slate-900 border-slate-900 text-white ring-1 ring-amber-400"
                : plan.popular
                ? "bg-background border-accent ring-1 ring-accent"
                : "bg-background border-border"
            }`}
          >
            {plan.popular && (
              <span className="text-xs font-medium text-accent mb-3 block">
                Most popular
              </span>
            )}
            {plan.premium && (
              <span className="text-xs font-semibold text-amber-400 mb-3 block">
                Best value
              </span>
            )}
            <h3 className="text-base font-semibold">{plan.name}</h3>
            <p className={`text-sm mb-4 ${plan.premium ? "text-white/70" : "text-muted"}`}>{plan.desc}</p>
            <div className="mb-5">
              <span className="text-3xl font-semibold">{plan.price}</span>
              <span className={`text-xs ${plan.premium ? "text-white/60" : "text-muted"}`}> {plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className={`text-sm flex items-center gap-2 ${plan.premium ? "text-white/80" : "text-muted"}`}>
                  <svg className={`w-4 h-4 flex-shrink-0 ${plan.premium ? "text-amber-400" : "text-accent"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className={`block text-center py-2.5 rounded-lg text-sm font-medium ${
                plan.premium
                  ? "bg-amber-400 text-slate-900 hover:bg-amber-300"
                  : plan.popular
                  ? "bg-accent text-white hover:bg-accent-hover"
                  : "border border-border text-foreground hover:bg-surface"
              }`}
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
