"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 10) {
      setError("Password must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 mb-1 text-center">Create account</h1>
      <p className="text-sm text-slate-500 text-center mb-5">Start managing your products</p>
      <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-slate-700 leading-relaxed">
        <p className="font-medium text-slate-900">Free registration until July 1, 2027</p>
        <p className="mt-0.5 text-slate-600">Manufacturer ID + 3 products. No card, no automatic charge.</p>
      </div>
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-3 mb-5">
          {error}
        </div>
      )}
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
            minLength={10}
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs hover:border-slate-400"
          />
          <p className="text-xs text-slate-500 mt-1.5">At least 10 characters</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-800 mb-1.5">Confirm password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-xs hover:border-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-accent text-white rounded-lg text-sm font-medium shadow-sm hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
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
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
