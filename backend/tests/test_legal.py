"""Manufacturer Agreement, content reports, audit trail and regulated-category review.

Calls the real API routes against the test database (see tests/db.py).
"""

import uuid
from datetime import date

import httpx
import pytest
from sqlalchemy import delete, select
from sqlalchemy.exc import DBAPIError

import app.api.reports.router as reports_router
from app.core.deps import get_db
from app.core.security import create_access_token
from app.models import (
    AgreementAcceptance, Company, ContentReport, DocType, Product, ProductDocument,
    ProductStatus, ProductTranslation, User, UserRole,
)
from app.models.audit_log import AuditLog
from app.services.agreement import (
    AGREEMENT_HASH, AGREEMENT_VERSION, CHECKBOX_TEXT_VERSION, PRIVACY_HASH, PRIVACY_VERSION,
)

ACCEPT = {
    "version": AGREEMENT_VERSION, "document_hash": AGREEMENT_HASH,
    "privacy_version": PRIVACY_VERSION, "privacy_document_hash": PRIVACY_HASH,
    "checkbox_text_version": CHECKBOX_TEXT_VERSION, "authorized_person_name": "Jane Maker",
    "billing_period": "monthly",
}
from main import app
from tests.db import requires_db, run

pytestmark = requires_db
CLIENT_IP = "203.0.113.7"


def client_for(db, user=None):
    async def override_db():
        yield db

    app.dependency_overrides[get_db] = override_db
    headers = {"X-Forwarded-For": f"10.0.0.1, {CLIENT_IP}"}  # proxy appends the real IP last
    if user is not None:
        headers["Authorization"] = f"Bearer {create_access_token(str(user.id))}"
    return httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test/api/v1",
                             headers=headers)


@pytest.fixture(autouse=True)
def _clear_overrides():
    yield
    app.dependency_overrides.clear()


async def make_member(db, role=UserRole.manufacturer):
    user = User(email=f"m-{uuid.uuid4().hex[:8]}@test.dev", role=role, is_active=True)
    db.add(user)
    await db.flush()
    company = Company(
        owner_user_id=user.id, legal_name="Maker Ltd", display_name=f"Maker {uuid.uuid4().hex[:4]}",
        country_code="CA", manufacturer_id=f"MID-T{uuid.uuid4().hex[:3].upper()}-TEST",
        registry_active=True, registry_paid_until=date(2099, 1, 1),
    )
    db.add(company)
    await db.flush()
    return user, company


async def make_publishable_product(db, company, category):
    product = Product(company_id=company.id, identification_id=f"IID-{uuid.uuid4().hex[:4].upper()}-TEST",
                      name="Thing", category=category)
    db.add(product)
    await db.flush()
    db.add(ProductTranslation(product_id=product.id, lang="en", short_description="A thing"))
    db.add(ProductDocument(product_id=product.id, doc_type=DocType.manual, title="Manual"))
    await db.flush()
    return product


# ── 1. Manufacturer Agreement ──

def test_payment_blocked_until_agreement_accepted():
    async def scenario(db):
        user, company = await make_member(db)
        async with client_for(db, user) as c:
            r = await c.post("/billing/registry/checkout", json={"billing": "monthly"})
            assert r.status_code == 409 and r.json()["error"]["code"] == "AGREEMENT_REQUIRED"
            r = await c.post("/billing/checkout", json={"plan": "popular"})
            assert r.status_code == 409

            assert (await c.get("/manufacturer/agreement")).json()["data"]["accepted"] is False
            r = await c.post("/manufacturer/agreement/accept", json={**ACCEPT, "version": "1999-01-01"})
            assert r.status_code == 422  # stale version is refused
            r = await c.post("/manufacturer/agreement/accept", json={**ACCEPT, "document_hash": "0" * 64})
            assert r.status_code == 422  # text that isn't the published one is refused
            r = await c.post("/manufacturer/agreement/accept", json=ACCEPT,
                             headers={"User-Agent": "TestBrowser/1.0"})
            assert r.status_code == 200
            assert (await c.get("/manufacturer/agreement")).json()["data"]["accepted"] is True

            row = (await db.execute(select(AgreementAcceptance).where(
                AgreementAcceptance.user_id == user.id))).scalar_one()
            assert (row.company_id, row.version, row.ip_address) == (company.id, AGREEMENT_VERSION, CLIENT_IP)
            assert row.accepted_at is not None
            assert row.document_hash == AGREEMENT_HASH and row.privacy_document_hash == PRIVACY_HASH
            assert row.terms_url.endswith("/legal/terms/1.0")
            assert row.authorized_person_name == "Jane Maker" and row.authorized_person_email == user.email
            assert (row.billing_period, row.price_presented_cents, row.currency) == ("monthly", 500, "USD")
            assert row.auto_renewal_disclosed is True and row.user_agent == "TestBrowser/1.0"
            assert "authorized to act on behalf of Maker Ltd" in row.checkbox_text
            assert "renews automatically at USD $5 per month" in row.checkbox_text

            # Demo mode (no Stripe key in tests) activates directly once accepted.
            r = await c.post("/billing/registry/checkout", json={"billing": "monthly"})
            assert r.status_code == 200

    run(scenario)


