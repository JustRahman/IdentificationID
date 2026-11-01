import asyncio
import logging
from datetime import date, timedelta

import stripe
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.core.exceptions import AppException, NotFound, ValidationError
from app.models.company import Company
from app.models.payment import Payment
from app.models.product import Product
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import User
from app.services.membership import PLANS_WITH_MEMBERSHIP, get_membership, membership_for
from app.services.agreement import link_checkout, require_agreement
from app.services import audit
from app.services.manufacturer_ids import ensure_manufacturer_id
from app.services.stripe_events import handle_event

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = settings.stripe_secret_key
logger = logging.getLogger("billing")

# Checkout Sessions are created with the same API version as our webhook
# endpoint: managed_payments needs 2025-03-31 or later, and stripe 11.4.1 pins
# 2024-12-18 for everything else.
CHECKOUT_API_VERSION = "2026-08-26.dahlia"


async def _create_checkout_session(**params):
    """Create a Stripe Checkout Session and return it (url + id)."""
    try:
        session = await asyncio.to_thread(
            stripe.checkout.Session.create,
            **params,
            # No Managed Payments (Stripe as merchant of record, +3.5% fee).
            # Sent as the literal "false", exactly as Stripe documents it.
            managed_payments={"enabled": "false"},
            stripe_version=CHECKOUT_API_VERSION,
        )
    except stripe.error.StripeError as e:
        logger.error("Stripe checkout session failed: %s", e)
        raise AppException(
            "PAYMENT_PROVIDER_ERROR",
            "We couldn't start checkout with our payment provider. Please try again in a "
            "few minutes or contact support@identificationid.com.",
            502,
        )
    return session

PLANS = {
    # Registry Membership alone: the first 3 Product IDs at no additional cost.
    "membership": {"name": "Registry Membership", "price_cents": 0, "product_limit": 3, "per_product": False},
    "standard":   {"name": "Standard",   "price_cents": 300,   "product_limit": -1,  "per_product": True},
    "popular":    {"name": "Popular",    "price_cents": 2900,  "product_limit": 100, "per_product": False},
    "best_value": {"name": "Best Value", "price_cents": 9900,  "product_limit": 500, "per_product": False},
    "enterprise": {"name": "Enterprise", "price_cents": 29900, "product_limit": -1,  "per_product": False},
}

PURCHASABLE_PLANS = ("standard", "popular", "best_value", "enterprise")

# Required for every manufacturer (Popular, Best Value and Enterprise include
# it; Standard does not). Activates the Manufacturer ID and public profile.
REGISTRY_MEMBERSHIP = {
    "name": "Manufacturer Registry Membership",
    "price_cents": 500,          # $5 / month
    "annual_price_cents": 4900,  # $49 / year
}


class CheckoutRequest(BaseModel):
    plan: str  # one of PURCHASABLE_PLANS


class RegistryCheckoutRequest(BaseModel):
    billing: str = "annual"  # "annual" or "monthly"


@router.get("/plan")
async def get_current_plan(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Create a company first")

    sub_result = await db.execute(
        select(Subscription).where(Subscription.company_id == company.id)
    )
    subscription = sub_result.scalar_one_or_none()

    product_result = await db.execute(
        select(Product).where(Product.company_id == company.id)
    )
    count = len(product_result.scalars().all())

    if subscription and subscription.status == SubscriptionStatus.active:
        plan_key = subscription.plan if subscription.plan in PLANS else "membership"
    else:
        plan_key = "membership"
    plan = PLANS[plan_key]
    membership = membership_for(company, subscription)

    return {
        "success": True,
        "data": {
            "plan": plan_key,
            "plan_name": plan["name"],
            "price_cents": plan["price_cents"],
            "product_limit": plan["product_limit"],
            "products_used": count,
            "membership_active": membership.active,
            "subscription": {
                "status": subscription.status.value,
                "paid_until": subscription.paid_until.isoformat(),
                "cancel_at_period_end": bool(subscription.cancel_at_period_end),
                "stripe_customer_id": subscription.stripe_customer_id,
            } if subscription else None,
        },
    }


@router.post("/checkout")
async def create_checkout(
    body: CheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.plan not in PURCHASABLE_PLANS:
        raise ValidationError(f"Plan must be one of {', '.join(PURCHASABLE_PLANS)}")
    await require_agreement(user.id, db)

    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Create a company first")

    plan = PLANS[body.plan]

    # Standard doesn't include the Registry Membership - it's billed on top.
    if body.plan not in PLANS_WITH_MEMBERSHIP and not (
        company.registry_active
        and (company.registry_paid_until is None or company.registry_paid_until >= date.today())
    ):
        raise ValidationError(
            f"The {plan['name']} plan requires an active Manufacturer Registry Membership."
        )

    # Per-product plans bill per registered product; others bill a flat rate.
    if plan["per_product"]:
        count_result = await db.execute(
            select(Product).where(Product.company_id == company.id)
        )
        quantity = max(1, len(count_result.scalars().all()))
    else:
        quantity = 1

    if not settings.stripe_secret_key:
        # Demo mode: activate the plan directly instead of going through Stripe.
        sub_result = await db.execute(
            select(Subscription).where(Subscription.company_id == company.id)
        )
        subscription = sub_result.scalar_one_or_none()
        if subscription is None:
            subscription = Subscription(company_id=company.id)
            db.add(subscription)
        subscription.status = SubscriptionStatus.active
        subscription.plan = body.plan
        subscription.paid_until = date.today() + timedelta(days=365)
        subscription.stripe_customer_id = "demo"
        subscription.stripe_subscription_id = f"demo_{body.plan}"
        if body.plan in PLANS_WITH_MEMBERSHIP:
            await ensure_manufacturer_id(company, db)
        await db.flush()
        return {
            "success": True,
            "data": {
                "message": "Plan activated (demo mode - Stripe not configured).",
                "plan": body.plan,
                "price_cents": plan["price_cents"],
            },
        }

    session = await _create_checkout_session(
        mode="subscription",
        customer_email=user.email,
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"Identification ID - {plan['name']} (annual)"},
                    "unit_amount": plan["price_cents"] * 12,
                    "recurring": {"interval": "year"},
                },
                "quantity": quantity,
            }
        ],
        metadata={"company_id": str(company.id), "plan": body.plan},
        success_url=f"{settings.frontend_url}/billing?success=true",
        cancel_url=f"{settings.frontend_url}/billing?canceled=true",
    )
    await link_checkout(user.id, session.id, db)
    return {"success": True, "data": {"checkout_url": session.url}}


