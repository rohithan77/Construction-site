from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, Text
from sqlalchemy import JSON as JSONB
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class StyleProfile(TimestampMixin, Base):
    __tablename__ = "style_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    formality_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    avg_sentence_length: Mapped[str | None] = mapped_column(Text, nullable=True)
    emoji_usage: Mapped[str | None] = mapped_column(Text, nullable=True)
    humor_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    vocabulary_complexity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    signature_phrases: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    phrases_to_avoid: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    typical_openings: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    typical_closings: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    paragraph_structure: Mapped[str | None] = mapped_column(Text, nullable=True)
    characteristic_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    corpus_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    refreshed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
