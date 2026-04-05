from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.product import Product


class ProductTranslation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "product_translations"
    __table_args__ = (
        UniqueConstraint("product_id", "lang", name="uq_product_translation_lang"),
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
    )
    lang: Mapped[str] = mapped_column(String(5), nullable=False, default="en")
    short_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    full_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    usage_instructions: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    product: Mapped[Product] = relationship(back_populates="translations")
