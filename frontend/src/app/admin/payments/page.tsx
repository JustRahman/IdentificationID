"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface PaymentItem {
  id: string;
  company_name: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  stripe_payment_intent_id: string;
  created_at: string | null;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ success: boolean; data: PaymentItem[] }>(
          "/admin/payments"
        );
        setPayments(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-6">Payments</h1>
      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : payments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl px-8 py-14 text-center">
          <p className="text-sm text-slate-500">No payments recorded.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {payments.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  ${(p.amount_cents / 100).toFixed(2)} {p.currency.toUpperCase()}
                </p>
                <p className="text-xs text-slate-500">
                  {p.company_name || "N/A"} · {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                </p>
              </div>
              <span
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset capitalize ${
                  p.status === "succeeded"
                    ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                    : p.status === "failed"
                    ? "bg-red-50 text-red-700 ring-red-200"
                    : "bg-slate-100 text-slate-700 ring-slate-200"
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
