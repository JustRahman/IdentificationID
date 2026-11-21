"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface ProductItem {
  id: string;
  identification_id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  country_of_origin: string | null;
  status: string;
  company_name: string | null;
  created_at: string | null;
  published_at: string | null;
}

const statusTabs = ["All", "Pending review", "Draft", "Published", "Hidden"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load(tab: string) {
    setLoading(true);
    try {
      const param = tab === "All" ? "" : `?status=${tab.toLowerCase().replace(" ", "_")}`;
      const res = await api.get<{ success: boolean; data: ProductItem[] }>(
        `/admin/products${param}`
      );
      setProducts(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(activeTab); }, [activeTab]);

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  async function moderateProduct(id: string, action: "hide" | "unhide" | "approve" | "reject") {
    setActionLoading(id);
    try {
      await api.post(`/admin/products/${id}/moderate`, { action });
      await load(activeTab);
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-6">Products</h1>
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
      ) : products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl px-8 py-14 text-center">
          <p className="text-sm text-slate-500">No products to moderate.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {products.map((p) => (
            <div key={p.id}>
              {/* Row */}
              <div
                className="px-5 py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggle(p.id)}
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    {p.identification_id} · {p.category} · {p.company_name || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset capitalize ${
                      p.status === "published"
                        ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                        : p.status === "hidden"
                        ? "bg-red-50 text-red-700 ring-red-200"
                        : "bg-slate-100 text-slate-700 ring-slate-200"
                    }`}
                  >
                    {p.status.replace("_", " ")}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform ${expanded === p.id ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === p.id && (
                <div className="px-5 pb-5 bg-slate-50/70 border-t border-slate-100">
                  <div className="pt-4 grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">ID</p>
                      <p className="font-mono text-xs">{p.identification_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Company</p>
                      <p>{p.company_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Category</p>
                      <p>{p.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Brand / Model</p>
                      <p>{[p.brand, p.model].filter(Boolean).join(" · ") || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Country of Origin</p>
                      <p>{p.country_of_origin || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Created</p>
                      <p>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Published At</p>
                      <p>{p.published_at ? new Date(p.published_at).toLocaleDateString() : "-"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {p.status === "pending_review" && (
                      <>
                        <button
                          onClick={() => moderateProduct(p.id, "approve")}
                          disabled={actionLoading === p.id}
                          className="h-9 text-sm font-medium bg-emerald-600 text-white px-4 rounded-lg shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {actionLoading === p.id ? "Processing..." : "Approve and publish"}
                        </button>
                        <button
                          onClick={() => moderateProduct(p.id, "reject")}
                          disabled={actionLoading === p.id}
                          className="h-9 text-sm font-medium border border-slate-300 bg-white px-4 rounded-lg shadow-xs hover:bg-slate-50 disabled:opacity-50"
                        >
                          Send back to draft
                        </button>
                      </>
                    )}
                    {p.status === "published" && (
                      <button
                        onClick={() => moderateProduct(p.id, "hide")}
                        disabled={actionLoading === p.id}
                        className="h-9 text-sm font-medium bg-red-600 text-white px-4 rounded-lg shadow-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === p.id ? "Processing..." : "Hide Product"}
                      </button>
                    )}
                    {p.status === "hidden" && (
                      <button
                        onClick={() => moderateProduct(p.id, "unhide")}
                        disabled={actionLoading === p.id}
                        className="h-9 text-sm font-medium bg-emerald-600 text-white px-4 rounded-lg shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {actionLoading === p.id ? "Processing..." : "Unhide Product"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
