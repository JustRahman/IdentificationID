"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/services/api";
import { useAuth } from "@/lib/auth";

type Status = "checking" | "pending" | "success" | "error" | "resending" | "resent";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token: authToken } = useAuth();
  const [status, setStatus] = useState<Status>("checking");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("pending");
      return;
    }

    apiFetch(`/auth/email/verify?token=${encodeURIComponent(token)}`, {
      method: "POST",
    })
      .then(() => setStatus("success"))
      .catch((err: Error) => {
        setErrorMsg(err.message || "Invalid or expired link");
        setStatus("error");
      });
  }, [searchParams]);

  async function handleResend() {
    if (!authToken) {
      router.push("/login");
      return;
    }
    setStatus("resending");
    try {
      await apiFetch("/auth/email/resend", { method: "POST" });
      setStatus("resent");
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to resend");
      setStatus("error");
    }
  }

  if (status === "checking") {
    return (
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted">Verifying your email…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2">Email verified</h1>
        <p className="text-sm text-muted mb-6">Your account is now fully activated.</p>
        <Link href="/dashboard" className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2">Verification failed</h1>
        <p className="text-sm text-muted mb-6">{errorMsg}</p>
        <button
          onClick={handleResend}
          className="border border-border text-foreground px-5 py-2.5 rounded-lg text-sm hover:bg-surface transition-colors"
        >
          Resend verification email
        </button>
      </div>
    );
  }

  if (status === "resending") {
    return (
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted">Sending email…</p>
      </div>
    );
  }

  if (status === "resent") {
    return (
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2">Email sent</h1>
        <p className="text-sm text-muted">Check your inbox and click the verification link.</p>
      </div>
    );
  }

  // status === "pending" — landed here without a token
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-5">
        <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold mb-2">Check your email</h1>
      <p className="text-sm text-muted mb-6 leading-relaxed">
        We sent a verification link to your email.
        <br />
        Click it to activate your account.
      </p>
      <button
        onClick={handleResend}
        className="border border-border text-foreground px-5 py-2.5 rounded-lg text-sm hover:bg-surface transition-colors"
      >
        Resend email
      </button>
    </div>
  );
}
