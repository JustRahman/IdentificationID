"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login, loginMfa } = useAuth();
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mfaToken) {
        await loginMfa(mfaToken, code);
      } else {
        const r = await login(email, password);
        if (r.mfaToken) setMfaToken(r.mfaToken);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 mb-1 text-center">Log in</h1>
      <p className="text-sm text-slate-500 text-center mb-7">Sign in to your account</p>
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-3 mb-5">
          {error}
        </div>
      )}
      {mfaToken ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1.5" htmlFor="mfa-code">Two-step verification code</label>
            <input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={8}
              placeholder="123456"
              className="w-full h-11 rounded-lg border border-slate-300 bg-white px-3 text-base font-mono tabular-nums text-slate-900 shadow-xs tracking-[0.3em] text-center"
            />
            <p className="text-xs text-slate-500 mt-1.5">Enter the 6-digit code from your authenticator app.</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-accent text-white rounded-lg text-sm font-medium shadow-sm hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? "Checking..." : "Verify"}
          </button>
          <button type="button" onClick={() => { setMfaToken(null); setCode(""); }} className="w-full text-sm text-slate-500 hover:text-slate-900">
            Start over
          </button>
        </form>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs hover:border-slate-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs hover:border-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-accent text-white rounded-lg text-sm font-medium shadow-sm hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
      </form>
      )}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-slate-400">or</span>
        </div>
      </div>
      <button disabled className="w-full h-10 border border-slate-200 bg-slate-50 text-slate-400 rounded-lg text-sm cursor-not-allowed">
        Continue with Google (coming soon)
      </button>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
