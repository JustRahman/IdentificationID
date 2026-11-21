"use client";

import { useState } from "react";
import Link from "next/link";
import type { ManufacturerProfile } from "@/types";
import { PublicPageNotice } from "@/components/PublicPageNotice";
import { Badge } from "@/components/ui/Badge";
import { ShareButton } from "@/components/registry/ShareButton";
import { IdChip } from "@/components/ui/IdChip";
import { FactBox } from "@/components/ui/FactBox";
import { Tabs } from "@/components/ui/Tabs";
import { DisclaimerBar } from "@/components/ui/DisclaimerBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompanyLogo } from "@/components/registry/CompanyLogo";
import { QrCode } from "@/components/registry/QrCode";
import { ProductCard } from "@/components/registry/RegistryCards";
import { countryName, fullDate, monthYear, prettyUrl, safeHref, shortMonthYear } from "@/components/registry/format";

/**
 * "2026-09-30" -> "September 2026". Deterministic (same string on server and
 * client), kept here because the dashboard imports it from this module.
 */
export { monthYear };

/**
 * The public manufacturer registry profile. Rendered on /manufacturer/[mid]
 * and, with `preview`, during onboarding before the membership is paid.
 * Layout: Companies House header + Wikipedia-style fact box + product grid.
 * Uses container queries, so it lays out correctly in the narrower dashboard.
 */
