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
  if (!values) return <span className="text-muted">-</span>;
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
      <h1 className="text-xl font-semibold mb-1">Audit trail</h1>
      <p className="text-sm text-muted mb-6">
        Every change to products, documents, images and company profiles. Entries are permanent.
      </p>
      <form onSubmit={search} className="flex gap-2 mb-4">
        <input
          value={entityId}
          onChange={(e) => setEntityId(e.target.value)}
          placeholder="Filter by product or company id"
          className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background w-80"
        />
        <button className="text-sm border border-border px-3 py-1.5 rounded-lg hover:bg-background">Filter</button>
      </form>

      {loading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted">No entries.</p>
      ) : (
        <div className="bg-background border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-muted border-b border-border">
              <tr>
                <th className="p-2.5 font-medium">When</th>
                <th className="p-2.5 font-medium">Who</th>
                <th className="p-2.5 font-medium">Action</th>
                <th className="p-2.5 font-medium">Entity</th>
                <th className="p-2.5 font-medium">Old</th>
                <th className="p-2.5 font-medium">New</th>
                <th className="p-2.5 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 align-top">
                  <td className="p-2.5 whitespace-nowrap">{e.created_at ? new Date(e.created_at).toLocaleString() : ""}</td>
                  <td className="p-2.5">{e.actor_email || "-"}</td>
                  <td className="p-2.5 font-mono">{e.action}</td>
                  <td className="p-2.5">
                    <span className="text-muted">{e.entity_type}</span>
                    <br />
                    <span className="font-mono break-all">{e.entity_id}</span>
                  </td>
                  <td className="p-2.5 max-w-[240px]"><Values values={e.old_values ?? e.metadata} /></td>
                  <td className="p-2.5 max-w-[240px]"><Values values={e.new_values} /></td>
                  <td className="p-2.5 font-mono">{e.ip_address || "-"}</td>
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
          className="text-sm border border-border px-3 py-1.5 rounded-lg disabled:opacity-40"
        >
          Newer
        </button>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={entries.length < 50}
          className="text-sm border border-border px-3 py-1.5 rounded-lg disabled:opacity-40"
        >
          Older
        </button>
      </div>
    </div>
  );
}
