from __future__ import annotations

import asyncio
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import structlog

from linkedin_agent.config import settings

log = structlog.get_logger(__name__)


class LinkedInClient:
    """Async wrapper around the synchronous linkedin-api library."""

    def __init__(self) -> None:
        self._api: Any | None = None

    def _get_api(self) -> Any:
        if self._api is not None:
            return self._api
        try:
            from linkedin_api import Linkedin
            cookies_path = Path(settings.linkedin_cookies_path)
            if not cookies_path.exists():
                raise FileNotFoundError(
                    f"LinkedIn cookies not found at {settings.linkedin_cookies_path}\n"
                    "Run setup: python -m linkedin_agent.cli setup"
                )
            cookies = json.loads(cookies_path.read_text())
            self._api = Linkedin("", "", cookies=cookies)
            log.info("linkedin_client_connected")
            return self._api
        except ImportError:
            raise RuntimeError("linkedin-api not installed. Run: pip install linkedin-api")

    async def _run(self, fn, *args, **kwargs):
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, lambda: fn(*args, **kwargs))

    async def get_own_profile(self) -> dict:
        try:
            api = self._get_api()
            profile = await self._run(api.get_profile, "me")
            return self._normalize_profile(profile or {})
        except Exception as e:
            log.error("get_own_profile_failed", error=str(e))
            return {}

    async def get_inbox(self, limit: int = 80) -> list[dict]:
        """Return list of conversations with messages."""
        try:
            api = self._get_api()
            convs = await self._run(api.get_conversations)
            if not convs:
                return []
            results = []
            for conv in (convs.get("elements") or [])[:limit]:
                try:
                    participants = [
                        {
                            "name": p.get("participantType", {}).get("member", {})
                                     .get("firstName", {}).get("text", "")
                                   + " "
                                   + p.get("participantType", {}).get("member", {})
                                     .get("lastName", {}).get("text", ""),
                            "profile_id": p.get("participantType", {})
                                           .get("member", {})
                                           .get("dashEntityUrn", ""),
                        }
                        for p in conv.get("participants", [])
                    ]
                    events = conv.get("events", [])
                    messages = []
                    for ev in events[:10]:
                        body = ev.get("eventContent", {}).get("messageBody", {})
                        text = body.get("text", "")
                        if text:
                            actor = ev.get("actor", {})
                            messages.append({
                                "text": text,
                                "sender_profile_id": actor.get("urn", ""),
                                "sent_at": ev.get("createdAt"),
                            })
                    results.append({
                        "conversation_id": conv.get("entityUrn", ""),
                        "participants": participants,
                        "messages": messages,
                        "last_message_at": conv.get("lastActivityAt"),
                    })
                except Exception:
                    continue
            return results
        except Exception as e:
            log.error("get_inbox_failed", error=str(e))
            return []

    async def get_profile(self, profile_id: str) -> dict | None:
        try:
            api = self._get_api()
            raw = await self._run(api.get_profile, profile_id)
            if not raw:
                return None
            return self._normalize_profile(raw)
        except Exception as e:
            log.error("get_profile_failed", profile_id=profile_id, error=str(e))
            return None

    async def search_people(self, keywords: str, limit: int = 10) -> list[dict]:
        try:
            api = self._get_api()
            raw = await self._run(api.search_people, keywords=keywords, limit=limit)
            return [self._normalize_search_result(r) for r in (raw or [])]
        except Exception as e:
            log.error("search_people_failed", keywords=keywords, error=str(e))
            return []

    async def get_own_posts(self, limit: int = 50) -> list[str]:
        """Return list of post text strings for tone analysis."""
        try:
            api = self._get_api()
            profile = await self._run(api.get_profile, "me")
            profile_id = (profile or {}).get("profile_id", "")
            if not profile_id:
                return []
            posts = await self._run(api.get_profile_posts, profile_id, post_count=limit)
            texts = []
            for p in (posts or []):
                text = (
                    p.get("value", {})
                     .get("com.linkedin.voyager.feed.render.UpdateV2", {})
                     .get("commentary", {})
                     .get("text", {})
                     .get("text", "")
                )
                if text:
                    texts.append(text)
            return texts
        except Exception as e:
            log.error("get_own_posts_failed", error=str(e))
            return []

    async def send_connection_request(self, profile_id: str, message: str = "") -> bool:
        try:
            api = self._get_api()
            await self._run(api.add_connection, profile_id, message=message)
            log.info("connection_request_sent", profile_id=profile_id)
            return True
        except Exception as e:
            log.error("send_connection_failed", profile_id=profile_id, error=str(e))
            return False

    async def send_message(self, recipients: list[str], text: str) -> bool:
        try:
            api = self._get_api()
            await self._run(api.send_message, message_body=text, recipients=recipients)
            log.info("message_sent", recipients=recipients)
            return True
        except Exception as e:
            log.error("send_message_failed", error=str(e))
            return False

    async def get_mutual_connections(self, profile_id: str) -> list[dict]:
        try:
            api = self._get_api()
            raw = await self._run(api.get_profile_member_badges, profile_id)
            mutuals = (raw or {}).get("mutualConnectionsInsight", {}).get("profiles", [])
            return [
                {
                    "name": m.get("firstName", "") + " " + m.get("lastName", ""),
                    "profile_id": m.get("profile_id", ""),
                    "title": m.get("headline", ""),
                }
                for m in mutuals
            ]
        except Exception as e:
            log.error("mutual_connections_failed", profile_id=profile_id, error=str(e))
            return []

    def _normalize_profile(self, raw: dict) -> dict:
        exp = raw.get("experience", [{}])
        current = exp[0] if exp else {}
        return {
            "profile_id": raw.get("profile_id", raw.get("entityUrn", "")),
            "full_name": raw.get("firstName", "") + " " + raw.get("lastName", ""),
            "headline": raw.get("headline", ""),
            "current_title": current.get("title", ""),
            "current_company": (current.get("company") or {}).get("name", ""),
            "location": raw.get("geoLocationName", ""),
            "connection_degree": raw.get("distance", {}).get("value", 3)
                                 if isinstance(raw.get("distance"), dict) else 3,
            "linkedin_url": f"https://www.linkedin.com/in/{raw.get('profile_id', '')}",
        }

    def _normalize_search_result(self, raw: dict) -> dict:
        return {
            "profile_id": raw.get("urn_id", raw.get("entityUrn", "")),
            "full_name": raw.get("name", ""),
            "headline": raw.get("headline", ""),
            "current_title": "",
            "current_company": raw.get("company", ""),
            "location": raw.get("location", ""),
            "connection_degree": raw.get("distance", 3),
            "linkedin_url": f"https://www.linkedin.com/in/{raw.get('urn_id', '')}",
        }
