from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.billing.router import PLANS
from app.api.webhooks.service import dispatch_event
from app.api.products.schemas import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    TranslationCreate,
    TranslationResponse,
)
from app.core.deps import get_db, get_verified_manufacturer
from app.core.exceptions import Forbidden, NotFound, ValidationError
from app.models.company import Company, CompanyStatus
from app.models.product import Product, ProductStatus
from app.models.product_document import ProductDocument, DocType
from app.models.product_translation import ProductTranslation
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.user import User
from app.services.id_generator import generate_identification_id
from app.services import audit
from app.services.membership import require_membership
from app.services.regulated import is_regulated

router = APIRouter(prefix="/manufacturer/products", tags=["products"])

PRODUCT_FIELDS = ("name", "category", "brand", "model", "country_of_origin", "status")
TRANSLATION_FIELDS = ("short_description", "full_description", "usage_instructions")


async def _get_user_company(user: User, db: AsyncSession) -> Company:
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("Create a company first")
    return company


@router.get("", response_model=list[ProductResponse])
async def list_products(
    status: str | None = Query(None),
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    company = await _get_user_company(user, db)
    query = select(Product).where(Product.company_id == company.id)
    if status:
        query = query.where(Product.status == status)
    query = query.order_by(Product.created_at.desc())
    result = await db.execute(query)
    return [_product_response(p) for p in result.scalars().all()]


@router.post("", response_model=ProductResponse)
async def create_product(
    body: ProductCreate,
    request: Request,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    company = await _get_user_company(user, db)
    await require_membership(company.id, db)

    # Enforce the product limit for the company's plan (membership alone = 3).
    sub_result = await db.execute(
        select(Subscription).where(Subscription.company_id == company.id)
    )
    subscription = sub_result.scalar_one_or_none()
    if subscription and subscription.status == SubscriptionStatus.active:
        plan_key = subscription.plan if subscription.plan in PLANS else "membership"
    else:
        plan_key = "membership"
    product_limit = PLANS[plan_key]["product_limit"]
    if product_limit != -1:
        count_result = await db.execute(
            select(func.count()).select_from(Product).where(Product.company_id == company.id)
        )
        current = count_result.scalar() or 0
        if current >= product_limit:
            raise ValidationError(
                f"Product limit reached for your plan ({product_limit} products). "
                "Upgrade your plan to add more."
            )

    # Generate unique ID
    for _ in range(10):
        iid = generate_identification_id()
        existing = await db.execute(
            select(Product).where(Product.identification_id == iid)
        )
        if not existing.scalar_one_or_none():
            break
    else:
        raise ValidationError("Failed to generate unique ID, try again")

    product = Product(
        company_id=company.id,
        identification_id=iid,
        name=body.name,
        category=body.category,
        brand=body.brand,
        model=body.model,
        country_of_origin=body.country_of_origin,
    )
    db.add(product)
    await db.flush()
    await audit.record(db, request, user.id, "product.create", "product", product.id,
                       new=audit.snapshot(product, PRODUCT_FIELDS + ("identification_id",)))
    return _product_response(product)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_owned_product(product_id, user, db)
    return _product_response(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    body: ProductUpdate,
    request: Request,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_owned_product(product_id, user, db)
    await require_membership(product.company_id, db)

    before = audit.snapshot(product, PRODUCT_FIELDS)
    for field, value in body.model_dump(exclude_unset=True).items():
        if field == "status" and value:
            # Manufacturers may only unpublish. Publishing goes through
            # /publish (checks + regulated review); hidden is admin-only.
            if value != ProductStatus.draft.value or product.status not in (
                ProductStatus.published, ProductStatus.pending_review
            ):
                raise ValidationError("Status can only be changed back to draft")
            product.status = ProductStatus.draft
        elif field != "status":
            setattr(product, field, value)

    # Moving a live product into a regulated category sends it to review.
    if (
        product.status == ProductStatus.published
        and is_regulated(product.category)
        and not is_regulated(before["category"])
    ):
        product.status = ProductStatus.pending_review

    await db.flush()
    old, new = audit.diff(before, audit.snapshot(product, PRODUCT_FIELDS))
    if new:
        await audit.record(db, request, user.id, "product.update", "product", product.id, old, new)
    await dispatch_event(db, product.company_id, "product.updated", {
        "identification_id": product.identification_id,
        "name": product.name,
        "status": product.status.value,
    })
    return _product_response(product)


@router.post("/{product_id}/publish", response_model=ProductResponse)
async def publish_product(
    product_id: str,
    request: Request,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_owned_product(product_id, user, db)
    await require_membership(product.company_id, db)

    errors = []
    if not product.name:
        errors.append("Product name is required")

    # Check for EN translation
    tr = await db.execute(
        select(ProductTranslation).where(
            ProductTranslation.product_id == product.id,
            ProductTranslation.lang == "en",
        )
    )
    if not tr.scalar_one_or_none():
        errors.append("English description is required")

    # Check for manual document
    doc = await db.execute(
        select(ProductDocument).where(
            ProductDocument.product_id == product.id,
            ProductDocument.doc_type == DocType.manual,
        )
    )
    if not doc.scalar_one_or_none():
        errors.append("At least one manual document is required")

    if errors:
        raise ValidationError("Cannot publish product", details={"errors": errors})

    before = audit.snapshot(product, ("status",))
    # Regulated categories wait for an admin. Already-live products stay live.
    if is_regulated(product.category) and product.status != ProductStatus.published:
        product.status = ProductStatus.pending_review
        await db.flush()
        await audit.record(db, request, user.id, "product.submit_for_review", "product",
                           product.id, before, audit.snapshot(product, ("status",)))
        return _product_response(product)

    product.status = ProductStatus.published
    product.published_at = datetime.now(timezone.utc)
    await db.flush()
    await audit.record(db, request, user.id, "product.publish", "product", product.id,
                       before, audit.snapshot(product, ("status",)))
    await dispatch_event(db, product.company_id, "product.published", {
        "identification_id": product.identification_id,
        "name": product.name,
        "status": product.status.value,
    })
    return _product_response(product)


@router.post("/{product_id}/translations", response_model=TranslationResponse)
async def upsert_translation(
    product_id: str,
    body: TranslationCreate,
    request: Request,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_owned_product(product_id, user, db)
    await require_membership(product.company_id, db)

    result = await db.execute(
        select(ProductTranslation).where(
            ProductTranslation.product_id == product.id,
            ProductTranslation.lang == body.lang,
        )
    )
    translation = result.scalar_one_or_none()
    before = audit.snapshot(translation, TRANSLATION_FIELDS) if translation else {}

    if translation:
        for field, value in body.model_dump(exclude_unset=True).items():
            setattr(translation, field, value)
    else:
        translation = ProductTranslation(
            product_id=product.id,
            lang=body.lang,
            short_description=body.short_description,
            full_description=body.full_description,
            usage_instructions=body.usage_instructions,
        )
        db.add(translation)

    await db.flush()
    old, new = audit.diff(before, audit.snapshot(translation, TRANSLATION_FIELDS))
    if new:
        await audit.record(db, request, user.id, f"product.translation.{body.lang}", "product",
                           product.id, old, new)
    return TranslationResponse(
        id=str(translation.id),
        product_id=str(translation.product_id),
        lang=translation.lang,
        short_description=translation.short_description,
        full_description=translation.full_description,
        usage_instructions=translation.usage_instructions,
    )


@router.get("/{product_id}/translations", response_model=list[TranslationResponse])
async def list_translations(
    product_id: str,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_owned_product(product_id, user, db)
    result = await db.execute(
        select(ProductTranslation).where(ProductTranslation.product_id == product.id)
    )
    return [
        TranslationResponse(
            id=str(t.id),
            product_id=str(t.product_id),
            lang=t.lang,
            short_description=t.short_description,
            full_description=t.full_description,
            usage_instructions=t.usage_instructions,
        )
        for t in result.scalars().all()
    ]


async def _get_owned_product(
    product_id: str, user: User, db: AsyncSession
) -> Product:
    company = await _get_user_company(user, db)
    result = await db.execute(
        select(Product).where(
            Product.id == product_id, Product.company_id == company.id
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFound("Product not found")
    return product


def _product_response(product: Product) -> ProductResponse:
    return ProductResponse(
        id=str(product.id),
        identification_id=product.identification_id,
        name=product.name,
        category=product.category,
        brand=product.brand,
        model=product.model,
        country_of_origin=product.country_of_origin,
        status=product.status.value,
        published_at=product.published_at.isoformat() if product.published_at else None,
        company_id=str(product.company_id),
        view_count=product.view_count or 0,
    )
