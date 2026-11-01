"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { PLANS } from "@/lib/constants";

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
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
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

  if (loading) return <p className="text-sm text-muted">Loading...</p>;

  const usagePercent = plan
    ? plan.product_limit > 0
      ? Math.min(100, Math.round((plan.products_used / plan.product_limit) * 100))
      : 0
    : 0;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Billing</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4 max-w-lg">
          {error}
        </div>
      )}

      {notice && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3 mb-4 max-w-lg">
          {notice}
        </div>
      )}

      {registry && registry.active && !registry.included_in_plan && (
        <div className="bg-background border border-border rounded-xl p-6 max-w-lg mb-6">
          <h2 className="text-base font-semibold mb-1">Manufacturer Registry Membership</h2>
          {registry.manufacturer_id && (
            <p className="text-xs text-muted font-mono mb-3">{registry.manufacturer_id}</p>
          )}
          {registry.founding_member && !registry.can_cancel ? (
            <p className="text-sm mb-3">
              <span className="text-green-700 font-medium">Founding Manufacturer.</span> Free until{" "}
              <strong>{fmtDate(registry.paid_until)}</strong>. No card is on file and nothing will be
              charged. After that you can choose to continue with a paid membership.
            </p>
          ) : registry.cancel_at_period_end ? (
            <>
              <p className="text-sm mb-3">
                <span className="text-amber-700 font-medium">Cancelled.</span> Active until{" "}
                <strong>{fmtDate(registry.paid_until)}</strong>. It will not renew and you won&apos;t be charged again.
              </p>
              <button
                onClick={() => toggle("registry", "resume")}
                disabled={busy}
                className="text-sm border border-border px-4 py-2 rounded-lg hover:bg-surface disabled:opacity-50"
              >
                Keep my membership
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted mb-3">
                Renews automatically on <strong className="text-foreground">{fmtDate(registry.paid_until)}</strong>.
              </p>
              {confirming === "registry" ? (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm space-y-2">
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
                      className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      {busy ? "Cancelling..." : "Yes, cancel"}
                    </button>
                    <button
                      onClick={() => setConfirming(null)}
                      className="border border-border px-4 py-1.5 rounded-lg text-sm hover:bg-background"
                    >
                      Keep it
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirming("registry")}
                  className="text-sm text-red-700 hover:underline"
                >
                  Cancel membership
                </button>
              )}
            </>
          )}
        </div>
      )}

      <div className="bg-background border border-border rounded-xl p-6 max-w-lg mb-6">
        <h2 className="text-base font-semibold mb-4">Current Plan</h2>
        <div className="mb-4">
          <span className="text-2xl font-semibold">{plan?.plan_name || "Registry Membership"}</span>
          <span className="text-sm text-muted ml-2">
            {plan?.products_used || 0} / {plan?.product_limit === -1 ? "Unlimited" : plan?.product_limit || 3} products used
          </span>
        </div>
        <div className="w-full bg-surface rounded-full h-2 mb-4">
          <div
            className="bg-accent h-2 rounded-full"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        {plan?.subscription && (
          <div className="grid grid-cols-2 gap-3 mb-4 border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted">Status</p>
              <p className="text-sm font-medium capitalize">{plan.subscription.status}</p>
            </div>
            <div>
              <p className="text-xs text-muted">{plan.subscription.cancel_at_period_end ? "Active until (cancelled)" : "Next billing / renews"}</p>
              <p className="text-sm font-medium">
                {(() => {
                  const d = new Date(plan.subscription.paid_until);
                  return isNaN(d.getTime()) ? plan.subscription.paid_until : d.toLocaleDateString();
                })()}
              </p>
            </div>
          </div>
        )}
        {plan?.subscription && plan.subscription.status === "active" && plan.plan !== "membership" && (
          <div className="mb-4">
            {plan.subscription.cancel_at_period_end ? (
              <button onClick={() => toggle("plan", "resume")} disabled={busy}
                className="text-sm border border-border px-4 py-2 rounded-lg hover:bg-surface disabled:opacity-50">
                Keep my plan
              </button>
            ) : confirming === "plan" ? (
              <div className="border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm space-y-2">
                <p>Cancel automatic renewal of this plan? It stays active until the date above and is not refunded.</p>
                <div className="flex gap-2">
                  <button onClick={() => toggle("plan", "cancel")} disabled={busy}
                    className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                    {busy ? "Cancelling..." : "Yes, cancel"}
                  </button>
                  <button onClick={() => setConfirming(null)}
                    className="border border-border px-4 py-1.5 rounded-lg text-sm hover:bg-background">
                    Keep it
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirming("plan")} className="text-sm text-red-700 hover:underline">
                Cancel plan
              </button>
            )}
          </div>
        )}
        {(!plan || plan.plan === "membership") && (
          <div className="grid grid-cols-2 gap-3">
            {PLANS.map((p) => (
              <button
                key={p.key}
                onClick={() => handleUpgrade(p.key)}
                disabled={upgrading}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
                  p.premium
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : p.popular
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "border border-border text-foreground hover:bg-surface"
                }`}
              >
                {p.en.name} (${p.priceCents / 100}
                {p.perProduct ? "/product" : "/mo"})
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-background border border-border rounded-xl p-6 max-w-lg">
        <h2 className="text-base font-semibold mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-muted">No payments yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    ${(p.amount_cents / 100).toFixed(2)} {p.currency.toUpperCase()}
                  </p>
                  <p className="text-xs text-muted">{p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-lg ${
                    p.status === "succeeded"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
