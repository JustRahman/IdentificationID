"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/services/api";
import type { Company } from "@/types";

const inputClass = "w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background";

/** Create or update the company profile (used in onboarding and settings). */
export function CompanyProfileForm({
  company,
  onSaved,
  submitLabel,
}: {
  company: Company | null;
  onSaved: (company: Company) => void;
  submitLabel?: string;
}) {
  const [legalName, setLegalName] = useState(company?.legal_name || "");
  const [displayName, setDisplayName] = useState(company?.display_name || "");
  const [countryCode, setCountryCode] = useState(company?.country_code || "");
  const [website, setWebsite] = useState(company?.website || "");
  const [supportEmail, setSupportEmail] = useState(company?.support_email || "");
  const [contactPhone, setContactPhone] = useState(company?.contact_phone || "");
  const [brands, setBrands] = useState((company?.brands || []).join(", "));
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || "");
  const [description, setDescription] = useState(company?.description || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body = {
      legal_name: legalName,
      display_name: displayName,
      country_code: countryCode,
      website: website || null,
      support_email: supportEmail || null,
      contact_phone: contactPhone || null,
      brands: brands.split(",").map((b) => b.trim()).filter(Boolean),
      logo_url: logoUrl || null,
      description: description || null,
    };

    try {
      const saved = company
        ? await api.put<Company>("/manufacturer/company", body)
        : await api.post<Company>("/manufacturer/company", body);
      onSaved(saved);
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">
          Legal Name <span className="text-red-500">*</span>
        </label>
        <input type="text" value={legalName} onChange={(e) => setLegalName(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Display Name <span className="text-red-500">*</span>
        </label>
        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Country Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0, 2))}
          required
          maxLength={2}
          placeholder="US"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Website URL</label>
        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" className={inputClass} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Contact Email</label>
          <input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Phone</label>
          <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} maxLength={50} className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Brands</label>
        <input
          type="text"
          value={brands}
          onChange={(e) => setBrands(e.target.value)}
          placeholder="Brand One, Brand Two"
          className={inputClass}
        />
        <p className="text-xs text-muted mt-1">Separate multiple brands with commas.</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Logo URL</label>
        <div className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo preview" className="w-10 h-10 rounded-lg object-contain border border-border bg-white shrink-0" />
          )}
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://…/logo.png"
            className={inputClass}
          />
        </div>
        <p className="text-xs text-muted mt-1">Shown on your public profile and product pages.</p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Manufacturer Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="A short description of your company, shown to consumers."
          className={inputClass}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel || (company ? "Save Changes" : "Create Company")}
        </button>
      </div>
    </form>
  );
}
