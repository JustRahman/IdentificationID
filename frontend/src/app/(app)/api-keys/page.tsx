"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui";
import { PageHeader, inputClass } from "@/components/app";
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
  { method: "GET", path: "/lookup/{identification_id}", desc: "Public lookup of any published product" },
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

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <div>
      <PageHeader title="API Access" description="API keys and webhooks for connecting your systems to the registry." />

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 max-w-3xl">
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

      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-3xl mb-6">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 mb-4">Create API Key</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Key name (e.g. Production)"
            maxLength={100}
            className={`flex-1 ${inputClass}`}
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className={buttonClasses("primary", "md")}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </form>

        {createdKey && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">
              Save this key now - you won&apos;t see it again.
            </p>
            <div className="flex items-center gap-2">
              <pre className="flex-1 bg-white border border-amber-200 rounded-lg p-3 text-xs font-mono overflow-x-auto" data-no-i18n>
                {createdKey.key}
              </pre>
              <button
                onClick={handleCopy}
                className={buttonClasses("secondary", "md", "shrink-0")}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-3xl mb-6">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 mb-4">Your Keys</h2>
        {keys.length === 0 ? (
          <p className="text-sm text-slate-500">No API keys yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 border-y border-slate-100 -mx-6">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between gap-4 px-6 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium">
                    {k.name}
                    {!k.is_active && (
                      <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
                        Revoked
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-600 font-mono mt-0.5" data-no-i18n>{k.key_prefix}</p>
                  <p className="text-xs text-slate-500">
                    Created {k.created_at ? new Date(k.created_at).toLocaleDateString() : "-"}
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
                        className="h-8 px-3 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmRevoke(null)}
                        className={buttonClasses("secondary", "sm")}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRevoke(k.id)}
                      className="h-8 px-3 text-sm rounded-lg border border-slate-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-200"
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-3xl mb-6">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 mb-1">Webhooks</h2>
        <p className="text-xs text-slate-500 mb-4">
          Receive a signed <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">POST</code> to your URL when product events happen.
          Verify the <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono">X-IID-Signature</code> header (HMAC-SHA256 of the body) with your signing secret.
        </p>

        <form onSubmit={handleCreateWebhook} className="space-y-3 mb-4">
          <input
            type="url"
            value={whUrl}
            onChange={(e) => setWhUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks/iid"
            className={inputClass}
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
            className={buttonClasses("primary", "md")}
          >
            {whCreating ? "Adding..." : "Add webhook"}
          </button>
        </form>

        {newWebhook?.secret && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">
              Signing secret - save it to verify webhook signatures.
            </p>
            <pre className="bg-white border border-amber-200 rounded-lg p-3 text-xs font-mono overflow-x-auto" data-no-i18n>
              {newWebhook.secret}
            </pre>
          </div>
        )}

        {webhooks.length === 0 ? (
          <p className="text-sm text-slate-500">No webhooks yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 border-y border-slate-100 -mx-6">
            {webhooks.map((w) => (
              <div key={w.id} className="px-6 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-mono truncate">{w.url}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{(w.events || []).join(" · ")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleTestWebhook(w.id)}
                      className={buttonClasses("secondary", "sm")}
                    >
                      {testedId === w.id ? "Sent" : "Test"}
                    </button>
                    <button
                      onClick={() => handleDeleteWebhook(w.id)}
                      className="h-8 px-3 text-sm rounded-lg border border-slate-300 bg-white text-red-600 hover:bg-red-50 hover:border-red-200"
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

      <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-3xl">
        <h2 className="text-[15px] font-semibold tracking-tight text-slate-900 mb-4">Quick start</h2>
        <p className="text-xs text-slate-500 mb-1">Base URL</p>
        <pre className="bg-slate-950 text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto" data-no-i18n>
          {BASE_URL}
        </pre>
        <p className="text-xs text-slate-500 mt-4 mb-1">Endpoints</p>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl">
          {ENDPOINTS.map((ep) => (
            <div
              key={ep.path}
              className="flex items-start gap-3 px-4 py-3"
            >
              <span className="text-[11px] font-mono font-semibold text-accent bg-blue-50 rounded px-1.5 py-0.5 shrink-0">
                {ep.method}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-mono">{ep.path}</p>
                <p className="text-xs text-slate-500">{ep.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 mb-1">Example</p>
        <pre className="bg-slate-950 text-slate-100 rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto" data-no-i18n>
          {CURL_EXAMPLE}
        </pre>
      </div>
    </div>
  );
}
