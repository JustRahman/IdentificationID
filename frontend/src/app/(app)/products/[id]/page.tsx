"use client";

import { useEffect, useState, type FormEvent, use } from "react";
import { api } from "@/services/api";
import type { Product, ProductTranslation } from "@/types";

interface DocumentInfo {
  id: string;
  doc_type: string;
  title: string | null;
  versions: { version: number; file_name: string; size_bytes: number }[];
}

const tabItems = ["Details", "Description", "Documents", "Publish"];

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [translations, setTranslations] = useState<ProductTranslation[]>([]);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [activeTab, setActiveTab] = useState("Details");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Details form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [country, setCountry] = useState("");

  // Translation form
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [usageInstr, setUsageInstr] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [p, t, d] = await Promise.all([
          api.get<Product>(`/manufacturer/products/${id}`),
          api.get<ProductTranslation[]>(`/manufacturer/products/${id}/translations`),
          api.get<DocumentInfo[]>(`/manufacturer/products/${id}/documents`),
        ]);
        setProduct(p);
        setName(p.name);
        setCategory(p.category);
        setBrand(p.brand || "");
        setModel(p.model || "");
        setCountry(p.country_of_origin || "");

        setTranslations(t);
        const en = t.find((tr) => tr.lang === "en");
        if (en) {
          setShortDesc(en.short_description || "");
          setFullDesc(en.full_description || "");
          setUsageInstr(en.usage_instructions || "");
        }

        setDocuments(d);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function saveDetails(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await api.put<Product>(`/manufacturer/products/${id}`, {
        name,
        category,
        brand: brand || null,
        model: model || null,
        country_of_origin: country || null,
      });
      setProduct(updated);
      setMessage("Product details saved.");
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Save failed");
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
      await api.post(`/manufacturer/products/${id}/translations`, {
        lang: "en",
        short_description: shortDesc || null,
        full_description: fullDesc || null,
        usage_instructions: usageInstr || null,
      });
      setMessage("Description saved.");
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function uploadDocument(file: File) {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.upload(`/manufacturer/products/${id}/documents`, file);
      const d = await api.get<DocumentInfo[]>(`/manufacturer/products/${id}/documents`);
      setDocuments(d);
      setMessage("Document uploaded.");
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Upload failed");
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{product.name}</h1>
          <p className="text-xs text-muted">{product.identification_id}</p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
            product.status === "published"
              ? "bg-green-50 text-green-700 border border-green-200"
              : product.status === "hidden"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-gray-50 text-gray-600 border border-gray-200"
          }`}
        >
          {product.status}
        </span>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3 mb-4">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {tabItems.map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setMessage(""); setError(""); }}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              activeTab === tab
                ? "bg-accent text-white"
                : "text-muted border border-border hover:bg-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-background border border-border rounded-xl p-6 max-w-lg">
        {activeTab === "Details" && (
          <form onSubmit={saveDetails} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
              >
                <option value="electronics">Electronics</option>
                <option value="home_appliances">Home Appliances</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country of Origin</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
                maxLength={2}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>
          </form>
        )}

        {activeTab === "Description" && (
          <form onSubmit={saveTranslation} className="space-y-4">
            <p className="text-xs text-muted mb-2">English description (required for publishing)</p>
            <div>
              <label className="block text-sm font-medium mb-1">Short Description</label>
              <textarea
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                rows={2}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Description</label>
              <textarea
                value={fullDesc}
                onChange={(e) => setFullDesc(e.target.value)}
                rows={5}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Usage Instructions</label>
              <textarea
                value={usageInstr}
                onChange={(e) => setUsageInstr(e.target.value)}
                rows={4}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Description"}
            </button>
          </form>
        )}

        {activeTab === "Documents" && (
          <div className="space-y-4">
            <p className="text-xs text-muted">Upload PDF documents (manual, warranty, certificate).</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadDocument(f);
              }}
              className="text-sm"
            />
            {documents.length > 0 ? (
              <div className="space-y-2 mt-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 border border-border rounded-lg"
                  >
                    <p className="text-sm font-medium">{doc.title || doc.doc_type}</p>
                    <p className="text-xs text-muted">
                      Type: {doc.doc_type} · {doc.versions.length} version(s)
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted mt-4">No documents uploaded yet.</p>
            )}
          </div>
        )}

        {activeTab === "Publish" && (
          <div className="space-y-4">
            <p className="text-sm">
              Publishing makes your product publicly visible. Requirements:
            </p>
            <ul className="text-sm text-muted list-disc list-inside space-y-1">
              <li>Company must be verified</li>
              <li>Product name is filled</li>
              <li>English description is added</li>
              <li>At least one manual document is uploaded</li>
            </ul>
            {product.status === "published" ? (
              <p className="text-sm text-green-600 font-medium">This product is already published.</p>
            ) : (
              <button
                onClick={publishProduct}
                disabled={saving}
                className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
              >
                {saving ? "Publishing..." : "Publish Product"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
