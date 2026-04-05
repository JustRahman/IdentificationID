from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db
from app.core.exceptions import NotFound
from app.models.company import Company
from app.models.product import Product, ProductStatus
from app.models.product_document import ProductDocument
from app.models.product_document_version import ProductDocumentVersion
from app.models.product_translation import ProductTranslation

router = APIRouter(prefix="/public", tags=["public"])


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
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFound("Product not found")

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
                "display_name": product.company.display_name,
                "country_code": product.company.country_code,
                "website": product.company.website,
                "support_email": product.company.support_email,
            },
            "translation": {
                "lang": translation.lang,
                "short_description": translation.short_description,
                "full_description": translation.full_description,
                "usage_instructions": translation.usage_instructions,
            } if translation else None,
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
    base = select(Product).where(Product.status == ProductStatus.published)
    search_filter = Product.name.ilike(f"%{q}%")
    query = base.where(search_filter).order_by(Product.published_at.desc())

    count_q = select(func.count()).select_from(
        base.where(search_filter).subquery()
    )
    total = (await db.execute(count_q)).scalar() or 0

    result = await db.execute(
        query.offset((page - 1) * per_page).limit(per_page)
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
            }
            for p in products
        ],
        "meta": {"total": total, "page": page, "per_page": per_page},
    }
