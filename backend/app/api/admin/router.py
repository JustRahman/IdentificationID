from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_current_admin, get_db
from app.core.exceptions import NotFound, ValidationError
from app.models.audit_log import AuditLog
from app.models.content_report import ContentReport, ReportStatus
from app.models.company import Company, CompanyStatus
from app.models.payment import Payment
from app.models.product import Product, ProductStatus
from app.models.user import User
from app.services import audit

router = APIRouter(prefix="/admin", tags=["admin"])


# --- Schemas ---

class CompanyReviewRequest(BaseModel):
    action: str  # "approve" or "reject"
    note: str | None = None


class ProductModerationRequest(BaseModel):
    action: str  # "hide", "unhide", "approve" (pending_review -> published), "reject"
    reason: str | None = None


class ReportResolveRequest(BaseModel):
    note: str | None = None


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
    request: Request,
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

    await audit.record(db, request, admin.id, f"admin.company.{body.action}", "company", company.id,
                       new={"status": company.status.value, "note": body.note})
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
    request: Request,
    body: ProductModerationRequest,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise NotFound("Product not found")

    old_status = product.status.value
    if body.action == "hide":
        product.status = ProductStatus.hidden
    elif body.action == "unhide":
        product.status = ProductStatus.draft
    elif body.action in ("approve", "reject"):
        if product.status != ProductStatus.pending_review:
            raise ValidationError("Only products pending review can be approved or rejected")
        if body.action == "approve":
            product.status = ProductStatus.published
            product.published_at = datetime.now(timezone.utc)
        else:
            product.status = ProductStatus.draft
    else:
        raise ValidationError("Action must be 'hide', 'unhide', 'approve' or 'reject'")

    await audit.record(db, request, admin.id, f"admin.product.{body.action}", "product", product.id,
                       old={"status": old_status},
                       new={"status": product.status.value, "reason": body.reason})
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


# --- Reports ---

@router.get("/reports")
async def list_reports(
    status: str | None = Query("open"),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(ContentReport).order_by(ContentReport.created_at.desc()).limit(200)
    if status:
        query = query.where(ContentReport.status == ReportStatus(status))
    reports = (await db.execute(query)).scalars().all()
    return {
        "success": True,
        "data": [
            {
                "id": str(r.id),
                "target_type": r.target_type,
                "target_id": r.target_id,
                "reason": r.reason.value,
                "message": r.message,
                "reporter_email": r.reporter_email,
                "status": r.status.value,
                "admin_note": r.admin_note,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "resolved_at": r.resolved_at.isoformat() if r.resolved_at else None,
            }
            for r in reports
        ],
    }


@router.post("/reports/{report_id}/resolve")
async def resolve_report(
    report_id: str,
    body: ReportResolveRequest,
    request: Request,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    report = (await db.execute(select(ContentReport).where(ContentReport.id == report_id))).scalar_one_or_none()
    if not report:
        raise NotFound("Report not found")
    report.status = ReportStatus.resolved
    report.admin_note = body.note
    report.resolved_at = datetime.now(timezone.utc)
    await audit.record(db, request, admin.id, "admin.report.resolve", report.target_type,
                       report.target_id, new={"report_id": str(report.id), "note": body.note})
    await db.flush()
    return {"success": True, "data": {"id": str(report.id), "status": report.status.value}}


# --- Audit trail (read-only) ---

@router.get("/audit-logs")
async def list_audit_logs(
    entity_type: str | None = Query(None),
    entity_id: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(AuditLog, User.email)
        .outerjoin(User, User.id == AuditLog.actor_user_id)
        .order_by(AuditLog.created_at.desc())
    )
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    if entity_id:
        query = query.where(AuditLog.entity_id == entity_id)
    rows = (await db.execute(query.offset((page - 1) * per_page).limit(per_page))).all()
    return {
        "success": True,
        "data": [
            {
                "id": str(log.id),
                "created_at": log.created_at.isoformat() if log.created_at else None,
                "actor_email": email,
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "old_values": log.old_values,
                "new_values": log.new_values,
                "ip_address": log.ip_address,
                "metadata": log.metadata_,
            }
            for log, email in rows
        ],
        "meta": {"page": page, "per_page": per_page},
    }
