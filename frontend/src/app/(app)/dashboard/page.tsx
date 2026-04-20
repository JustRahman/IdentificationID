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
      {/* Verification status banner */}
      {!company && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-lg shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">Company profile not created</p>
            <p className="text-xs text-amber-700 mt-0.5">Create your company profile to get verified and start publishing products.</p>
            <Link href="/company" className="inline-block mt-2 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 font-medium">
              Set up company →
            </Link>
          </div>
        </div>
      )}
      {company?.status === "pending" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-blue-500 text-lg shrink-0">🕐</span>
          <div>
            <p className="text-sm font-semibold text-blue-800">Verification in progress</p>
            <p className="text-xs text-blue-700 mt-0.5">Your company is under review — typically 1–2 business days. You'll receive an email once approved.</p>
          </div>
        </div>
      )}
      {company?.status === "rejected" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-red-500 text-lg shrink-0">✕</span>
          <div>
            <p className="text-sm font-semibold text-red-800">Verification rejected</p>
            <p className="text-xs text-red-700 mt-0.5">Your company verification was not approved. Please update your company details or contact us at support@identificationid.com.</p>
            <Link href="/company" className="inline-block mt-2 text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 font-medium">
              Update company →
            </Link>
          </div>
        </div>
      )}

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
