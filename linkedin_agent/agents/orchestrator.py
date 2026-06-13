from __future__ import annotations

import random
import time
from datetime import datetime, timezone

import structlog
from sqlalchemy import select

from linkedin_agent.agents.inbox_audit import InboxAuditAgent
from linkedin_agent.agents.monitor_agent import MonitorAgent
from linkedin_agent.approval.telegram_bot import TelegramNotifier
from linkedin_agent.config import settings
from linkedin_agent.database import async_session
from linkedin_agent.models import PipelineRun, User
from linkedin_agent.scraper.linkedin_client import LinkedInClient
from linkedin_agent.utils.rate_limiter import RateLimiter

log = structlog.get_logger(__name__)


def _is_active_window() -> bool:
    hour = datetime.now(timezone.utc).hour
    return settings.active_hours_start <= hour < settings.active_hours_end


def _human_delay(min_s: float = 8.0, max_s: float = 30.0) -> None:
    time.sleep(random.uniform(min_s, max_s))


class Orchestrator:
    def __init__(self) -> None:
        self._linkedin = LinkedInClient()
        self._rate = RateLimiter()
        self._telegram = TelegramNotifier()
        self._inbox = InboxAuditAgent()
        self._monitor = MonitorAgent()

    async def run_pipeline(self, run_type: str = "scheduled") -> None:
        if not _is_active_window():
            log.info("outside_active_window_skipped")
            return

        async with async_session() as session:
            user: User | None = await session.scalar(
                select(User).where(User.is_active == True).limit(1)
            )
            if not user:
                log.error("no_active_user_found")
                return

            run = PipelineRun(
                user_id=user.id,
                started_at=datetime.now(timezone.utc),
                status="running",
                run_type=run_type,
            )
            session.add(run)
            await session.flush()

            try:
                # ── 1. Inbox audit (always runs first) ──────────────────────
                if run_type in ("scheduled", "inbox_audit", "manual"):
                    log.info("running_inbox_audit")
                    opportunities = await self._inbox.run_audit(user, self._linkedin, session)
                    if opportunities:
                        report = self._inbox.format_report(opportunities)
                        await self._telegram.send_inbox_audit(report)
                        run.actions_taken += len(opportunities)
                    _human_delay(5, 15)

                # ── 2. Job monitoring ────────────────────────────────────────
                if run_type in ("scheduled", "job_scan", "manual"):
                    if self._rate.check_and_consume("search"):
                        log.info("running_job_scan")
                        new_jobs = await self._monitor.scan_jobs(user, session)
                        run.jobs_found = len(new_jobs)
                        if new_jobs:
                            alert = self._monitor.format_job_alert(new_jobs)
                            await self._telegram.send_job_alert(alert)
                        _human_delay(8, 20)

                run.status = "completed"
                run.completed_at = datetime.now(timezone.utc)
                await session.commit()
                log.info(
                    "pipeline_complete",
                    jobs_found=run.jobs_found,
                    actions=run.actions_taken,
                )

            except Exception as e:
                run.status = "failed"
                run.error_log = str(e)
                run.completed_at = datetime.now(timezone.utc)
                await session.commit()
                log.error("pipeline_failed", error=str(e))
                await self._telegram.send_alert(f"Pipeline error: {e}")

    async def run_inbox_audit_only(self) -> None:
        await self.run_pipeline(run_type="inbox_audit")

    async def run_job_scan_only(self) -> None:
        await self.run_pipeline(run_type="job_scan")
