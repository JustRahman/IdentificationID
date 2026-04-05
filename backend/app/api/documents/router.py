import hashlib
import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.documents.schemas import DocumentResponse, DocumentVersionResponse
from app.core.deps import get_db, get_verified_manufacturer
from app.core.exceptions import NotFound, ValidationError
from app.models.company import Company
from app.models.product import Product
from app.models.product_document import DocType, ProductDocument
from app.models.product_document_version import ProductDocumentVersion
from app.models.user import User
from app.services import storage

router = APIRouter(prefix="/manufacturer", tags=["documents"])

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


async def _get_owned_product(product_id: str, user: User, db: AsyncSession) -> Product:
    result = await db.execute(
        select(Company).where(Company.owner_user_id == user.id)
    )
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


@router.post("/products/{product_id}/documents", response_model=DocumentResponse)
async def upload_document(
    product_id: str,
    file: UploadFile = File(...),
    doc_type: str = Form("manual"),
    title: str = Form(None),
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_owned_product(product_id, user, db)

    if file.content_type != "application/pdf":
        raise ValidationError("Only PDF files are allowed")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise ValidationError("File size exceeds 20MB limit")

    sha256 = hashlib.sha256(content).hexdigest()
    file_key = f"documents/{product.id}/{uuid.uuid4()}.pdf"

    # Upload to Supabase Storage if configured
    file_url = None
    if storage.is_configured():
        file_url = storage.upload_file(file_key, content, "application/pdf")

    # Create document
    document = ProductDocument(
        product_id=product.id,
        doc_type=DocType(doc_type),
        title=title,
    )
    db.add(document)
    await db.flush()

    # Create version
    version = ProductDocumentVersion(
        document_id=document.id,
        version=1,
        file_key=file_key,
        file_name=file.filename or "document.pdf",
        size_bytes=len(content),
        sha256=sha256,
        uploaded_by=user.id,
    )
    db.add(version)
    await db.flush()

    document.current_version_id = version.id
    await db.flush()

    return DocumentResponse(
        id=str(document.id),
        product_id=str(document.product_id),
        doc_type=document.doc_type.value,
        title=document.title,
        current_version_id=str(version.id),
    )


@router.get("/products/{product_id}/documents", response_model=list[DocumentResponse])
async def list_documents(
    product_id: str,
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    product = await _get_owned_product(product_id, user, db)
    result = await db.execute(
        select(ProductDocument).where(ProductDocument.product_id == product.id)
    )
    return [
        DocumentResponse(
            id=str(d.id),
            product_id=str(d.product_id),
            doc_type=d.doc_type.value,
            title=d.title,
            current_version_id=str(d.current_version_id) if d.current_version_id else None,
        )
        for d in result.scalars().all()
    ]


@router.post("/documents/{doc_id}/versions", response_model=DocumentVersionResponse)
async def upload_new_version(
    doc_id: str,
    file: UploadFile = File(...),
    user: User = Depends(get_verified_manufacturer),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProductDocument).where(ProductDocument.id == doc_id)
    )
    document = result.scalar_one_or_none()
    if not document:
        raise NotFound("Document not found")

    # Verify ownership
    await _get_owned_product(str(document.product_id), user, db)

    if file.content_type != "application/pdf":
        raise ValidationError("Only PDF files are allowed")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise ValidationError("File size exceeds 20MB limit")

    # Get latest version number
    latest = await db.execute(
        select(ProductDocumentVersion)
        .where(ProductDocumentVersion.document_id == document.id)
        .order_by(ProductDocumentVersion.version.desc())
        .limit(1)
    )
    latest_version = latest.scalar_one_or_none()
    new_version_num = (latest_version.version + 1) if latest_version else 1

    sha256 = hashlib.sha256(content).hexdigest()
    file_key = f"documents/{document.product_id}/{uuid.uuid4()}.pdf"

    if storage.is_configured():
        storage.upload_file(file_key, content, "application/pdf")

    version = ProductDocumentVersion(
        document_id=document.id,
        version=new_version_num,
        file_key=file_key,
        file_name=file.filename or "document.pdf",
        size_bytes=len(content),
        sha256=sha256,
        uploaded_by=user.id,
    )
    db.add(version)
    await db.flush()

    document.current_version_id = version.id
    await db.flush()

    return DocumentVersionResponse(
        id=str(version.id),
        document_id=str(version.document_id),
        version=version.version,
        file_name=version.file_name,
        size_bytes=version.size_bytes,
        created_at=version.created_at.isoformat(),
    )
