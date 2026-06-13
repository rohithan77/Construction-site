from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import TYPE_CHECKING

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from linkedin_agent.models import Contact, StyleProfile, User
from linkedin_agent.tone.engine import ToneEngine
from linkedin_agent.utils.rate_limiter import RateLimiter

if TYPE_CHECKING:
    from linkedin_agent.scraper.linkedin_client import LinkedInClient

log = structlog.get_logger(__name__)

# Keywords that flag a post as relevant to clinical research
_CLINICAL_POST_SIGNALS = [
    "clinical trial", "clinical research", "cra ", "cdm ", "cro ", "gcp", "ich",
    "protocol", "regulatory", "fda", "tga", "ema", "phase i", "phase ii", "phase iii",
    "investigator", "sponsor", "site", "data management", "pharmacovigilance",
    "drug development", "biotech", "pharmaceutical", "clinical data",
    "clinical operations", "patient recruitment", "adverse event",
]

_AU_SIGNALS = frozenset([
    "australia", "sydney", "melbourne", "brisbane", "perth", "adelaide",
    "canberra", "nsw", "vic", "qld", "wa", "sa", "act",
])

_CLINICAL_TITLE_SIGNALS = frozenset([
    "clinical research", "clinical trial", "clinical data", "cra", "cdm", "ctc", "cta",
    "regulatory", "pharmacovigilance", "medical affairs", "clinical operations",
    "clinical monitor", "data manager", "cro", "pharmaceutical", "biotech",
])


def _is_australian(location: str) -> bool:
    return any(s in location.lower() for s in _AU_SIGNALS)


def _is_clinical_person(headline: str, title: str) -> bool:
    text = (headline + " " + title).lower()
    return any(s in text for s in _CLINICAL_TITLE_SIGNALS)


def _post_relevance_score(post_text: str) -> float:
    """Score 0–1 how relevant a post is to clinical research."""
    text_lower = post_text.lower()
    hits = sum(1 for kw in _CLINICAL_POST_SIGNALS if kw in text_lower)
    return min(1.0, hits * 0.15)


def _post_comment_value(post_text: str, likes: int, comments: int) -> float:
    """Score how valuable it is to comment on this post.

    Higher value = specific, substantive post with moderate engagement.
    Avoid: very low engagement (nobody will see it), very high (buried in comments).
    """
    relevance = _post_relevance_score(post_text)
    length_score = min(1.0, len(post_text) / 400)  # longer posts = more to engage with
    # Sweet spot: 5–100 likes. Very viral posts (500+) aren't worth targeting.
    eng_score = min(1.0, likes / 50) if likes < 200 else max(0.1, 1.0 - (likes - 200) / 500)
    return round(relevance * 0.5 + length_score * 0.3 + eng_score * 0.2, 3)


