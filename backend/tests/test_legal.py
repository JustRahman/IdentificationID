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
from app.services.agreement import AGREEMENT_VERSION
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
            r = await c.post("/manufacturer/agreement/accept", json={"version": "1999-01-01"})
            assert r.status_code == 422  # stale version is refused
            r = await c.post("/manufacturer/agreement/accept", json={"version": AGREEMENT_VERSION})
            assert r.status_code == 200
            assert (await c.get("/manufacturer/agreement")).json()["data"]["accepted"] is True

            row = (await db.execute(select(AgreementAcceptance).where(
                AgreementAcceptance.user_id == user.id))).scalar_one()
            assert (row.company_id, row.version, row.ip_address) == (company.id, AGREEMENT_VERSION, CLIENT_IP)
            assert row.accepted_at is not None

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
