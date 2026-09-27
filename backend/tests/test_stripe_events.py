"""Stripe webhook handling for the Registry Membership and product plans.

Needs a disposable Postgres database (tables are created, nothing is committed):
    TEST_DATABASE_URL=postgresql+asyncpg://localhost/identification_id_test pytest
"""

import asyncio
import os
import uuid
from datetime import date, datetime, time, timedelta, timezone

import pytest
import stripe
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.models import Base, Company, Subscription, SubscriptionStatus, User, UserRole
from app.services.membership import membership_for
from app.services.stripe_events import handle_event

TEST_DB = os.environ.get("TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not TEST_DB, reason="TEST_DATABASE_URL not set")

TODAY = datetime.now(timezone.utc).date()


def ts(d: date) -> int:
    return int(datetime.combine(d, time(12), tzinfo=timezone.utc).timestamp())


@pytest.fixture
def stripe_period(monkeypatch):
    """Fake stripe.Subscription.retrieve: {subscription_id: current_period_end date}."""
    periods: dict[str, date] = {}

    def retrieve(sub_id):
        return {"id": sub_id, "current_period_end": ts(periods[sub_id])}

    monkeypatch.setattr(stripe.Subscription, "retrieve", retrieve)
    return periods


def run(scenario):
    async def main():
        engine = create_async_engine(TEST_DB)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with AsyncSession(engine, expire_on_commit=False) as db:
            try:
                await scenario(db)
            finally:
                await db.rollback()
        await engine.dispose()

    asyncio.run(main())


async def make_company(db, **kwargs) -> Company:
    user = User(email=f"t-{uuid.uuid4().hex[:8]}@test.dev", role=UserRole.manufacturer)
    db.add(user)
    await db.flush()
    company = Company(
        owner_user_id=user.id, legal_name="T", display_name="T", country_code="CA", **kwargs
    )
    db.add(company)
    await db.flush()
    return company


def event(event_type, obj):
    return {"type": event_type, "data": {"object": obj}}


def registry_checkout(company, sub_id):
    return event("checkout.session.completed", {
        "subscription": sub_id,
        "customer": "cus_1",
        "metadata": {"company_id": str(company.id), "registry": "1"},
    })


def test_monthly_checkout_gives_about_one_month(stripe_period):
    async def scenario(db):
        company = await make_company(db)
        stripe_period["sub_monthly"] = TODAY + timedelta(days=31)
        await handle_event(registry_checkout(company, "sub_monthly"), db)

        assert company.registry_active
        assert company.registry_stripe_subscription_id == "sub_monthly"
        assert 28 <= (company.registry_paid_until - TODAY).days <= 31

    run(scenario)


def test_yearly_checkout_gives_about_one_year(stripe_period):
    async def scenario(db):
        company = await make_company(db)
        stripe_period["sub_yearly"] = TODAY + timedelta(days=365)
        await handle_event(registry_checkout(company, "sub_yearly"), db)

        assert company.registry_active
        assert 364 <= (company.registry_paid_until - TODAY).days <= 366

    run(scenario)


@pytest.mark.parametrize("api_shape", ["classic", "2025"])
def test_renewal_extends_registry_membership(stripe_period, api_shape):
    async def scenario(db):
        company = await make_company(
            db,
            registry_active=True,
            registry_paid_until=TODAY + timedelta(days=1),
            registry_stripe_subscription_id="sub_renew",
        )
        stripe_period["sub_renew"] = TODAY + timedelta(days=32)
        invoice = (
            {"id": "in_1", "subscription": "sub_renew"}
            if api_shape == "classic"
            else {"id": "in_1", "parent": {"subscription_details": {"subscription": "sub_renew"}}}
        )
        await handle_event(event("invoice.paid", invoice), db)

        assert company.registry_active
        assert company.registry_paid_until == TODAY + timedelta(days=32)

    run(scenario)


def test_renewal_extends_product_plan(stripe_period):
    async def scenario(db):
        company = await make_company(db)
        sub = Subscription(
            company_id=company.id,
            status=SubscriptionStatus.active,
            plan="popular",
            paid_until=TODAY + timedelta(days=1),
            stripe_customer_id="cus_1",
            stripe_subscription_id="sub_plan",
        )
        db.add(sub)
        await db.flush()
        stripe_period["sub_plan"] = TODAY + timedelta(days=366)
        await handle_event(event("invoice.paid", {"id": "in_2", "subscription": "sub_plan"}), db)

        assert sub.paid_until == TODAY + timedelta(days=366)

    run(scenario)


@pytest.mark.parametrize(
    "ended",
    [
        ("customer.subscription.deleted", None),
        ("customer.subscription.updated", "canceled"),
        ("customer.subscription.updated", "unpaid"),
    ],
)
def test_cancellation_makes_membership_inactive_with_last_active(stripe_period, ended):
    async def scenario(db):
        last_paid = TODAY - timedelta(days=3)
        company = await make_company(
            db,
            registry_active=True,
            registry_paid_until=last_paid,
            registry_stripe_subscription_id="sub_cancel",
        )
        event_type, status = ended
        await handle_event(event(event_type, {"id": "sub_cancel", "status": status}), db)

        assert company.registry_active is False
        assert company.registry_paid_until == last_paid  # kept for "Last active"
        m = membership_for(company, None)
        assert not m.active and m.last_active == last_paid

    run(scenario)


def test_payment_failed_does_not_deactivate(stripe_period):
    async def scenario(db):
        company = await make_company(
            db,
            registry_active=True,
            registry_paid_until=TODAY + timedelta(days=5),
            registry_stripe_subscription_id="sub_retry",
        )
        await handle_event(event("invoice.payment_failed", {"id": "in_3", "subscription": "sub_retry"}), db)
        await handle_event(event("customer.subscription.updated", {"id": "sub_retry", "status": "past_due"}), db)

        assert company.registry_active
        assert membership_for(company, None).active

    run(scenario)
