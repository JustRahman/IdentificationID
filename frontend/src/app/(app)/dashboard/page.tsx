"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useMembership } from "@/lib/membership";
import type { Product, Company } from "@/types";
import { ButtonLink, ArrowRight, EmptyState } from "@/components/ui";
import { AppIcon, Notice, PageHeader, Panel, StatCard, StatusPill } from "@/components/app";

export default function DashboardPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { registry } = useMembership();

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
  const totalViews = products.reduce((sum, p) => sum + (p.view_count || 0), 0);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  const companyStatus = company ? company.status.charAt(0).toUpperCase() + company.status.slice(1) : "Not created";

  return (
    <div>
      {/* Verification status banner */}
      {!company && (
        <Notice
          tone="warning"
          title="Company profile not created"
          className="mb-6"
          action={<ButtonLink href="/company" size="sm">Set up company <ArrowRight /></ButtonLink>}
        >
          Create your company profile to get verified and start publishing products.
        </Notice>
      )}
      {company?.status === "pending" && (
        <Notice tone="info" icon="clock" title="Verification in progress" className="mb-6">
          Your company is under review - typically 1-2 business days. You&apos;ll receive an email once approved.
        </Notice>
      )}
      {company?.status === "rejected" && (
        <Notice
          tone="error"
          title="Verification rejected"
          className="mb-6"
          action={<ButtonLink href="/company" size="sm" variant="secondary">Update company <ArrowRight /></ButtonLink>}
        >
          Your company verification was not approved. Please update your company details or contact us at support@identificationid.com.
        </Notice>
      )}

      <PageHeader
        title="Dashboard"
        description={company ? <>Overview for <span className="text-slate-700 font-medium">{company.display_name || company.legal_name}</span></> : "Overview of your company and products."}
        actions={
          <ButtonLink href="/products/new">
            <AppIcon name="plus" /> New Product
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Company Status"
          value={companyStatus}
          tone={company?.status === "verified" ? "good" : company?.status === "rejected" ? "bad" : "warn"}
        />
        <StatCard label="Total Products" value={String(products.length)} />
        <StatCard label="Published" value={String(published)} />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} />
        <StatCard label="Registry" value={registry?.active ? "Active" : "Inactive"} tone={registry?.active ? "good" : "muted"} />
      </div>

      <Panel
        title="Recent Products"
        flush
        action={products.length > 0 ? <Link href="/products" className="text-sm font-medium text-accent hover:underline">View all</Link> : undefined}
      >
        {products.length === 0 ? (
          <EmptyState
            icon="box"
            compact
            className="!border-0 !rounded-none !bg-transparent"
            title="No products yet"
            description="Create your first product to get started."
            action={<ButtonLink href="/products/new" size="sm"><AppIcon name="plus" /> New Product</ButtonLink>}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {products.slice(0, 5).map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-3.5 hover:bg-slate-50 last:rounded-b-2xl"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-mono tabular-nums" data-no-i18n>{p.identification_id}</span> · {p.category}
                    </p>
                  </div>
                  <StatusPill status={p.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
