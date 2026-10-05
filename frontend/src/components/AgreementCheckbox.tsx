"use client";

import { api } from "@/services/api";
import {
  AGREEMENT_HASH,
  AGREEMENT_VERSION,
  CHECKBOX_TEXT_VERSION,
  PRIVACY_HASH,
  PRIVACY_VERSION,
} from "@/lib/constants";

export type BillingPeriod = "monthly" | "annual";

const PRICE_TEXT: Record<BillingPeriod, string> = {
  monthly: "USD $5 per month",
  annual: "USD $49 per year",
};

/**
 * Saves a full acceptance record: exact document version + SHA-256, privacy
 * version, the person accepting, price and billing period shown, checkbox
 * text version, plus IP and browser (added by the server).
 */
export async function acceptAgreement(opts: {
  authorizedPersonName: string;
  billingPeriod?: BillingPeriod | null;
}): Promise<void> {
  await api.post("/manufacturer/agreement/accept", {
    version: AGREEMENT_VERSION,
    document_hash: AGREEMENT_HASH,
    privacy_version: PRIVACY_VERSION,
    privacy_document_hash: PRIVACY_HASH,
    checkbox_text_version: CHECKBOX_TEXT_VERSION,
    authorized_person_name: opts.authorizedPersonName.trim(),
    billing_period: opts.billingPeriod ?? null,
  });
}

/**
 * Unchecked by default; the caller keeps payment disabled until it's ticked and
 * a name is entered. The sentence must match checkbox_text() in
 * backend/app/services/agreement.py (version CHECKBOX_TEXT_VERSION).
 */
export function AgreementCheckbox({
  checked,
  onChange,
  companyName,
  billingPeriod,
  personName,
  onPersonNameChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  companyName: string;
  billingPeriod?: BillingPeriod | null;
  personName: string;
  onPersonNameChange: (name: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium mb-1" htmlFor="authorized-person">
          Your full name (person accepting on behalf of the company)
        </label>
        <input
          id="authorized-person"
          type="text"
          value={personName}
          onChange={(e) => onPersonNameChange(e.target.value)}
          autoComplete="name"
          maxLength={255}
          className="w-full max-w-sm border border-border rounded-lg px-3 py-2 text-sm bg-background"
        />
      </div>
      <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
        />
        <span>
          I confirm that I am authorized to act on behalf of <strong>{companyName || "my company"}</strong>{" "}and
          agree to the Identification ID{" "}
          <a href={`/legal/terms/${AGREEMENT_VERSION}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Terms of Service and Manufacturer Agreement
          </a>{" "}
          (Version {AGREEMENT_VERSION}). I acknowledge that I have read the{" "}
          <a href={`/legal/privacy/${PRIVACY_VERSION}`} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            Privacy Policy
          </a>
          .
          {billingPeriod && (
            <>
              {" "}I understand that the Manufacturer Registry Membership renews automatically at{" "}
              {PRICE_TEXT[billingPeriod]} until cancelled.
            </>
          )}
        </span>
      </label>
    </div>
  );
}
