import hashlib
import secrets
import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import Forbidden, NotFound
from app.models.api_key import ApiKey
from app.models.company import Company
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import User

router = APIRouter(prefix="/manufacturer/api-keys", tags=["api-keys"])


class CreateKeyRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)


async def _get_company(user: User, db: AsyncSession) -> Company:
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Create a company first")
    return company


@router.post("")
async def create_api_key(
    body: CreateKeyRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = await _get_company(user, db)

    sub_result = await db.execute(
        select(Subscription).where(
            Subscription.company_id == company.id,
            Subscription.status == SubscriptionStatus.active,
        )
    )
    if not sub_result.scalar_one_or_none():
        raise Forbidden(
            "API access requires an active plan. Choose a plan on the Billing page."
        )

    key = "iid_live_" + secrets.token_hex(20)
    api_key = ApiKey(
        company_id=company.id,
        name=body.name,
        key_prefix=key[:12] + "…",
        key_hash=hashlib.sha256(key.encode()).hexdigest(),
    )
    db.add(api_key)
    await db.flush()

    return {
        "success": True,
        "data": {
            "id": str(api_key.id),
            "name": api_key.name,
            "key": key,
            "key_prefix": api_key.key_prefix,
            "created_at": api_key.created_at.isoformat() if api_key.created_at else None,
        },
    }


@router.get("")
async def list_api_keys(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = await _get_company(user, db)

    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.company_id == company.id)
        .order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": str(k.id),
                "name": k.name,
                "key_prefix": k.key_prefix,
                "is_active": k.is_active,
                "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                "created_at": k.created_at.isoformat() if k.created_at else None,
            }
            for k in keys
        ],
    }


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    company = await _get_company(user, db)

    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.company_id == company.id)
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise NotFound("API key not found")

    api_key.is_active = False
    await db.flush()

    return {"success": True, "data": {"id": str(api_key.id), "is_active": False}}
