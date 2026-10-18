"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/services/api";

interface Row {
  email: string;
  reason: string;
  source: string;
  note: string | null;
  created_at: string | null;
}

/** Outreach do-not-contact list. Check every address here before sending an outreach email. */
export default function DoNotContactPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("unsubscribe");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Row[] }>("/admin/suppressions");
      setRows(res.data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      const res = await api.post<{ success: boolean; data: { created: boolean } }>("/admin/suppressions", {
        email: email.trim(), reason, note: note.trim() || null,
      });
      setMsg(res.data.created ? "Added." : "Already on the list.");
      setEmail("");
      setNote("");
      await load();
    } catch {
      setMsg("Could not add. Check the email address.");
    }
  }

  const q = query.trim().toLowerCase();
  const shown = q ? rows.filter((r) => r.email.includes(q)) : rows;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Do not contact</h1>
      <p className="text-sm text-muted mb-6">
        Never send outreach to these addresses. Unsubscribe-link clicks are added automatically. Add replies that
        say &ldquo;unsubscribe&rdquo;, bounces and spam complaints here by hand.
      </p>

      <form onSubmit={add} className="flex gap-2 flex-wrap mb-6">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@factory.com"
          className="flex-1 min-w-[220px] border border-border rounded-lg px-3 py-1.5 text-sm bg-background"
        />
        <select value={reason} onChange={(e) => setReason(e.target.value)}
          className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background">
          <option value="unsubscribe">Unsubscribed (reply)</option>
          <option value="bounce">Bounced</option>
          <option value="complaint">Complaint / spam report</option>
          <option value="manual">Other</option>
        </select>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)"
          className="flex-1 min-w-[160px] border border-border rounded-lg px-3 py-1.5 text-sm bg-background" />
        <button type="submit" className="text-sm bg-accent text-white px-4 py-1.5 rounded-lg hover:bg-accent-hover">
          Add
        </button>
      </form>
      {msg && <p className="text-xs text-muted -mt-4 mb-4">{msg}</p>}

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Check an address..."
        className="w-full max-w-sm border border-border rounded-lg px-3 py-1.5 text-sm bg-background mb-3" />

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-muted">{q ? "Not on the list - OK to contact." : "The list is empty."}</p>
      ) : (
        <div className="bg-background border border-border rounded-xl divide-y divide-border">
          {shown.map((r) => (
            <div key={r.email} className="px-4 py-2.5 text-sm flex items-center justify-between gap-3 flex-wrap">
              <span className="font-mono">{r.email}</span>
              <span className="text-xs text-muted">
                {r.reason} via {r.source}
                {r.note ? ` · ${r.note}` : ""}
                {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString()}` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
