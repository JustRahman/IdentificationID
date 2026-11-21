"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";

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

  const input =
    "w-full h-11 rounded-lg border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-100";

  return (
    <div className="bg-surface border-b border-slate-200">
      <div className="mx-auto max-w-lg px-5 sm:px-6 py-16 sm:py-24">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)]">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Unsubscribe</h1>
          <p className="mt-1 text-sm text-slate-500">退订 · Отписаться</p>

          {done ? (
            <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 space-y-2">
              <p className="flex items-start gap-2.5">
                <svg className="w-5 h-5 shrink-0 text-emerald-600" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 10.5l3.2 3.2L15 7" />
                </svg>
                <span>
                  <strong>{email.trim()}</strong>{" "}has been unsubscribed. We will not send business emails to this
                  address again.
                </span>
              </p>
              <p className="text-xs pl-7">您已成功退订，我们将不再向此邮箱发送邮件。</p>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5">
              <p className="text-[15px] text-slate-600 leading-relaxed">
                Stop all business emails from Identification ID (Global Product Identification Inc.) to this address.
                It takes effect immediately.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5" htmlFor="unsub-email">Email address</label>
                <input
                  id="unsub-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={input}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5" htmlFor="unsub-comment">
                  Comment <span className="font-normal text-slate-500">(optional)</span>
                </label>
                <input
                  id="unsub-comment"
                  type="text"
                  maxLength={1000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={input}
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <Button type="submit" disabled={sending} size="lg" className="w-full">
                {sending ? "Unsubscribing..." : "Unsubscribe"}
              </Button>
              <p className="text-xs text-slate-500 leading-relaxed">
                This only stops marketing emails. If you have an account, messages about your account and payments
                continue. See our <Link href="/legal/privacy" className="text-accent hover:underline underline-offset-4">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          Want to check who we are first? See the{" "}
          <Link href="/legal#outreach" className="text-accent hover:underline underline-offset-4">Trust Center</Link>.
        </p>
      </div>
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
