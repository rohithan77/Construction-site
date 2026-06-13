from __future__ import annotations

import random
import time
from datetime import datetime, timezone

import structlog
from sqlalchemy import select

from linkedin_agent.agents.inbox_audit import InboxAuditAgent
from linkedin_agent.agents.monitor_agent import MonitorAgent
from linkedin_agent.agents.post_monitor import PostMonitorAgent
from linkedin_agent.agents.profile_optimizer import ProfileOptimizerAgent
from linkedin_agent.agents.prospect_agent import ProspectAgent
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
        self._post_monitor = PostMonitorAgent()
        self._prospect = ProspectAgent()
        self._profile_opt = ProfileOptimizerAgent()

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
                # ── 1. Inbox audit (always first — warm beats cold) ──────────
                if run_type in ("scheduled", "inbox_audit", "manual"):
                    log.info("running_inbox_audit")
                    opportunities = await self._inbox.run_audit(user, self._linkedin, session)
                    if opportunities:
                        report = self._inbox.format_report(opportunities)
                        await self._telegram.send_inbox_audit(report)
                        run.actions_taken += len(opportunities)
                    _human_delay(8, 20)

                # ── 2. Post monitoring — comment on Australian CRA connections ─
                if run_type in ("scheduled", "manual"):
                    log.info("running_post_monitor")
                    comment_drafts = await self._post_monitor.scan_and_draft(
                        user, self._linkedin, session
                    )
                    if comment_drafts:
                        msg = self._post_monitor.format_comment_queue(comment_drafts)
                        await self._telegram.send_comment_queue(msg)
                        run.actions_taken += len(comment_drafts)
                    _human_delay(10, 25)

                # ── 3. Prospect research — new people to connect with ─────────
                if run_type in ("scheduled", "manual") and self._rate.get_remaining("search") >= 2:
                    log.info("running_prospect_research")
                    prospects = await self._prospect.build_prospect_list(
                        user, self._linkedin, session
                    )
                    run.prospects_found = len(prospects)
                    if prospects:
                        batch = self._prospect.format_connection_batch(prospects)
                        await self._telegram.send_connection_batch_formatted(batch)
                        run.connections_queued = len(prospects)
                    _human_delay(10, 25)

                # ── 4. Job monitoring ─────────────────────────────────────────
                if run_type in ("scheduled", "job_scan", "manual"):
                    if self._rate.check_and_consume("search"):
                        log.info("running_job_scan")
                        new_jobs = await self._monitor.scan_jobs(user, session)
                        run.jobs_found = len(new_jobs)
                        if new_jobs:
                            alert = self._monitor.format_job_alert(new_jobs)
                            await self._telegram.send_job_alert(alert)
                        _human_delay(8, 20)

                # ── 5. Profile gap analysis (weekly — only on first run of day) ─
                if run_type in ("scheduled", "manual"):
                    await self._maybe_run_profile_analysis(user, session, run)

                run.status = "completed"
                run.completed_at = datetime.now(timezone.utc)
                await session.commit()
                log.info(
                    "pipeline_complete",
                    jobs_found=run.jobs_found,
                    prospects=run.prospects_found,
                    actions=run.actions_taken,
                )

            except Exception as e:
                run.status = "failed"
                run.error_log = str(e)
                run.completed_at = datetime.now(timezone.utc)
                await session.commit()
                log.error("pipeline_failed", error=str(e))
                await self._telegram.send_alert(f"Pipeline error: {e}")

    async def _maybe_run_profile_analysis(
        self, user: User, session, run: PipelineRun
    ) -> None:
        """Run profile gap analysis at most once per week."""
        from sqlalchemy import and_
        from datetime import timedelta

        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        recent = await session.scalar(
            select(PipelineRun).where(
                and_(
                    PipelineRun.user_id == user.id,
                    PipelineRun.run_type == "profile_analysis",
                    PipelineRun.started_at > cutoff,
                    PipelineRun.status == "completed",
                )
            )
        )
        if recent:
            return

        log.info("running_profile_gap_analysis")
        gaps = await self._profile_opt.analyse(user, self._linkedin, session)
        if gaps:
            msg = self._profile_opt.format_suggestions(gaps)
            await self._telegram.send_profile_suggestions(msg)

    # ── manual trigger helpers ─────────────────────────────────────────────────

    async def run_inbox_audit_only(self) -> None:
        await self.run_pipeline(run_type="inbox_audit")

    async def run_job_scan_only(self) -> None:
        await self.run_pipeline(run_type="job_scan")

    async def run_prospect_scan_only(self) -> None:
        async with async_session() as session:
            user = await session.scalar(select(User).where(User.is_active == True).limit(1))
            if not user:
                return
            prospects = await self._prospect.build_prospect_list(user, self._linkedin, session)
            if prospects:
                await self._telegram.send_connection_batch_formatted(
                    self._prospect.format_connection_batch(prospects)
                )

    async def run_post_scan_only(self) -> None:
        async with async_session() as session:
            user = await session.scalar(select(User).where(User.is_active == True).limit(1))
            if not user:
                return
            drafts = await self._post_monitor.scan_and_draft(user, self._linkedin, session)
            if drafts:
                await self._telegram.send_comment_queue(
                    self._post_monitor.format_comment_queue(drafts)
                )

    async def run_profile_analysis_only(self) -> None:
        async with async_session() as session:
            user = await session.scalar(select(User).where(User.is_active == True).limit(1))
            if not user:
                return
            gaps = await self._profile_opt.analyse(user, self._linkedin, session)
            if gaps:
                await self._telegram.send_profile_suggestions(
                    self._profile_opt.format_suggestions(gaps)
                )
