from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.companies.schemas import CompanyCreate, CompanyResponse, CompanyUpdate
from app.core.deps import get_db, get_verified_manufacturer
from app.core.exceptions import Conflict, NotFound, ValidationError
from app.models.company import Company, CompanyStatus
from app.models.user import User
from app.services.id_generator import generate_manufacturer_id
from app.services.verification import evaluate_company

router = APIRouter(prefix="/manufacturer/company", tags=["companies"])


async def _run_verification(company: Company, user: User, db: AsyncSession) -> None:
    """Score a company from its website + the owner's email.

    Best-effort: a network failure must never block saving the profile.
    """
    try:
        result = await evaluate_company(
            company_name=company.display_name or company.legal_name or "",
            website=company.website,
            contact_email=company.support_email or user.email,
        )
        company.trust_score = result["score"]
        company.trust_checks = result["checks"]
        company.trust_checked_at = datetime.now(timezone.utc)
        await db.flush()
    except Exception:
        pass


async def _unique_manufacturer_id(db: AsyncSession) -> str:
    """Generate a MID that isn't already taken."""
    for _ in range(10):
        mid = generate_manufacturer_id()
        existing = await db.execute(
            select(Company).where(Company.manufacturer_id == mid)
        )
        if not existing.scalar_one_or_none():
            return mid
    raise ValidationError("Failed to generate a unique Manufacturer ID, try again")


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
        manufacturer_id=await _unique_manufacturer_id(db),
        legal_name=body.legal_name,
        display_name=body.display_name,
        country_code=body.country_code,
        website=body.website,
        support_email=body.support_email,
        logo_url=body.logo_url,
        description=body.description,
        status=CompanyStatus.verified,
        verified_at=datetime.now(timezone.utc),
    )
    db.add(company)
    await db.flush()
    await _run_verification(company, user, db)

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
    # Backfill a Manufacturer ID for companies created before the registry.
    if not company.manufacturer_id:
        company.manufacturer_id = await _unique_manufacturer_id(db)
        await db.flush()
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
    # Website/email may have changed — re-score.
    await _run_verification(company, user, db)
    return _company_response(company)


@router.post("/verify", response_model=CompanyResponse)
async def recheck_verification(
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    """Manually re-run the automated trust checks."""
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("No company found")

    await _run_verification(company, user, db)
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
        manufacturer_id=company.manufacturer_id,
        legal_name=company.legal_name,
        display_name=company.display_name,
        country_code=company.country_code,
        website=company.website,
        support_email=company.support_email,
        logo_url=company.logo_url,
        description=company.description,
        status=company.status.value,
        trust_score=company.trust_score,
        trust_checks=company.trust_checks,
        trust_checked_at=company.trust_checked_at.isoformat() if company.trust_checked_at else None,
        admin_note=company.admin_note,
        verified_at=company.verified_at.isoformat() if company.verified_at else None,
    )
