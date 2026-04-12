import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_db, get_verified_manufacturer
from app.core.exceptions import NotFound, ValidationError
from app.models.company import Company
from app.models.product import Product
from app.models.product_image import ProductImage
from app.models.user import User
from app.services import storage

router = APIRouter(prefix="/manufacturer", tags=["images"])

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


async def _get_owned_product(product_id: str, user: User, db: AsyncSession) -> Product:
    result = await db.execute(select(Company).where(Company.owner_user_id == user.id))
    company = result.scalar_one_or_none()
    if not company:
        raise NotFound("No company found")
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.company_id == company.id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise NotFound("Product not found")
    return product


@router.post("/products/{product_id}/images")
async def upload_image(
    product_id: str,
    file: UploadFile = File(...),
    alt_text: str = Form(None),
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_owned_product(product_id, user, db)

    if file.content_type not in ALLOWED_TYPES:
        raise ValidationError("Only JPEG, PNG, and WebP images are allowed")

    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE:
        raise ValidationError("Image size exceeds 10MB limit")

    # Determine display order
    result = await db.execute(
        select(ProductImage).where(ProductImage.product_id == product.id)
    )
    existing = result.scalars().all()
    if len(existing) >= 5:
        raise ValidationError("Maximum 5 images per product")
    display_order = len(existing)

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    file_key = f"images/{product.id}/{uuid.uuid4()}.{ext}"

    if not storage.is_configured():
        raise ValidationError("Storage is not configured")

    url = storage.upload_file(file_key, content, file.content_type or "image/jpeg")

    image = ProductImage(
        product_id=product.id,
        file_key=file_key,
        url=url,
        display_order=display_order,
        alt_text=alt_text,
    )
    db.add(image)
    await db.commit()
    await db.refresh(image)

    return {
        "id": str(image.id),
        "url": image.url,
        "display_order": image.display_order,
        "alt_text": image.alt_text,
    }


@router.get("/products/{product_id}/images")
async def list_images(
    product_id: str,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_owned_product(product_id, user, db)
    result = await db.execute(
        select(ProductImage)
        .where(ProductImage.product_id == product.id)
        .order_by(ProductImage.display_order)
    )
    images = result.scalars().all()
    return [
        {"id": str(img.id), "url": img.url, "display_order": img.display_order, "alt_text": img.alt_text}
        for img in images
    ]


@router.delete("/images/{image_id}")
async def delete_image(
    image_id: str,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ProductImage).where(ProductImage.id == image_id))
    image = result.scalar_one_or_none()
    if not image:
        raise NotFound("Image not found")

    # Verify ownership
    await _get_owned_product(str(image.product_id), user, db)

    await db.delete(image)
    await db.commit()
    return {"success": True}
