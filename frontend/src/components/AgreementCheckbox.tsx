"use client";

import { api } from "@/services/api";
import { AGREEMENT_VERSION } from "@/lib/constants";

/** Records acceptance of the current Manufacturer Agreement (user, company, version, time, IP). */
export async function acceptAgreement(): Promise<void> {
  await api.post("/manufacturer/agreement/accept", { version: AGREEMENT_VERSION });
}

/** Unchecked by default; the caller keeps payment disabled until it's ticked. */
export function AgreementCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
      />
      <span>
        I agree to the{" "}
        <a href="/manufacturer-agreement" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          Manufacturer Agreement
        </a>{" "}
        and{" "}
        <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          Terms of Service
        </a>
        .
      </span>
    </label>
  );
}
