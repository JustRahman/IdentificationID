from __future__ import annotations

from sqlalchemy import String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDMixin


class UiTranslation(Base, UUIDMixin, TimestampMixin):
    """Server-side cache of machine-translated UI strings.

    Each unique (source text, target language) pair is translated once and
    reused for every visitor — so the external translation API is hit at most
    once per phrase, not once per page view.
    """

    __tablename__ = "ui_translations"

    source_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    lang: Mapped[str] = mapped_column(String(8), nullable=False, index=True)
    source_text: Mapped[str] = mapped_column(Text, nullable=False)
    translated_text: Mapped[str] = mapped_column(Text, nullable=False)

    __table_args__ = (
        UniqueConstraint("source_hash", "lang", name="uq_ui_translation_hash_lang"),
    )
