from __future__ import annotations

from typing import TYPE_CHECKING

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from linkedin_agent.models import User
from linkedin_agent.tone.engine import ToneEngine

if TYPE_CHECKING:
    from linkedin_agent.scraper.linkedin_client import LinkedInClient

log = structlog.get_logger(__name__)


def _build_profile_text(profile: dict) -> str:
    """Flatten a LinkedIn profile dict into readable text for gap analysis."""
    parts = []
    if profile.get("headline"):
        parts.append(f"HEADLINE: {profile['headline']}")
    if profile.get("summary"):
        parts.append(f"SUMMARY: {profile['summary']}")
    if profile.get("current_title"):
        parts.append(f"CURRENT ROLE: {profile['current_title']} at {profile.get('current_company', '')}")
    exp = profile.get("experience", [])
    if exp:
        parts.append("EXPERIENCE:")
        for e in exp[:4]:
            title = e.get("title", "")
            company = (e.get("company") or {}).get("name", "")
            desc = e.get("description", "")[:300]
            parts.append(f"  - {title} @ {company}: {desc}")
    skills = profile.get("skills", [])
    if skills:
        skill_names = [s.get("name", "") for s in skills[:20]]
        parts.append(f"SKILLS: {', '.join(skill_names)}")
    certs = profile.get("certifications", [])
    if certs:
        cert_names = [c.get("name", "") for c in certs]
        parts.append(f"CERTIFICATIONS: {', '.join(cert_names)}")
    return "\n".join(parts)


class ProfileOptimizerAgent:
    def __init__(self) -> None:
        self._tone = ToneEngine()

    async def analyse(
        self,
        user: User,
        linkedin: "LinkedInClient",
        session: AsyncSession,
        job_descriptions: list[str] | None = None,
    ) -> list[dict]:
        """Pull the owner's LinkedIn profile, compare it against job descriptions,
        return a prioritised list of gap suggestions.
        """
        # Get own profile
        try:
            profile = await linkedin.get_own_profile()
        except Exception as e:
            log.error("get_own_profile_failed", error=str(e))
            return []

        if not profile:
            log.info("profile_not_available")
            return []

        profile_text = _build_profile_text(profile)

        # Use resume text as additional profile context if available
        if user.resume_text:
            profile_text += f"\n\nRESUME CONTENT:\n{user.resume_text[:2000]}"

        # Fall back to stored job descriptions if none passed in
        if not job_descriptions:
            job_descriptions = await self._fetch_recent_jds(user, session)

        if not job_descriptions:
            log.info("no_job_descriptions_for_profile_gap")
            return []

        target_countries = getattr(user, "target_countries", None) or ["Australia"]
        target_market = ", ".join(target_countries)

        gaps = self._tone.analyse_profile_gaps(
            profile_text=profile_text,
            job_descriptions=job_descriptions,
            target_roles=user.target_roles or [],
            target_market=target_market,
        )
        log.info("profile_gap_analysis_complete", gaps_found=len(gaps))
        return gaps

    async def _fetch_recent_jds(self, user: User, session: AsyncSession) -> list[str]:
        """Pull job description text from recently stored listings."""
        from sqlalchemy import select
        from linkedin_agent.models import JobListing
        stmt = (
            select(JobListing.description_text)
            .where(
                JobListing.user_id == user.id,
                JobListing.description_text.isnot(None),
            )
            .order_by(JobListing.created_at.desc())
            .limit(8)
        )
        result = await session.scalars(stmt)
        return [d for d in result if d]

    def format_suggestions(self, gaps: list[dict]) -> str:
        if not gaps:
            return "✅ Profile looks well-optimised for your target roles."

        high = [g for g in gaps if g.get("priority") == "high"]
        medium = [g for g in gaps if g.get("priority") == "medium"]
        low = [g for g in gaps if g.get("priority") == "low"]

        lines = [f"📋 *Profile optimisation — {len(gaps)} suggestions*\n"]

        def fmt(g: dict) -> str:
            section = g.get("section", "Profile")
            gap = g.get("gap", "")
            suggestion = g.get("suggestion", "")
            return f"*{section}*\n_{gap}_\n→ {suggestion}"

        if high:
            lines.append("🔴 *High priority:*")
            lines.extend(fmt(g) for g in high)
        if medium:
            lines.append("\n🟡 *Medium priority:*")
            lines.extend(fmt(g) for g in medium)
        if low:
            lines.append("\n⚪ *Lower priority:*")
            lines.extend(fmt(g) for g in low)

        lines.append("\nReply /apply\\_suggestion\\_<n> to use one, or update your profile manually.")
        return "\n\n".join(lines)
