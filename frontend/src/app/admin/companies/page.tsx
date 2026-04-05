"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface CompanyItem {
  id: string;
  legal_name: string;
  display_name: string;
  country_code: string;
  status: string;
  owner_email: string | null;
  admin_note: string | null;
  created_at: string | null;
}

const statusTabs = ["All", "Pending", "Verified", "Rejected"];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const param = activeTab === "All" ? "" : `?status=${activeTab.toLowerCase()}`;
        const res = await api.get<{ success: boolean; data: CompanyItem[] }>(
          `/admin/companies${param}`
        );
        setCompanies(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeTab]);

  async function reviewCompany(id: string, action: "approve" | "reject") {
    setActionLoading(id);
    try {
      await api.post(`/admin/companies/${id}/review`, {
        action,
        note: action === "reject" ? "Does not meet requirements" : null,
      });
      // Refresh list
      setActiveTab((t) => t);
      const param = activeTab === "All" ? "" : `?status=${activeTab.toLowerCase()}`;
      const res = await api.get<{ success: boolean; data: CompanyItem[] }>(
        `/admin/companies${param}`
      );
      setCompanies(res.data);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Companies</h1>
      <div className="flex gap-2 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              activeTab === tab
                ? "bg-accent text-white"
                : "text-muted border border-border hover:bg-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : companies.length === 0 ? (
        <div className="bg-background border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted">No companies to review.</p>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-xl divide-y divide-border">
          {companies.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{c.display_name}</p>
                <p className="text-xs text-muted">
                  {c.legal_name} · {c.country_code} · {c.owner_email}
                </p>
                {c.admin_note && <p className="text-xs text-muted mt-1">Note: {c.admin_note}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-lg ${
                    c.status === "verified"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : c.status === "rejected"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {c.status}
                </span>
                {c.status === "pending" && (
                  <>
                    <button
                      onClick={() => reviewCompany(c.id, "approve")}
                      disabled={actionLoading === c.id}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reviewCompany(c.id, "reject")}
                      disabled={actionLoading === c.id}
                      className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
