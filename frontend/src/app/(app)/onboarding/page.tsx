"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/services/api";
import { CompanyProfileForm } from "@/components/CompanyProfileForm";
import { ManufacturerProfileView } from "@/components/ManufacturerProfileView";
import { REGISTRY_MEMBERSHIP } from "@/lib/constants";
import { useMembership } from "@/lib/membership";
import { AgreementCheckbox, acceptAgreement } from "@/components/AgreementCheckbox";
import type { Company, ManufacturerProfile } from "@/types";
import { Badge, buttonClasses } from "@/components/ui";
import { AppIcon, Notice } from "@/components/app";

type Step = "profile" | "preview" | "activate";
type Billing = "annual" | "monthly" | "founding";
type Founding = { open: boolean; free_until: string; spots_left: number | null; limit: number | null };

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
  const [agreed, setAgreed] = useState(false);
  const [personName, setPersonName] = useState("");
  const [error, setError] = useState("");
  const [founding, setFounding] = useState<Founding | null>(null);

  // Founding Manufacturers Program: offer it first while spots are left.
  useEffect(() => {
    api
      .get<{ success: boolean; data: Founding }>("/billing/founding")
      .then((res) => {
        setFounding(res.data);
        if (res.data.open) setBilling("founding");
      })
      .catch(() => setFounding(null));
  }, []);

  // Already an active member - nothing to onboard.
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
    if (!agreed || personName.trim().length < 2) return;
    setPaying(true);
    setError("");
    try {
      if (billing === "founding") {
        await acceptAgreement({ authorizedPersonName: personName, billingPeriod: null });
        await api.post("/billing/registry/founding", {});
        await refresh();
        router.push("/dashboard?registry=active");
        return;
      }
      await acceptAgreement({ authorizedPersonName: personName, billingPeriod: billing });
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

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;

  const monthly = REGISTRY_MEMBERSHIP.priceCents / 100;
  const annual = REGISTRY_MEMBERSHIP.annualPriceCents / 100;
  const savings = monthly * 12 - annual;

  const currentIdx = STEPS.findIndex((x) => x.key === step);

  return (
    <div>
      {/* Stepper */}
      <nav aria-label="Onboarding progress" className="mb-10">
        <p className="text-xs font-medium text-slate-500 mb-3 sm:hidden">
          Step {currentIdx + 1} of {STEPS.length}
        </p>
        <ol className="grid grid-cols-3 gap-2 sm:gap-3">
          {STEPS.map((s, i) => {
            const done = i < currentIdx;
            const current = i === currentIdx;
            return (
              <li key={s.key} aria-current={current ? "step" : undefined}>
                <div className={`h-1 rounded-full mb-3 ${done || current ? "bg-accent" : "bg-slate-200"}`} />
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      done
                        ? "bg-accent text-white"
                        : current
                        ? "bg-white text-accent ring-2 ring-accent"
                        : "bg-white ring-1 ring-slate-300 text-slate-500"
                    }`}
                  >
                    {done ? <AppIcon name="check" className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className={`text-sm truncate ${current ? "font-medium text-slate-900" : done ? "text-slate-700" : "text-slate-500"}`}>
                    {s.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {error && <Notice tone="error" className="mb-5">{error}</Notice>}

      {step === "profile" && (
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1.5">Tell us about your company</h1>
          <p className="text-sm text-slate-500 mb-7">
            This becomes your public manufacturer profile. You can change it later.
          </p>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7">
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
          <div className="flex items-start justify-between gap-4 mb-7 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1.5">Preview your public profile</h1>
              <p className="text-sm text-slate-500">
                This is how your manufacturer profile will look once your membership is active.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep("profile")}
                className={buttonClasses("secondary", "md")}
              >
                Edit profile
              </button>
              <button
                onClick={() => setStep("activate")}
                className={buttonClasses("primary", "md")}
              >
                Looks good - continue
              </button>
            </div>
          </div>
          {preview ? (
            <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden">
              <div className="flex items-center gap-2 px-4 h-10 border-b border-slate-200 bg-slate-50">
                <Badge tone="pending" dot size="xs">Preview</Badge>
                <span className="text-xs text-slate-500">Not public yet</span>
              </div>
              <div className="p-5 sm:p-8">
                <ManufacturerProfileView data={preview} preview />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Loading preview...</p>
          )}
        </div>
      )}

      {step === "activate" && (
        <div className="max-w-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1.5">{REGISTRY_MEMBERSHIP.en.name}</h1>
          <p className="text-sm text-slate-500 mb-7 leading-relaxed">
            Activates your permanent Manufacturer ID and public profile. Your first 3 Product
            IDs are included at no additional cost.
          </p>

          {founding?.open && (
            <button
              type="button"
              onClick={() => setBilling("founding")}
              aria-pressed={billing === "founding"}
              className={`w-full text-left rounded-2xl p-6 border mb-4 transition-colors ${
                billing === "founding"
                  ? "border-accent ring-1 ring-accent bg-blue-50/40 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.18)]"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <span className="flex items-center gap-2.5 text-sm font-semibold text-slate-900">
                  <Radio on={billing === "founding"} /> Free registration
                </span>
                <Badge tone="info" size="xs">
                  {founding.spots_left != null ? `${founding.spots_left} spots left` : "Until July 1, 2027"}
                </Badge>
              </div>
              <p className="mt-3">
                <span className="text-4xl font-semibold tracking-tight text-slate-900">$0</span>
                <span className="text-sm text-slate-500 ml-1.5">until July 1, 2027</span>
              </p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Manufacturer ID + 3 products. No card needed and no automatic charge. You stay in the registry permanently; after July 1, 2027 you decide whether to keep an active membership.{" "}
                <a href="/founding-manufacturers" target="_blank" className="text-accent underline">Details</a>
              </p>
            </button>
          )}

          {founding?.open && (
            <p className="text-xs font-medium text-slate-500 mb-3 mt-6">Or choose a paid membership</p>
          )}

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
                aria-pressed={billing === o.key}
                className={`text-left rounded-2xl p-5 border bg-white transition-colors ${
                  billing === o.key ? "border-accent ring-1 ring-accent" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="flex items-center gap-2.5 text-sm font-medium text-slate-900">
                    <Radio on={billing === o.key} /> {o.key === "annual" ? "Yearly" : "Monthly"}
                  </span>
                  {o.badge && <Badge tone="neutral" size="xs">{o.badge}</Badge>}
                </div>
                <p className="mt-2">
                  <span className="text-2xl font-semibold tracking-tight text-slate-900">{o.price}</span>
                  <span className="text-sm text-slate-500 ml-1">{o.period}</span>
                </p>
                <p className={`text-xs mt-1 ${o.key === "annual" ? "text-slate-700 font-medium" : "text-slate-500"}`}>
                  {o.note}
                </p>
              </button>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6">
            <p className="text-sm font-semibold text-slate-900 mb-3">Included</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
              {REGISTRY_MEMBERSHIP.en.features.map((f) => (
                <li key={f} className="text-sm text-slate-700 flex items-start gap-2">
                  <AppIcon name="check" className="w-4 h-4 mt-0.5 text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100 leading-relaxed">
              Need more products? Popular, Best Value and Enterprise plans include this
              membership. The Standard plan ($3 per product) is billed in addition to it.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-5">
            <AgreementCheckbox
              checked={agreed}
              onChange={setAgreed}
              companyName={company?.legal_name || company?.display_name || ""}
              billingPeriod={billing === "founding" ? null : billing}
              personName={personName}
              onPersonNameChange={setPersonName}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setStep("preview")}
              className={buttonClasses("secondary", "lg")}
            >
              Back
            </button>
            <button
              onClick={activate}
              disabled={paying || !agreed || personName.trim().length < 2}
              className={buttonClasses("primary", "lg")}
            >
              {paying
                ? "Processing..."
                : billing === "founding"
                ? "Activate free registration"
                : `Continue to payment - ${billing === "annual" ? `$${annual}/year` : `$${monthly}/month`}`}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            {billing === "founding" ? "Free until July 1, 2027, no payment details collected. " : ""}
            Secure payment by Stripe. See our{" "}
            <a href="/legal/refund" target="_blank" className="text-accent hover:underline">Refund & Cancellation Policy</a>.
          </p>
        </div>
      )}
    </div>
  );
}

function Radio({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${on ? "ring-[5px] ring-inset ring-accent bg-white" : "ring-1 ring-inset ring-slate-300 bg-white"}`}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingInner />
    </Suspense>
  );
}
