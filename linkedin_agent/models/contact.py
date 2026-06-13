from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, CheckConstraint, DateTime, Float, Integer, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class Contact(TimestampMixin, Base):
    __tablename__ = "contacts"
    __table_args__ = (
        CheckConstraint(
            "connection_status IN ("
            "'none', 'request_pending', 'connected', 'message_pending_approval',"
            " 'messaged', 'replied', 'ignored', 'do_not_contact')",
            name="ck_contact_connection_status",
        ),
        CheckConstraint(
            "relationship_temperature IN ('cold', 'warm', 'hot')",
            name="ck_contact_relationship_temperature",
        ),
        UniqueConstraint("user_id", "linkedin_url", name="uq_contact_user_linkedin_url"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    linkedin_url: Mapped[str] = mapped_column(Text, nullable=False)
    linkedin_profile_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    full_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    headline: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_company: Mapped[str | None] = mapped_column(Text, nullable=True)
    current_title: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(Text, nullable=True)
    connection_degree: Mapped[int | None] = mapped_column(Integer, nullable=True)
    connection_status: Mapped[str] = mapped_column(
        Text, nullable=False, server_default="none"
    )
    relationship_temperature: Mapped[str] = mapped_column(
        Text, nullable=False, server_default="cold"
    )
    prospect_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_breakdown: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    research_data: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    is_from_inbox: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default="false"
    )
    last_interaction_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    last_scraped_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
