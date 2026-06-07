from datetime import date

import stripe
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFound, ValidationError
from app.models.company import Company
from app.models.payment import Payment, PaymentStatus
from app.models.product import Product
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import User

router = APIRouter(prefix="/billing", tags=["billing"])

stripe.api_key = settings.stripe_secret_key

PLANS = {
    "free":    {"name": "Free",    "price_cents": 0,    "product_limit": 10},
    "starter": {"name": "Starter", "price_cents": 2900, "product_limit": 100},
    "pro":     {"name": "Pro",     "price_cents": 9900, "product_limit": -1},
}

PURCHASABLE_PLANS = ("starter", "pro")


class CheckoutRequest(BaseModel):
    plan: str  # one of PURCHASABLE_PLANS


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
        plan_key = subscription.plan if subscription.plan in PLANS else "free"
        plan = PLANS[plan_key]
    else:
        plan_key = "free"
        plan = PLANS["free"]

    return {
        "success": True,
        "data": {
            "plan": plan_key,
            "plan_name": plan["name"],
            "price_cents": plan["price_cents"],
            "product_limit": plan["product_limit"],
            "products_used": count,
            "subscription": {
                "status": subscription.status.value,
                "paid_until": subscription.paid_until.isoformat(),
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

    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Create a company first")

    plan = PLANS[body.plan]

    if not settings.stripe_secret_key:
        return {
            "success": True,
            "data": {
                "message": "Stripe not configured. In production, this would redirect to Stripe Checkout.",
                "plan": body.plan,
                "price_cents": plan["price_cents"],
            },
        }

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer_email=user.email,
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"Identification ID - {plan['name']}"},
                    "unit_amount": plan["price_cents"],
                    "recurring": {"interval": "month"},
                },
                "quantity": 1,
            }
        ],
        metadata={"company_id": str(company.id), "plan": body.plan},
        success_url=f"{settings.frontend_url}/billing?success=true",
        cancel_url=f"{settings.frontend_url}/billing?canceled=true",
    )

    return {"success": True, "data": {"checkout_url": session.url}}


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if settings.stripe_webhook_secret:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.stripe_webhook_secret
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            raise ValidationError("Invalid webhook signature")
    else:
        import json
        event = json.loads(payload)

    event_type = event.get("type", "")

    if event_type == "checkout.session.completed":
        session_data = event["data"]["object"]
        company_id = session_data.get("metadata", {}).get("company_id")
        plan = session_data.get("metadata", {}).get("plan", "free")

        if company_id:
            stripe_customer_id = session_data.get("customer", "")
            stripe_subscription_id = session_data.get("subscription", "")

            result = await db.execute(
                select(Subscription).where(Subscription.company_id == company_id)
            )
            sub = result.scalar_one_or_none()

            if sub:
                sub.status = SubscriptionStatus.active
                sub.stripe_customer_id = stripe_customer_id
                sub.stripe_subscription_id = stripe_subscription_id
                sub.paid_until = date(2099, 12, 31)
                sub.plan = plan
            else:
                sub = Subscription(
                    company_id=company_id,
                    status=SubscriptionStatus.active,
                    stripe_customer_id=stripe_customer_id,
                    stripe_subscription_id=stripe_subscription_id,
                    paid_until=date(2099, 12, 31),
                    plan=plan,
                )
                db.add(sub)

            amount = session_data.get("amount_total", 0)
            payment = Payment(
                company_id=company_id,
                amount_cents=amount,
                currency="usd",
                status=PaymentStatus.succeeded,
                stripe_payment_intent_id=session_data.get("payment_intent", ""),
            )
            db.add(payment)
            await db.flush()

    elif event_type == "customer.subscription.deleted":
        sub_data = event["data"]["object"]
        stripe_sub_id = sub_data.get("id", "")
        result = await db.execute(
            select(Subscription).where(
                Subscription.stripe_subscription_id == stripe_sub_id
            )
        )
        sub = result.scalar_one_or_none()
        if sub:
            sub.status = SubscriptionStatus.canceled
            await db.flush()

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
