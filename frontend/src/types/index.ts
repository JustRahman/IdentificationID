export type UserRole = "consumer" | "manufacturer" | "admin";
export type CompanyStatus = "pending" | "verified" | "rejected";
export type ProductStatus = "draft" | "published" | "hidden";
export type DocType = "manual" | "warranty" | "certificate" | "other";
export type SubscriptionStatus = "active" | "past_due" | "canceled";
export type PaymentStatus = "pending" | "succeeded" | "failed";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  email_verified_at: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  legal_name: string;
  display_name: string;
  country_code: string;
  website: string | null;
  support_email: string | null;
  logo_url: string | null;
  description: string | null;
  status: CompanyStatus;
  admin_note: string | null;
  verified_at: string | null;
}

export interface ProductImage {
  url: string;
  alt_text: string | null;
  display_order: number;
}

export interface Product {
  id: string;
  identification_id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  country_of_origin: string | null;
  status: ProductStatus;
  published_at: string | null;
  view_count?: number;
  images?: ProductImage[];
}

export interface ProductTranslation {
  id: string;
  product_id: string;
  lang: string;
  short_description: string | null;
  full_description: string | null;
  usage_instructions: string | null;
}

export interface ProductDocument {
  id: string;
  product_id: string;
  doc_type: DocType;
  title: string | null;
  current_version_id: string | null;
}

export interface ProductDocumentVersion {
  id: string;
  document_id: string;
  version: number;
  file_key: string;
  file_name: string;
  size_bytes: number;
  sha256: string;
  uploaded_by: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  company_id: string;
  status: SubscriptionStatus;
  paid_until: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
}

export interface Payment {
  id: string;
  company_id: string;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_intent_id: string;
}
