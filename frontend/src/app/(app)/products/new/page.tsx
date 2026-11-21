"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { Product } from "@/types";
import { CATEGORIES, REGULATED_CATEGORIES, REGULATED_NOTICE } from "@/lib/constants";
import { buttonClasses } from "@/components/ui";
import { FormError, PageHeader, helpClass, inputClass, labelClass } from "@/components/app";

export default function CreateProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const product = await api.post<Product>("/manufacturer/products", {
        name,
        category,
        brand: brand || null,
        model: model || null,
        country_of_origin: country || null,
      });
      router.push(`/products/${product.id}`);
    } catch (err: unknown) {
      const msg = (err as { error?: { message?: string } })?.error?.message;
      setError(msg || "Failed to create product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        back={{ href: "/products", label: "Products" }}
        title="New Product"
        description="Start with the basics. You can add photos, specifications and documents on the next screen."
      />

      {error && <FormError className="mb-4 max-w-xl">{error}</FormError>}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>
              Product Name <span className="text-red-600">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              placeholder="e.g. Smart Thermostat X1"
            />
          </div>
          <div>
            <label className={labelClass}>
              Category <span className="text-red-600">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select category</option>
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
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Model</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Country of Origin</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))}
              maxLength={2}
              placeholder="US"
              className={inputClass}
            />
            <p className={helpClass}>Two-letter country code, for example US, CA or DE.</p>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className={buttonClasses("primary", "md")}
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
