"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { api } from "@/services/api";
import { PRODUCT_DISCLAIMER, VERIFICATION_DISCLAIMER } from "@/lib/constants";

const REASONS = [
  { value: "incorrect_info", label: "Incorrect information" },
  { value: "ip_infringement", label: "Intellectual property infringement" },
  { value: "impersonation", label: "Impersonation" },
  { value: "safety_concern", label: "Safety concern" },
  { value: "other", label: "Other" },
];

const inputClass = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background";

function ReportForm({
  targetType,
  targetId,
  onClose,
}: {
  targetType: "product" | "manufacturer";
  targetId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("incorrect_info");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
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
      <div className="mt-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3">
        Thank you. Your report was sent to our team for review.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3 bg-background border border-border rounded-xl p-4">
      <div>
        <label className="block text-xs font-medium mb-1">Reason</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass}>
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">What is wrong?</label>
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
        <label className="block text-xs font-medium mb-1">Your email (optional)</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        <p className="text-[11px] text-muted mt-1">Only used if we need to follow up with you.</p>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send report"}
        </button>
        <button type="button" onClick={onClose} className="border border-border px-4 py-2 rounded-lg text-sm hover:bg-surface">
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
}: {
  targetType: "product" | "manufacturer";
  targetId: string;
  showReport?: boolean;
}) {
  const [reporting, setReporting] = useState(false);

  return (
    <div className="mt-6 border-t border-border pt-5 text-xs text-muted leading-relaxed space-y-2">
      <p>{PRODUCT_DISCLAIMER}</p>
      <p>
        {VERIFICATION_DISCLAIMER}{" "}
        <Link href="/verification" className="text-accent hover:underline">
          How verification works
        </Link>
      </p>
      {showReport && (
        <div>
          {!reporting && (
            <button
              onClick={() => setReporting(true)}
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground border border-border rounded-lg px-3 py-1.5 mt-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V4m0 0h13l-2 4 2 4H3" />
              </svg>
              Report incorrect information
            </button>
          )}
          {reporting && (
            <ReportForm targetType={targetType} targetId={targetId} onClose={() => setReporting(false)} />
          )}
        </div>
      )}
    </div>
  );
}
