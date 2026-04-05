"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import type { Product } from "@/types";

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
      <h1 className="text-xl font-semibold mb-6">New Product</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4 max-w-lg">
          {error}
        </div>
      )}

      <div className="bg-background border border-border rounded-xl p-6 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
              placeholder="e.g. Smart Thermostat X1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
            >
              <option value="">Select category</option>
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
              placeholder="US"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
