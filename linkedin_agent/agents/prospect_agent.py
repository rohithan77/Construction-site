from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from linkedin_agent.models import Contact, User
from linkedin_agent.utils.rate_limiter import RateLimiter

if TYPE_CHECKING:
    from linkedin_agent.scraper.linkedin_client import LinkedInClient

log = structlog.get_logger(__name__)

# LinkedIn geo URN for Australia
_AU_GEO = "urn:li:geo:101452733"

_AU_SIGNALS = frozenset([
    "australia", "sydney", "melbourne", "brisbane", "perth", "adelaide",
    "canberra", "nsw", "vic", "qld", "wa", "sa", "act", "nt",
])

_CLINICAL_TITLE_SIGNALS = frozenset([
    "clinical research", "clinical trial", "clinical data", "cra", "cdm", "ctc", "cta",
    "regulatory affairs", "pharmacovigilance", "drug safety", "medical affairs",
    "clinical operations", "site management", "clinical monitor", "data manager",
    "biostatistics", "clinical project", "cro", "pharmaceutical", "biotech",
])

_SEARCH_TERMS = [
    "clinical research associate Australia",
    "clinical data manager Australia",
    "clinical trial coordinator Australia",
    "CRA clinical trials Australia",
    "clinical research manager Australia",
    "pharmacovigilance Australia",
]


def _is_australian(location: str) -> bool:
    return any(s in location.lower() for s in _AU_SIGNALS)


def _is_clinical(headline: str, title: str) -> bool:
    text = (headline + " " + title).lower()
    return any(s in text for s in _CLINICAL_TITLE_SIGNALS)


