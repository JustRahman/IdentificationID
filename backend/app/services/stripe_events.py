"""Stripe webhook events for the Registry Membership and product plans.

Paid-through dates always come from the Stripe subscription's current billing
period, so monthly members get a month and yearly members a year. A lapse keeps
the last paid date, which the public profile shows as "Last active".
"""

import asyncio
import logging
import uuid
from datetime import date, datetime, timezone
from typing import Any, Optional

import stripe
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company import Company
from app.models.payment import Payment, PaymentStatus
from app.models.subscription import Subscription, SubscriptionStatus

logger = logging.getLogger("billing")

ENDED_STATUSES = ("canceled", "unpaid")


def period_end(subscription: Any) -> date:
    """The subscription's current_period_end as a UTC date."""
    ts = subscription.get("current_period_end")
    if ts is None:
        # Stripe API 2025-03-31+ moved the period onto the subscription items.
        ts = max(item["current_period_end"] for item in subscription["items"]["data"])
    return datetime.fromtimestamp(ts, tz=timezone.utc).date()


async def _period_end_of(subscription_id: str) -> date:
    sub = await asyncio.to_thread(stripe.Subscription.retrieve, subscription_id)
    return period_end(sub)


def _invoice_subscription_id(invoice: Any) -> Optional[str]:
    sub = invoice.get("subscription")
    if not sub:
        # Stripe API 2025-03-31+ location.
        details = (invoice.get("parent") or {}).get("subscription_details") or {}
        sub = details.get("subscription")
    if sub and not isinstance(sub, str):
        sub = sub.get("id")
    return sub or None


async def _registry_company(subscription_id: str, db: AsyncSession) -> Optional[Company]:
    result = await db.execute(
        select(Company).where(Company.registry_stripe_subscription_id == subscription_id)
    )
    return result.scalar_one_or_none()


async def _plan_subscription(subscription_id: str, db: AsyncSession) -> Optional[Subscription]:
    result = await db.execute(
        select(Subscription).where(Subscription.stripe_subscription_id == subscription_id)
    )
    return result.scalar_one_or_none()


async def _checkout_completed(session: Any, db: AsyncSession) -> None:
    metadata = session.get("metadata") or {}
    company_id = metadata.get("company_id")
    subscription_id = session.get("subscription")
    if not company_id or not subscription_id:
        return
    company_id = uuid.UUID(company_id)
    paid_until = await _period_end_of(subscription_id)

    if metadata.get("registry") == "1":
        company = await db.get(Company, company_id)
        if company:
            company.registry_active = True
            company.registry_paid_until = paid_until
            company.registry_stripe_subscription_id = subscription_id
        return

    plan = metadata.get("plan", "membership")
    result = await db.execute(select(Subscription).where(Subscription.company_id == company_id))
    sub = result.scalar_one_or_none()
    if sub is None:
        sub = Subscription(company_id=company_id)
        db.add(sub)
    sub.status = SubscriptionStatus.active
    sub.plan = plan
    sub.paid_until = paid_until
    sub.stripe_customer_id = session.get("customer") or ""
    sub.stripe_subscription_id = subscription_id
    db.add(Payment(
        company_id=company_id,
        amount_cents=session.get("amount_total") or 0,
        currency=session.get("currency") or "usd",
        status=PaymentStatus.succeeded,
        stripe_payment_intent_id=session.get("payment_intent") or "",
    ))


async def _invoice_paid(invoice: Any, db: AsyncSession) -> None:
    """A renewal (or first) payment - extend to the new period end."""
    subscription_id = _invoice_subscription_id(invoice)
    if not subscription_id:
        return
    company = await _registry_company(subscription_id, db)
    plan_sub = await _plan_subscription(subscription_id, db)
    if company is None and plan_sub is None:
        # First invoice can arrive before checkout.session.completed, which
        # sets the dates itself.
        return

    paid_until = await _period_end_of(subscription_id)
    if company:
        company.registry_active = True
        company.registry_paid_until = paid_until
    if plan_sub:
        plan_sub.status = SubscriptionStatus.active
        plan_sub.paid_until = paid_until


async def _subscription_ended(subscription_id: str, db: AsyncSession) -> None:
    """Cancelled or finally unpaid. Keep the last paid date for "Last active"."""
    company = await _registry_company(subscription_id, db)
    if company:
        company.registry_active = False
    plan_sub = await _plan_subscription(subscription_id, db)
    if plan_sub:
        plan_sub.status = SubscriptionStatus.canceled


async def handle_event(event: Any, db: AsyncSession) -> None:
    event_type = event["type"]
    obj = event["data"]["object"]

    if event_type == "checkout.session.completed":
        await _checkout_completed(obj, db)
    elif event_type == "invoice.paid":
        await _invoice_paid(obj, db)
    elif event_type == "customer.subscription.deleted":
        await _subscription_ended(obj["id"], db)
    elif event_type == "customer.subscription.updated":
        if obj.get("status") in ENDED_STATUSES:
            await _subscription_ended(obj["id"], db)
    elif event_type == "invoice.payment_failed":
        # Stripe retries; if it finally fails we get subscription.deleted.
        logger.warning(
            "Stripe payment failed for subscription %s (invoice %s)",
            _invoice_subscription_id(obj),
            obj.get("id"),
        )

    await db.flush()
