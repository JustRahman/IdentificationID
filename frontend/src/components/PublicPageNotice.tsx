"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { PRODUCT_DISCLAIMER, VERIFICATION_DISCLAIMER } from "@/lib/constants";
import { DisclaimerBar } from "@/components/ui/DisclaimerBar";

// Reasons from the IP & Trademark Complaint Policy.
const REASONS = [
  { value: "incorrect_manufacturer_info", label: "Incorrect manufacturer information" },
  { value: "unauthorized_profile", label: "Unauthorized company / brand profile" },
  { value: "trademark", label: "Trademark infringement" },
  { value: "copyright", label: "Copyright infringement" },
  { value: "counterfeit", label: "Counterfeit / suspicious product" },
  { value: "incorrect_product_info", label: "Incorrect product information" },
  { value: "safety_concern", label: "Safety concern" },
  { value: "other", label: "Other" },
];
// Complaints that can lead to restricting a record need a way to reply.
const NEEDS_EMAIL = new Set(["unauthorized_profile", "trademark", "copyright"]);

const inputClass = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:border-accent";

function ReportForm({
  targetType,
  targetId,
  onClose,
}: {
  targetType: "product" | "manufacturer";
  targetId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState(targetType === "product" ? "incorrect_product_info" : "incorrect_manufacturer_info");
  const [message, setMessage] = useState("");
  const [evidence, setEvidence] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const emailRequired = NEEDS_EMAIL.has(reason);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api.post("/public/reports", {
        target_type: targetType,
        target_id: targetId,
        reason,
        message,
        evidence: evidence.trim() || null,
        name: name.trim() || null,
        email: email.trim() || null,
      });
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Could not send the report. Please check the form and try again.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-xl px-4 py-3">
        Thank you. Your report was sent to our team for review. If you gave an email address, we may contact you
        for more information.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-white border border-slate-200 rounded-2xl p-5">
      <p className="text-xs text-slate-500">
        Reporting {targetType === "product" ? "Product ID" : "Manufacturer ID"}{" "}
        <span className="font-mono tabular-nums font-semibold text-slate-800" data-no-i18n>{targetId}</span>
      </p>
      <div>
        <label className="block text-xs font-medium mb-1">Reason</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass}>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Describe the problem</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={5}
          maxLength={4000}
          rows={4}
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Evidence (optional)</label>
        <textarea
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          maxLength={4000}
          rows={2}
          placeholder="Links, trademark registration numbers, or where the original content appears"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1">Your name (optional)</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={255} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Your email {emailRequired ? "(required)" : "(optional)"}</label>
          <input type="email" value={email} required={emailRequired} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
      </div>
      <p className="text-xs text-slate-500">
        Your contact details are only used to follow up on this report. Trademark and copyright complaints are
        handled under our{" "}
        <Link href="/legal/ip-policy" className="text-accent hover:underline">IP &amp; Trademark Complaint Policy</Link>.
      </p>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send report"}
        </button>
        <button type="button" onClick={onClose} className="border border-slate-200 bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:border-slate-300">
          Cancel
        </button>
      </div>
    </form>
  );
}

/**
 * Legal notice for public product and manufacturer pages: who provides the
 * information, what verification means, and a way to report problems.
 */
export function PublicPageNotice({
  targetType,
  targetId,
  showReport = true,
  underReview = false,
}: {
  targetType: "product" | "manufacturer";
  targetId: string;
  showReport?: boolean;
  underReview?: boolean;
}) {
  const [reporting, setReporting] = useState(false);

  return (
    <div className="mt-10 space-y-3 text-sm">
      {underReview && (
        <div role="status" className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-3 text-sm">
          <strong>Under registry review.</strong>{" "}We received a report about this{" "}
          {targetType === "product" ? "product record" : "manufacturer record"} and are reviewing it. Editing is
          paused until the review is complete.
        </div>
      )}
      <DisclaimerBar
        action={
          showReport && !reporting ? (
            <button
              type="button"
              onClick={() => setReporting(true)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg px-3 h-8 whitespace-nowrap transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0h13l-2 4 2 4H3" />
              </svg>
              {targetType === "product" ? "Report this product" : "Report this profile"}
            </button>
          ) : undefined
        }
      >
        {PRODUCT_DISCLAIMER}
      </DisclaimerBar>
      <p className="text-xs text-slate-500 leading-relaxed px-1">
        {VERIFICATION_DISCLAIMER}{" "}
        <Link href="/verification" className="text-accent hover:underline">
          What does Verified mean?
        </Link>
        {" - "}
        <Link href="/legal" className="text-accent hover:underline">
          Legal &amp; Trust Center
        </Link>
      </p>
      {showReport && reporting && (
        <ReportForm targetType={targetType} targetId={targetId} onClose={() => setReporting(false)} />
      )}
    </div>
  );
}
