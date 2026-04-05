# Identification ID — MVP Blueprint

## What Are We Building?

A global SaaS platform where manufacturers register their products and receive a unique **Identification ID** (format: `IID-XXXX-XXXX`). Consumers can look up any product by entering its ID on the public portal and instantly access verified product info, manuals, and specs — no paper required.

**Core loop:**
1. Manufacturer registers → gets unique ID → prints it on packaging
2. Consumer sees ID on product → goes to site → enters ID → gets full product info

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python 3.12+) |
| Frontend | Next.js 14 + Tailwind CSS |
| Database | PostgreSQL (Supabase) |
| File Storage | Supabase Storage or AWS S3 |
| Auth | JWT + Google OAuth |
| Payments | Stripe |
| Deploy | Railway (backend) + Vercel (frontend) |
| Migrations | Alembic |

---

## Project Structure

```
identification-id/
  backend/
    app/
      api/
        auth/
        companies/
        products/
        documents/
        billing/
        public/
        admin/
      models/
      services/
      core/
    alembic/
    main.py
    requirements.txt

  frontend/
    src/
      app/
        (public)/
          page.tsx          — Landing
          lookup/           — Search by ID
          p/[id]/           — Public product page
          pricing/
        (auth)/
          login/
          register/
          verify/
        (app)/
          dashboard/
          company/
          products/
          billing/
        admin/
      components/
      services/
      lib/
    package.json
```

---

## User Roles

| Role | Description |
|---|---|
| **Public User** | Anyone — can search products by ID, no login required |
| **Manufacturer** | Registered company — creates products, uploads PDFs, manages account |
| **Admin** | Internal — verifies companies, moderates content, views payments |

---

## Pages & Screens

### Public (No Login Required)

#### 1. Landing Page `/`
**Purpose:** Convert visitors into registered manufacturers + allow quick product lookup

**Layout:**
- Top navbar: Logo left, links right (How it works, Pricing, Login, Register)
- Hero section:
  - Big headline: *"Digital Passport for Every Product"*
  - Subheadline: *"Replace paper manuals with a single Identification ID"*
  - Two CTA buttons: `Register as Manufacturer` | `Search Product by ID`
  - Quick search input field with search button
- How It Works section (3 steps with icons):
  1. Manufacturer registers product
  2. ID printed on packaging
  3. Consumer looks up ID online
- Benefits section — two columns: For Manufacturers / For Consumers
- Pricing preview — 3 plan cards
- Footer: Logo, links, contact email

**Design:**
- Dark theme: background `#0b1220`, cards `#111a2e`, accent `#4ea8ff`
- Clean, minimal, modern SaaS feel
- Mobile responsive

---

#### 2. Product Lookup `/lookup`
**Purpose:** Let anyone search for a product by its ID

**Layout:**
- Centered on page
- Large input field with placeholder: `Enter Identification ID (e.g. IID-4F9A-2K7Q)`
- Search button
- States:
  - **Loading:** spinner
  - **Found:** redirect to `/p/[identification_id]`
  - **Not Found:** message "No product found for this ID"
  - **Rate Limited:** message "Too many requests, try again later"

---

#### 3. Public Product Page `/p/[identification_id]`
**Purpose:** Display full verified product info to consumer

**Layout:**
- Breadcrumb: Home > Products > [Product Name]
- Product header:
  - Product name (large)
  - Category badge
  - `✓ Verified Manufacturer` badge (if company verified)
- Two column layout:
  - Left: Product details (name, brand, model, category, country of origin)
  - Right: Company info (display name, country, website)
- Translations section — show EN description and full description
- Documents section:
  - List of PDF manuals with type labels (Manual, Warranty, Certificate)
  - Download button for each
  - Version number shown
- Footer note: "Information provided by manufacturer"

---

#### 4. Pricing `/pricing`
**Layout:**
- 3 pricing cards:
  - **Free:** First 10 products free, basic features
  - **Starter $29/mo:** Up to 100 products
  - **Pro $99/mo:** Unlimited products + API access
- FAQ below cards
- CTA: `Start for Free`

---

### Auth Pages