# ── 3. Report incorrect information ──

def test_report_saved_emailed_and_rate_limited(monkeypatch):
    sent = []

    async def fake_send(to, subject, html):
        sent.append((to, subject, html))
        return True

    monkeypatch.setattr(reports_router, "send_email", fake_send)

    async def scenario(db):
        _, company = await make_member(db)
        product = await make_publishable_product(db, company, "electronics")
        async with client_for(db) as c:
            body = {"target_type": "product", "target_id": product.identification_id.lower(),
                    "reason": "safety_concern", "message": "<b>Battery</b> overheats", "email": "a@b.dev"}
            assert (await c.post("/public/reports", json=body)).status_code == 200

            report = (await db.execute(select(ContentReport))).scalars().first()
            assert report.target_id == product.identification_id and report.ip_address == CLIENT_IP
            assert sent and sent[0][0] == "support@identificationid.com"
            assert "&lt;b&gt;Battery" in sent[0][2]  # user text is escaped in the email

            r = await c.post("/public/reports", json={**body, "target_type": "manufacturer",
                                                      "target_id": company.manufacturer_id})
            assert r.status_code == 200
            r = await c.post("/public/reports", json={**body, "target_id": "IID-NOPE-NOPE"})
            assert r.status_code == 404
            for _ in range(3):
                assert (await c.post("/public/reports", json=body)).status_code == 200
            assert (await c.post("/public/reports", json=body)).status_code == 429  # 6th in an hour

    run(scenario)


# ── 4. Audit trail ──

def test_changes_are_audited_and_audit_log_is_append_only():
    async def scenario(db):
        user, company = await make_member(db)
        product = await make_publishable_product(db, company, "electronics")
        async with client_for(db, user) as c:
            r = await c.put(f"/manufacturer/products/{product.id}", json={"name": "Thing 2", "brand": "B"})
            assert r.status_code == 200
            r = await c.put("/manufacturer/company", json={"description": "New description"})
            assert r.status_code == 200

        logs = (await db.execute(select(AuditLog).order_by(AuditLog.created_at))).scalars().all()
        update = next(l for l in logs if l.action == "product.update")
        assert update.actor_user_id == user.id and update.entity_id == str(product.id)
        assert update.old_values == {"name": "Thing", "brand": None}
        assert update.new_values == {"name": "Thing 2", "brand": "B"}
        assert update.ip_address == CLIENT_IP
        company_log = next(l for l in logs if l.action == "company.update")
        assert company_log.new_values == {"description": "New description"}

        with pytest.raises(DBAPIError, match="append-only"):
            await db.execute(delete(AuditLog).where(AuditLog.id == update.id))

    run(scenario)


# ── 7. Regulated categories ──

