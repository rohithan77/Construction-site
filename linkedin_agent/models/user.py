from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import Boolean, CheckConstraint, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class User(TimestampMixin, Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("mode IN ('job_seeker', 'business_owner')", name="ck_user_mode"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str | None] = mapped_column(Text, unique=True, nullable=True)
    mode: Mapped[str] = mapped_column(Text, nullable=False, server_default="job_seeker")
    linkedin_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    linkedin_profile_id: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_roles: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    target_industries: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    target_locations: Mapped[list[str] | None] = mapped_column(JSONB, nullable=True)
    resume_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    knowledge_base: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    notification_channel: Mapped[str] = mapped_column(
        Text, nullable=False, server_default="telegram"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    config: Mapped[dict[str, Any]] = mapped_column(
        JSONB, nullable=False, server_default="{}"
    )