#### 5. Register `/auth/register`
**Layout:**
- Centered card
- Fields: Email, Password, Confirm Password
- `Continue with Google` button (divider between)
- Link to Login
- After submit: redirect to email verification page

#### 6. Login `/auth/login`
**Layout:**
- Centered card
- Fields: Email, Password
- `Continue with Google` button
- Forgot password link
- Link to Register

#### 7. Email Verification `/auth/verify`
- Message: "Check your email and click the verification link"
- Resend button
- Blocks access to `/app/*` until verified

#### 8. Password Reset `/auth/reset`
- Step 1: Enter email → receive reset link
- Step 2: Enter new password via token link

---

### Manufacturer Dashboard (Login Required)

#### 9. Dashboard `/app`
**Layout:**
- Sidebar navigation (left):
  - Dashboard
  - Company Profile
  - Products
  - Billing
  - Support
- Main area — stat cards:
  - Company verification status (badge: Pending / Verified / Rejected)
  - Total products
  - Published products
  - Plan & paid_until date
- Recent products table (last 5)
- CTA button: `+ Create Product`
- If no company created → banner: "Complete your company profile first"

---

#### 10. Company Profile `/app/company`
**Layout:**
- Form fields:
  - Legal Name (required)
  - Display Name (required — shown publicly)
  - Country (dropdown)
  - Website URL
  - Support Email
- Status banner at top:
  - 🟡 Pending: "Your company is under review"
  - 🟢 Verified: "Your company is verified"
  - 🔴 Rejected: "[Admin note here]. Please update and resubmit."
- Submit for Verification button (disabled if already pending/verified)
- Save Changes button

---

#### 11. Products List `/app/products`
**Layout:**
- Header: "My Products" + `+ Create Product` button
- Filter tabs: All | Draft | Published | Hidden
- Table columns:
  - Product Name
  - Category
  - Identification ID (monospace font, copy button)
  - Status badge (Draft / Published / Hidden)
  - Updated date
  - Actions: Edit | View Public Page
- Empty state: "No products yet. Create your first product."

---

#### 12. Create / Edit Product `/app/products/new` and `/app/products/[id]`
**Layout — tabbed interface:**

**Tab 1: Details**
- Fields:
  - Product Name (required)
  - Category (dropdown: Electronics, Home Appliances, Medical, Other)
  - Brand
  - Model
  - Country of Origin (dropdown)
- Identification ID display (read-only, generated on create):
  - `IID-4F9A-2K7Q` with Copy button and QR download button
- Status selector: Draft / Published / Hidden
- Save button

**Tab 2: Description**
- Language: EN (only on MVP)
- Short Description (textarea, 160 chars max)
- Full Description (rich text or large textarea)
- Usage Instructions (textarea)
- Save button

**Tab 3: Documents**
- Upload area:
  - Drag & drop or click to upload
  - PDF only, max 20MB
  - Document type selector: Manual / Warranty / Certificate / Other
  - Title field (optional)
- Uploaded documents list:
  - File name, type, size, upload date, version number
  - Download button
  - Upload new version button
  - Delete button

**Tab 4: Publish**
- Checklist showing publish requirements:
  - ✅ / ❌ Company verified
  - ✅ / ❌ Product name filled
  - ✅ / ❌ EN description added
  - ✅ / ❌ At least 1 PDF manual uploaded
- `Publish Product` button (disabled until all requirements met)
- `Preview Public Page` link (opens in new tab)

---

#### 13. Billing `/app/billing`
**Layout:**
- Current plan card:
  - Plan name
  - Active until: [date]
  - Products used: X / Y
- Upgrade button → opens Stripe Checkout
- Payment history table:
  - Date, amount, status, invoice link

---

### Admin Panel

#### 14. Admin — Companies `/admin/companies`
- Filter: Pending | Verified | Rejected
- Table: Company name, owner email, country, submitted date, status
- Actions per row: Approve | Reject (with note input)

#### 15. Admin — Products `/admin/products`
- Table: Product name, company, status, published date
- Actions: Hide | Unpublish

#### 16. Admin — Payments `/admin/payments`
- Table: Company, amount, date, status, Stripe ID

