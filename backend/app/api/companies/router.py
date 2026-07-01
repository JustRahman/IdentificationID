from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.companies.schemas import CompanyCreate, CompanyResponse, CompanyUpdate
from app.core.deps import get_db, get_verified_manufacturer
from app.core.exceptions import Conflict, NotFound, ValidationError
from app.models.company import Company, CompanyStatus
from app.models.user import User

router = APIRouter(prefix="/manufacturer/company", tags=["companies"])


@router.post("", response_model=CompanyResponse)
async def create_company(
    body: CompanyCreate,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    if result.scalar_one_or_none():
        raise Conflict("You already have a company")

    company = Company(
        owner_user_id=user.id,
        legal_name=body.legal_name,
        display_name=body.display_name,
        country_code=body.country_code,
        website=body.website,
        support_email=body.support_email,
        logo_url=body.logo_url,
        description=body.description,
    )
    db.add(company)
    await db.flush()

    return _company_response(company)


@router.get("", response_model=CompanyResponse)
async def get_company(
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("No company found. Create one first.")
    return _company_response(company)


@router.put("", response_model=CompanyResponse)
async def update_company(
    body: CompanyUpdate,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("No company found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(company, field, value)

    # If rejected, allow resubmission by resetting to pending
    if company.status == CompanyStatus.rejected:
        company.status = CompanyStatus.pending
        company.admin_note = None

    await db.flush()
    return _company_response(company)


@router.post("/submit", response_model=CompanyResponse)
async def submit_for_verification(
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("No company found")

    if company.status == CompanyStatus.verified:
        raise ValidationError("Company is already verified")

    if company.status == CompanyStatus.pending:
        raise ValidationError("Company is already pending verification")

    company.status = CompanyStatus.pending
    await db.flush()
    return _company_response(company)


def _company_response(company: Company) -> CompanyResponse:
    return CompanyResponse(
        id=str(company.id),
        legal_name=company.legal_name,
        display_name=company.display_name,
        country_code=company.country_code,
        website=company.website,
        support_email=company.support_email,
        logo_url=company.logo_url,
        description=company.description,
        status=company.status.value,
        admin_note=company.admin_note,
        verified_at=company.verified_at.isoformat() if company.verified_at else None,
    )