@router.get("/registry")
async def get_registry_membership(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Current Manufacturer Registry Membership status for the company."""
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Create a company first")

    membership = await get_membership(company, db)
    return {
        "success": True,
        "data": {
            "manufacturer_id": company.manufacturer_id,
            "active": membership.active,
            "included_in_plan": membership.included_in_plan,
            "paid_until": membership.paid_until.isoformat()
            if membership.paid_until
            else None,
            "last_active": membership.last_active.isoformat()
            if membership.last_active
            else None,
            "price_cents": REGISTRY_MEMBERSHIP["price_cents"],
            "annual_price_cents": REGISTRY_MEMBERSHIP["annual_price_cents"],
            "cancel_at_period_end": bool(company.registry_cancel_at_period_end),
            "founding_member": company.founding_member_since is not None,
            # Can be cancelled here when it's its own paid subscription (not included
            # in a plan, not a free Founding membership - that one simply ends).
            "can_cancel": bool(
                company.registry_active
                and not membership.included_in_plan
                and not (company.founding_member_since and not company.registry_stripe_subscription_id)
            ),
        },
    }


@router.post("/registry/checkout")
async def create_registry_checkout(
    body: RegistryCheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Purchase the Manufacturer Registry Membership."""
    await require_agreement(user.id, db)
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Create a company first")

    annual = body.billing != "monthly"

    if not settings.stripe_secret_key:
        # Demo mode: activate directly instead of going through Stripe.
        company.registry_active = True
        company.registry_paid_until = date.today() + timedelta(
            days=365 if annual else 30
        )
        await ensure_manufacturer_id(company, db)
        await db.flush()
        return {
            "success": True,
            "data": {
                "message": "Registry membership activated (demo mode - Stripe not configured).",
                "active": True,
                "paid_until": company.registry_paid_until.isoformat(),
            },
        }

    # Prices live in the Stripe dashboard ($5/month and $49/year).
    price_id = (
        settings.stripe_price_registry_yearly
        if annual
        else settings.stripe_price_registry_monthly
    )
    if not price_id:
        raise ValidationError("Registry membership prices are not configured")

    session = await _create_checkout_session(
        mode="subscription",
        customer_email=user.email,
        line_items=[{"price": price_id, "quantity": 1}],
        metadata={"company_id": str(company.id), "registry": "1"},
        success_url=f"{settings.frontend_url}/dashboard?registry=active",
        cancel_url=f"{settings.frontend_url}/onboarding?step=activate",
    )
    await link_checkout(user.id, session.id, db)
    return {"success": True, "data": {"checkout_url": session.url}}


# --- Founding Manufacturers Program (free, no card, no automatic charge) ---

async def _founding_taken(db: AsyncSession) -> int:
    result = await db.execute(
        select(func.count()).select_from(Company).where(Company.founding_member_since.is_not(None))
    )
    return int(result.scalar() or 0)


@router.get("/founding")
async def founding_status(db: AsyncSession = Depends(get_db)):
    """Public: is the Founding Manufacturers Program still open, and how many spots are left."""
    taken = await _founding_taken(db)
    left = max(settings.founding_limit - taken, 0)
    return {"success": True, "data": {
        "open": left > 0,
        "spots_left": left,
        "limit": settings.founding_limit,
        "free_days": settings.founding_free_days,
    }}


@router.post("/registry/founding")
async def join_founding(
    request: Request,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Activate a free Registry Membership for a Founding Manufacturer.

    No payment details are collected and nothing renews: when the free period
    ends the membership simply lapses (the Manufacturer ID stays, the profile
    is shown as Inactive) unless the company chooses to pay.
    """
    await require_agreement(user.id, db)
    company = await _own_company(user, db)
    if company.founding_member_since is not None:
        raise ValidationError("Your company has already used the Founding Manufacturers Program.")
    if (await get_membership(company, db)).active:
        raise ValidationError("Your Registry Membership is already active.")
    if await _founding_taken(db) >= settings.founding_limit:
        raise ValidationError("The Founding Manufacturers Program is full.")

    today = date.today()
    company.founding_member_since = today
    company.registry_active = True
    company.registry_paid_until = today + timedelta(days=settings.founding_free_days)
    company.registry_cancel_at_period_end = True  # nothing renews automatically
    await ensure_manufacturer_id(company, db)
    await audit.record(db, request, user.id, "billing.registry.founding", "company", company.id,
                       new={"free_until": str(company.registry_paid_until)})
    await db.flush()
    return {"success": True, "data": {
        "active": True,
        "manufacturer_id": company.manufacturer_id,
        "free_until": company.registry_paid_until.isoformat(),
    }}


# --- Cancel / resume (takes effect at the end of the paid period, no refund) ---

async def _set_stripe_cancel(subscription_id: str | None, cancel: bool) -> None:
    """Tell Stripe to stop (or resume) renewing. Demo mode / demo IDs skip Stripe."""
    if not settings.stripe_secret_key or not subscription_id or subscription_id.startswith("demo"):
        return
    try:
        await asyncio.to_thread(stripe.Subscription.modify, subscription_id, cancel_at_period_end=cancel)
    except stripe.error.StripeError as e:
        logger.error("Stripe cancel/resume failed for %s: %s", subscription_id, e)
        raise AppException(
            "PAYMENT_PROVIDER_ERROR",
            "We couldn't update your subscription with our payment provider. Please try again or "
            "email support@identificationid.com.",
            502,
        )


async def _own_company(user: User, db: AsyncSession) -> Company:
    company = (await db.execute(select(Company).where(Company.owner_user_id == user.id))).scalar_one_or_none()
    if not company:
        raise NotFound("Create a company first")
    return company


async def _registry_toggle(cancel: bool, user: User, request: Request, db: AsyncSession) -> dict:
    company = await _own_company(user, db)
    membership = await get_membership(company, db)
    if not company.registry_active or membership.included_in_plan:
        raise ValidationError(
            "There is no separate Registry Membership to cancel. If it is included in your plan, "
            "cancel the plan instead."
        )
    await _set_stripe_cancel(company.registry_stripe_subscription_id, cancel)
    company.registry_cancel_at_period_end = cancel
    await audit.record(db, request, user.id, "billing.registry.cancel" if cancel else "billing.registry.resume",
                       "company", company.id, new={"cancel_at_period_end": cancel,
                                                   "paid_until": str(company.registry_paid_until)})
    await db.flush()
    return {"success": True, "data": {
        "cancel_at_period_end": cancel,
        "paid_until": company.registry_paid_until.isoformat() if company.registry_paid_until else None,
    }}


@router.post("/registry/cancel")
async def cancel_registry(request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Stop automatic renewal. The membership stays active until the end of the paid period."""
    return await _registry_toggle(True, user, request, db)


@router.post("/registry/resume")
async def resume_registry(request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await _registry_toggle(False, user, request, db)


async def _plan_toggle(cancel: bool, user: User, request: Request, db: AsyncSession) -> dict:
    company = await _own_company(user, db)
    sub = (await db.execute(select(Subscription).where(Subscription.company_id == company.id))).scalar_one_or_none()
    if not sub or sub.status != SubscriptionStatus.active:
        raise ValidationError("You don't have an active product plan.")
    await _set_stripe_cancel(sub.stripe_subscription_id, cancel)
    sub.cancel_at_period_end = cancel
    await audit.record(db, request, user.id, "billing.plan.cancel" if cancel else "billing.plan.resume",
                       "company", company.id, new={"plan": sub.plan, "cancel_at_period_end": cancel,
                                                   "paid_until": str(sub.paid_until)})
    await db.flush()
    return {"success": True, "data": {"cancel_at_period_end": cancel, "paid_until": sub.paid_until.isoformat()}}


@router.post("/plan/cancel")
async def cancel_plan(request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await _plan_toggle(True, user, request, db)


@router.post("/plan/resume")
async def resume_plan(request: Request, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return await _plan_toggle(False, user, request, db)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    # Never accept unsigned events - anyone could POST a fake "paid" event.
    if not settings.stripe_webhook_secret:
        raise ValidationError("Stripe webhooks are not configured")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise ValidationError("Invalid webhook signature")

    await handle_event(event, db)
    return {"received": True}


@router.get("/payments")
async def list_my_payments(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        return {"success": True, "data": []}

    result = await db.execute(
        select(Payment)
        .where(Payment.company_id == company.id)
        .order_by(Payment.created_at.desc())
    )
    payments = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": str(p.id),
                "amount_cents": p.amount_cents,
                "currency": p.currency,
                "status": p.status.value,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ],
    }
