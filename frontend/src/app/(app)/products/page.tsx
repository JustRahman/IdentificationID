"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { Product } from "@/types";

const tabs = ["All", "Draft", "Published", "Hidden"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    async function load() {
      try {
        const statusParam = activeTab === "All" ? "" : `?status=${activeTab.toLowerCase()}`;
        const data = await api.get<Product[]>(`/manufacturer/products${statusParam}`);
        setProducts(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    setLoading(true);
    load();
  }, [activeTab]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link
          href="/products/new"
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover"
        >
          + New Product
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => (
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
          <p className="text-sm text-muted mb-3">No products yet.</p>
          <Link
            href="/products/new"
            className="text-sm text-accent font-medium hover:underline"
          >
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="bg-background border border-border rounded-xl divide-y divide-border">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="flex items-center justify-between p-4 hover:bg-surface first:rounded-t-xl last:rounded-b-xl"
            >
              <div>
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted">
                  {p.identification_id} · {p.category}
                  {p.brand && ` · ${p.brand}`}
                </p>
              </div>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
