"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { Product } from "@/types";
import { ButtonLink, EmptyState } from "@/components/ui";
import { AppIcon, PageHeader, StatusPill } from "@/components/app";

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
      <PageHeader
        title="Products"
        description="Every product gets a permanent Identification ID, a QR code and an official product page."
        actions={
          <ButtonLink href="/products/new">
            <AppIcon name="plus" /> New Product
          </ButtonLink>
        }
      />

      <div className="inline-flex gap-1 p-1 mb-5 rounded-lg bg-slate-100 border border-slate-200" role="tablist" aria-label="Filter by status">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`h-8 px-3 rounded-md text-sm transition-colors ${
              activeTab === tab
                ? "bg-white text-slate-900 font-medium shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : products.length === 0 ? (
        <EmptyState
            icon="box"
            title="No products yet."
            description="Add a product to get its Identification ID and QR code."
            action={<ButtonLink href="/products/new" size="sm">Create your first product</ButtonLink>}
          />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_160px_140px_120px] gap-4 px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500">
            <span>Product</span>
            <span>Identification ID</span>
            <span>Category</span>
            <span className="text-right">Status</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {products.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_160px_140px_120px] gap-x-4 gap-y-1 items-center px-5 py-3.5 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      <span className="sm:hidden font-mono tabular-nums" data-no-i18n>{p.identification_id} · </span>
                      <span className="sm:hidden">{p.category}</span>
                      {p.brand && <span><span className="sm:hidden"> · </span>{p.brand}</span>}
                    </p>
                  </div>
                  <span className="hidden sm:block text-xs font-mono tabular-nums font-medium text-slate-700" data-no-i18n>{p.identification_id}</span>
                  <span className="hidden sm:block text-sm text-slate-600 truncate">{p.category}</span>
                  <span className="text-right row-start-1 col-start-2 sm:row-auto sm:col-auto">
                    <StatusPill status={p.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