def test_regulated_product_waits_for_admin_review():
    async def scenario(db):
        user, company = await make_member(db)
        admin = User(email=f"admin-{uuid.uuid4().hex[:6]}@test.dev", role=UserRole.admin, is_active=True)
        db.add(admin)
        medical = await make_publishable_product(db, company, "medical")
        normal = await make_publishable_product(db, company, "electronics")
        await db.flush()

        async with client_for(db, user) as c:
            r = await c.post(f"/manufacturer/products/{medical.id}/publish")
            assert r.status_code == 200 and r.json()["status"] == "pending_review"
            r = await c.post(f"/manufacturer/products/{normal.id}/publish")
            assert r.json()["status"] == "published"
            # Can't skip review by setting the status directly.
            r = await c.put(f"/manufacturer/products/{medical.id}", json={"status": "published"})
            assert r.status_code == 422
            # Not visible publicly while pending.
            assert (await c.get(f"/public/products/{medical.identification_id}")).status_code == 404
            # Moving a live product into a regulated category sends it back to review.
            r = await c.put(f"/manufacturer/products/{normal.id}", json={"category": "food_beverage"})
            assert r.json()["status"] == "pending_review"

        async with client_for(db, admin) as c:
            r = await c.post(f"/admin/products/{medical.id}/moderate", json={"action": "approve"})
            assert r.status_code == 200 and r.json()["data"]["status"] == "published"
        await db.refresh(medical)
        assert medical.status == ProductStatus.published and medical.published_at is not None

    run(scenario)


# ── 5. Manufacturer ID only after payment ──

def test_manufacturer_id_issued_only_after_payment():
    async def scenario(db):
        user = User(email=f"new-{uuid.uuid4().hex[:8]}@test.dev", role=UserRole.manufacturer, is_active=True)
        db.add(user)
        await db.flush()
        async with client_for(db, user) as c:
            r = await c.post("/manufacturer/company", json={
                "legal_name": "Fresh Co", "display_name": f"Fresh {uuid.uuid4().hex[:4]}", "country_code": "CN"})
            assert r.status_code == 200 and r.json()["manufacturer_id"] is None
            assert (await c.get("/manufacturer/company")).json()["manufacturer_id"] is None
            assert (await c.get("/manufacturer/company/preview")).json()["data"]["manufacturer_id"] is None

            assert (await c.post("/manufacturer/agreement/accept", json=ACCEPT)).status_code == 200
            # Demo mode (no Stripe key) stands in for a confirmed payment.
            assert (await c.post("/billing/registry/checkout", json={"billing": "annual"})).status_code == 200
            mid = (await c.get("/manufacturer/company")).json()["manufacturer_id"]
            assert mid and mid.startswith("MID-")

    run(scenario)


# ── 6. Complaints: legal reasons need an email, "under review" locks editing ──

def test_under_review_flags_public_page_and_locks_editing(monkeypatch):
    async def fake_send(to, subject, html):
        return True

    monkeypatch.setattr(reports_router, "send_email", fake_send)

    async def scenario(db):
        user, company = await make_member(db)
        product = await make_publishable_product(db, company, "electronics")
        product.status = ProductStatus.published
        admin = User(email=f"admin-{uuid.uuid4().hex[:6]}@test.dev", role=UserRole.admin, is_active=True)
        db.add(admin)
        await db.flush()

        async with client_for(db) as c:
            body = {"target_type": "product", "target_id": product.identification_id,
                    "reason": "trademark", "message": "This uses our registered mark"}
            assert (await c.post("/public/reports", json=body)).status_code == 422  # email required
            r = await c.post("/public/reports", json={**body, "email": "brand@owner.dev",
                                                      "name": "Brand Owner", "evidence": "TM reg 123"})
            assert r.status_code == 200
            report_id = r.json()["data"]["id"]
            assert (await c.get(f"/public/products/{product.identification_id}")).json()["data"]["under_review"] is False

        async with client_for(db, admin) as c:
            r = await c.post(f"/admin/reports/{report_id}/under-review", json={"note": "checking"})
            assert r.status_code == 200 and r.json()["data"]["status"] == "under_review"

        async with client_for(db) as c:
            assert (await c.get(f"/public/products/{product.identification_id}")).json()["data"]["under_review"] is True

        async with client_for(db, user) as c:
            r = await c.put(f"/manufacturer/products/{product.id}", json={"name": "Renamed"})
            assert r.status_code == 423

        async with client_for(db, admin) as c:
            assert (await c.post(f"/admin/reports/{report_id}/resolve", json={"note": "ok"})).status_code == 200

        async with client_for(db, user) as c:
            assert (await c.put(f"/manufacturer/products/{product.id}", json={"name": "Renamed"})).status_code == 200

    run(scenario)
