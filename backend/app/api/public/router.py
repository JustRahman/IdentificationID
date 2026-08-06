from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db
from app.core.exceptions import NotFound
from app.models.company import Company, CompanyStatus
from app.models.product import Product, ProductStatus
from app.models.product_document import ProductDocument
from app.models.product_document_version import ProductDocumentVersion
from app.models.product_image import ProductImage
from app.models.product_translation import ProductTranslation
from app.services import storage

router = APIRouter(prefix="/public", tags=["public"])


def _safe_signed_url(file_key: str) -> str | None:
    """Best-effort download URL; None if storage is unconfigured or fails."""
    # Seeded/external docs may store a full URL directly — serve it as-is.
    if file_key.startswith("http"):
        return file_key
    if not storage.is_configured():
        return None
    try:
        return storage.get_signed_url(file_key, expires_in=3600)
    except Exception:
        return None


@router.get("/products/{identification_id}")
async def lookup_product(
    identification_id: str,
    lang: str = Query("en"),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product)
        .where(
            Product.identification_id == identification_id.upper(),
            Product.status == ProductStatus.published,
        )
        .options(
            selectinload(Product.company),
            selectinload(Product.translations),
            selectinload(Product.documents).selectinload(ProductDocument.versions),
            selectinload(Product.images),
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFound("Product not found")

    # Count this view (a scan / public page open).
    product.view_count = (product.view_count or 0) + 1
    await db.commit()

    # Pick requested language, fall back to English
    translation = None
    en_translation = None
    for t in product.translations:
        if t.lang == lang:
            translation = t
        if t.lang == "en":
            en_translation = t
    translation = translation or en_translation

    return {
        "success": True,
        "data": {
            "identification_id": product.identification_id,
            "name": product.name,
            "category": product.category,
            "brand": product.brand,
            "model": product.model,
            "country_of_origin": product.country_of_origin,
            "published_at": product.published_at.isoformat() if product.published_at else None,
            "company": {
                "manufacturer_id": product.company.manufacturer_id,
                "display_name": product.company.display_name,
                "country_code": product.company.country_code,
                "website": product.company.website,
                "support_email": product.company.support_email,
                "logo_url": product.company.logo_url,
                "description": product.company.description,
            },
            "translation": {
                "lang": translation.lang,
                "short_description": translation.short_description,
                "full_description": translation.full_description,
                "usage_instructions": translation.usage_instructions,
            } if translation else None,
            "translations": [
                {
                    "lang": t.lang,
                    "short_description": t.short_description,
                    "full_description": t.full_description,
                    "usage_instructions": t.usage_instructions,
                }
                for t in product.translations
            ],
            "images": [
                {
                    "url": img.url,
                    "alt_text": img.alt_text,
                    "display_order": img.display_order,
                }
                for img in product.images
            ],
            "documents": [
                {
                    "id": str(doc.id),
                    "doc_type": doc.doc_type.value,
                    "title": doc.title,
                    "versions": [
                        {
                            "version": v.version,
                            "file_name": v.file_name,
                            "size_bytes": v.size_bytes,
                            "created_at": v.created_at.isoformat(),
                            "file_url": _safe_signed_url(v.file_key),
                        }
                        for v in sorted(doc.versions, key=lambda v: v.version, reverse=True)
                    ],
                }
                for doc in product.documents
            ],
        },
    }


@router.get("/search")
async def search_products(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    like = f"%{q}%"
    base = (
        select(Product)
        .join(Product.company)
        .where(Product.status == ProductStatus.published)
    )
    search_filter = (
        Product.name.ilike(like)
        | Product.brand.ilike(like)
        | Product.category.ilike(like)
        | Company.display_name.ilike(like)
    )
    query = base.where(search_filter).order_by(Product.published_at.desc())

    count_q = select(func.count()).select_from(
        base.where(search_filter).subquery()
    )
    total = (await db.execute(count_q)).scalar() or 0

    result = await db.execute(
        query.options(selectinload(Product.company), selectinload(Product.images))
        .offset((page - 1) * per_page)
        .limit(per_page)
    )
    products = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "identification_id": p.identification_id,
                "name": p.name,
                "category": p.category,
                "brand": p.brand,
                "manufacturer": p.company.display_name,
                "cover_image": p.images[0].url if p.images else None,
            }
            for p in products
        ],
        "meta": {"total": total, "page": page, "per_page": per_page},
    }


@router.get("/featured")
async def featured_products(
    limit: int = Query(8, ge=1, le=24),
    db: AsyncSession = Depends(get_db),
):
    """Recently published products for homepage recommendations."""
    result = await db.execute(
        select(Product)
        .join(Product.company)
        .where(Product.status == ProductStatus.published)
        .options(selectinload(Product.company), selectinload(Product.images))
        .order_by(Product.published_at.desc())
        .limit(limit)
    )
    products = result.scalars().all()
    return {
        "success": True,
        "data": [
            {
                "identification_id": p.identification_id,
                "name": p.name,
                "category": p.category,
                "brand": p.brand,
                "manufacturer": p.company.display_name,
                "cover_image": p.images[0].url if p.images else None,
            }
            for p in products
        ],
    }


@router.get("/companies")
async def list_companies(
    db: AsyncSession = Depends(get_db),
):
    """Verified manufacturers for the search recommendations page."""
    result = await db.execute(
        select(Company, func.count(Product.id).label("product_count"))
        .outerjoin(Product, (Product.company_id == Company.id) & (Product.status == ProductStatus.published))
        .where(Company.status == CompanyStatus.verified)
        .group_by(Company.id)
        .order_by(func.count(Product.id).desc())
    )
    rows = result.all()
    return {
        "success": True,
        "data": [
            {
                "display_name": company.display_name,
                "country_code": company.country_code,
                "website": company.website,
                "product_count": count,
            }
            for company, count in rows
        ],
    }


@router.get("/manufacturers/{manufacturer_id}")
async def lookup_manufacturer(
    manufacturer_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Public manufacturer registry profile (MID-XXXX-XXXX) + published products."""
    result = await db.execute(
        select(Company).where(Company.manufacturer_id == manufacturer_id.upper())
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Manufacturer not found")

    prod_result = await db.execute(
        select(Product)
        .where(
            Product.company_id == company.id,
            Product.status == ProductStatus.published,
        )
        .options(selectinload(Product.images))
        .order_by(Product.published_at.desc())
    )
    products = prod_result.scalars().all()

    # The Manufacturer ID is permanent, but the full public profile is part of
    # the Registry Membership. Without it the page shows a minimal "Inactive"
    # record so existing links and QR codes never break.
    active = bool(company.registry_active)

    return {
        "success": True,
        "data": {
            "manufacturer_id": company.manufacturer_id,
            "registry_status": "active" if active else "inactive",
            "display_name": company.display_name,
            "legal_name": company.legal_name if active else None,
            "country_code": company.country_code,
            "website": company.website if active else None,
            "support_email": company.support_email if active else None,
            "logo_url": company.logo_url if active else None,
            "description": company.description if active else None,
            "registered_at": company.created_at.isoformat() if company.created_at else None,
            "product_count": len(products),
            "products": [] if not active else [
                {
                    "identification_id": p.identification_id,
                    "name": p.name,
                    "category": p.category,
                    "brand": p.brand,
                    "cover_image": p.images[0].url if p.images else None,
                }
                for p in products
            ],
        },
    }
