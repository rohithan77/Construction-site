from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from linkedin_agent.models import Action, Contact, User
from linkedin_agent.tone.engine import ToneEngine

if TYPE_CHECKING:
    from linkedin_agent.scraper.linkedin_client import LinkedInClient

log = structlog.get_logger(__name__)

RECRUITER_KEYWORDS = ["recruiter", "talent", "hr", "hiring", "people ops", "talent acquisition"]


class InboxAuditAgent:
    def __init__(self) -> None:
        self._tone = ToneEngine()

    async def run_audit(
        self, user: User, linkedin: "LinkedInClient", session: AsyncSession
    ) -> list[dict]:
        """Read inbox, classify threads, return top opportunities sorted by score."""
        log.info("inbox_audit_started")
        conversations = await linkedin.get_inbox(limit=80)
        if not conversations:
            log.info("inbox_empty_or_unavailable")
            return []

        owner_id = user.linkedin_profile_id or ""
        opportunities = []

        for conv in conversations:
            try:
                participants = conv.get("participants", [])
                other = next(
                    (p for p in participants if p.get("profile_id", "") != owner_id),
                    participants[0] if participants else {},
                )
                other_name = other.get("name", "Unknown").strip()
                other_id = other.get("profile_id", "")
                messages = conv.get("messages", [])
                if not messages:
                    continue

                last_msg_ts = conv.get("last_message_at")
                last_msg_at = self._parse_ts(last_msg_ts)
                days_since = (datetime.now(timezone.utc) - last_msg_at).days if last_msg_at else 999

                owner_sent_last = self._owner_sent_last(messages, owner_id)
                excerpt = self._build_excerpt(messages)

                # Get profile info (title/company) from existing contact or skip enrichment for speed
                existing: Contact | None = await session.scalar(
                    select(Contact).where(
                        Contact.user_id == user.id,
                        Contact.linkedin_profile_id == other_id,
                    )
                )
                other_title = existing.current_title if existing else ""
                other_company = existing.current_company if existing else ""

                classification_data = self._tone.classify_conversation(
                    conversation_excerpt=excerpt,
                    other_person_name=other_name,
                    other_person_title=other_title or "Professional",
                    other_person_company=other_company or "Unknown",
                    days_since_last=days_since,
                    owner_sent_last=owner_sent_last,
                )

                classification = classification_data.get("classification", "closed")
                warmth = classification_data.get("warmth", 1)
                relevance = classification_data.get("relevance", 1)
                revival_hook = classification_data.get("revival_hook", "")

                if classification in ("active", "closed"):
                    continue

                score = self._score(classification, warmth, relevance, days_since)

                # Upsert contact
                if other_id and not existing:
                    contact = Contact(
                        user_id=user.id,
                        linkedin_profile_id=other_id,
                        linkedin_url=f"https://www.linkedin.com/in/{other_id}",
                        full_name=other_name,
                        current_title=other_title,
                        current_company=other_company,
                        connection_status="connected",
                        relationship_temperature="warm" if warmth >= 3 else "cold",
                        is_from_inbox=True,
                    )
                    session.add(contact)

                opportunities.append({
                    "conversation_id": conv.get("conversation_id", ""),
                    "other_name": other_name,
                    "other_title": other_title,
                    "other_company": other_company,
                    "other_id": other_id,
                    "classification": classification,
                    "score": score,
                    "days_since": days_since,
                    "revival_hook": revival_hook,
                    "excerpt": excerpt,
                })
            except Exception as e:
                log.error("conversation_processing_failed", error=str(e))
                continue

        await session.commit()
        opportunities.sort(key=lambda x: x["score"], reverse=True)
        log.info("inbox_audit_complete", opportunities_found=len(opportunities))
        return opportunities[:10]

    def format_report(self, opportunities: list[dict]) -> str:
        if not opportunities:
            return "✅ Inbox audit complete — no dormant conversations to revive right now."

        needs_reply = [o for o in opportunities if o["classification"] == "needs_reply"]
        warm = [o for o in opportunities if o["classification"] == "warm_dormant"]
        cold = [o for o in opportunities if o["classification"] == "cold_worth_reviving"]

        lines = [f"📬 *Inbox audit — {len(opportunities)} opportunities found*\n"]

        def fmt(o: dict) -> str:
            who = o["other_name"]
            title = f", {o['other_title']}" if o["other_title"] else ""
            co = f" @ {o['other_company']}" if o["other_company"] else ""
            return f"• *{who}*{title}{co} — {o['days_since']}d ago"

        if needs_reply:
            lines.append("🔴 *They replied — you haven't responded:*")
            lines.extend(fmt(o) for o in needs_reply[:3])
        if warm:
            lines.append("\n🟡 *Warm conversations that went quiet:*")
            lines.extend(fmt(o) for o in warm[:3])
        if cold:
            lines.append("\n⚪ *Worth a re-engagement:*")
            lines.extend(fmt(o) for o in cold[:2])

        lines.append("\nReply /revive to draft messages for any of these.")
        return "\n".join(lines)

    def _owner_sent_last(self, messages: list[dict], owner_id: str) -> bool:
        if not messages:
            return False
        last = messages[0]
        return owner_id in last.get("sender_profile_id", "")

    def _build_excerpt(self, messages: list[dict]) -> str:
        lines = []
        for m in messages[:5]:
            lines.append(f"[{m.get('sender_profile_id', 'unknown')[:20]}]: {m.get('text', '')[:200]}")
        return "\n".join(lines)

    def _score(self, classification: str, warmth: int, relevance: int, days_since: int) -> float:
        base = {"needs_reply": 1.0, "warm_dormant": 0.7, "cold_worth_reviving": 0.4}.get(
            classification, 0.0
        )
        recency = max(0.0, 1.0 - days_since / 90)
        return round(base * 0.5 + (warmth / 5) * 0.25 + (relevance / 5) * 0.15 + recency * 0.1, 3)

    def _parse_ts(self, ts) -> datetime | None:
        if not ts:
            return None
        try:
            if isinstance(ts, (int, float)):
                return datetime.fromtimestamp(ts / 1000, tz=timezone.utc)
            return datetime.fromisoformat(str(ts)).replace(tzinfo=timezone.utc)
        except Exception:
            return None
