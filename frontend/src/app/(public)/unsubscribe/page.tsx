"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";

function UnsubscribeInner() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await api.post("/public/unsubscribe", { email: email.trim(), comment: comment.trim() || null });
      setDone(true);
    } catch {
      setError("Please check the email address and try again, or reply \"unsubscribe\" to our email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Unsubscribe</h1>
      <p className="text-xs text-muted mb-6">退订 · Отписаться</p>

      {done ? (
        <div className="bg-green-50 border border-green-200 text-green-900 text-sm rounded-lg p-4 space-y-2">
          <p>
            <strong>{email.trim()}</strong>{" "}has been unsubscribed. We will not send business emails to this
            address again.
          </p>
          <p className="text-xs">您已成功退订，我们将不再向此邮箱发送邮件。</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted">
            Stop all business emails from Identification ID (Global Product Identification Inc.) to this address.
            It takes effect immediately.
          </p>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="unsub-email">Email address</label>
            <input
              id="unsub-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" htmlFor="unsub-comment">Comment (optional)</label>
            <input
              id="unsub-comment"
              type="text"
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            />
          </div>
          {error && <p className="text-xs text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
          >
            {sending ? "Unsubscribing..." : "Unsubscribe"}
          </button>
          <p className="text-xs text-muted">
            This only stops marketing emails. If you have an account, messages about your account and payments
            continue. See our <Link href="/legal/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
          </p>
        </form>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense>
      <UnsubscribeInner />
    </Suspense>
  );
}
