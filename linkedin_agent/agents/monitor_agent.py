from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import TYPE_CHECKING

import structlog
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from linkedin_agent.models import JobListing, User
from linkedin_agent.tone.engine import ToneEngine

if TYPE_CHECKING:
    pass

log = structlog.get_logger(__name__)

CLINICAL_SEARCH_TERMS = [
    "clinical research associate",
    "clinical data manager",
    "clinical trial coordinator",
    "clinical trial assistant CTA",
    "CRA clinical trials",
    "CDM pharmaceutical",
]


class MonitorAgent:
    def __init__(self) -> None:
        self._tone = ToneEngine()

    async def scan_jobs(self, user: User, session: AsyncSession) -> list[JobListing]:
        """Scan for new clinical research jobs, score them, save to DB, return new high-priority ones."""
        from jobspy import scrape_jobs

        all_new: list[JobListing] = []

        for term in CLINICAL_SEARCH_TERMS:
            try:
                df = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda t=term: scrape_jobs(
                        site_name=["linkedin", "indeed"],
                        search_term=t,
                        results_wanted=15,
                        hours_old=72,
                    ),
                )
                if df is None or df.empty:
                    continue

                for _, row in df.iterrows():
                    external_id = str(row.get("id", "")) or str(row.get("job_url", ""))[:100]
                    if not external_id:
                        continue

                    # Skip if already in DB
                    exists = await session.scalar(
                        select(JobListing).where(
                            JobListing.user_id == user.id,
                            JobListing.external_id == external_id,
                        )
                    )
                    if exists:
                        continue

                    title = str(row.get("title", ""))
                    company = str(row.get("company", ""))
                    description = str(row.get("description", "") or "")
                    location = str(row.get("location", "") or "Remote")
                    job_url = str(row.get("job_url", ""))
                    source = str(row.get("site", "linkedin"))

                    posted_at = None
                    if row.get("date_posted"):
                        try:
                            posted_at = datetime.fromisoformat(str(row["date_posted"]))
                            if posted_at.tzinfo is None:
                                posted_at = posted_at.replace(tzinfo=timezone.utc)
                        except Exception:
                            pass

                    fit_score, fit_explanation = self._score_fit(title, description, user)
                    urgency_score, urgency_reason = self._score_urgency(
                        posted_at, row.get("num_urgent_words", 0)
                    )

                    listing = JobListing(
                        user_id=user.id,
                        external_id=external_id,
                        source=source,
                        title=title,
                        company=company,
                        location=location,
                        job_url=job_url,
                        description_text=description[:3000],
                        posted_at=posted_at,
                        fit_score=fit_score,
                        urgency_score=urgency_score,
                        fit_explanation=fit_explanation,
                        urgency_reason=urgency_reason,
                        notified=False,
                    )
                    session.add(listing)
                    all_new.append(listing)

                await session.flush()
            except Exception as e:
                log.error("job_scan_term_failed", term=term, error=str(e))
                continue

        await session.commit()
        high_priority = [j for j in all_new if (j.fit_score or 0) >= 0.5 or (j.urgency_score or 0) >= 0.7]
        log.info("job_scan_complete", new_total=len(all_new), high_priority=len(high_priority))
        return sorted(high_priority, key=lambda x: ((x.urgency_score or 0) + (x.fit_score or 0)), reverse=True)

    def _score_fit(self, title: str, description: str, user: User) -> tuple[float, str]:
        title_lower = title.lower()
        score = 0.0
        reasons = []

        clinical_keywords = ["clinical research", "cra", "cdm", "cta", "ctc",
                              "clinical trial", "data management", "clinical data"]
        for kw in clinical_keywords:
            if kw in title_lower:
                score += 0.4
                reasons.append(f"title matches '{kw}'")
                break

        if user.resume_text:
            desc_lower = description.lower()
            resume_lower = user.resume_text.lower()
            skill_matches = sum(
                1 for word in ["gcp", "ich", "edc", "medidata", "rave", "ctms", "sas",
                               "phase i", "phase ii", "phase iii", "protocol", "regulatory"]
                if word in resume_lower and word in desc_lower
            )
            score += min(0.3, skill_matches * 0.1)
            if skill_matches:
                reasons.append(f"{skill_matches} skill matches")

        target_roles = [r.lower() for r in (user.target_roles or [])]
        if any(r in title_lower for r in target_roles):
            score = max(score, 0.7)
            reasons.append("exact role match")

        score = min(1.0, score)
        return score, "; ".join(reasons) or "General clinical research role"

    def _score_urgency(self, posted_at: datetime | None, urgent_words: int) -> tuple[float, str]:
        if not posted_at:
            return 0.3, "Posting date unknown"

        now = datetime.now(timezone.utc)
        hours_old = (now - posted_at).total_seconds() / 3600

        if hours_old < 24:
            score, reason = 1.0, "Posted < 24h ago — apply immediately"
        elif hours_old < 72:
            score, reason = 0.7, "Posted < 3 days ago — act soon"
        elif hours_old < 168:
            score, reason = 0.4, "Posted this week"
        else:
            score, reason = 0.1, "Older posting"

        return min(1.0, score), reason

    def format_job_alert(self, listings: list[JobListing]) -> str:
        if not listings:
            return ""
        critical = [j for j in listings if (j.urgency_score or 0) >= 0.9]
        high = [j for j in listings if 0.6 <= (j.urgency_score or 0) < 0.9]
        normal = [j for j in listings if (j.urgency_score or 0) < 0.6]

        lines = [f"🔍 *{len(listings)} new clinical research jobs found*\n"]

        def fmt(j: JobListing) -> str:
            age = ""
            if j.posted_at:
                hrs = int((datetime.now(timezone.utc) - j.posted_at).total_seconds() / 3600)
                age = f"{hrs}h ago" if hrs < 48 else f"{hrs//24}d ago"
            return f"• *{j.title}* @ {j.company} ({j.location}) — {age}\n  {j.job_url}"

        if critical:
            lines.append("🔴 *APPLY NOW* (posted < 24h):")
            lines.extend(fmt(j) for j in critical[:3])
        if high:
            lines.append("\n🟡 *High priority*:")
            lines.extend(fmt(j) for j in high[:3])
        if normal:
            lines.append("\n⚪ *Other matches*:")
            lines.extend(fmt(j) for j in normal[:2])

        return "\n".join(lines)
