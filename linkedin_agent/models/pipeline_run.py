from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class PipelineRun(TimestampMixin, Base):
    __tablename__ = "pipeline_runs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('running', 'completed', 'failed', 'skipped')",
            name="ck_pipeline_run_status",
        ),
        CheckConstraint(
            "run_type IN ('scheduled', 'manual', 'inbox_audit', 'job_scan')",
            name="ck_pipeline_run_run_type",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), nullable=False, index=True
    )
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(Text, nullable=False)
    run_type: Mapped[str] = mapped_column(Text, nullable=False)
    prospects_found: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    connections_queued: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    messages_drafted: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    jobs_found: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    actions_taken: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    error_log: Mapped[str | None] = mapped_column(Text, nullable=True)
