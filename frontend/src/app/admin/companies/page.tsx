"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface CompanyItem {
  id: string;
  legal_name: string;
  display_name: string;
  country_code: string;
  website: string | null;
  support_email: string | null;
  status: string;
  owner_email: string | null;
  admin_note: string | null;
  created_at: string | null;
  verified_at: string | null;
}

const statusTabs = ["All", "Pending", "Verified", "Rejected"];

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  async function load(tab: string) {
    setLoading(true);
    try {
      const param = tab === "All" ? "" : `?status=${tab.toLowerCase()}`;
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

  useEffect(() => { load(activeTab); }, [activeTab]);

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
    setRejectNote("");
  }

  async function reviewCompany(id: string, action: "approve" | "reject") {
    setActionLoading(id);
    try {
      await api.post(`/admin/companies/${id}/review`, {
        action,
        note: action === "reject" ? (rejectNote || "Does not meet requirements") : null,
      });
      setExpanded(null);
      await load(activeTab);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-6">Companies</h1>
      <div className="inline-flex flex-wrap gap-1 p-1 mb-5 rounded-lg bg-slate-100 border border-slate-200">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setExpanded(null); }}
            className={`h-8 px-3 rounded-md text-sm transition-colors ${
              activeTab === tab ? "bg-white text-slate-900 font-medium shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : companies.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl px-8 py-14 text-center">
          <p className="text-sm text-slate-500">No companies to review.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {companies.map((c) => (
            <div key={c.id}>
              {/* Row */}
              <div
                className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggle(c.id)}
              >
                <div>
                  <p className="text-sm font-medium">{c.display_name}</p>
                  <p className="text-xs text-slate-500">
                    {c.legal_name} · {c.country_code} · {c.owner_email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset capitalize ${
                      c.status === "verified"
                        ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                        : c.status === "rejected"
                        ? "bg-red-50 text-red-700 ring-red-200"
                        : "bg-amber-50 text-amber-800 ring-amber-200"
                    }`}
                  >
                    {c.status}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform ${expanded === c.id ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === c.id && (
                <div className="px-5 pb-5 bg-slate-50/70 border-t border-slate-100">
                  <div className="pt-4 grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Legal Name</p>
                      <p>{c.legal_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Display Name</p>
                      <p>{c.display_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Country</p>
                      <p>{c.country_code}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Owner</p>
                      <p>{c.owner_email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Website</p>
                      <p>{c.website || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Support Email</p>
                      <p>{c.support_email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Registered</p>
                      <p>{c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Verified At</p>
                      <p>{c.verified_at ? new Date(c.verified_at).toLocaleDateString() : "-"}</p>
                    </div>
                    {c.admin_note && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 mb-0.5">Admin Note</p>
                        <p>{c.admin_note}</p>
                      </div>
                    )}
                  </div>

                  {c.status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Rejection note (optional)"
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-xs w-full"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => reviewCompany(c.id, "approve")}
                          disabled={actionLoading === c.id}
                          className="h-9 text-sm font-medium bg-emerald-600 text-white px-4 rounded-lg shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {actionLoading === c.id ? "Processing..." : "Approve"}
                        </button>
                        <button
                          onClick={() => reviewCompany(c.id, "reject")}
                          disabled={actionLoading === c.id}
                          className="h-9 text-sm font-medium bg-red-600 text-white px-4 rounded-lg shadow-sm hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading === c.id ? "Processing..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
