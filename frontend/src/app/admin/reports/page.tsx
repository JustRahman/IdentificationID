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
  status: "open" | "resolved";
  admin_note: string | null;
  created_at: string | null;
  resolved_at: string | null;
}

const REASON_LABELS: Record<string, string> = {
  incorrect_info: "Incorrect information",
  ip_infringement: "IP infringement",
  impersonation: "Impersonation",
  safety_concern: "Safety concern",
  other: "Other",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [status, setStatus] = useState<"open" | "resolved">("open");
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function load(s: "open" | "resolved") {
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

  async function resolve(id: string) {
    setBusy(id);
    try {
      await api.post(`/admin/reports/${id}/resolve`, { note: notes[id] || null });
      await load(status);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Reports</h1>
      <div className="flex gap-2 mb-4">
        {(["open", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm capitalize ${
              status === s ? "bg-accent text-white" : "bg-background border border-border text-muted hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : reports.length === 0 ? (
        <p className="text-sm text-muted">No {status} reports.</p>
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
              <p className="text-xs text-muted mb-3">Reporter: {r.reporter_email || "no email given"}</p>
              {r.status === "open" ? (
                <div className="flex gap-2 flex-wrap">
                  <input
                    value={notes[r.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                    placeholder="Internal note (optional)"
                    className="flex-1 min-w-[200px] border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
                  />
                  <button
                    onClick={() => resolve(r.id)}
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
