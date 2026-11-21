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
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1.5">Do not contact</h1>
      <p className="text-sm text-slate-500 mb-6">
        Never send outreach to these addresses. Unsubscribe-link clicks are added automatically. Add replies that
        say &ldquo;unsubscribe&rdquo;, bounces and spam complaints here by hand.
      </p>

      <form onSubmit={add} className="inline-flex flex-wrap gap-1 p-1 mb-6 rounded-lg bg-slate-100 border border-slate-200">
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@factory.com"
          className="flex-1 min-w-[220px] h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-xs hover:border-slate-400"
        />
        <select value={reason} onChange={(e) => setReason(e.target.value)}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-xs hover:border-slate-400">
          <option value="unsubscribe">Unsubscribed (reply)</option>
          <option value="bounce">Bounced</option>
          <option value="complaint">Complaint / spam report</option>
          <option value="manual">Other</option>
        </select>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)"
          className="flex-1 min-w-[160px] h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-xs hover:border-slate-400" />
        <button type="submit" className="h-8 text-sm font-medium bg-accent text-white px-4 rounded-lg shadow-sm hover:bg-accent-hover">
          Add
        </button>
      </form>
      {msg && <p className="text-xs text-slate-500 -mt-4 mb-4">{msg}</p>}

      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Check an address..."
        className="w-full max-w-sm h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-xs hover:border-slate-400 mb-3" />

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-slate-500">{q ? "Not on the list - OK to contact." : "The list is empty."}</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
          {shown.map((r) => (
            <div key={r.email} className="px-4 py-2.5 text-sm flex items-center justify-between gap-3 flex-wrap">
              <span className="font-mono">{r.email}</span>
              <span className="text-xs text-slate-500">
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
