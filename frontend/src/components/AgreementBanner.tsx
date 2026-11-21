"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { AgreementCheckbox, acceptAgreement } from "@/components/AgreementCheckbox";

/**
 * Asks existing members to accept the current Manufacturer Agreement version.
 * Until they do, only payments are blocked (server-side); product editing works.
 */
export function AgreementBanner() {
  const [needed, setNeeded] = useState(false);
  const [checked, setChecked] = useState(false);
  const [personName, setPersonName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ success: boolean; data: { accepted: boolean } }>("/manufacturer/agreement")
      .then((res) => setNeeded(!res.data.accepted))
      .catch(() => {});
    api
      .get<{ legal_name?: string; display_name?: string }>("/manufacturer/company")
      .then((c) => setCompanyName(c.legal_name || c.display_name || ""))
      .catch(() => {});
  }, []);

  if (!needed) return null;

  async function accept() {
    setSaving(true);
    setError("");
    try {
      await acceptAgreement({ authorizedPersonName: personName });
      setNeeded(false);
    } catch {
      setError("Could not save your acceptance. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 border-l-4 border-l-accent">
      <p className="text-sm font-semibold text-slate-900">Please review our updated Terms</p>
      <p className="text-sm text-slate-600 mt-1 mb-4 leading-relaxed">
        We&apos;ve published a new version of the Terms of Service and Manufacturer Agreement. Please review and
        accept it. Payments are paused until you do; your products are not affected.
      </p>
      <div className="flex items-end gap-4 flex-wrap">
        <AgreementCheckbox
          checked={checked}
          onChange={setChecked}
          companyName={companyName}
          personName={personName}
          onPersonNameChange={setPersonName}
        />
        <button
          onClick={accept}
          disabled={!checked || saving || personName.trim().length < 2}
          className="h-9 px-4 text-sm bg-accent text-white rounded-lg hover:bg-accent-hover font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Accept"}
        </button>
      </div>
      {error && <p className="text-sm text-red-700 mt-2">{error}</p>}
    </div>
  );
}
