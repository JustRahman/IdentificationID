from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_admin, get_db
from app.core.exceptions import NotFound, ValidationError
from app.models.audit_log import AuditLog
from app.models.company import Company, CompanyStatus
from app.models.payment import Payment
from app.models.product import Product, ProductStatus
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


# --- Schemas ---

class CompanyReviewRequest(BaseModel):
    action: str  # "approve" or "reject"
    note: str | None = None


class ProductModerationRequest(BaseModel):
    action: str  # "hide" or "unhide"
    reason: str | None = None


# --- Companies ---

@router.get("/companies")
async def list_companies(
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Company).options(selectinload(Company.owner))
    if status:
        query = query.where(Company.status == CompanyStatus(status))
    query = query.order_by(Company.created_at.desc())

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    result = await db.execute(
        query.offset((page - 1) * per_page).limit(per_page)
    )
    companies = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": str(c.id),
                "legal_name": c.legal_name,
                "display_name": c.display_name,
                "country_code": c.country_code,
                "website": c.website,
                "support_email": c.support_email,
                "status": c.status.value,
                "owner_email": c.owner.email if c.owner else None,
                "admin_note": c.admin_note,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "verified_at": c.verified_at.isoformat() if c.verified_at else None,
            }
            for c in companies
        ],
        "meta": {"total": total, "page": page, "per_page": per_page},
    }


@router.post("/companies/{company_id}/review")
async def review_company(
    company_id: str,
    body: CompanyReviewRequest,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Company not found")

    if body.action == "approve":
        company.status = CompanyStatus.verified
        company.verified_at = datetime.now(timezone.utc)
        company.admin_note = body.note
    elif body.action == "reject":
        company.status = CompanyStatus.rejected
        company.admin_note = body.note or "Rejected by admin"
    else:
        raise ValidationError("Action must be 'approve' or 'reject'")

    log = AuditLog(
        actor_user_id=admin.id,
        action=f"company.{body.action}",
        metadata_={"company_id": str(company.id), "note": body.note},
    )
    db.add(log)
    await db.flush()

    return {
        "success": True,
        "data": {
            "id": str(company.id),
            "status": company.status.value,
            "admin_note": company.admin_note,
        },
    }


# --- Products ---

@router.get("/products")
async def list_all_products(
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).options(selectinload(Product.company))
    if status:
        query = query.where(Product.status == ProductStatus(status))
    query = query.order_by(Product.created_at.desc())

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    result = await db.execute(
        query.offset((page - 1) * per_page).limit(per_page)
    )
    products = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": str(p.id),
                "identification_id": p.identification_id,
                "name": p.name,
                "category": p.category,
                "brand": p.brand,
                "model": p.model,
                "country_of_origin": p.country_of_origin,
                "status": p.status.value,
                "company_name": p.company.display_name if p.company else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
                "published_at": p.published_at.isoformat() if p.published_at else None,
            }
            for p in products
        ],
        "meta": {"total": total, "page": page, "per_page": per_page},
    }


@router.post("/products/{product_id}/moderate")
async def moderate_product(
    product_id: str,
    body: ProductModerationRequest,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise NotFound("Product not found")

    if body.action == "hide":
        product.status = ProductStatus.hidden
    elif body.action == "unhide":
        product.status = ProductStatus.draft
    else:
        raise ValidationError("Action must be 'hide' or 'unhide'")

    log = AuditLog(
        actor_user_id=admin.id,
        action=f"product.{body.action}",
        metadata_={"product_id": str(product.id), "reason": body.reason},
    )
    db.add(log)
    await db.flush()

    return {
        "success": True,
        "data": {
            "id": str(product.id),
            "status": product.status.value,
        },
    }


# --- Payments ---

@router.get("/payments")
async def list_payments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Payment)
        .options(selectinload(Payment.company))
        .order_by(Payment.created_at.desc())
    )

    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    result = await db.execute(
        query.offset((page - 1) * per_page).limit(per_page)
    )
    payments = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "id": str(p.id),
                "company_name": p.company.display_name if p.company else None,
                "amount_cents": p.amount_cents,
                "currency": p.currency,
                "status": p.status.value,
                "stripe_payment_intent_id": p.stripe_payment_intent_id,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ],
        "meta": {"total": total, "page": page, "per_page": per_page},
    }


# --- Stats ---

@router.get("/stats")
async def admin_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    companies_total = (await db.execute(select(func.count(Company.id)))).scalar() or 0
    companies_pending = (
        await db.execute(
            select(func.count(Company.id)).where(Company.status == CompanyStatus.pending)
        )
    ).scalar() or 0
    products_total = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    products_published = (
        await db.execute(
            select(func.count(Product.id)).where(Product.status == ProductStatus.published)
        )
    ).scalar() or 0
    users_total = (await db.execute(select(func.count(User.id)))).scalar() or 0

    return {
        "success": True,
        "data": {
            "companies_total": companies_total,
            "companies_pending": companies_pending,
            "products_total": products_total,
            "products_published": products_published,
            "users_total": users_total,
        },
    }