---

## Database Schema

### users
| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| email | string | Unique |
| password_hash | string | Null if Google only |
| google_sub | string | Unique, nullable |
| role | enum | consumer, manufacturer, admin |
| is_active | bool | |
| email_verified_at | timestamp | Nullable |
| created_at | timestamp | |

### companies
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| owner_user_id | UUID | FK → users |
| legal_name | string | |
| display_name | string | Shown publicly |
| country_code | char(2) | |
| website | string | Nullable |
| support_email | string | Nullable |
| status | enum | pending, verified, rejected |
| admin_note | string | Nullable |
| verified_at | timestamp | Nullable |

### products
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| company_id | UUID | FK → companies |
| identification_id | string | Unique, immutable, IID-XXXX-XXXX |
| name | string | |
| category | string | |
| brand | string | Nullable |
| model | string | Nullable |
| country_of_origin | char(2) | Nullable |
| status | enum | draft, published, hidden |
| published_at | timestamp | Nullable |

### product_translations
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| product_id | UUID | FK → products |
| lang | string | e.g. "en" |
| short_description | text | Nullable |
| full_description | text | Nullable |
| usage_instructions | text | Nullable |
| Unique constraint | | (product_id, lang) |

### product_documents
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| product_id | UUID | FK → products |
| doc_type | enum | manual, warranty, certificate, other |
| title | string | Nullable |
| current_version_id | UUID | FK → product_document_versions |

### product_document_versions
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| document_id | UUID | FK → product_documents |
| version | int | 1, 2, 3... |
| file_key | string | S3/Supabase path |
| file_name | string | |
| size_bytes | bigint | |
| sha256 | string | Integrity check |
| uploaded_by | UUID | FK → users |
| created_at | timestamp | |

### subscriptions
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| company_id | UUID | FK → companies |
| status | enum | active, past_due, canceled |
| paid_until | date | Access gate |
| stripe_customer_id | string | |
| stripe_subscription_id | string | |

### payments
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| company_id | UUID | |
| amount_cents | int | |
| currency | char(3) | USD default |
| status | enum | pending, succeeded, failed |
| stripe_payment_intent_id | string | |

### audit_logs
| Field | Type | Notes |
|---|---|---|
| id | UUID | |
| actor_user_id | UUID | Nullable |
| action | string | e.g. "product.publish" |
| metadata | jsonb | |
| created_at | timestamp | |

---

## API Endpoints

### Auth
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/google
POST /api/v1/auth/password/reset-request
POST /api/v1/auth/password/reset-confirm
POST /api/v1/auth/email/verify
POST /api/v1/auth/email/resend
```

### Companies
```
POST   /api/v1/manufacturer/company
GET    /api/v1/manufacturer/company
PUT    /api/v1/manufacturer/company
POST   /api/v1/manufacturer/company/submit
```

### Products
```
GET    /api/v1/manufacturer/products
POST   /api/v1/manufacturer/products
GET    /api/v1/manufacturer/products/{id}
PUT    /api/v1/manufacturer/products/{id}
POST   /api/v1/manufacturer/products/{id}/publish
POST   /api/v1/manufacturer/products/{id}/translations
```

### Documents
```
POST   /api/v1/manufacturer/products/{id}/documents
GET    /api/v1/manufacturer/products/{id}/documents
POST   /api/v1/manufacturer/documents/{doc_id}/versions
GET    /api/v1/manufacturer/documents/{doc_id}/versions/{v}/download
```

### Public
```
GET    /api/v1/public/products/{identification_id}
```

### Billing
```
POST   /api/v1/billing/checkout-session
POST   /api/v1/billing/webhook
GET    /api/v1/billing/subscription
```

### Admin
```
GET    /api/v1/admin/companies?status=pending
POST   /api/v1/admin/companies/{id}/approve
POST   /api/v1/admin/companies/{id}/reject
POST   /api/v1/admin/products/{id}/hide
GET    /api/v1/admin/payments
```

---

## Identification ID Generation

**Format:** `IID-XXXX-XXXX`

**Rules:**
- 8 characters, alphanumeric
- No ambiguous characters (0, O, I, 1 removed)
- Character pool: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Cryptographically random (use `secrets` module in Python)
- Check uniqueness in DB before assigning
- Immutable once assigned — never changes

**Example IDs:**
- `IID-4F9A-2K7Q`
- `IID-M3NP-7RXC`

---

## Publish Rules

A product can only be published if ALL of these are true:
- `company.status == verified`
- Product has `name` filled
- At least one translation exists with `lang == "en"`
- At least one document of `doc_type == "manual"` exists
- Company has active subscription OR is within free tier limit (first 10 products)

---

## PDF Upload Rules
- File type: `application/pdf` only
- Max size: 20MB
- Storage: S3 / Supabase Storage
- Access: signed URLs only (never expose raw S3 paths publicly)
- Versioning: each new upload increments version number

---

## Rate Limiting
- Public lookup endpoint: **10 requests/minute per IP**
- On 429: return `{"error": "Too many requests, try again later"}`
- Log all lookup attempts to `audit_logs`

---

## Security Requirements
- HTTPS only in production
- JWT tokens: access token 30min, refresh token 14 days
- Passwords: bcrypt hashed, minimum 10 characters
- All file downloads via signed URLs (expire after 1 hour)
- Admin routes protected by role check
- Input validation on all endpoints
- CORS configured for frontend domain only

---

## Error Response Format (all endpoints)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": {}
  }
}
```

