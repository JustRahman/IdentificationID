from datetime import datetime

from sqlalchemy import DateTime, Integer, LargeBinary, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, UUIDMixin


class StoredFile(Base, UUIDMixin):
    """File bytes kept in Postgres when no external object storage is configured.

    Used for product images and PDF documents. Keys are random (uuid-based), so a
    file can only be fetched by someone who already has its link.
    """

    __tablename__ = "stored_files"

    key: Mapped[str] = mapped_column(String(512), unique=True, index=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=func.now(), server_default=func.now()
    )
