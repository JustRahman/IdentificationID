from typing import Optional

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
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
    document_hash: str
    privacy_version: str
    privacy_document_hash: str
    checkbox_text_version: str
    authorized_person_name: str = Field(min_length=2, max_length=255)
    billing_period: Optional[str] = Field(default=None, pattern="^(monthly|annual)$")


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
    # The client must have shown exactly the current published text.
    if (
        body.version != agreement.AGREEMENT_VERSION
        or body.document_hash != agreement.AGREEMENT_HASH
        or body.privacy_version != agreement.PRIVACY_VERSION
        or body.privacy_document_hash != agreement.PRIVACY_HASH
        or body.checkbox_text_version != agreement.CHECKBOX_TEXT_VERSION
    ):
        raise ValidationError("Our Terms have changed. Please reload the page and review them.")
    result = await db.execute(select(Company).where(Company.owner_user_id == user.id))
    company = result.scalar_one_or_none()
    company_name = (company.legal_name or company.display_name) if company else None
    row = await agreement.accept(
        user_id=user.id,
        user_email=user.email,
        company_id=company.id if company else None,
        company_name=company_name,
        manufacturer_id=company.manufacturer_id if company else None,
        authorized_person_name=body.authorized_person_name.strip(),
        billing_period=body.billing_period,
        ip_address=client_ip(request),
        user_agent=request.headers.get("user-agent"),
        db=db,
    )
    return {
        "success": True,
        "data": {"version": agreement.AGREEMENT_VERSION, "accepted": True, "acceptance_id": str(row.id)},
    }
