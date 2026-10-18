"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "@/services/api";

/** Admin 2-step login setup (TOTP). */
export default function AdminSecurityPage() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<{ secret: string; otpauth_uri: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get<{ success: boolean; data: { enabled: boolean } }>("/admin/2fa")
      .then((r) => setEnabled(r.data.enabled))
      .catch(() => setEnabled(null));
  }, []);

  async function start() {
    setError("");
    setBusy(true);
    try {
      const r = await api.post<{ success: boolean; data: { secret: string; otpauth_uri: string } }>("/admin/2fa/setup");
      setSetup(r.data);
    } catch {
      setError("Could not start setup.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api.post<{ success: boolean; data: { access_token: string; refresh_token: string } }>(
        "/admin/2fa/enable",
        { code }
      );
      localStorage.setItem("access_token", r.data.access_token);
      localStorage.setItem("refresh_token", r.data.refresh_token);
      setEnabled(true);
      setSetup(null);
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Wrong code.");
    } finally {
      setBusy(false);
    }
  }

  const grouped = setup?.secret.replace(/(.{4})/g, "$1 ").trim();

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-1">Security</h1>
      <p className="text-sm text-muted mb-6">Two-step login for the admin panel.</p>

      {enabled === true && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-4">
          Two-step login is <strong>on</strong>. Every admin login asks for a 6-digit code from your authenticator app.
        </div>
      )}

      {enabled === false && !setup && (
        <div className="bg-background border border-border rounded-xl p-5 space-y-3">
          <p className="text-sm">
            Two-step login is <strong className="text-red-700">off</strong>. Anyone with the admin password can open
            this panel. Turn it on so a code from your phone is also needed.
          </p>
          <button onClick={start} disabled={busy}
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50">
            Turn on two-step login
          </button>
        </div>
      )}

      {setup && (
        <form onSubmit={confirm} className="bg-background border border-border rounded-xl p-5 space-y-4">
          <div className="text-sm space-y-2">
            <p className="font-medium">1. Add this key to your authenticator app</p>
            <p className="text-muted text-xs">
              iPhone Passwords: New entry, then Set Up Verification Code, then Enter Setup Key. Google or Microsoft
              Authenticator: +, then Enter a setup key. On an iPhone you can also open{" "}
              <a href={setup.otpauth_uri} className="text-accent underline">this link</a> directly.
            </p>
            <p className="font-mono text-base bg-surface border border-border rounded-lg px-3 py-2 select-all break-all">
              {grouped}
            </p>
            <p className="text-xs text-muted">Account name: Identification ID Admin. Keep this key private.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="totp-code">2. Enter the 6-digit code it shows</label>
            <input id="totp-code" inputMode="numeric" autoComplete="one-time-code" value={code}
              onChange={(e) => setCode(e.target.value)} required maxLength={8}
              className="w-40 border border-border rounded-lg px-3 py-2 text-sm bg-background tracking-widest" />
          </div>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <button type="submit" disabled={busy}
            className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50">
            {busy ? "Checking..." : "Confirm and turn on"}
          </button>
        </form>
      )}
      {error && !setup && <p className="text-xs text-red-700 mt-3">{error}</p>}
    </div>
  );
}
