import Link from "next/link";
import { PLANS, REGISTRY_MEMBERSHIP, type PlanTier } from "@/lib/constants";
import { PLAN_THEME, MEMBERSHIP_THEME } from "@/components/ui/planTheme";
import { cn } from "@/lib/utils";

/**
 * Colored plan cards (restored per-plan colors from before the redesign).
 * Prices, names and features always come from lib/constants.ts.
 */

const usd = (cents: number) => `$${cents / 100}`;

function Check({ className }: { className?: string }) {
  return (
    <svg
      className={cn("w-4 h-4 mt-0.5 shrink-0", className)}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 10.5l3.2 3.2L15 7" />
    </svg>
  );
}

const btnBase =
  "inline-flex items-center justify-center h-11 px-5 rounded-xl text-sm font-semibold transition-colors shadow-sm " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/** Indigo / violet Manufacturer Registry Membership card. */
export function MembershipCard({
  badge = "Registry membership",
  footnote = "Your Manufacturer ID is permanent. If your membership lapses, the ID, product pages and QR codes keep working - your profile is marked Inactive and adding or editing products pauses until you renew.",
  className,
}: {
  badge?: string;
  footnote?: string;
  className?: string;
}) {
  const monthly = REGISTRY_MEMBERSHIP.priceCents / 100;
  const annual = REGISTRY_MEMBERSHIP.annualPriceCents / 100;
  const t = MEMBERSHIP_THEME;
  return (
    <div className={cn("relative rounded-2xl p-6 sm:p-8", t.card, className)}>
      <span className={cn("absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-sm", t.badge)}>
        {badge}
      </span>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start mt-1">
        <div>
          <h3 className={cn("text-xl font-semibold tracking-tight", t.title)}>{REGISTRY_MEMBERSHIP.en.name}</h3>
          <p className={cn("mt-1.5 text-sm leading-relaxed max-w-2xl", t.body)}>{REGISTRY_MEMBERSHIP.en.desc}</p>
          <ul className="mt-5 grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {REGISTRY_MEMBERSHIP.en.features.map((f) => (
              <li key={f} className={cn("flex items-start gap-2.5 text-sm", t.body)}>
                <Check className={t.check} />
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div className={cn("lg:border-l lg:pl-8", t.divider)}>
          <p>
            <span className={cn("text-4xl font-bold tracking-tight tabular-nums", t.title)}>${monthly}</span>
            <span className="text-sm text-indigo-900/70"> / month</span>
          </p>
          <p className={cn("mt-1 text-sm", t.title)}>
            or <span className="font-semibold tabular-nums">${annual} / year</span>
          </p>
          <p className="mt-1 text-xs font-medium text-indigo-700">Yearly recommended - save ${monthly * 12 - annual}</p>
          <Link href="/register" className={cn(btnBase, "mt-5 w-full focus-visible:outline-indigo-600", t.button)}>
            Join the registry
          </Link>
        </div>
      </div>
      {footnote && (
        <p className={cn("mt-6 pt-5 border-t text-sm leading-relaxed text-indigo-900/70", t.divider)}>{footnote}</p>
      )}
    </div>
  );
}

/** One colored product-plan card. */
export function PlanCard({ plan, cta = "Get Started", href = "/register" }: { plan: PlanTier; cta?: string; href?: string }) {
  const t = PLAN_THEME[plan.key];
  return (
    <div className={cn("relative flex flex-col rounded-2xl border p-6 transition-transform hover:-translate-y-0.5", t.card, t.emphasis)}>
      {t.badge && (
        <span className={cn("absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider shadow-sm", t.badge.className)}>
          {t.badge.label}
        </span>
      )}
      <h4 className="text-base font-semibold tracking-tight">{plan.en.name}</h4>
      <p className={cn("mt-1 text-sm", t.muted)}>{plan.en.desc}</p>
      <p className="mt-5">
        <span className="text-4xl font-bold tracking-tight tabular-nums">{usd(plan.priceCents)}</span>
        <span className={cn("block mt-1 text-xs font-medium", t.muted)}>{plan.en.period}</span>
      </p>
      <ul className="mt-5 mb-6 flex-1 space-y-2">
        {plan.en.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className={t.check} />
            <span className={t.muted}>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={href} className={cn(btnBase, "w-full", t.button, plan.key === "enterprise" && "focus-visible:outline-slate-900")}>
        {cta}
      </Link>
    </div>
  );
}

/** 4 colored plan cards in a grid. */
export function PlanCardGrid({ className, cta }: { className?: string; cta?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-3", className)}>
      {PLANS.map((p) => (
        <PlanCard key={p.key} plan={p} cta={cta} />
      ))}
    </div>
  );
}

/** Compact colored mini-grid (homepage): membership strip + 2x2 plan tiles. */
export function PlanMiniGrid({ className }: { className?: string }) {
  const t = MEMBERSHIP_THEME;
  return (
    <div className={cn("space-y-3", className)}>
      <div className={cn("rounded-2xl px-5 py-4 flex items-center justify-between gap-4", t.card)}>
        <div className="min-w-0">
          <p className={cn("text-sm font-semibold", t.title)}>Registry Membership</p>
          <p className="text-xs text-indigo-900/75">Manufacturer ID + first 3 Product IDs</p>
        </div>
        <p className={cn("text-right whitespace-nowrap tabular-nums", t.title)}>
          <span className="text-xl font-bold">{usd(REGISTRY_MEMBERSHIP.priceCents)}</span>
          <span className="text-xs text-indigo-900/75">/mo</span>
          <span className="block text-xs font-medium text-indigo-700">or {usd(REGISTRY_MEMBERSHIP.annualPriceCents)}/yr</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PLANS.map((p) => {
          const pt = PLAN_THEME[p.key];
          return (
            <div key={p.key} className={cn("relative rounded-2xl border p-4", pt.card)}>
              {pt.badge && (
                <span className={cn("absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider shadow-sm", pt.badge.className)}>
                  {pt.badge.label}
                </span>
              )}
              <p className="text-sm font-semibold">{p.en.name}</p>
              <p className="mt-2 tabular-nums">
                <span className="text-2xl font-bold tracking-tight">{usd(p.priceCents)}</span>
                <span className={cn("text-xs font-medium", pt.muted)}>{p.perProduct ? " / product / mo" : " / mo"}</span>
              </p>
              <p className={cn("mt-1 text-xs", pt.muted)}>{p.en.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
