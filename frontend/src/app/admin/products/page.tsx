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

const statusTabs = ["All", "Draft", "Published", "Hidden"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load(tab: string) {
    setLoading(true);
    try {
      const param = tab === "All" ? "" : `?status=${tab.toLowerCase()}`;
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

  async function moderateProduct(id: string, action: "hide" | "unhide") {
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
      <h1 className="text-xl font-semibold mb-6">Products</h1>
      <div className="flex gap-2 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setExpanded(null); }}
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
      ) : products.length === 0 ? (
        <div className="bg-background border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted">No products to moderate.</p>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-xl divide-y divide-border">
          {products.map((p) => (
            <div key={p.id}>
              {/* Row */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface transition-colors"
                onClick={() => toggle(p.id)}
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.identification_id} · {p.category} · {p.company_name || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-lg ${
                      p.status === "published"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : p.status === "hidden"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {p.status}
                  </span>
                  <svg
                    className={`w-4 h-4 text-muted transition-transform ${expanded === p.id ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === p.id && (
                <div className="px-4 pb-4 bg-surface border-t border-border">
                  <div className="pt-4 grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                      <p className="text-xs text-muted mb-0.5">ID</p>
                      <p className="font-mono text-xs">{p.identification_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Company</p>
                      <p>{p.company_name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Category</p>
                      <p>{p.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Brand / Model</p>
                      <p>{[p.brand, p.model].filter(Boolean).join(" · ") || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Country of Origin</p>
                      <p>{p.country_of_origin || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Created</p>
                      <p>{p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted mb-0.5">Published At</p>
                      <p>{p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {p.status === "published" && (
                      <button
                        onClick={() => moderateProduct(p.id, "hide")}
                        disabled={actionLoading === p.id}
                        className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === p.id ? "Processing..." : "Hide Product"}
                      </button>
                    )}
                    {p.status === "hidden" && (
                      <button
                        onClick={() => moderateProduct(p.id, "unhide")}
                        disabled={actionLoading === p.id}
                        className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
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
