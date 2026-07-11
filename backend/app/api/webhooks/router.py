import secrets
import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.webhooks.service import dispatch_event
from app.core.deps import get_current_user, get_db
from app.core.exceptions import Forbidden, NotFound, ValidationError
from app.models.company import Company
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import User
from app.models.webhook_endpoint import WEBHOOK_EVENTS, WebhookEndpoint

router = APIRouter(prefix="/manufacturer/webhooks", tags=["webhooks"])


class CreateWebhookRequest(BaseModel):
    url: str = Field(min_length=8, max_length=500)
    events: list[str] = Field(default_factory=list)

    @field_validator("url")
    @classmethod
    def _https(cls, v: str) -> str:
        if not (v.startswith("https://") or v.startswith("http://")):
            raise ValueError("URL must start with http:// or https://")
        return v

    @field_validator("events")
    @classmethod
    def _valid_events(cls, v: list[str]) -> list[str]:
        bad = [e for e in v if e not in WEBHOOK_EVENTS]
        if bad:
            raise ValueError(f"Unknown events: {', '.join(bad)}")
        return v


async def _get_company(user: User, db: AsyncSession) -> Company:
    result = await db.execute(select(Company).where(Company.owner_user_id == user.id))
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Create a company first")
    return company


async def _require_active_plan(company: Company, db: AsyncSession) -> None:
    sub = await db.execute(
        select(Subscription).where(
            Subscription.company_id == company.id,
            Subscription.status == SubscriptionStatus.active,
        )
    )
    if not sub.scalar_one_or_none():
        raise Forbidden(
            "Webhooks require an active plan. Choose a plan on the Billing page."
        )


def _serialize(w: WebhookEndpoint, include_secret: bool = True) -> dict:
    data = {
        "id": str(w.id),
        "url": w.url,
        "events": w.events or [],
        "is_active": w.is_active,
        "created_at": w.created_at.isoformat() if w.created_at else None,
    }
    if include_secret:
        data["secret"] = w.secret
    return data


@router.get("/events")
async def list_events():
    """The events a webhook can subscribe to."""
    return {"success": True, "data": list(WEBHOOK_EVENTS)}


@router.post("")
async def create_webhook(
    body: CreateWebhookRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = await _get_company(user, db)
    await _require_active_plan(company, db)

    if not body.events:
        raise ValidationError("Select at least one event")

    webhook = WebhookEndpoint(
        company_id=company.id,
        url=body.url,
        events=body.events,
        secret="whsec_" + secrets.token_hex(24),
    )
    db.add(webhook)
    await db.flush()
    return {"success": True, "data": _serialize(webhook)}


@router.get("")
async def list_webhooks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = await _get_company(user, db)
    result = await db.execute(
        select(WebhookEndpoint)
        .where(WebhookEndpoint.company_id == company.id)
        .order_by(WebhookEndpoint.created_at.desc())
    )
    return {
        "success": True,
        "data": [_serialize(w) for w in result.scalars().all()],
    }


@router.post("/{webhook_id}/test")
async def test_webhook(
    webhook_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = await _get_company(user, db)
    result = await db.execute(
        select(WebhookEndpoint).where(
            WebhookEndpoint.id == webhook_id,
            WebhookEndpoint.company_id == company.id,
        )
    )
    webhook = result.scalar_one_or_none()
    if not webhook:
        raise NotFound("Webhook not found")

    await dispatch_event(
        db,
        company.id,
        webhook.events[0] if webhook.events else "product.published",
        {"test": True, "message": "This is a test event from Identification ID."},
    )
    return {"success": True, "data": {"sent": True}}


@router.delete("/{webhook_id}")
async def delete_webhook(
    webhook_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = await _get_company(user, db)
    result = await db.execute(
        select(WebhookEndpoint).where(
            WebhookEndpoint.id == webhook_id,
            WebhookEndpoint.company_id == company.id,
        )
    )
    webhook = result.scalar_one_or_none()
    if not webhook:
        raise NotFound("Webhook not found")

    await db.delete(webhook)
    await db.flush()
    return {"success": True, "data": {"id": str(webhook_id), "deleted": True}}
