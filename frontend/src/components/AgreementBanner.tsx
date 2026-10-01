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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<{ success: boolean; data: { accepted: boolean } }>("/manufacturer/agreement")
      .then((res) => setNeeded(!res.data.accepted))
      .catch(() => {});
  }, []);

  if (!needed) return null;

  async function accept() {
    setSaving(true);
    setError("");
    try {
      await acceptAgreement();
      setNeeded(false);
    } catch {
      setError("Could not save your acceptance. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
      <p className="text-sm font-semibold text-blue-900">Please review the Manufacturer Agreement</p>
      <p className="text-xs text-blue-800 mt-0.5 mb-3">
        We&apos;ve published a new version of the Manufacturer Agreement. Please review and accept it.
        Payments are paused until you do; your products are not affected.
      </p>
      <div className="flex items-center gap-4 flex-wrap">
        <AgreementCheckbox checked={checked} onChange={setChecked} />
        <button
          onClick={accept}
          disabled={!checked || saving}
          className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-accent-hover font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Accept"}
        </button>
      </div>
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
    </div>
  );
}
