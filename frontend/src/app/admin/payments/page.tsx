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
      <h1 className="text-xl font-semibold mb-6">Payments</h1>
      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : payments.length === 0 ? (
        <div className="bg-background border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted">No payments recorded.</p>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-xl divide-y divide-border">
          {payments.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  ${(p.amount_cents / 100).toFixed(2)} {p.currency.toUpperCase()}
                </p>
                <p className="text-xs text-muted">
                  {p.company_name || "N/A"} · {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-lg ${
                  p.status === "succeeded"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : p.status === "failed"
                    ? "bg-red-50 text-red-700 border border-red-200"
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
  );
}
