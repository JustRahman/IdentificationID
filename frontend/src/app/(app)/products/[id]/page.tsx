"use client";

import { useEffect, useState, type FormEvent, use } from "react";
import { api } from "@/services/api";
import type { Product, ProductTranslation } from "@/types";

interface DocumentInfo {
  id: string;
  product_id: string;
  doc_type: string;
  title: string | null;
  current_version_id: string | null;
  file_url: string | null;
  file_name: string | null;
}

interface ImageInfo {
  id: string;
  url: string;
  display_order: number;
  alt_text: string | null;
}

const tabItems = ["Details", "Images", "Description", "Documents", "Publish"];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "ru", label: "Russian" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "es", label: "Spanish" },
  { code: "ar", label: "Arabic" },
  { code: "ko", label: "Korean" },
  { code: "ja", label: "Japanese" },
];

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

  async function translateText(text: string, fromLang: string): Promise<string> {
    // MyMemory free limit is 500 chars per request — chunk if needed
    const MAX = 480;
    if (text.length <= MAX) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|en`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.responseData?.translatedText) throw new Error(`No translation returned (status ${data.responseStatus})`);
      return data.responseData.translatedText as string;
    }

    // Split into sentences, group into chunks under MAX chars
    const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) ?? [text];
    const chunks: string[] = [];
    let current = "";
    for (const s of sentences) {
      if ((current + s).length > MAX) {
        if (current) chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    const translated = await Promise.all(
      chunks.map(async (chunk) => {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${fromLang}|en`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!data.responseData?.translatedText) throw new Error(`No translation (status ${data.responseStatus})`);
        return data.responseData.translatedText as string;
      })
    );
    return translated.join(" ");
  }

  async function autoTranslate() {
    const src = getLang(activeLang);
    if (!src.short && !src.full && !src.usage) {
      setError("Nothing to translate — fill in the current language fields first.");
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
      if (src.short) enFields.short = await translateText(src.short, activeLang);
      if (src.full) enFields.full = await translateText(src.full, activeLang);
      if (src.usage) enFields.usage = await translateText(src.usage, activeLang);

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
      setMessage("Product published successfully!");
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      const details = (err as { error?: { details?: { errors?: string[] } } })?.error?.details?.errors;
      setError(details ? details.join(", ") : msg || "Publish failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading...</p>;
  if (!product) return <p className="text-sm text-red-600">Product not found.</p>;

  const currentDesc = getLang(activeLang);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{product.name}</h1>
          <p className="text-sm font-semibold text-foreground font-mono">{product.identification_id}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
          product.status === "published" ? "bg-green-50 text-green-700 border border-green-200"
          : product.status === "hidden" ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-gray-50 text-gray-600 border border-gray-200"
        }`}>
          {product.status}
        </span>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">{message}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabItems.map((tab) => (
          <button key={tab}
            onClick={() => { setActiveTab(tab); setMessage(""); setError(""); }}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              activeTab === tab ? "bg-accent text-white" : "text-muted border border-border hover:bg-surface"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-background border border-border rounded-xl p-6 max-w-lg">

        {/* Details */}
        {activeTab === "Details" && (
          <form onSubmit={saveDetails} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background">
                <option value="electronics">Electronics</option>
                <option value="home_appliances">Home Appliances</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input value={model} onChange={(e) => setModel(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country of Origin</label>
              <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2} placeholder="US"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background" />
            </div>
            <button type="submit" disabled={saving}
              className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50">
              {saving ? "Saving..." : "Save Details"}
            </button>
          </form>
        )}

        {/* Images */}
        {activeTab === "Images" && (
          <div className="space-y-4">
            <p className="text-xs text-muted">Up to 5 images (JPEG, PNG, WebP). First image is the cover.</p>
            {images.length < 5 && (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:bg-surface transition-colors">
                <svg className="w-8 h-8 text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <span className="text-sm text-muted">{saving ? "Uploading..." : "Click to upload image"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={saving}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
              </label>
            )}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border bg-surface" style={{aspectRatio:"1"}}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt_text || `Image ${i + 1}`} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 text-xs bg-accent text-white px-1.5 py-0.5 rounded">Cover</span>
                    )}
                    <button onClick={() => deleteImage(img.id)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full text-xs items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length === 0 && <p className="text-sm text-muted">No images yet.</p>}
          </div>
        )}

        {/* Description */}
        {activeTab === "Description" && (
          <form onSubmit={saveTranslation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map((l) => {
                  const hasContent = !!(descFields[l.code]?.short || descFields[l.code]?.full);
                  return (
                    <button key={l.code} type="button" onClick={() => setActiveLang(l.code)}
                      className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                        activeLang === l.code ? "bg-accent text-white border-accent"
                        : hasContent ? "border-green-300 text-green-700 bg-green-50"
                        : "border-border text-muted hover:bg-surface"
                      }`}>
                      {l.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted mt-1.5">Green = has content. Write in any language, then auto-translate to English.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <textarea value={currentDesc.short}
                onChange={(e) => setLangField(activeLang, "short", e.target.value)}
                rows={2} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Description</label>
              <textarea value={currentDesc.full}
                onChange={(e) => setLangField(activeLang, "full", e.target.value)}
                rows={5} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usage Instructions</label>
              <textarea value={currentDesc.usage}
                onChange={(e) => setLangField(activeLang, "usage", e.target.value)}
                rows={4} className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background" />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button type="submit" disabled={saving}
                className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50">
                {saving ? "Saving..." : `Save ${LANGUAGES.find(l => l.code === activeLang)?.label}`}
              </button>
              {activeLang !== "en" && (
                <button type="button" onClick={autoTranslate} disabled={translating}
                  className="border border-border text-foreground px-5 py-2.5 rounded-lg text-sm hover:bg-surface disabled:opacity-50">
                  {translating ? "Translating..." : "Auto-translate → English"}
                </button>
              )}
            </div>
          </form>
        )}

        {/* Documents */}
        {activeTab === "Documents" && (
          <div className="space-y-4">
            <p className="text-xs text-muted">Upload PDF documents (manual, warranty, certificate).</p>
            <div>
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <select value={docType} onChange={(e) => setDocType(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background">
                <option value="manual">Manual</option>
                <option value="warranty">Warranty</option>
                <option value="certificate">Certificate</option>
                <option value="other">Other</option>
              </select>
            </div>
            <input type="file" accept="application/pdf"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadDocument(f); }}
              className="text-sm" />
            {documents.length > 0 ? (
              <div className="space-y-2 mt-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3 border border-border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{doc.title || doc.doc_type}</p>
                      <p className="text-xs text-muted">{doc.file_name || doc.doc_type}</p>
                    </div>
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-accent text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 shrink-0"
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
              <p className="text-sm text-muted mt-4">No documents uploaded yet.</p>
            )}
          </div>
        )}

        {/* Publish */}
        {activeTab === "Publish" && (
          <div className="space-y-4">
            <p className="text-sm">Publishing makes your product publicly visible. Requirements:</p>
            <ul className="text-sm text-muted list-disc list-inside space-y-1">
              <li>Company must be verified</li>
              <li>Product name is filled</li>
              <li>English description is added</li>
              <li>At least one manual document is uploaded</li>
            </ul>
            {product.status === "published" ? (
              <p className="text-sm text-green-600 font-medium">This product is already published.</p>
            ) : (
              <button onClick={publishProduct} disabled={saving}
                className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50">
                {saving ? "Publishing..." : "Publish Product"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
