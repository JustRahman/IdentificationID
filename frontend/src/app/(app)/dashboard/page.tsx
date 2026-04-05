"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { Product, Company } from "@/types";

export default function DashboardPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [companyRes, productsRes] = await Promise.allSettled([
          api.get<Company>("/manufacturer/company"),
          api.get<Product[]>("/manufacturer/products"),
        ]);
        if (companyRes.status === "fulfilled") setCompany(companyRes.value);
        if (productsRes.status === "fulfilled") setProducts(productsRes.value);
      } catch {
        // ignore - new users won't have data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const published = products.filter((p) => p.status === "published").length;

  if (loading) {
    return <p className="text-sm text-muted">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <Link
          href="/products/new"
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover"
        >
          + New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Company Status",
            value: company ? company.status.charAt(0).toUpperCase() + company.status.slice(1) : "Not created",
            color: company?.status === "verified" ? "text-green-600" : company?.status === "rejected" ? "text-red-600" : "text-amber-600",
          },
          { label: "Total Products", value: String(products.length) },
          { label: "Published", value: String(published) },
          { label: "Current Plan", value: "Free" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-background border border-border rounded-xl p-5"
          >
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className={`text-2xl font-semibold ${stat.color || ""}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-background border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold mb-4">Recent Products</h2>
        {products.length === 0 ? (
          <p className="text-sm text-muted">No products yet. Create your first product to get started.</p>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-surface"
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted">{p.identification_id} · {p.category}</p>
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
    </div>
  );
}