class ProspectAgent:
    def __init__(self) -> None:
        self._rate = RateLimiter()

    async def build_prospect_list(
        self,
        user: User,
        linkedin: "LinkedInClient",
        session: AsyncSession,
    ) -> list[dict]:
        """Find relevant Australian clinical research professionals to connect with.

        Only surfaces 2nd-degree connections (people you don't know yet but can reach).
        Filters to Australia + clinical research. Returns top 10 scored prospects.
        """
        target_countries = getattr(user, "target_countries", None) or ["Australia"]
        au_focused = any("australia" in c.lower() for c in target_countries)
        regions = [_AU_GEO] if au_focused else []

        all_raw: list[dict] = []
        for term in _SEARCH_TERMS:
            if not self._rate.check_and_consume("search"):
                log.info("search_budget_exhausted")
                break
            try:
                results = await linkedin.search_people_geo(
                    keywords=term,
                    regions=regions if regions else None,
                    network_depths=["S"],  # 2nd degree — not yet connected
                    limit=8,
                )
                all_raw.extend(results)
            except Exception as e:
                log.error("prospect_search_failed", term=term, error=str(e))
            await asyncio.sleep(3)  # light delay between searches

        # Deduplicate
        seen: set[str] = set()
        candidates: list[dict] = []
        for r in all_raw:
            pid = r.get("profile_id", "")
            if not pid or pid in seen:
                continue
            seen.add(pid)
            # Geographic + industry filter
            if au_focused and not _is_australian(r.get("location", "")):
                continue
            if not _is_clinical(r.get("headline", ""), r.get("current_title", "")):
                continue
            candidates.append(r)

        # Skip people we've already contacted
        fresh: list[dict] = []
        for c in candidates:
            pid = c.get("profile_id", "")
            existing = await session.scalar(
                select(Contact).where(
                    Contact.user_id == user.id,
                    Contact.linkedin_profile_id == pid,
                )
            )
            if existing and existing.connection_status in (
                "request_pending", "connected", "messaged", "replied", "do_not_contact"
            ):
                continue
            fresh.append(c)

        # Research top candidates: get mutual connections (helps score + warm intro path)
        scored: list[dict] = []
        for candidate in fresh[:15]:
            pid = candidate.get("profile_id", "")
            if not self._rate.check_and_consume("profile_view"):
                break
            try:
                mutuals = await linkedin.get_mutual_connections(pid)
                score, breakdown = self._score(candidate, user, mutuals)
                scored.append({
                    **candidate,
                    "prospect_score": score,
                    "score_breakdown": breakdown,
                    "mutual_connections": mutuals,
                })
            except Exception as e:
                log.error("prospect_research_failed", pid=pid, error=str(e))

        scored.sort(key=lambda x: x.get("prospect_score", 0), reverse=True)
        top = scored[:10]

        # Upsert into contacts table
        for p in top:
            await self._upsert_contact(p, user, session)
        await session.commit()

        log.info("prospect_list_built", found=len(top))
        return top

    def _score(self, profile: dict, user: User, mutuals: list[dict]) -> tuple[float, dict]:
        score = 0.0
        breakdown: dict[str, float] = {}

        # Australian location
        if _is_australian(profile.get("location", "")):
            score += 0.30
            breakdown["au_location"] = 0.30

        # Clinical research role match
        if _is_clinical(profile.get("headline", ""), profile.get("current_title", "")):
            score += 0.30
            breakdown["clinical_role"] = 0.30

        # Mutual connections (warm path exists)
        if mutuals:
            warmth = min(0.20, len(mutuals) * 0.07)
            score += warmth
            breakdown["mutuals"] = warmth

        # Seniority bonus (hiring managers etc. are higher priority for job seeking)
        seniority = ["manager", "director", "senior", "lead", "head of", "principal", "vp"]
        title = profile.get("current_title", "").lower()
        if any(s in title for s in seniority):
            score += 0.10
            breakdown["seniority"] = 0.10

        # Exact role match
        target_roles_lower = [r.lower() for r in (getattr(user, "target_roles", None) or [])]
        if any(r in title for r in target_roles_lower):
            score += 0.10
            breakdown["exact_role_match"] = 0.10

        return round(min(1.0, score), 3), breakdown

    async def _upsert_contact(self, p: dict, user: User, session: AsyncSession) -> None:
        pid = p.get("profile_id", "")
        if not pid:
            return
        existing = await session.scalar(
            select(Contact).where(
                Contact.user_id == user.id,
                Contact.linkedin_profile_id == pid,
            )
        )
        if existing:
            existing.prospect_score = p.get("prospect_score")
            existing.score_breakdown = p.get("score_breakdown")
            existing.research_data = {"mutual_connections": p.get("mutual_connections", [])}
        else:
            session.add(Contact(
                user_id=user.id,
                linkedin_profile_id=pid,
                linkedin_url=p.get("linkedin_url", f"https://www.linkedin.com/in/{pid}"),
                full_name=p.get("full_name", ""),
                headline=p.get("headline", ""),
                current_title=p.get("current_title", ""),
                current_company=p.get("current_company", ""),
                location=p.get("location", ""),
                connection_degree=p.get("connection_degree", 2),
                connection_status="none",
                relationship_temperature="cold",
                prospect_score=p.get("prospect_score"),
                score_breakdown=p.get("score_breakdown"),
                research_data={"mutual_connections": p.get("mutual_connections", [])},
            ))

    def format_connection_batch(self, prospects: list[dict]) -> str:
        if not prospects:
            return ""
        lines = [f"🔗 *{len(prospects)} connection requests proposed — Australian clinical research*\n"]
        for i, p in enumerate(prospects[:8], 1):
            name = p.get("full_name", "Unknown")
            title = p.get("current_title", "") or p.get("headline", "")
            company = p.get("current_company", "")
            location = p.get("location", "")
            mutuals = p.get("mutual_connections", [])
            mutual_str = f"\n   Mutual: {mutuals[0]['name']}" if mutuals else ""
            score = p.get("prospect_score", 0)
            lines.append(
                f"{i}. *{name}*{mutual_str}\n"
                f"   {title} @ {company} · {location} · {score:.0%} match"
            )
        lines.append(
            "\nReply /approve\\_all or /skip\\_all\n"
            "Or /approve\\_1, /approve\\_2 … for individual picks."
        )
        return "\n".join(lines)