export function ManufacturerProfileView({
  data,
  preview = false,
}: {
  data: ManufacturerProfile;
  preview?: boolean;
}) {
  const [tab, setTab] = useState("overview");

  const websiteHref = safeHref(data.website);
  const inactive = data.registry_status !== "active";
  const since = data.registered_at ? shortMonthYear(data.registered_at) : "";
  const country = countryName(data.country_code);
  const verified = data.verification_level !== "registered";

  const statusBadge = preview ? (
    <Badge tone="pending" dot>Pending activation</Badge>
  ) : inactive ? (
    <Badge tone="neutral" dot>Inactive</Badge>
  ) : (
    <Badge tone="verified" dot>Active</Badge>
  );

  const levelLabel = data.verification_label || "Registered Manufacturer";
  const levelText = !preview && since ? `${levelLabel} - since ${since}` : levelLabel;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "products", label: "Products", count: data.product_count },
  ];

  const productsBlock =
    data.products.length === 0 ? (
      <EmptyState
        icon="box"
        compact
        title={inactive && data.product_count > 0 ? "Product list hidden" : "No published products yet"}
        description={
          inactive && data.product_count > 0
            ? "Product list hidden while the registry membership is inactive. Individual product pages and QR codes still work."
            : "Products this manufacturer publishes will appear here with their Identification ID."
        }
      />
    ) : (
      <div className="grid grid-cols-1 @md:grid-cols-2 @4xl:grid-cols-3 gap-4">
        {data.products.map((p) => (
          <ProductCard key={p.identification_id} p={{ ...p, brand: p.brand === data.display_name ? null : p.brand }} showMaker={false} />
        ))}
      </div>
    );

  const facts = [
    {
      label: "Manufacturer ID",
      value: data.manufacturer_id ? <span data-no-i18n>{data.manufacturer_id}</span> : preview ? "Issued after payment" : null,
      mono: !!data.manufacturer_id,
    },
    { label: "Registry status", value: preview ? "Pending activation" : inactive ? "Inactive" : "Active" },
    ...(inactive && data.last_active ? [{ label: "Last active", value: monthYear(data.last_active) }] : []),
    {
      label: "In registry since",
      value: preview ? "On activation" : data.registered_at ? fullDate(data.registered_at) : null,
    },
    { label: "Legal name", value: data.legal_name },
    { label: "Country", value: country },
    { label: "Brands", value: data.brands.length ? data.brands.join(", ") : null },
    { label: "Products", value: String(data.product_count), mono: true },
    {
      label: "Website",
      value: data.website ? (
        websiteHref ? (
          <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline break-all">
            {prettyUrl(data.website)}
          </a>
        ) : (
          data.website
        )
      ) : null,
    },
    {
      label: "Email",
      value: data.support_email ? (
        <a href={`mailto:${data.support_email}`} className="text-accent hover:underline break-all">
          {data.support_email}
        </a>
      ) : null,
    },
    ...(data.contact_phone ? [{ label: "Phone", value: data.contact_phone }] : []),
  ];

  return (
    <div className="@container">
      {/* ── Header ── */}
      <header className="flex flex-col @2xl:flex-row @2xl:items-start gap-5">
        <CompanyLogo name={data.display_name} src={data.logo_url} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Link href="/verification" title="See exactly what this status means" className="rounded-full">
              <Badge tone={verified ? "verified" : "neutral"} icon="check">
                {levelText}
              </Badge>
            </Link>
            {statusBadge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 text-balance">{data.display_name}</h1>
          {(data.legal_name || country) && (
            <p className="mt-1.5 text-base text-slate-500">
              {[data.legal_name && data.legal_name !== data.display_name ? data.legal_name : null, country]
                .filter(Boolean)
                .join(" - ")}
            </p>
          )}
          {inactive && data.last_active && !preview && (
            <p className="text-sm text-slate-500 mt-1">Last active: {monthYear(data.last_active)}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            {data.manufacturer_id ? (
              <IdChip label="Manufacturer ID" id={data.manufacturer_id} size="lg" />
            ) : (
              <p className="text-sm text-slate-500">
                <span className="font-mono tabular-nums font-semibold text-slate-700" data-no-i18n>MID-XXXX-XXXX</span>{" "}
                - your permanent Manufacturer ID is issued right after payment
              </p>
            )}
            {websiteHref && (
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-accent"
              >
                <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
                </svg>
                {prettyUrl(data.website || "")}
              </a>
            )}
            {!preview && data.manufacturer_id && <ShareButton title={`${data.display_name} - Identification ID`} />}
          </div>
        </div>
      </header>

      <DisclaimerBar className="mt-6" />

      {/* ── Tabs ── */}
      <Tabs items={tabs} value={tab} onChange={setTab} idPrefix="mfr-tab" ariaLabel="Manufacturer sections" className="mt-8" />

      <div className="mt-8 grid grid-cols-1 @3xl:grid-cols-[minmax(0,1fr)_300px] @5xl:grid-cols-[minmax(0,1fr)_340px] gap-8 @5xl:gap-10 items-start">
        <div className="min-w-0">
          {/* All panels stay in the HTML (hidden) so crawlers see the full profile. */}
          <section role="tabpanel" id="mfr-tabpanel-overview" aria-labelledby="mfr-tab-overview" hidden={tab !== "overview"}>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 mb-3">About</h2>
            {data.description ? (
              <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-line">{data.description}</p>
            ) : (
              <p className="text-sm text-slate-400">No company description provided yet.</p>
            )}

            {data.brands.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-500 mb-2">Brands</h3>
                <div className="flex flex-wrap gap-1.5">
                  {data.brands.map((b) => (
                    <span key={b} className="text-sm px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What was actually verified - transparency over a bare checkmark */}
            {data.verified_attributes.length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Verified by Identification ID</h3>
                <ul className="grid grid-cols-1 @md:grid-cols-2 gap-x-6 gap-y-2">
                  {data.verified_attributes.map((a) => (
                    <li key={a} className="text-sm inline-flex items-center gap-2 text-slate-700">
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3.5 8.5l3 3 6-7" />
                      </svg>
                      {a}
                    </li>
                  ))}
                </ul>
                <Link href="/verification" className="text-sm text-accent hover:underline mt-3 inline-block">
                  What does this mean?
                </Link>
              </div>
            )}

            <h2 className="mt-10 mb-4 text-lg font-semibold tracking-tight text-slate-900">
              Products in the registry{" "}
              <span className="text-slate-400 font-normal tabular-nums">({data.product_count})</span>
            </h2>
            {productsBlock}
          </section>

          <section role="tabpanel" id="mfr-tabpanel-products" aria-labelledby="mfr-tab-products" hidden={tab !== "products"}>
            <h2 className="sr-only">Products</h2>
            {productsBlock}
          </section>
        </div>

        {/* ── Fact box ── */}
        <FactBox
          title="Registry record"
          subtitle="Identification ID registry"
          sticky
          items={facts}
          footer={
            data.manufacturer_id ? (
              <div className="flex items-center gap-4">
                <QrCode path={`/manufacturer/${data.manufacturer_id}`} size={88} alt="Manufacturer QR code" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Manufacturer QR</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Scan to open this manufacturer&apos;s registry profile.</p>
                </div>
              </div>
            ) : undefined
          }
        />
      </div>

      <p className="text-xs text-slate-500 mt-12 leading-relaxed">
        A Manufacturer ID is a unique identifier assigned to a manufacturer within the
        Identification ID global product registry. It is not a government, tax, or
        internationally recognized business identifier.
      </p>
      <PublicPageNotice
        targetType="manufacturer"
        targetId={data.manufacturer_id || ""}
        showReport={!preview && !!data.manufacturer_id}
        underReview={!!data.under_review}
      />
    </div>
  );
}
