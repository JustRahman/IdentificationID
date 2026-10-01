"use client";

import { useState } from "react";
import Link from "next/link";
import type { ManufacturerProfile } from "@/types";
import { PublicPageNotice } from "@/components/PublicPageNotice";

/** "2026-09-30" → "September 2026" (parsed as a local date, not UTC). */
export function monthYear(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * The public manufacturer registry profile. Rendered on /manufacturer/[mid]
 * and, with `preview`, during onboarding before the membership is paid.
 */
export function ManufacturerProfileView({
  data,
  preview = false,
}: {
  data: ManufacturerProfile;
  preview?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function copyId() {
    navigator.clipboard.writeText(data.manufacturer_id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/manufacturer/${data.manufacturer_id}`
      : `https://identificationid.com/manufacturer/${data.manufacturer_id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(publicUrl)}`;
  // Only ever link http(s) URLs.
  const websiteHref =
    data.website && /^https?:\/\//i.test(data.website) ? data.website : null;
  const inactive = data.registry_status !== "active";

  return (
    <>
      {/* Profile header */}
      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          {data.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.logo_url}
              alt={`${data.display_name} logo`}
              className="w-20 h-20 rounded-xl object-contain border border-border bg-white shrink-0"
            />
          )}
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold mb-1">{data.display_name}</h1>
                <p className="text-sm text-muted">{data.legal_name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Link
                  href="/verification"
                  title="See exactly what this status means"
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border inline-flex items-center gap-1 transition-colors ${
                    data.verification_level === "business"
                      ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                      : data.verification_level === "verified"
                      ? "text-blue-700 bg-blue-50 border-blue-200 hover:bg-blue-100"
                      : "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {data.verification_level !== "registered" && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {data.verification_label}
                </Link>
                <span
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                    preview
                      ? "text-amber-700 bg-amber-50 border-amber-200"
                      : inactive
                      ? "text-gray-600 bg-gray-50 border-gray-200"
                      : "text-green-700 bg-green-50 border-green-200"
                  }`}
                >
                  {/* Before payment the preview must not claim an active registry. */}
                  Registry status: {preview ? "Pending activation" : inactive ? "Inactive" : "Active"}
                </span>
              </div>
            </div>

            {inactive && data.last_active && (
              <p className="text-xs text-muted mt-2">Last active: {monthYear(data.last_active)}</p>
            )}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm font-mono font-semibold">{data.manufacturer_id}</span>
              <button
                onClick={copyId}
                className="text-xs px-2 py-0.5 border border-border rounded hover:bg-surface text-muted transition-colors"
              >
                {copied ? "✓ Copied" : "Copy ID"}
              </button>
            </div>

            {data.description && (
              <p className="text-sm text-muted mt-4 leading-relaxed">{data.description}</p>
            )}

            {data.brands.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {data.brands.map((b) => (
                  <span key={b} className="text-xs px-2 py-0.5 rounded-md bg-surface border border-border">
                    {b}
                  </span>
                ))}
              </div>
            )}

            {/* What was actually verified - transparency over a bare checkmark */}
            {data.verified_attributes.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-muted mb-1.5">Verified by Identification ID:</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {data.verified_attributes.map((a) => (
                    <span key={a} className="text-xs inline-flex items-center gap-1 text-foreground/80">
                      <svg className="w-3 h-3 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {a}
                    </span>
                  ))}
                </div>
                <Link href="/verification" className="text-xs text-accent hover:underline mt-1.5 inline-block">
                  What does this mean?
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Details + QR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Country", value: data.country_code },
              { label: "Products", value: String(data.product_count) },
              {
                label: "In registry since",
                value: preview
                  ? "On activation"
                  : data.registered_at
                  ? new Date(data.registered_at).toLocaleDateString()
                  : "--",
              },
              { label: "Website", value: data.website || "--" },
              ...(data.support_email ? [{ label: "Email", value: data.support_email }] : []),
              ...(data.contact_phone ? [{ label: "Phone", value: data.contact_phone }] : []),
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-muted">{f.label}</p>
                {f.label === "Website" && websiteHref ? (
                  <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline break-all">
                    {data.website}
                  </a>
                ) : (
                  <p className="text-sm break-all">{f.value}</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="Manufacturer QR code"
              width={120}
              height={120}
              className="border border-border rounded-lg p-1.5 bg-white shrink-0"
            />
            <div>
              <p className="text-sm font-medium mb-1">Manufacturer QR</p>
              <p className="text-xs text-muted">
                Scan to open this manufacturer&apos;s registry profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-background border border-border rounded-xl p-6">
        <h2 className="text-base font-semibold mb-4">
          Products in the registry ({data.product_count})
        </h2>
        {data.products.length === 0 ? (
          <p className="text-sm text-muted">
            {inactive && data.product_count > 0
              ? "Product list hidden while the registry membership is inactive. Individual product pages and QR codes still work."
              : "No published products yet."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.products.map((p) => (
              <Link
                key={p.identification_id}
                href={`/p/${encodeURIComponent(p.identification_id)}`}
                className="border border-border rounded-xl overflow-hidden hover:border-accent hover:shadow-md transition-all bg-background group block"
              >
                <div className="aspect-[4/3] bg-surface overflow-hidden">
                  {p.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.cover_image}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 12V6.75A2.25 2.25 0 0018.75 4.5H5.25A2.25 2.25 0 003 6.75V15" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold group-hover:text-accent transition-colors leading-snug line-clamp-2 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs font-mono text-muted/70">{p.identification_id}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted mt-6 leading-relaxed">
        A Manufacturer ID is a unique identifier assigned to a manufacturer within the
        Identification ID global product registry. It is not a government, tax, or
        internationally recognized business identifier.
      </p>
      <PublicPageNotice targetType="manufacturer" targetId={data.manufacturer_id} showReport={!preview} />
    </>
  );
}
