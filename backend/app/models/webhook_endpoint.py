from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, Boolean, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.company import Company

# Events a webhook can subscribe to (product.viewed is intentionally excluded —
# it is high-volume and would flood endpoints).
WEBHOOK_EVENTS = ("product.published", "product.updated", "document.uploaded")


class WebhookEndpoint(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "webhook_endpoints"

    company_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), ForeignKey("companies.id"), nullable=False
    )
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    events: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    secret: Mapped[str] = mapped_column(String(64), nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="true"
    )

    company: Mapped[Company] = relationship()
