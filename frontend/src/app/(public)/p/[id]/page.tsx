"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ProductData {
  identification_id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  country_of_origin: string | null;
  published_at: string | null;
  company: {
    display_name: string;
    country_code: string;
    website: string | null;
    support_email: string | null;
  };
  translation: {
    lang: string;
    short_description: string | null;
    full_description: string | null;
    usage_instructions: string | null;
  } | null;
  documents: {
    id: string;
    doc_type: string;
    title: string | null;
    versions: { version: number; file_name: string; size_bytes: number; created_at: string }[];
  }[];
}

export default function PublicProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/public/products/${encodeURIComponent(id)}`);
        if (!res.ok) {
          setError("Product not found");
          return;
        }
        const json = await res.json();
        setProduct(json.data);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Product Not Found</h1>
        <p className="text-muted mb-6">{error || "No product with this ID."}</p>
        <Link href="/lookup" className="text-accent hover:underline text-sm">
          Try another lookup
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <p className="text-sm text-muted mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        {" / "}
        <Link href="/lookup" className="hover:underline">Lookup</Link>
        {" / "}
        {product.name}
      </p>

      <div className="bg-background border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
            <span className="text-xs bg-surface text-muted px-2 py-1 rounded border border-border">
              {product.category}
            </span>
          </div>
          <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
            Verified Manufacturer
          </span>
        </div>

        {product.translation?.short_description && (
          <p className="text-sm text-muted mb-6">{product.translation.short_description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-muted mb-4">Product Details</h3>
            {[
              { label: "Identification ID", value: product.identification_id },
              { label: "Brand", value: product.brand || "--" },
              { label: "Model", value: product.model || "--" },
              { label: "Country of Origin", value: product.country_of_origin || "--" },
              { label: "Published", value: product.published_at ? new Date(product.published_at).toLocaleDateString() : "--" },
            ].map((field) => (
              <div key={field.label} className="mb-3">
                <p className="text-xs text-muted">{field.label}</p>
                <p className="text-sm">{field.value}</p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-muted mb-4">Manufacturer</h3>
            {[
              { label: "Company", value: product.company.display_name },
              { label: "Country", value: product.company.country_code },
              { label: "Website", value: product.company.website || "--" },
              { label: "Support Email", value: product.company.support_email || "--" },
            ].map((field) => (
              <div key={field.label} className="mb-3">
                <p className="text-xs text-muted">{field.label}</p>
                <p className="text-sm">{field.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {product.translation?.full_description && (
        <div className="bg-background border border-border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-muted mb-4">Description</h3>
          <p className="text-sm whitespace-pre-line">{product.translation.full_description}</p>
        </div>
      )}

      {product.translation?.usage_instructions && (
        <div className="bg-background border border-border rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-muted mb-4">Usage Instructions</h3>
          <p className="text-sm whitespace-pre-line">{product.translation.usage_instructions}</p>
        </div>
      )}

      <div className="bg-background border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-muted mb-4">Documents</h3>
        {product.documents.length === 0 ? (
          <p className="text-sm text-muted">No documents available.</p>
        ) : (
          <div className="space-y-3">
            {product.documents.map((doc) => (
              <div key={doc.id} className="p-3 border border-border rounded-lg">
                <p className="text-sm font-medium">{doc.title || doc.doc_type}</p>
                <p className="text-xs text-muted">
                  Type: {doc.doc_type} · {doc.versions.length} version(s)
                  {doc.versions[0] && ` · ${(doc.versions[0].size_bytes / 1024).toFixed(0)} KB`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