class PostMonitorAgent:
    def __init__(self) -> None:
        self._tone = ToneEngine()
        self._rate = RateLimiter()

    async def scan_and_draft(
        self,
        user: User,
        linkedin: "LinkedInClient",
        session: AsyncSession,
    ) -> list[dict]:
        """Scan recent posts from relevant Australian clinical research connections.

        Returns up to 3 post + draft-comment pairs for approval.
        Only looks at 1st-degree connections (people already connected to you).
        """
        target_countries = getattr(user, "target_countries", None) or ["Australia"]
        au_focused = any("australia" in c.lower() for c in target_countries)

        # Load style profile
        style_profile = await self._load_style_profile(user, session)

        # Get relevant connections from DB first (already researched)
        relevant_contacts = await self._get_relevant_connections(user, session, au_focused)

        if not relevant_contacts:
            # Fall back to a fresh search for Australian clinical research connections
            relevant_contacts = await self._search_connections(user, linkedin, au_focused)

        if not relevant_contacts:
            log.info("no_relevant_connections_for_post_scan")
            return []

        opportunities: list[dict] = []

        for contact in relevant_contacts[:20]:  # check up to 20 connections' posts
            if not self._rate.check_and_consume("profile_view"):
                break
            pid = contact.get("profile_id") or contact.get("linkedin_profile_id", "")
            name = contact.get("full_name", "Unknown")
            if not pid:
                continue
            try:
                posts = await linkedin.get_connection_posts(pid, limit=3)
                await asyncio.sleep(2)  # human-like pacing
            except Exception as e:
                log.error("get_posts_failed", pid=pid, error=str(e))
                continue

            for post in posts:
                text = post.get("text", "")
                if not text or len(text) < 80:
                    continue

                # Only posts from the last 72 hours are worth commenting on
                created_ms = post.get("created_at_ms", 0)
                if created_ms:
                    age_hours = (datetime.now(timezone.utc).timestamp() * 1000 - created_ms) / 3_600_000
                    if age_hours > 72:
                        continue

                relevance = _post_relevance_score(text)
                if relevance < 0.15:
                    continue

                value = _post_comment_value(text, post.get("likes", 0), post.get("comments", 0))

                # Draft comment
                commenter_context = (
                    f"clinical research professional targeting roles in "
                    f"{', '.join(getattr(user, 'target_roles', None) or ['clinical research'])}"
                )
                draft = self._tone.draft_comment(
                    post_text=text,
                    post_author=name,
                    style_profile=style_profile,
                    commenter_name=user.email or "the owner",
                    commenter_context=commenter_context,
                )
                if not draft:
                    continue  # tone engine said SKIP

                opportunities.append({
                    "post_urn": post.get("urn", ""),
                    "author_name": name,
                    "author_profile_id": pid,
                    "author_title": contact.get("current_title", ""),
                    "author_company": contact.get("current_company", ""),
                    "post_text": text[:500],
                    "post_likes": post.get("likes", 0),
                    "post_comments": post.get("comments", 0),
                    "relevance_score": relevance,
                    "comment_value": value,
                    "draft_comment": draft,
                })

                if len(opportunities) >= 5:
                    break
            if len(opportunities) >= 5:
                break

        # Sort by comment value, return top 3 (prevent approval fatigue)
        opportunities.sort(key=lambda x: x["comment_value"], reverse=True)
        top = opportunities[:3]
        log.info("post_scan_complete", drafts_ready=len(top))
        return top

    def format_comment_queue(self, opportunities: list[dict]) -> str:
        if not opportunities:
            return ""
        lines = [f"💬 *{len(opportunities)} comment draft(s) ready*\n_Australian clinical research connections_\n"]
        for i, o in enumerate(opportunities, 1):
            author = o["author_name"]
            title = o.get("author_title", "")
            post_preview = o["post_text"][:150].replace("\n", " ") + "…"
            draft = o["draft_comment"]
            lines.append(
                f"*{i}. {author}* — {title}\n"
                f"Post: _{post_preview}_\n\n"
                f"Draft comment:\n_{draft}_\n"
            )
        lines.append("Reply /approve\\_comment\\_<n> to post, or /skip\\_comment\\_<n> to discard.")
        return "\n\n".join(lines)

    async def _load_style_profile(self, user: User, session: AsyncSession) -> dict:
        sp = await session.scalar(
            select(StyleProfile).where(
                StyleProfile.user_id == user.id,
                StyleProfile.is_active == True,
            )
        )
        if not sp:
            from linkedin_agent.tone.engine import ToneEngine
            return ToneEngine()._default_style_profile()
        return {
            "formality_level": sp.formality_level,
            "avg_sentence_length": sp.avg_sentence_length,
            "emoji_usage": sp.emoji_usage,
            "humor_level": sp.humor_level,
            "vocabulary_complexity": sp.vocabulary_complexity,
            "signature_phrases": sp.signature_phrases or [],
            "phrases_to_avoid": sp.phrases_to_avoid or [],
            "typical_openings": sp.typical_openings or [],
            "typical_closings": sp.typical_closings or [],
            "paragraph_structure": sp.paragraph_structure,
            "characteristic_description": sp.characteristic_description,
        }

    async def _get_relevant_connections(
        self, user: User, session: AsyncSession, au_focused: bool
    ) -> list[dict]:
        """Pull already-stored contacts that are 1st-degree + relevant."""
        stmt = select(Contact).where(
            Contact.user_id == user.id,
            Contact.connection_status == "connected",
            Contact.connection_degree == 1,
        )
        result = await session.scalars(stmt)
        contacts = list(result)
        relevant = []
        for c in contacts:
            if au_focused and not _is_australian(c.location or ""):
                continue
            if not _is_clinical_person(c.headline or "", c.current_title or ""):
                continue
            relevant.append({
                "profile_id": c.linkedin_profile_id,
                "full_name": c.full_name,
                "current_title": c.current_title,
                "current_company": c.current_company,
                "location": c.location,
            })
        return relevant

    async def _search_connections(
        self, user: User, linkedin: "LinkedInClient", au_focused: bool
    ) -> list[dict]:
        """Fresh search for 1st-degree Australian clinical research connections."""
        try:
            from linkedin_agent.agents.prospect_agent import _AU_GEO
            regions = [_AU_GEO] if au_focused else None
            results = await linkedin.search_people_geo(
                keywords="clinical research",
                regions=regions,
                network_depths=["F"],  # first degree = already connected
                limit=20,
            )
            return [
                r for r in results
                if _is_clinical_person(r.get("headline", ""), r.get("current_title", ""))
            ]
        except Exception as e:
            log.error("connection_search_failed", error=str(e))
            return []
