"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";
import { monthYear } from "@/components/ManufacturerProfileView";
import { useMembership } from "@/lib/membership";
import type { Company } from "@/types";

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
    return <p className="text-sm text-muted">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Company Profile</h1>

      {company && (
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
              company.status === "verified"
                ? "bg-green-50 text-green-700 border border-green-200"
                : company.status === "rejected"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
          </span>
          {company.admin_note && (
            <span className="text-xs text-muted">Note: {company.admin_note}</span>
          )}
        </div>
      )}

      {/* Manufacturer registry ID + membership */}
      {company?.manufacturer_id && (
        <div className="bg-background border border-border rounded-xl p-5 mb-6 max-w-lg">
          <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
            <p className="text-sm font-medium">Your Manufacturer ID</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-lg font-medium ${
                registry?.active
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-50 text-gray-600 border border-gray-200"
              }`}
            >
              Registry: {registry?.active ? "Active" : "Inactive"}
            </span>
          </div>
          <p className="text-xs text-muted mb-3">
            A permanent identifier for your company in the Identification ID registry.
            It never changes and links to all of your products.
          </p>
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-lg font-mono font-semibold">{company.manufacturer_id}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(company.manufacturer_id || "").catch(() => {});
                setCopiedMid(true);
                setTimeout(() => setCopiedMid(false), 2000);
              }}
              className="text-xs px-2 py-0.5 border border-border rounded hover:bg-surface text-muted transition-colors"
            >
              {copiedMid ? "✓ Copied" : "Copy"}
            </button>
            <a
              href={`/manufacturer/${company.manufacturer_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-0.5 border border-border rounded hover:bg-surface text-muted transition-colors"
            >
              View public profile ↗
            </a>
          </div>

          {registry?.active ? (
            <p className="text-xs text-muted border-t border-border pt-3">
              Registry membership active
              {registry.included_in_plan
                ? " (included in your plan)"
                : registry.paid_until
                ? ` through ${new Date(registry.paid_until).toLocaleDateString()}`
                : ""}
              . Your public manufacturer profile is live.
            </p>
          ) : (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted mb-3">
                {registry?.last_active ? `Last active: ${monthYear(registry.last_active)}. ` : ""}
                Your Manufacturer ID is permanent and existing links keep working. Renew your
                membership ($5/month or $49/year) to reactivate your public profile and edit products.
              </p>
              <Link
                href="/onboarding?step=activate"
                className="inline-block bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover"
              >
                Renew membership
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Automated verification */}
      {company && (
        <div className="bg-background border border-border rounded-xl p-5 mb-6 max-w-lg">
          <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
            <p className="text-sm font-medium">Verification</p>
            {company.trust_score !== null && company.trust_score !== undefined && (
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                  company.trust_score >= 70
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : company.trust_score >= 40
                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                    : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}
              >
                {company.trust_score >= 70
                  ? "✓ Verified Manufacturer"
                  : company.trust_score >= 40
                  ? "Partially verified"
                  : "Not verified"}{" "}
                · {company.trust_score}/100
              </span>
            )}
          </div>
          <p className="text-xs text-muted mb-4">
            These checks run automatically from your website and email — nothing for you to do.
            Add a company website and use a work email address to score higher.
          </p>

          {company.trust_checks ? (
            <ul className="space-y-1.5 mb-4">
              {Object.entries(CHECK_LABELS).map(([key, label]) => {
                const ok = company.trust_checks?.[key] === true;
                return (
                  <li key={key} className="flex items-center gap-2 text-sm">
                    <span className={ok ? "text-green-600" : "text-muted/50"}>
                      {ok ? "✓" : "○"}
                    </span>
                    <span className={ok ? "" : "text-muted"}>{label}</span>
                  </li>
                );
              })}
              {typeof company.trust_checks.domain_age_days === "number" && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✓</span>
                  <span>
                    Domain age:{" "}
                    {Math.floor((company.trust_checks.domain_age_days as number) / 365)} year(s)
                  </span>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted mb-4">No checks run yet.</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={recheckVerification}
              disabled={rechecking}
              className="text-sm border border-border px-4 py-2 rounded-lg hover:bg-surface disabled:opacity-50"
            >
              {rechecking ? "Checking…" : "Re-run checks"}
            </button>
            {company.trust_checked_at && (
              <span className="text-xs text-muted">
                Last checked {new Date(company.trust_checked_at).toLocaleString()}
              </span>
            )}
          </div>

          <p className="text-[11px] text-muted mt-4 pt-3 border-t border-border leading-relaxed">
            Verification confirms specified account, domain, or company-profile attributes
            checked by Identification ID. It does not constitute government certification,
            product safety certification, or a guarantee of product authenticity.{" "}
            <a href="/verification" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              How verification works
            </a>
          </p>
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <div className="bg-background border border-border rounded-xl p-6 max-w-lg">
        <CompanyProfileForm
          company={company}
          onSaved={(c) => {
            setCompany(c);
            setError("");
            setMessage("Company profile updated.");
          }}
        />
      </div>
    </div>
  );
}
