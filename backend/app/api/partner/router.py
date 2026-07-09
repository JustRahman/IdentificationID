import hashlib
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.deps import get_db
from app.core.exceptions import Forbidden, NotFound
from app.models.api_key import ApiKey
from app.models.company import Company
from app.models.product import Product, ProductStatus

router = APIRouter(prefix="/v1", tags=["partner"])


async def get_api_company(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: AsyncSession = Depends(get_db),
) -> Company:
    if not x_api_key:
        raise Forbidden("Missing X-API-Key header")

    key_hash = hashlib.sha256(x_api_key.encode()).hexdigest()
    result = await db.execute(
        select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active == True)  # noqa: E712
    )
    api_key = result.scalar_one_or_none()
    if not api_key:
        raise Forbidden("Invalid API key")

    api_key.last_used_at = datetime.now(timezone.utc)
    await db.flush()

    company_result = await db.execute(
        select(Company).where(Company.id == api_key.company_id)
    )
    company = company_result.scalar_one_or_none()
    if not company:
        raise Forbidden("Invalid API key")

    return company


@router.get("/products")
async def list_products(
    status: Optional[ProductStatus] = Query(None),
    company: Company = Depends(get_api_company),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).where(Product.company_id == company.id)
    if status is not None:
        query = query.where(Product.status == status)
    query = query.order_by(Product.created_at.desc())

    result = await db.execute(query)
    products = result.scalars().all()

    return {
        "success": True,
        "data": [
            {
                "identification_id": p.identification_id,
                "name": p.name,
                "category": p.category,
                "brand": p.brand,
                "model": p.model,
                "status": p.status.value,
                "view_count": p.view_count,
                "published_at": p.published_at.isoformat() if p.published_at else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in products
        ],
    }


@router.get("/products/{identification_id}")
async def get_product(
    identification_id: str,
    company: Company = Depends(get_api_company),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product)
        .where(
            Product.identification_id == identification_id.upper(),
            Product.company_id == company.id,
        )
        .options(selectinload(Product.images), selectinload(Product.translations))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFound("Product not found")

    return {
        "success": True,
        "data": {
            "identification_id": product.identification_id,
            "name": product.name,
            "category": product.category,
            "brand": product.brand,
            "model": product.model,
            "country_of_origin": product.country_of_origin,
            "status": product.status.value,
            "view_count": product.view_count,
            "published_at": product.published_at.isoformat() if product.published_at else None,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "images": [
                {
                    "url": img.url,
                    "alt_text": img.alt_text,
                    "display_order": img.display_order,
                }
                for img in product.images
            ],
            "translations": [
                {
                    "lang": t.lang,
                    "short_description": t.short_description,
                    "full_description": t.full_description,
                    "usage_instructions": t.usage_instructions,
                }
                for t in product.translations
            ],
        },
    }


@router.get("/lookup/{identification_id}")
async def lookup_product(
    identification_id: str,
    company: Company = Depends(get_api_company),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product)
        .where(
            Product.identification_id == identification_id.upper(),
            Product.status == ProductStatus.published,
        )
        .options(selectinload(Product.company))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFound("Product not found")

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
            "manufacturer": product.company.display_name if product.company else None,
            "verified": True,
        },
    }


@router.get("/stats")
async def get_stats(
    company: Company = Depends(get_api_company),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            func.count(Product.id),
            func.count(Product.id).filter(Product.status == ProductStatus.published),
            func.coalesce(func.sum(Product.view_count), 0),
        ).where(Product.company_id == company.id)
    )
    total, published, total_views = result.one()

    return {
        "success": True,
        "data": {
            "total_products": total,
            "published": published,
            "total_views": int(total_views),
        },
    }
