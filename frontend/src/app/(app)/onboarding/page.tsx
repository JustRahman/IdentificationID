"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";
import { ManufacturerProfileView } from "@/components/ManufacturerProfileView";
import { REGISTRY_MEMBERSHIP } from "@/lib/constants";
import { useMembership } from "@/lib/membership";
import type { Company, ManufacturerProfile } from "@/types";

type Step = "profile" | "preview" | "activate";
type Billing = "annual" | "monthly";

const STEPS: { key: Step; label: string }[] = [
  { key: "profile", label: "Company profile" },
  { key: "preview", label: "Preview" },
  { key: "activate", label: "Activate membership" },
];

function OnboardingInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh, registry } = useMembership();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("profile");
  const [preview, setPreview] = useState<ManufacturerProfile | null>(null);
  const [billing, setBilling] = useState<Billing>("annual");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  // Already an active member — nothing to onboard.
  useEffect(() => {
    if (registry?.active) router.replace("/dashboard");
  }, [registry, router]);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Company>("/manufacturer/company");
        setCompany(data);
        setStep(params.get("step") === "activate" ? "activate" : "preview");
      } catch {
        setStep("profile"); // no company yet
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== "preview") return;
    setPreview(null);
    api
      .get<{ success: boolean; data: ManufacturerProfile }>("/manufacturer/company/preview")
      .then((res) => setPreview(res.data))
      .catch(() => setError("Could not load the preview"));
  }, [step]);

  async function activate() {
    setPaying(true);
    setError("");
    try {
      const res = await api.post<{
        success: boolean;
        data: { checkout_url?: string; message?: string };
      }>("/billing/registry/checkout", { billing });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url; // Stripe Checkout
        return;
      }
      await refresh();
      router.push("/dashboard?registry=active");
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Could not start checkout");
      setPaying(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading...</p>;

  const monthly = REGISTRY_MEMBERSHIP.priceCents / 100;
  const annual = REGISTRY_MEMBERSHIP.annualPriceCents / 100;
  const savings = monthly * 12 - annual;

  return (
    <div>
      {/* Stepper */}
      <ol className="flex items-center gap-2 text-sm mb-8 flex-wrap">
        {STEPS.map((s, i) => {
          const current = STEPS.findIndex((x) => x.key === step);
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  i < current
                    ? "bg-green-600 text-white"
                    : i === current
                    ? "bg-accent text-white"
                    : "bg-background border border-border text-muted"
                }`}
              >
                {i < current ? "✓" : i + 1}
              </span>
              <span className={i === current ? "font-medium" : "text-muted"}>{s.label}</span>
              {i < STEPS.length - 1 && <span className="text-border mx-1">—</span>}
            </li>
          );
        })}
      </ol>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      {step === "profile" && (
        <div className="max-w-lg">
          <h1 className="text-xl font-semibold mb-1">Tell us about your company</h1>
          <p className="text-sm text-muted mb-6">
            This becomes your public manufacturer profile. You can change it later.
          </p>
          <div className="bg-background border border-border rounded-xl p-6">
            <CompanyProfileForm
              company={company}
              submitLabel="Continue to preview"
              onSaved={(c) => {
                setCompany(c);
                setStep("preview");
              }}
            />
          </div>
        </div>
      )}

      {step === "preview" && (
        <div>
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold mb-1">Preview your public profile</h1>
              <p className="text-sm text-muted">
                This is how your manufacturer profile will look once your membership is active.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("profile")}
                className="border border-border px-4 py-2 rounded-lg text-sm hover:bg-background"
              >
                Edit profile
              </button>
              <button
                onClick={() => setStep("activate")}
                className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-hover"
              >
                Looks good — continue
              </button>
            </div>
          </div>
          {preview ? (
            <div className="relative">
              <span className="absolute -top-3 right-4 z-10 text-[11px] font-semibold uppercase tracking-wide bg-amber-500 text-white px-2 py-0.5 rounded">
                Preview
              </span>
              <ManufacturerProfileView data={preview} preview />
            </div>
          ) : (
            <p className="text-sm text-muted">Loading preview...</p>
          )}
        </div>
      )}

      {step === "activate" && (
        <div className="max-w-2xl">
          <h1 className="text-xl font-semibold mb-1">{REGISTRY_MEMBERSHIP.en.name}</h1>
          <p className="text-sm text-muted mb-6">
            Activates your permanent Manufacturer ID and public profile. Your first 3 Product
            IDs are included at no additional cost.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {(
              [
                { key: "annual", price: `$${annual}`, period: "/ year", badge: "Recommended", note: `Save $${savings}` },
                { key: "monthly", price: `$${monthly}`, period: "/ month", badge: null, note: "Cancel anytime" },
              ] as const
            ).map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setBilling(o.key)}
                className={`text-left rounded-xl p-5 border-2 bg-background transition-colors ${
                  billing === o.key ? "border-accent" : "border-border hover:border-muted"
                }`}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-sm font-medium">{o.key === "annual" ? "Yearly" : "Monthly"}</span>
                  {o.badge && (
                    <span className="text-[11px] font-semibold bg-accent text-white px-2 py-0.5 rounded">
                      {o.badge}
                    </span>
                  )}
                </div>
                <p>
                  <span className="text-3xl font-semibold">{o.price}</span>
                  <span className="text-sm text-muted ml-1">{o.period}</span>
                </p>
                <p className={`text-xs mt-1 ${o.key === "annual" ? "text-green-700 font-medium" : "text-muted"}`}>
                  {o.note}
                </p>
              </button>
            ))}
          </div>

          <div className="bg-background border border-border rounded-xl p-5 mb-6">
            <p className="text-sm font-medium mb-3">Included</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
              {REGISTRY_MEMBERSHIP.en.features.map((f) => (
                <li key={f} className="text-sm flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted mt-4 pt-3 border-t border-border">
              Need more products? Popular, Best Value and Enterprise plans include this
              membership. The Standard plan ($3 per product) is billed in addition to it.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setStep("preview")}
              className="border border-border px-4 py-2.5 rounded-lg text-sm hover:bg-background"
            >
              Back
            </button>
            <button
              onClick={activate}
              disabled={paying}
              className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
            >
              {paying
                ? "Processing..."
                : `Continue to payment — ${billing === "annual" ? `$${annual}/year` : `$${monthly}/month`}`}
            </button>
          </div>
          <p className="text-xs text-muted mt-3">
            Secure payment by Stripe. See our{" "}
            <a href="/refund" target="_blank" className="text-accent hover:underline">Refund Policy</a>.
          </p>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  );
}
