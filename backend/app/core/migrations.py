"""Idempotent schema migrations run at startup, after create_all.

create_all only creates missing tables, not missing columns, so new columns,
types and triggers on existing tables are added here.
"""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

MIGRATIONS = (
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500)",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT",
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan VARCHAR(32) NOT NULL DEFAULT 'free'",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS manufacturer_id VARCHAR(13)",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS trust_score INTEGER",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS trust_checks JSONB",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS trust_checked_at TIMESTAMPTZ",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS registry_active BOOLEAN NOT NULL DEFAULT false",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS registry_paid_until DATE",
    "CREATE UNIQUE INDEX IF NOT EXISTS ix_companies_manufacturer_id ON companies (manufacturer_id)",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS brands JSONB",
    "ALTER TABLE companies ADD COLUMN IF NOT EXISTS registry_stripe_subscription_id VARCHAR(255)",
    "CREATE INDEX IF NOT EXISTS ix_companies_registry_stripe_subscription_id ON companies (registry_stripe_subscription_id)",
    # Audit trail: who/what/old/new/IP, and append-only at the DB level.
    "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50)",
    "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id VARCHAR(64)",
    "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS old_values JSONB",
    "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS new_values JSONB",
    "ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(64)",
    "CREATE INDEX IF NOT EXISTS ix_audit_logs_entity ON audit_logs (entity_type, entity_id)",
    """CREATE OR REPLACE FUNCTION audit_logs_append_only() RETURNS trigger AS $$
       BEGIN RAISE EXCEPTION 'audit_logs is append-only'; END;
       $$ LANGUAGE plpgsql""",
    "CREATE OR REPLACE TRIGGER audit_logs_no_change BEFORE UPDATE OR DELETE ON audit_logs "
    "FOR EACH ROW EXECUTE FUNCTION audit_logs_append_only()",
    "CREATE OR REPLACE TRIGGER audit_logs_no_truncate BEFORE TRUNCATE ON audit_logs "
    "FOR EACH STATEMENT EXECUTE FUNCTION audit_logs_append_only()",
    # Regulated categories wait for admin review before going live.
    "ALTER TYPE productstatus ADD VALUE IF NOT EXISTS 'pending_review'",
    # Full acceptance evidence for the Terms / Manufacturer Agreement.
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS manufacturer_id VARCHAR(13)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS agreement_type VARCHAR(64)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS document_hash VARCHAR(64)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS terms_url VARCHAR(255)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS privacy_version VARCHAR(32)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS privacy_document_hash VARCHAR(64)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS company_name VARCHAR(255)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS authorized_person_name VARCHAR(255)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS authorized_person_email VARCHAR(255)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS price_presented_cents INTEGER",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS currency VARCHAR(8)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS billing_period VARCHAR(16)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS auto_renewal_disclosed BOOLEAN NOT NULL DEFAULT false",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS checkbox_text_version VARCHAR(32)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS checkbox_text TEXT",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS user_agent VARCHAR(512)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS checkout_id VARCHAR(255)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS payment_provider_customer_id VARCHAR(255)",
    "ALTER TABLE agreement_acceptances ADD COLUMN IF NOT EXISTS payment_provider_subscription_id VARCHAR(255)",
    "CREATE INDEX IF NOT EXISTS ix_agreement_acceptances_checkout_id ON agreement_acceptances (checkout_id)",
    # Report reasons from the IP & Trademark Complaint Policy, and "under review".
    "ALTER TYPE reportreason ADD VALUE IF NOT EXISTS 'incorrect_manufacturer_info'",
    "ALTER TYPE reportreason ADD VALUE IF NOT EXISTS 'unauthorized_profile'",
    "ALTER TYPE reportreason ADD VALUE IF NOT EXISTS 'trademark'",
    "ALTER TYPE reportreason ADD VALUE IF NOT EXISTS 'copyright'",
    "ALTER TYPE reportreason ADD VALUE IF NOT EXISTS 'counterfeit'",
    "ALTER TYPE reportreason ADD VALUE IF NOT EXISTS 'incorrect_product_info'",
    "ALTER TYPE reportstatus ADD VALUE IF NOT EXISTS 'under_review'",
    "ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS reporter_name VARCHAR(255)",
    "ALTER TABLE content_reports ADD COLUMN IF NOT EXISTS evidence TEXT",
    # A Manufacturer ID is issued only after payment: release IDs that were
    # reserved at sign-up by companies that never paid.
    """UPDATE companies c SET manufacturer_id = NULL
       WHERE c.manufacturer_id IS NOT NULL
         AND c.registry_active = false
         AND c.registry_paid_until IS NULL
         AND NOT EXISTS (
           SELECT 1 FROM subscriptions s
           WHERE s.company_id = c.id AND s.plan IN ('popular', 'best_value', 'enterprise')
         )""",
)


async def run_migrations(conn: AsyncConnection) -> None:
    for stmt in MIGRATIONS:
        await conn.execute(text(stmt))
