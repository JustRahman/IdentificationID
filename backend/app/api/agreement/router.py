from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_verified_manufacturer
from app.core.exceptions import ValidationError
from app.models.company import Company
from app.models.user import User
from app.services import agreement
from app.services.audit import client_ip

router = APIRouter(prefix="/manufacturer/agreement", tags=["agreement"])


class AcceptRequest(BaseModel):
    version: str


@router.get("")
async def agreement_status(
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    return {
        "success": True,
        "data": {
            "current_version": agreement.AGREEMENT_VERSION,
            "accepted": await agreement.has_accepted(user.id, db),
        },
    }


@router.post("/accept")
async def accept_agreement(
    body: AcceptRequest,
    request: Request,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    # The client must have shown the current version, not an older cached one.
    if body.version != agreement.AGREEMENT_VERSION:
        raise ValidationError("The Manufacturer Agreement has changed. Please reload and review it.")
    result = await db.execute(select(Company.id).where(Company.owner_user_id == user.id))
    company_id = result.scalar_one_or_none()
    await agreement.accept(user.id, company_id, client_ip(request), db)
    return {"success": True, "data": {"version": agreement.AGREEMENT_VERSION, "accepted": True}}
