"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/services/api";

interface AuditEntry {
  id: string;
  created_at: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
}

function Values({ values }: { values: Record<string, unknown> | null }) {
  if (!values) return <span className="text-slate-500">-</span>;
  return (
    <pre className="text-[11px] whitespace-pre-wrap break-all font-mono">{JSON.stringify(values, null, 1)}</pre>
  );
}

/** Read-only audit trail. Entries can't be edited or deleted (enforced in the database). */
export default function AdminAuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [entityId, setEntityId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  async function load(p: number, id: string) {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: String(p), per_page: "50" });
      if (id.trim()) q.set("entity_id", id.trim());
      const res = await api.get<{ success: boolean; data: AuditEntry[] }>(`/admin/audit-logs?${q}`);
      setEntries(res.data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(page, entityId); }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function search(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    load(1, entityId);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1.5">Audit trail</h1>
      <p className="text-sm text-slate-500 mb-6">
        Every change to products, documents, images and company profiles. Entries are permanent.
      </p>
      <form onSubmit={search} className="inline-flex flex-wrap gap-1 p-1 mb-5 rounded-lg bg-slate-100 border border-slate-200">
        <input
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Filter by product or company id"
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-xs hover:border-slate-400 w-80"
        />
        <button className="h-8 text-sm border border-slate-300 bg-white px-3 rounded-lg shadow-xs hover:bg-slate-50">Filter</button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-500">No entries.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-xs font-medium text-slate-500 bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">When</th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">Who</th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">Action</th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">Entity</th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">Old</th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">New</th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">IP</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-slate-100 last:border-0 align-top hover:bg-slate-50/60">
                  <td className="px-3 py-2.5 whitespace-nowrap">{e.created_at ? new Date(e.created_at).toLocaleString() : ""}</td>
                  <td className="px-3 py-2.5">{e.actor_email || "-"}</td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{e.action}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-slate-500">{e.entity_type}</span>
                    <br />
                    <span className="font-mono break-all">{e.entity_id}</span>
                  </td>
                  <td className="px-3 py-2.5 max-w-[240px]"><Values values={e.old_values ?? e.metadata} /></td>
                  <td className="px-3 py-2.5 max-w-[240px]"><Values values={e.new_values} /></td>
                  <td className="px-3 py-2.5 font-mono tabular-nums">{e.ip_address || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="h-8 text-sm border border-slate-300 bg-white px-3 rounded-lg shadow-xs hover:bg-slate-50 disabled:opacity-40"
        >
          Newer
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={entries.length < 50}
          className="h-8 text-sm border border-slate-300 bg-white px-3 rounded-lg shadow-xs hover:bg-slate-50 disabled:opacity-40"
        >
          Older
        </button>
      </div>
    </div>
  );
}