**Standard error codes:**
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `RATE_LIMITED`
- `CONFLICT`
- `INTERNAL_ERROR`

---

## 7-Day Build Plan

### Day 1 — Project Setup
- Initialize FastAPI backend + Next.js frontend
- Configure PostgreSQL (Supabase)
- Set up Alembic migrations
- Create all DB models
- Configure S3/Supabase Storage
- Set up Railway + Vercel deployments
- Configure environment variables

### Day 2 — Auth System
- User model + migrations
- Email/password register + login
- Google OAuth integration
- JWT access + refresh tokens
- Email verification flow
- Password reset flow
- AuthGuard on frontend (protect `/app/*` routes)

### Day 3 — Companies + Products + ID Generation
- Company CRUD + verification workflow
- Product CRUD
- Identification ID generator service
- QR code generation
- Product translations (EN)
- Publish rules validation

### Day 4 — PDF Upload + Public Portal
- PDF upload to S3/Supabase
- Document versioning
- Signed URL generation for downloads
- Public lookup endpoint with rate limiting
- Public product page (frontend)
- Lookup page (frontend)

### Day 5 — Stripe Billing + Admin
- Stripe checkout session
- Stripe webhooks (update paid_until)
- Subscription access control
- Admin panel: company verification
- Admin panel: product moderation

### Day 6 — Frontend Polish + Testing
- Complete all dashboard screens
- Mobile responsive check
- End-to-end testing of full flow
- Fix bugs
- Performance checks

### Day 7 — Deploy + Handover
- Production deployment
- Domain configuration (identificationid.com)
- SSL setup
- Final QA
- Handover to CEO

---

## MVP Definition of Done

The MVP is complete when a user can:
1. ✅ Register as a manufacturer (email or Google)
2. ✅ Create a company profile and submit for verification
3. ✅ Create a product and receive an Identification ID
4. ✅ Upload a PDF manual
5. ✅ Publish the product (after admin verifies company)
6. ✅ Pay via Stripe
7. ✅ A consumer can search the ID and download the manual

---

## Environment Variables

```env
# App
DEBUG=false
SECRET_KEY=

# Database
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=
JWT_ACCESS_TTL_MIN=30
JWT_REFRESH_TTL_DAYS=14
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Storage
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_ENDPOINT=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SENDGRID_API_KEY=
FROM_EMAIL=noreply@identificationid.com

# Frontend
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## Out of Scope for MVP (Post-Launch)
- Mobile app
- Multi-language support beyond English
- Video instructions
- Anti-counterfeit per-unit serialization
- API access for third parties (logistics, customs)
- Bulk product import (CSV)
- Analytics dashboard for manufacturers
