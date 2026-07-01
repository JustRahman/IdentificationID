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
  subscription: {
    status: string;
    paid_until: string;
  } | null;
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
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [planRes, paymentsRes] = await Promise.allSettled([
          api.get<{ success: boolean; data: PlanData }>("/billing/plan"),
          api.get<{ success: boolean; data: PaymentItem[] }>("/billing/payments"),
        ]);
        if (planRes.status === "fulfilled") setPlan(planRes.value.data);
        if (paymentsRes.status === "fulfilled") setPayments(paymentsRes.value.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

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

      <div className="bg-background border border-border rounded-xl p-6 max-w-lg mb-6">
        <h2 className="text-base font-semibold mb-4">Current Plan</h2>
        <div className="mb-4">
          <span className="text-2xl font-semibold">{plan?.plan_name || "Free"}</span>
          <span className="text-sm text-muted ml-2">
            {plan?.products_used || 0} / {plan?.product_limit === -1 ? "Unlimited" : plan?.product_limit || 10} products used
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
              <p className="text-xs text-muted">Next billing / renews</p>
              <p className="text-sm font-medium">
                {(() => {
                  const d = new Date(plan.subscription.paid_until);
                  return isNaN(d.getTime()) ? plan.subscription.paid_until : d.toLocaleDateString();
                })()}
              </p>
            </div>
          </div>
        )}
        {(!plan || plan.plan === "free") && (
          <div className="grid grid-cols-2 gap-3">
            {PLANS.filter((p) => p.key !== "free").map((p) => (
              <button
                key={p.key}
                onClick={() => handleUpgrade(p.key)}
                disabled={upgrading}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 ${
                  p.popular
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "border border-border text-foreground hover:bg-surface"
                }`}
              >
                {p.en.name} (${p.priceCents / 100}/mo)
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
