"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1 text-center">Log in</h1>
      <p className="text-sm text-muted text-center mb-6">Sign in to your account</p>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
      </form>
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted">or</span>
        </div>
      </div>
      <button disabled className="w-full border border-border text-muted py-2.5 rounded-lg text-sm cursor-not-allowed">
        Continue with Google (coming soon)
      </button>
      <p className="mt-5 text-center text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
