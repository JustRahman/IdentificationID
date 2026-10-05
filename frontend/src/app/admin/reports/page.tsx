"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface Report {
  id: string;
  target_type: "product" | "manufacturer";
  target_id: string;
  reason: string;
  message: string;
  reporter_email: string | null;
  reporter_name: string | null;
  evidence: string | null;
  status: Status;
  admin_note: string | null;
  created_at: string | null;
  resolved_at: string | null;
}

type Status = "open" | "under_review" | "resolved";
const STATUS_LABELS: Record<Status, string> = { open: "Open", under_review: "Under review", resolved: "Resolved" };

const REASON_LABELS: Record<string, string> = {
  incorrect_manufacturer_info: "Incorrect manufacturer information",
  unauthorized_profile: "Unauthorized company / brand profile",
  trademark: "Trademark infringement",
  copyright: "Copyright infringement",
  counterfeit: "Counterfeit / suspicious product",
  incorrect_product_info: "Incorrect product information",
  incorrect_info: "Incorrect information",
  ip_infringement: "IP infringement",
  impersonation: "Impersonation",
  safety_concern: "Safety concern",
  other: "Other",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState<Status>("open");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function load(s: Status) {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Report[] }>(`/admin/reports?status=${s}`);
      setReports(res.data);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(status); }, [status]);

  async function act(id: string, action: "resolve" | "under-review") {
    setBusy(id);
    try {
      await api.post(`/admin/reports/${id}/${action}`, { note: notes[id] || null });
      await load(status);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Reports</h1>
      <div className="flex gap-2 mb-4">
        {(["open", "under_review", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
              status === s ? "bg-accent text-white" : "bg-background border border-border text-muted hover:text-foreground"
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted">No {STATUS_LABELS[status].toLowerCase()} reports.</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-background border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div>
                  <p className="text-sm font-medium">{REASON_LABELS[r.reason] || r.reason}</p>
                  <a
                    href={r.target_type === "product" ? `/p/${r.target_id}` : `/manufacturer/${r.target_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-accent hover:underline"
                  >
                    {r.target_id} ({r.target_type}) ↗
                  </a>
                </div>
                <p className="text-xs text-muted">
                  {r.created_at ? new Date(r.created_at).toLocaleString() : ""}
                </p>
              </div>
              <p className="text-sm whitespace-pre-wrap mb-2">{r.message}</p>
              {r.evidence && (
                <p className="text-xs whitespace-pre-wrap mb-2"><span className="text-muted">Evidence:</span> {r.evidence}</p>
              )}
              <p className="text-xs text-muted mb-3">
                Reporter: {r.reporter_name || "no name given"} · {r.reporter_email || "no email given"}
              </p>
              {r.status !== "resolved" ? (
                <div className="flex gap-2 flex-wrap">
                  <input
                    value={notes[r.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                    placeholder="Internal note (optional)"
                    className="flex-1 min-w-[200px] border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
                  />
                  {r.status === "open" && (
                    <button
                      onClick={() => act(r.id, "under-review")}
                      disabled={busy === r.id}
                      title="Shows 'Under registry review' on the public page and locks editing"
                      className="text-sm border border-amber-300 text-amber-900 bg-amber-50 px-4 py-1.5 rounded-lg hover:bg-amber-100 disabled:opacity-50"
                    >
                      Mark under review
                    </button>
                  )}
                  <button
                    onClick={() => act(r.id, "resolve")}
                    disabled={busy === r.id}
                    className="text-sm bg-accent text-white px-4 py-1.5 rounded-lg hover:bg-accent-hover disabled:opacity-50"
                  >
                    {busy === r.id ? "Saving..." : "Mark resolved"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-muted">
                  Resolved {r.resolved_at ? new Date(r.resolved_at).toLocaleString() : ""}
                  {r.admin_note ? ` · Note: ${r.admin_note}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
