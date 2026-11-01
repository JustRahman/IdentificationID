"""Founding Manufacturers Program: free membership, no card, no auto-renew, capped."""

from datetime import date, timedelta

from app.core.config import settings
from app.models import AgreementAcceptance
from app.services.agreement import AGREEMENT_VERSION
from tests.db import requires_db, run
from tests.test_legal import client_for, make_member

pytestmark = requires_db


async def new_maker(db, accepted=True):
    user, company = await make_member(db)
    company.registry_active = False
    company.registry_paid_until = None
    company.manufacturer_id = None
    if accepted:
        db.add(AgreementAcceptance(user_id=user.id, company_id=company.id, version=AGREEMENT_VERSION))
    await db.flush()
    return user, company


def test_founding_activates_free_without_card(monkeypatch):
    monkeypatch.setattr(settings, "stripe_secret_key", "sk_test_fake")  # must not call Stripe

    async def scenario(db):
        user, company = await new_maker(db)
        async with client_for(db, user) as c:
            r = await c.post("/billing/registry/founding")
            assert r.status_code == 200, r.text
            data = r.json()["data"]
            assert data["active"] is True
            assert data["manufacturer_id"]
            assert data["free_until"] == (date.today() + timedelta(days=settings.founding_free_days)).isoformat()

            status = (await c.get("/billing/registry")).json()["data"]
            assert status["active"] is True
            assert status["founding_member"] is True
            assert status["can_cancel"] is False  # nothing to cancel, it just ends

            again = await c.post("/billing/registry/founding")
            assert again.status_code == 422
        assert company.registry_cancel_at_period_end is True
        assert company.registry_stripe_subscription_id is None

    run(scenario)


def test_founding_needs_agreement():
    async def scenario(db):
        user, _ = await new_maker(db, accepted=False)
        async with client_for(db, user) as c:
            r = await c.post("/billing/registry/founding")
        assert r.status_code != 200

    run(scenario)


def test_founding_closes_at_limit(monkeypatch):
    async def scenario(db):
        user, _ = await new_maker(db)
        async with client_for(db) as anon:
            before = (await anon.get("/billing/founding")).json()["data"]
        monkeypatch.setattr(settings, "founding_limit", settings.founding_limit - before["spots_left"])
        async with client_for(db) as anon:
            closed = (await anon.get("/billing/founding")).json()["data"]
        assert closed["open"] is False and closed["spots_left"] == 0
        async with client_for(db, user) as c:
            r = await c.post("/billing/registry/founding")
        assert r.status_code == 422

    run(scenario)
