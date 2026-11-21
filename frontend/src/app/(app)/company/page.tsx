"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";
import { monthYear } from "@/components/ManufacturerProfileView";
import { useMembership } from "@/lib/membership";
import { VERIFICATION_DISCLAIMER } from "@/lib/constants";
import type { Company } from "@/types";
import { Badge, buttonClasses } from "@/components/ui";
import { AppIcon, Notice, PageHeader, StatusPill } from "@/components/app";

export default function CompanyPage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copiedMid, setCopiedMid] = useState(false);
  const [rechecking, setRechecking] = useState(false);
  const { registry } = useMembership();

  async function recheckVerification() {
    setRechecking(true);
    setError("");
    setMessage("");
    try {
      const updated = await api.post<Company>("/manufacturer/company/verify");
      setCompany(updated);
      setMessage("Verification checks re-run.");
    } catch {
      setError("Could not re-run verification");
    } finally {
      setRechecking(false);
    }
  }

  const CHECK_LABELS: Record<string, string> = {
    email_domain_matches_website: "Email domain matches website",
    corporate_email: "Corporate email (not a free provider)",
    website_live: "Website is live",
    company_name_on_website: "Company name appears on website",
    mx_records: "Domain has mail servers",
    valid_ssl: "Valid HTTPS certificate",
  };
  useEffect(() => {
    api
      .get<Company>("/manufacturer/company")
      .then(setCompany)
      .catch(() => {}) // No company yet
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  return (
    <div>
      <PageHeader
        title="Company Profile"
        description="This information appears on your public manufacturer page."
        meta={
          company ? (
            <>
              <StatusPill status={company.status} />
              {company.admin_note && (
                <span className="text-xs text-slate-500">Note: {company.admin_note}</span>
              )}
            </>
          ) : undefined
        }
        actions={
          company?.manufacturer_id ? (
            <a
              href={`/manufacturer/${company.manufacturer_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("secondary", "md")}
            >
              View public profile <AppIcon name="external" />
            </a>
          ) : undefined
        }
      />

      {message && <Notice tone="success" className="mb-4">{message}</Notice>}
      {error && <Notice tone="error" className="mb-4">{error}</Notice>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 min-w-0 order-2 lg:order-1">
        <CompanyProfileForm
          company={company}
          onSaved={(c) => {
            setCompany(c);
            setError("");
            setMessage("Company profile updated.");
          }}
        />
      </div>

      <div className="space-y-6 order-1 lg:order-2">
      {/* Manufacturer registry ID + membership */}
      {company?.manufacturer_id && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-slate-900">Your Manufacturer ID</p>
            <Badge tone={registry?.active ? "verified" : "neutral"} dot size="xs">
              Registry: {registry?.active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            A permanent identifier for your company in the Identification ID registry.
            It never changes and links to all of your products.
          </p>
          <div className="flex items-center justify-between gap-2 mb-4 rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-1 h-11">
            <span className="text-base font-mono tabular-nums font-semibold text-slate-900" data-no-i18n>{company.manufacturer_id}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(company.manufacturer_id || "").catch(() => {});
                setCopiedMid(true);
                setTimeout(() => setCopiedMid(false), 2000);
              }}
              className="text-xs h-8 px-2.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {copiedMid ? "Copied" : "Copy"}
            </button>
          </div>

          {registry?.active ? (
            <p className="text-xs text-slate-500 border-t border-slate-100 pt-3 leading-relaxed">
              Registry membership active
              {registry.included_in_plan
                ? " (included in your plan)"
                : registry.paid_until
                ? ` through ${new Date(registry.paid_until).toLocaleDateString()}`
                : ""}
              . Your public manufacturer profile is live.
            </p>
          ) : (
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                {registry?.last_active ? `Last active: ${monthYear(registry.last_active)}. ` : ""}
                Your Manufacturer ID is permanent and existing links keep working. Renew your
                membership ($5/month or $49/year) to reactivate your public profile and edit products.
              </p>
              <Link
                href="/onboarding?step=activate"
                className={buttonClasses("primary", "sm")}
              >
                Renew membership
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Automated verification */}
      {company && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
            <p className="text-sm font-semibold text-slate-900">Verification</p>
            {company.trust_score !== null && company.trust_score !== undefined && (
              <Badge
                tone={company.trust_score >= 70 ? "verified" : company.trust_score >= 40 ? "pending" : "neutral"}
                icon={company.trust_score >= 70 ? "check" : undefined}
                size="xs"
              >
                {company.trust_score >= 70
                  ? "Verified Manufacturer"
                  : company.trust_score >= 40
                  ? "Partially verified"
                  : "Not verified"}{" "}
                · {company.trust_score}/100
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            These checks run automatically from your website and email - nothing for you to do.
            Add a company website and use a work email address to score higher.
          </p>

          {company.trust_checks ? (
            <ul className="divide-y divide-slate-100 mb-4 border-y border-slate-100">
              {Object.entries(CHECK_LABELS).map(([key, label]) => {
                const ok = company.trust_checks?.[key] === true;
                return (
                  <li key={key} className="flex items-center gap-2.5 text-sm py-2">
                    <CheckDot ok={ok} />
                    <span className={ok ? "text-slate-800" : "text-slate-500"}>{label}</span>
                  </li>
                );
              })}
              {typeof company.trust_checks.domain_age_days === "number" && (
                <li className="flex items-center gap-2.5 text-sm py-2">
                  <CheckDot ok />
                  <span className="text-slate-800">
                    Domain age:{" "}
                    {Math.floor((company.trust_checks.domain_age_days as number) / 365)} year(s)
                  </span>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-slate-500 mb-4">No checks run yet.</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={recheckVerification}
              disabled={rechecking}
              className={buttonClasses("secondary", "sm")}
            >
              {rechecking ? "Checking…" : "Re-run checks"}
            </button>
            {company.trust_checked_at && (
              <span className="text-xs text-slate-500">
                Last checked {new Date(company.trust_checked_at).toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-slate-100 leading-relaxed">
            {VERIFICATION_DISCLAIMER}{" "}
            <a href="/verification" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              How verification works
            </a>
          </p>
        </div>
      )}
      </div>
      </div>
    </div>
  );
}

function CheckDot({ ok }: { ok: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
        ok ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" : "ring-1 ring-slate-200 text-transparent"
      }`}
    >
      <AppIcon name="check" className="w-3 h-3" />
    </span>
  );
}
