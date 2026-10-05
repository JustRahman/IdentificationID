from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.companies.schemas import CompanyCreate, CompanyResponse, CompanyUpdate
from app.core.deps import get_db, get_verified_manufacturer
from app.core.exceptions import Conflict, NotFound, ValidationError
from app.api.public.router import manufacturer_profile
from app.models.company import Company, CompanyStatus
from app.models.product import Product, ProductStatus
from app.models.user import User
from app.services.manufacturer_ids import ensure_manufacturer_id
from app.services.registry_review import require_not_under_review
from app.services import audit
from app.services.membership import Membership, get_membership
from app.services.verification import evaluate_company

router = APIRouter(prefix="/manufacturer/company", tags=["companies"])

COMPANY_FIELDS = (
    "legal_name", "display_name", "country_code", "website", "support_email",
    "contact_phone", "brands", "logo_url", "description",
)


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


@router.post("", response_model=CompanyResponse)
async def create_company(
    body: CompanyCreate,
    request: Request,
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
        # No Manufacturer ID yet: it is issued only after the membership is paid.
        manufacturer_id=None,
        legal_name=body.legal_name,
        display_name=body.display_name,
        country_code=body.country_code,
        website=body.website,
        support_email=body.support_email,
        logo_url=body.logo_url,
        description=body.description,
        contact_phone=body.contact_phone,
        brands=body.brands,
        status=CompanyStatus.verified,
        verified_at=datetime.now(timezone.utc),
    )
    db.add(company)
    await db.flush()
    await audit.record(db, request, user.id, "company.create", "company", company.id,
                       new=audit.snapshot(company, COMPANY_FIELDS + ("manufacturer_id",)))
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
    # Members who paid before MIDs were issued at payment time still get one.
    if not company.manufacturer_id and (await get_membership(company, db)).ever_active:
        await ensure_manufacturer_id(company, db)
    # Score companies that predate automated verification, so existing
    # manufacturers get checked without having to do anything.
    if company.trust_score is None:
        await _run_verification(company, user, db)
    return _company_response(company)


@router.put("", response_model=CompanyResponse)
async def update_company(
    body: CompanyUpdate,
    request: Request,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("No company found")

    await require_not_under_review("manufacturer", company.manufacturer_id, db)
    before = audit.snapshot(company, COMPANY_FIELDS)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    old, new = audit.diff(before, audit.snapshot(company, COMPANY_FIELDS))
    if new:
        await audit.record(db, request, user.id, "company.update", "company", company.id, old, new)

    # If rejected, allow resubmission by resetting to pending
    if company.status == CompanyStatus.rejected:
        company.status = CompanyStatus.pending
        company.admin_note = None

    await db.flush()
    # Website/email may have changed - re-score.
    await _run_verification(company, user, db)
    return _company_response(company)


@router.get("/preview")
async def preview_public_profile(
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    """The public manufacturer profile exactly as it will look once active."""
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("No company found")

    prod_result = await db.execute(
        select(Product)
        .where(Product.company_id == company.id, Product.status == ProductStatus.published)
        .options(selectinload(Product.images))
        .order_by(Product.published_at.desc())
    )
    preview = Membership(active=True, included_in_plan=False, paid_until=None, last_active=None)
    return {
        "success": True,
        "data": manufacturer_profile(company, preview, prod_result.scalars().all()),
    }


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
        contact_phone=company.contact_phone,
        brands=company.brands or [],
        status=company.status.value,
        trust_score=company.trust_score,
        trust_checks=company.trust_checks,
        trust_checked_at=company.trust_checked_at.isoformat() if company.trust_checked_at else None,
        admin_note=company.admin_note,
        verified_at=company.verified_at.isoformat() if company.verified_at else None,
    )
