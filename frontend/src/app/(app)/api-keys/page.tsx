"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/services/api";

interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string | null;
}

interface CreatedKey {
  id: string;
  name: string;
  key: string;
  key_prefix: string;
  created_at: string | null;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  is_active: boolean;
  created_at: string | null;
}

const WH_EVENTS = ["product.published", "product.updated", "document.uploaded"];

const BASE_URL = "https://api.identificationid.com/v1";

const ENDPOINTS = [
  { method: "GET", path: "/products", desc: "List all your products (optional ?status=published)" },
  { method: "GET", path: "/products/{identification_id}", desc: "Full product detail with images and translations" },
  { method: "GET", path: "/lookup/{identification_id}", desc: "Public verification of any published product" },
  { method: "GET", path: "/stats", desc: "Product and view counts for your company" },
];

const CURL_EXAMPLE = `curl ${BASE_URL}/products \\
  -H "X-API-Key: iid_live_…"`;

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [planRequired, setPlanRequired] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreatedKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  // Webhooks
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [whUrl, setWhUrl] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>(["product.published"]);
  const [whCreating, setWhCreating] = useState(false);
  const [newWebhook, setNewWebhook] = useState<WebhookItem | null>(null);
  const [testedId, setTestedId] = useState<string | null>(null);

  async function loadWebhooks() {
    try {
      const res = await api.get<{ success: boolean; data: WebhookItem[] }>("/manufacturer/webhooks");
      setWebhooks(res.data);
    } catch {
      // ignore
    }
  }

  async function handleCreateWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (!whUrl.trim() || whEvents.length === 0) return;
    setWhCreating(true);
    setError("");
    setPlanRequired(false);
    try {
      const res = await api.post<{ success: boolean; data: WebhookItem }>(
        "/manufacturer/webhooks",
        { url: whUrl.trim(), events: whEvents }
      );
      setNewWebhook(res.data);
      setWhUrl("");
      await loadWebhooks();
    } catch (err: unknown) {
      const e2 = err as { error?: { code?: string; message?: string } };
      setError(e2?.error?.message || "Failed to create webhook");
      if (e2?.error?.code === "FORBIDDEN") setPlanRequired(true);
    } finally {
      setWhCreating(false);
    }
  }

  async function handleDeleteWebhook(id: string) {
    try {
      await api.delete(`/manufacturer/webhooks/${id}`);
      await loadWebhooks();
    } catch {
      // ignore
    }
  }

  async function handleTestWebhook(id: string) {
    try {
      await api.post(`/manufacturer/webhooks/${id}/test`);
      setTestedId(id);
      setTimeout(() => setTestedId(null), 2500);
    } catch {
      // ignore
    }
  }

  function toggleEvent(ev: string) {
    setWhEvents((prev) => (prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]));
  }

  async function loadKeys() {
    try {
      const res = await api.get<{ success: boolean; data: ApiKeyItem[] }>(
        "/manufacturer/api-keys"
      );
      setKeys(res.data);
    } catch {
      // ignore (e.g. no company yet)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKeys();
    loadWebhooks();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError("");
    setPlanRequired(false);
    setCopied(false);
    try {
      const res = await api.post<{ success: boolean; data: CreatedKey }>(
        "/manufacturer/api-keys",
        { name: name.trim() }
      );
      setCreatedKey(res.data);
      setName("");
      await loadKeys();
    } catch (err: unknown) {
      const e2 = err as { error?: { code?: string; message?: string } };
      setError(e2?.error?.message || "Failed to create key");
      if (e2?.error?.code === "FORBIDDEN") setPlanRequired(true);
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    try {
      await api.delete(`/manufacturer/api-keys/${id}`);
      setConfirmRevoke(null);
      await loadKeys();
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Failed to revoke key");
    }
  }

  async function handleCopy() {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">API Access</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4 max-w-2xl">
          {error}
          {planRequired && (
            <>
              {" "}
              <Link href="/billing" className="underline font-medium">
                Go to Billing
              </Link>
            </>
          )}
        </div>
      )}

      <div className="bg-background border border-border rounded-xl p-6 max-w-2xl mb-6">
        <h2 className="text-base font-semibold mb-4">Create API Key</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            maxLength={100}
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>

        {createdKey && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">
              Save this key now — you won&apos;t see it again.
            </p>
            <div className="flex items-center gap-2">
              <pre className="flex-1 bg-background border border-border rounded-lg p-3 text-xs overflow-x-auto">
                {createdKey.key}
              </pre>
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-lg text-sm font-medium border border-border hover:bg-surface shrink-0"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-background border border-border rounded-xl p-6 max-w-2xl mb-6">
        <h2 className="text-base font-semibold mb-4">Your Keys</h2>
        {keys.length === 0 ? (
          <p className="text-sm text-muted">No API keys yet.</p>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">
                    {k.name}
                    {!k.is_active && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-lg bg-gray-50 text-gray-600 border border-gray-200">
                        Revoked
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted font-mono">{k.key_prefix}</p>
                  <p className="text-xs text-muted">
                    Created {k.created_at ? new Date(k.created_at).toLocaleDateString() : "—"}
                    {" · "}
                    Last used{" "}
                    {k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "never"}
                  </p>
                </div>
                {k.is_active &&
                  (confirmRevoke === k.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRevoke(k.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmRevoke(null)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRevoke(k.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Revoke
                    </button>
                  ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Webhooks */}
      <div className="bg-background border border-border rounded-xl p-6 max-w-2xl mb-6">
        <h2 className="text-base font-semibold mb-1">Webhooks</h2>
        <p className="text-xs text-muted mb-4">
          Receive a signed <code className="bg-surface px-1 rounded">POST</code> to your URL when product events happen.
          Verify the <code className="bg-surface px-1 rounded">X-IID-Signature</code> header (HMAC-SHA256 of the body) with your signing secret.
        </p>

        <form onSubmit={handleCreateWebhook} className="space-y-3 mb-4">
          <input
            type="url"
            value={whUrl}
            onChange={(e) => setWhUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks/iid"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="flex flex-wrap gap-3">
            {WH_EVENTS.map((ev) => (
              <label key={ev} className="inline-flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={whEvents.includes(ev)}
                  onChange={() => toggleEvent(ev)}
                  className="accent-accent"
                />
                <span className="font-mono">{ev}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={whCreating || !whUrl.trim() || whEvents.length === 0}
            className="px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {whCreating ? "Adding..." : "Add webhook"}
          </button>
        </form>

        {newWebhook?.secret && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">
              Signing secret — save it to verify webhook signatures.
            </p>
            <pre className="bg-background border border-border rounded-lg p-3 text-xs overflow-x-auto">
              {newWebhook.secret}
            </pre>
          </div>
        )}

        {webhooks.length === 0 ? (
          <p className="text-sm text-muted">No webhooks yet.</p>
        ) : (
          <div className="space-y-2">
            {webhooks.map((w) => (
              <div key={w.id} className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-mono truncate">{w.url}</p>
                    <p className="text-xs text-muted mt-0.5">{(w.events || []).join(" · ")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleTestWebhook(w.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface"
                    >
                      {testedId === w.id ? "Sent ✓" : "Test"}
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(w.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-background border border-border rounded-xl p-6 max-w-2xl">
        <h2 className="text-base font-semibold mb-4">Quick start</h2>
        <p className="text-xs text-muted mb-1">Base URL</p>
        <pre className="bg-surface border border-border rounded-lg p-3 text-xs overflow-x-auto">
          {BASE_URL}
        </pre>
        <p className="text-xs text-muted mt-4 mb-1">Endpoints</p>
        <div className="space-y-2">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="flex items-start gap-3 p-3 border border-border rounded-lg"
            >
              <span className="text-xs font-mono font-semibold text-accent shrink-0">
                {ep.method}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-mono">{ep.path}</p>
                <p className="text-xs text-muted">{ep.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-4 mb-1">Example</p>
        <pre className="bg-surface border border-border rounded-lg p-3 text-xs overflow-x-auto">
          {CURL_EXAMPLE}
        </pre>
      </div>
    </div>
  );
}
