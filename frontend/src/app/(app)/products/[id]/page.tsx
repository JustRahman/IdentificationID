"use client";

import { useEffect, useState, type FormEvent, use } from "react";
import { api } from "@/services/api";
import type { Product, ProductTranslation } from "@/types";
import { CATEGORIES, REGULATED_CATEGORIES, REGULATED_NOTICE, LANGUAGES } from "@/lib/constants";
import { translateText } from "@/lib/translate";
import { buttonClasses } from "@/components/ui";
import { AppIcon, Notice, PageHeader, StatusPill, inputClass, labelClass, textareaClass } from "@/components/app";

interface DocumentInfo {
  id: string;
  product_id: string;
  doc_type: string;
  title: string | null;
  current_version_id: string | null;
  file_url: string | null;
  file_name: string | null;
  size_bytes: number | null;
  created_at: string | null;
}

interface ImageInfo {
  id: string;
  url: string;
  display_order: number;
  alt_text: string | null;
}

const tabItems = ["Details", "Images", "Description", "Documents", "Publish"];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function authHeader() {
  return { Authorization: `Bearer ${localStorage.getItem("access_token")}` };
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [translations, setTranslations] = useState<ProductTranslation[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [activeTab, setActiveTab] = useState("Details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Details
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [country, setCountry] = useState("");

  // Description: per-language state
  const [activeLang, setActiveLang] = useState("en");
  const [translating, setTranslating] = useState(false);
  const [descFields, setDescFields] = useState<
    Record<string, { short: string; full: string; usage: string }>
  >({});

  // Documents
  const [docType, setDocType] = useState("manual");

  useEffect(() => {
    async function load() {
      try {
        const [p, t, d, imgs] = await Promise.all([
          api.get<Product>(`/manufacturer/products/${id}`),
          api.get<ProductTranslation[]>(`/manufacturer/products/${id}/translations`),
          api.get<DocumentInfo[]>(`/manufacturer/products/${id}/documents`),
          api.get<ImageInfo[]>(`/manufacturer/products/${id}/images`),
        ]);
        setProduct(p);
        setName(p.name);
        setCategory(p.category);
        setBrand(p.brand || "");
        setModel(p.model || "");
        setCountry(p.country_of_origin || "");
        setTranslations(t);

        const fields: Record<string, { short: string; full: string; usage: string }> = {};
        for (const tr of t) {
          fields[tr.lang] = {
            short: tr.short_description || "",
            full: tr.full_description || "",
            usage: tr.usage_instructions || "",
          };
        }
        setDescFields(fields);
        setDocuments(d);
        setImages(imgs);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function getLang(lang: string) {
    return descFields[lang] || { short: "", full: "", usage: "" };
  }

  function setLangField(lang: string, field: "short" | "full" | "usage", value: string) {
    setDescFields((prev) => ({
      ...prev,
      [lang]: { ...getLang(lang), [field]: value },
    }));
  }

  async function autoTranslate() {
    const src = getLang(activeLang);
    if (!src.short && !src.full && !src.usage) {
      setError("Nothing to translate - fill in the current language fields first.");
      return;
    }
    setTranslating(true);
    setError("");
    try {
      // Save the source language first so it's not lost on reload
      await api.post(`/manufacturer/products/${id}/translations`, {
        lang: activeLang,
        short_description: src.short || null,
        full_description: src.full || null,
        usage_instructions: src.usage || null,
      });

      // Translate each field separately
      const enFields = { ...getLang("en") };
      if (src.short) enFields.short = await translateText(src.short, activeLang, "en");
      if (src.full) enFields.full = await translateText(src.full, activeLang, "en");
      if (src.usage) enFields.usage = await translateText(src.usage, activeLang, "en");

      // Save English translation too
      await api.post(`/manufacturer/products/${id}/translations`, {
        lang: "en",
        short_description: enFields.short || null,
        full_description: enFields.full || null,
        usage_instructions: enFields.usage || null,
      });

      setDescFields((prev) => ({ ...prev, en: enFields }));
      setActiveLang("en");
      setMessage("Translated and saved both languages.");
    } catch {
      setError("Auto-translate failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  }

  async function saveDetails(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await api.put<Product>(`/manufacturer/products/${id}`, {
        name, category,
        brand: brand || null,
        model: model || null,
        country_of_origin: country || null,
      });
      setProduct(updated);
      setMessage("Product details saved.");
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveTranslation(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const fields = getLang(activeLang);
      await api.post(`/manufacturer/products/${id}/translations`, {
        lang: activeLang,
        short_description: fields.short || null,
        full_description: fields.full || null,
        usage_instructions: fields.usage || null,
      });
      setMessage(`${LANGUAGES.find((l) => l.code === activeLang)?.label} description saved.`);
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file: File) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/manufacturer/products/${id}/images`, {
        method: "POST",
        headers: authHeader(),
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw err;
      }
      const imgs = await api.get<ImageInfo[]>(`/manufacturer/products/${id}/images`);
      setImages(imgs);
      setMessage("Image uploaded.");
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteImage(imageId: string) {
    try {
      await api.delete(`/manufacturer/images/${imageId}`);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setError("Failed to delete image");
    }
  }

  async function uploadDocument(file: File) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("doc_type", docType);
      const res = await fetch(`${API_BASE}/manufacturer/products/${id}/documents`, {
        method: "POST",
        headers: authHeader(),
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw err;
      }
      const d = await api.get<DocumentInfo[]>(`/manufacturer/products/${id}/documents`);
      setDocuments(d);
      setMessage("Document uploaded.");
    } catch (err: unknown) {
      setError((err as { error?: { message?: string } })?.error?.message || "Upload failed");
    } finally {
      setSaving(false);
    }
  }

  async function publishProduct() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await api.post<Product>(`/manufacturer/products/${id}/publish`);
      setProduct(updated);
      setMessage(
        updated.status === "pending_review"
          ? "Submitted for review. Products in regulated categories are published after our team reviews them."
          : "Product published successfully!"
      );
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      const details = (err as { error?: { details?: { errors?: string[] } } })?.error?.details?.errors;
      setError(details ? details.join(", ") : msg || "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  function copyId() {
    if (!product) return;
    navigator.clipboard.writeText(product.identification_id).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>;
  if (!product) return <p className="text-sm text-red-600">Product not found.</p>;

  const currentDesc = getLang(activeLang);
  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${product.identification_id}`
    : `https://identificationid.com/p/${product.identification_id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(publicUrl)}`;

  // Product completion - motivates finishing the listing before publishing.
  const completionSteps = [
    { label: "Details", done: !!(name && category) },
    { label: "Image", done: images.length > 0 },
    { label: "Description", done: !!(descFields["en"]?.short || descFields["en"]?.full) },
    { label: "Document", done: documents.length > 0 },
    { label: "Published", done: product.status === "published" },
  ];
  const doneCount = completionSteps.filter((s) => s.done).length;
  const completionPct = Math.round((doneCount / completionSteps.length) * 100);

  return (
    <div>
      <PageHeader
        back={{ href: "/products", label: "Products" }}
        title={product.name}
        meta={
          <>
            <span className="inline-flex items-center gap-2 h-8 rounded-lg border border-slate-200 bg-white pl-3 pr-1 shadow-xs">
              <span className="text-xs text-slate-500">Identification ID</span>
              <span className="text-sm font-semibold font-mono tabular-nums text-slate-900" data-no-i18n>{product.identification_id}</span>
              <button
                onClick={copyId}
                className="text-xs h-6 px-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {copied ? "Copied" : "Copy ID"}
              </button>
            </span>
            <StatusPill status={product.status} />
          </>
        }
        actions={
          <a
            href={`/p/${product.identification_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("secondary", "md")}
          >
            Open Public Page <AppIcon name="external" />
          </a>
        }
      />

      {message && <Notice tone="success" className="mb-4">{message}</Notice>}
      {error && <Notice tone="error" className="mb-4">{error}</Notice>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] items-start">
      <div className="min-w-0">
      <div className="flex gap-6 mb-5 border-b border-slate-200 overflow-x-auto" role="tablist">
        {tabItems.map((tab) => (
          <button key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => { setActiveTab(tab); setMessage(""); setError(""); }}
            className={`-mb-px pb-3 pt-1 text-sm whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab ? "border-accent text-slate-900 font-medium" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7">

        {/* Details */}
        {activeTab === "Details" && (
          <form onSubmit={saveDetails} className="space-y-5">
            <div>
              <label className={labelClass}>Product Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className={inputClass}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {REGULATED_CATEGORIES.has(category) && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
                {REGULATED_NOTICE} Products in this category are reviewed by our team before they are published.
              </p>
            )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Brand</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Model</label>
                <input value={model} onChange={(e) => setModel(e.target.value)}
                  className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Country of Origin</label>
              <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2} placeholder="US"
                className={inputClass} />
            </div>
            <button type="submit" disabled={saving}
              className={buttonClasses("primary", "md")}>
              {saving ? "Saving..." : "Save Details"}
            </button>

            {/* QR Code */}
            <div className="pt-5 border-t border-slate-100 mt-2">
              <p className="text-sm font-semibold text-slate-900 mb-1">Product QR Code</p>
              <p className="text-xs text-slate-500 mb-3">Print on packaging so customers can scan to access this product page.</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="QR Code"
                width={160}
                height={160}
                className="border border-slate-200 rounded-xl p-2 bg-white"
              />
              <p className="text-xs font-mono tabular-nums font-medium text-slate-600 mt-2" data-no-i18n>{product.identification_id}</p>
            </div>
          </form>
        )}

        {/* Images */}
        {activeTab === "Images" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Up to 5 images (JPEG, PNG, WebP). First image is the cover.</p>
            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl p-8 cursor-pointer bg-slate-50/60 hover:bg-slate-50 hover:border-slate-400 transition-colors">
                <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <span className="text-sm text-slate-500">{saving ? "Uploading..." : "Click to upload image"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={saving}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
              </label>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50" style={{aspectRatio:"1"}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt_text || `Image ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 text-[11px] font-medium bg-white/95 text-slate-800 ring-1 ring-slate-200 px-1.5 py-0.5 rounded-md">Cover</span>
                    )}
                    <button onClick={() => deleteImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/95 text-slate-700 ring-1 ring-slate-200 shadow-sm hover:text-red-600 rounded-full text-sm items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length === 0 && <p className="text-sm text-slate-500">No images yet.</p>}
          </div>
        )}

        {/* Description */}
        {activeTab === "Description" && (
          <form onSubmit={saveTranslation} className="space-y-4">
            <div>
              <label className={labelClass}>Language</label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((l) => {
                  const hasContent = !!(descFields[l.code]?.short || descFields[l.code]?.full);
                  return (
                    <button key={l.code} type="button" onClick={() => setActiveLang(l.code)}
                      className={`h-7 px-2.5 rounded-md text-xs border transition-colors ${
                        activeLang === l.code ? "bg-slate-900 text-white border-slate-900"
                        : hasContent ? "border-emerald-200 text-emerald-800 bg-emerald-50"
                        : "border-slate-200 text-slate-600 bg-white hover:bg-slate-50"
                      }`}>
                      {l.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Green = has content. Write in any language, then auto-translate to English.</p>
            </div>

            <div>
              <label className={labelClass}>Short Description</label>
              <textarea value={currentDesc.short}
                onChange={(e) => setLangField(activeLang, "short", e.target.value)}
                rows={2} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Full Description</label>
              <textarea value={currentDesc.full}
                onChange={(e) => setLangField(activeLang, "full", e.target.value)}
                rows={5} className={textareaClass} />
            </div>
            <div>
              <label className={labelClass}>Usage Instructions</label>
              <textarea value={currentDesc.usage}
                onChange={(e) => setLangField(activeLang, "usage", e.target.value)}
                rows={4} className={textareaClass} />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button type="submit" disabled={saving}
                className={buttonClasses("primary", "md")}>
                {saving ? "Saving..." : `Save ${LANGUAGES.find(l => l.code === activeLang)?.label}`}
              </button>
              {activeLang !== "en" && (
                <button type="button" onClick={autoTranslate} disabled={translating}
                  className={buttonClasses("secondary", "md")}>
                  {translating ? "Translating..." : "Auto-translate → English"}
                </button>
              )}
            </div>
          </form>
        )}

        {/* Documents */}
        {activeTab === "Documents" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Upload PDF documents (manual, warranty, certificate).</p>
            <div>
              <label className={labelClass}>Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)}
                className={inputClass}>
                <option value="manual">Manual</option>
                <option value="warranty">Warranty</option>
                <option value="certificate">Certificate</option>
                <option value="other">Other</option>
              </select>
            </div>
            <input type="file" accept="application/pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDocument(f); }}
              className="block w-full text-sm text-slate-600 file:mr-3 file:h-9 file:px-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:text-sm file:font-medium file:text-slate-900 hover:file:bg-slate-50" />
            {documents.length > 0 ? (
              <div className="space-y-2 mt-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{doc.title || doc.doc_type}</p>
                      <p className="text-xs text-slate-500">{doc.file_name || doc.doc_type}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-slate-500">
                        <span className="uppercase tracking-wide">{doc.doc_type}</span>
                        {doc.size_bytes != null && <span>{(doc.size_bytes / 1024).toFixed(0)} KB</span>}
                        {doc.created_at && <span>{new Date(doc.created_at).toLocaleDateString()}</span>}
                        <span className="text-slate-500">PDF</span>
                      </div>
                    </div>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonClasses("secondary", "sm", "shrink-0")}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-4">No documents uploaded yet.</p>
            )}
          </div>
        )}

        {/* Publish */}
        {activeTab === "Publish" && (
          <div className="space-y-4">
            <p className="text-sm text-slate-700">Publishing makes your product publicly visible. Requirements:</p>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1.5">
              <li>Product name is filled</li>
              <li>English description is added</li>
              <li>At least one manual document is uploaded</li>
            </ul>
            {product.status === "published" ? (
              <Notice tone="success">This product is already published.</Notice>
            ) : product.status === "pending_review" ? (
              <p className="text-sm text-amber-700 font-medium">
                Waiting for review. {REGULATED_NOTICE} We&apos;ll publish it once our team has reviewed it.
              </p>
            ) : (
              <button onClick={publishProduct} disabled={saving}
                className={buttonClasses("primary", "md")}>
                {saving ? "Publishing..." : "Publish Product"}
              </button>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Completion progress */}
      <aside className="bg-white border border-slate-200 rounded-2xl p-5 lg:sticky lg:top-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-900">Product completion</p>
          <span className={`text-xs font-semibold tabular-nums ${completionPct === 100 ? "text-emerald-700" : "text-slate-600"}`}>
            {doneCount} of {completionSteps.length} · {completionPct}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
          <div
            className={`h-1.5 rounded-full transition-all ${completionPct === 100 ? "bg-emerald-500" : "bg-accent"}`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <ul className="divide-y divide-slate-100">
          {completionSteps.map((s) => (
            <li key={s.label} className="flex items-center gap-2.5 py-2 text-sm">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  s.done ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" : "ring-1 ring-slate-200 text-transparent"
                }`}
                aria-hidden="true"
              >
                <AppIcon name="check" className="w-3 h-3" />
              </span>
              <span className={s.done ? "text-slate-900" : "text-slate-500"}>{s.label}</span>
              <span className="sr-only">{s.done ? "done" : "not done"}</span>
            </li>
          ))}
        </ul>
      </aside>
      </div>
    </div>
  );
}
