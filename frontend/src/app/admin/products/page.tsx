"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface ProductItem {
  id: string;
  identification_id: string;
  name: string;
  category: string;
  status: string;
  company_name: string | null;
  created_at: string | null;
}

const statusTabs = ["All", "Draft", "Published", "Hidden"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const param = activeTab === "All" ? "" : `?status=${activeTab.toLowerCase()}`;
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
    load();
  }, [activeTab]);

  async function moderateProduct(id: string, action: "hide" | "unhide") {
    setActionLoading(id);
    try {
      await api.post(`/admin/products/${id}/moderate`, { action });
      const param = activeTab === "All" ? "" : `?status=${activeTab.toLowerCase()}`;
      const res = await api.get<{ success: boolean; data: ProductItem[] }>(
        `/admin/products${param}`
      );
      setProducts(res.data);
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
      ) : products.length === 0 ? (
        <div className="bg-background border border-border rounded-xl p-8 text-center">
          <p className="text-sm text-muted">No products to moderate.</p>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-xl divide-y divide-border">
          {products.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between">
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
                {p.status === "published" && (
                  <button
                    onClick={() => moderateProduct(p.id, "hide")}
                    disabled={actionLoading === p.id}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    Hide
                  </button>
                )}
                {p.status === "hidden" && (
                  <button
                    onClick={() => moderateProduct(p.id, "unhide")}
                    disabled={actionLoading === p.id}
                    className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Unhide
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
