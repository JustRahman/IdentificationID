"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { PLANS } from "@/lib/constants";
import { Badge, EmptyState, buttonClasses } from "@/components/ui";
import { Notice, PageHeader, Panel, StatusPill, tableClass, tableWrap, tbodyClass, tdClass, thClass, theadClass } from "@/components/app";

interface PlanData {
  plan: string;
  plan_name: string;
  price_cents: number;
  product_limit: number;
  products_used: number;
  membership_active: boolean;
  subscription: {
    status: string;
    paid_until: string;
    cancel_at_period_end?: boolean;
  } | null;
}

interface RegistryData {
  manufacturer_id: string | null;
  active: boolean;
  included_in_plan: boolean;
  paid_until: string | null;
  cancel_at_period_end: boolean;
  can_cancel: boolean;
  founding_member?: boolean;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "";
  // Date-only values ("2027-07-01") are UTC midnight; format in UTC so they don't shift a day back.
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

interface PaymentItem {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  created_at: string | null;
}

export default function BillingPage() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [registry, setRegistry] = useState<RegistryData | null>(null);
  const [confirming, setConfirming] = useState<"registry" | "plan" | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [planRes, paymentsRes, registryRes] = await Promise.allSettled([
        api.get<{ success: boolean; data: PlanData }>("/billing/plan"),
        api.get<{ success: boolean; data: PaymentItem[] }>("/billing/payments"),
        api.get<{ success: boolean; data: RegistryData }>("/billing/registry"),
      ]);
      if (planRes.status === "fulfilled") setPlan(planRes.value.data);
      if (paymentsRes.status === "fulfilled") setPayments(paymentsRes.value.data);
      if (registryRes.status === "fulfilled") setRegistry(registryRes.value.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(what: "registry" | "plan", action: "cancel" | "resume") {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await api.post<{ success: boolean; data: { paid_until: string | null } }>(
        `/billing/${what}/${action}`
      );
      setNotice(
        action === "cancel"
          ? `Cancelled. Nothing more will be charged. Everything stays active until ${fmtDate(res.data.paid_until)}.`
          : "Automatic renewal is back on."
      );
      setConfirming(null);
      await load();
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Could not update your subscription. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpgrade(planKey: string) {
    setUpgrading(true);
    setError("");
    try {
      const res = await api.post<{ success: boolean; data: { checkout_url?: string; message?: string } }>(
        "/billing/checkout",
        { plan: planKey }
      );
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        setError(res.data.message || "Stripe not configured");
      }
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Checkout failed");
    } finally {
      setUpgrading(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  const usagePercent = plan
    ? plan.product_limit > 0
      ? Math.min(100, Math.round((plan.products_used / plan.product_limit) * 100))
      : 0
    : 0;

  const cancelBtn = "inline-flex items-center h-9 px-4 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50";
  const keepBtn = buttonClasses("secondary", "sm", "h-9");

  return (
    <div>
      <PageHeader title="Billing" description="Your registry membership, plan and payment history." />

      {error && <Notice tone="error" className="mb-4">{error}</Notice>}

      {notice && <Notice tone="success" className="mb-4">{notice}</Notice>}

      <div className="grid gap-6 lg:grid-cols-2 items-start mb-6">
      {registry && registry.active && !registry.included_in_plan && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)]">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">Manufacturer Registry Membership</h2>
            {registry.founding_member && !registry.can_cancel ? (
              <Badge tone="verified" dot size="xs">Free registration</Badge>
            ) : registry.cancel_at_period_end ? (
              <Badge tone="pending" dot size="xs">Cancelled</Badge>
            ) : (
              <Badge tone="verified" dot size="xs">Active</Badge>
            )}
          </div>
          {registry.manufacturer_id && (
            <p className="text-sm text-slate-700 font-mono tabular-nums font-semibold mb-4" data-no-i18n>{registry.manufacturer_id}</p>
          )}
          <div className="border-t border-slate-100 pt-4">
          {registry.founding_member && !registry.can_cancel ? (
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="text-emerald-700 font-medium">Free registration.</span> Free until{" "}
              <strong className="text-slate-900">{fmtDate(registry.paid_until)}</strong>. No card is on file and nothing will be
              charged. Your company stays in the registry permanently; after that you can choose to keep an active membership.
            </p>
          ) : registry.cancel_at_period_end ? (
            <>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                <span className="text-amber-700 font-medium">Cancelled.</span> Active until{" "}
                <strong className="text-slate-900">{fmtDate(registry.paid_until)}</strong>. It will not renew and you won&apos;t be charged again.
              </p>
              <button
                onClick={() => toggle("registry", "resume")}
                disabled={busy}
                className={buttonClasses("secondary", "md")}
              >
                Keep my membership
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4">
                Renews automatically on <strong className="text-slate-900">{fmtDate(registry.paid_until)}</strong>.
              </p>
              {confirming === "registry" ? (
                <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-sm text-amber-900 leading-relaxed space-y-3">
                  <p>
                    Cancel automatic renewal? Your membership stays active until {fmtDate(registry.paid_until)}.
                    After that your profile shows as Inactive and you can&apos;t add or edit products. Your
                    Manufacturer ID stays reserved for you. Payments already made are not refunded (see the{" "}
                    <a href="/legal/refund" target="_blank" className="underline">Refund &amp; Cancellation Policy</a>).
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggle("registry", "cancel")}
                      disabled={busy}
                      className={cancelBtn}
                    >
                      {busy ? "Cancelling..." : "Yes, cancel"}
                    </button>
                    <button
                      onClick={() => setConfirming(null)}
                      className={keepBtn}
                    >
                      Keep it
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirming("registry")}
                  className="text-sm text-slate-500 hover:text-red-700 hover:underline"
                >
                  Cancel membership
                </button>
              )}
            </>
          )}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 mb-4">Current Plan</h2>
        <div className="mb-3 flex items-baseline justify-between gap-3 flex-wrap">
          <span className="text-2xl font-semibold tracking-tight text-slate-900">{plan?.plan_name || "Registry Membership"}</span>
          <span className="text-sm text-slate-500 tabular-nums">
            {plan?.products_used || 0} / {plan?.product_limit === -1 ? "Unlimited" : plan?.product_limit || 3} products used
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5">
          <div
            className="bg-accent h-1.5 rounded-full"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        {plan?.subscription && (
          <dl className="grid grid-cols-2 gap-3 mb-5 border-t border-slate-100 pt-4">
            <div>
              <dt className="text-xs text-slate-500">Status</dt>
              <dd className="text-sm font-medium text-slate-900 capitalize mt-0.5">{plan.subscription.status}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">{plan.subscription.cancel_at_period_end ? "Active until (cancelled)" : "Next billing / renews"}</dt>
              <dd className="text-sm font-medium text-slate-900 mt-0.5">
                {(() => {
                  const d = new Date(plan.subscription.paid_until);
                  return isNaN(d.getTime()) ? plan.subscription.paid_until : d.toLocaleDateString(undefined, { timeZone: "UTC" });
                })()}
              </dd>
            </div>
          </dl>
        )}
        {plan?.subscription && plan.subscription.status === "active" && plan.plan !== "membership" && (
          <div className="mb-4">
            {plan.subscription.cancel_at_period_end ? (
              <button onClick={() => toggle("plan", "resume")} disabled={busy}
                className={buttonClasses("secondary", "md")}>
                Keep my plan
              </button>
            ) : confirming === "plan" ? (
              <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 text-sm text-amber-900 space-y-3">
                <p>Cancel automatic renewal of this plan? It stays active until the date above and is not refunded.</p>
                <div className="flex gap-2">
                  <button onClick={() => toggle("plan", "cancel")} disabled={busy}
                    className={cancelBtn}>
                    {busy ? "Cancelling..." : "Yes, cancel"}
                  </button>
                  <button onClick={() => setConfirming(null)}
                    className={keepBtn}>
                    Keep it
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirming("plan")} className="text-sm text-slate-500 hover:text-red-700 hover:underline">
                Cancel plan
              </button>
            )}
          </div>
        )}
        {(!plan || plan.plan === "membership") && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-medium text-slate-500 mb-3">Paid plans (optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PLANS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleUpgrade(p.key)}
                  disabled={upgrading}
                  className={`h-10 px-4 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors bg-white border text-slate-900 shadow-xs hover:bg-slate-50 ${
                    p.popular ? "border-accent/60" : "border-slate-300"
                  }`}
                >
                  {p.en.name} (${p.priceCents / 100}
                  {p.perProduct ? "/product" : "/mo"})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      <Panel title="Payment History" flush>
        {payments.length === 0 ? (
          <EmptyState icon="document" compact title="No payments yet." className="!border-0 !rounded-none !bg-transparent" />
        ) : (
          <div className={tableWrap}>
            <table className={tableClass}>
              <thead className={theadClass}>
                <tr>
                  <th className={thClass}>Date</th>
                  <th className={thClass}>Amount</th>
                  <th className={`${thClass} text-right`}>Status</th>
                </tr>
              </thead>
              <tbody className={tbodyClass}>
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className={tdClass}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}</td>
                    <td className={`${tdClass} font-medium text-slate-900 tabular-nums`}>
                      ${(p.amount_cents / 100).toFixed(2)} {p.currency.toUpperCase()}
                    </td>
                    <td className={`${tdClass} text-right`}><StatusPill status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
