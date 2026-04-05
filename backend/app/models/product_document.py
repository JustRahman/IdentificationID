from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.product import Product
    from app.models.product_document_version import ProductDocumentVersion


class DocType(str, enum.Enum):
    manual = "manual"
    warranty = "warranty"
    certificate = "certificate"
    other = "other"


class ProductDocument(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "product_documents"

    product_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    doc_type: Mapped[DocType] = mapped_column(Enum(DocType), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    current_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("product_document_versions.id", use_alter=True),
        nullable=True,
    )

    product: Mapped[Product] = relationship(back_populates="documents")
    versions: Mapped[list[ProductDocumentVersion]] = relationship(
        back_populates="document",
        foreign_keys="ProductDocumentVersion.document_id",
    )
