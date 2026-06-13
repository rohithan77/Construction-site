from __future__ import annotations

import time
from datetime import datetime, timezone
from typing import Any

from linkedin_agent.config import settings

_ACTION_LIMITS: dict[str, int] = {
    "connection_request": settings.max_connections_per_day,
    "message": settings.max_messages_per_day,
    "profile_view": settings.max_profile_views_per_day,
    "search": settings.max_searches_per_day,
}

_ACTION_TYPES = list(_ACTION_LIMITS.keys())


def _seconds_until_midnight() -> int:
    now = datetime.now(tz=timezone.utc)
    tomorrow = now.replace(hour=0, minute=0, second=0, microsecond=0)
    from datetime import timedelta

    tomorrow += timedelta(days=1)
    return max(1, int((tomorrow - now).total_seconds()))


def _today_key(action_type: str) -> str:
    date_str = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
    return f"rate_limiter:{date_str}:{action_type}"


class RateLimiter:
    def __init__(self) -> None:
        self._redis: Any | None = None
        self._fallback: dict[str, int] = {}
        self._fallback_date: str = ""
        self._use_redis = True
        self._connect_redis()

    def _connect_redis(self) -> None:
        try:
            import redis

            client = redis.from_url(settings.redis_url, decode_responses=True, socket_timeout=2)
            client.ping()
            self._redis = client
            self._use_redis = True
        except Exception:
            self._redis = None
            self._use_redis = False

    def _ensure_fallback_reset(self) -> None:
        today = datetime.now(tz=timezone.utc).strftime("%Y-%m-%d")
        if self._fallback_date != today:
            self._fallback = {}
            self._fallback_date = today

    def _redis_get(self, key: str) -> int:
        try:
            val = self._redis.get(key)
            return int(val) if val is not None else 0
        except Exception:
            self._use_redis = False
            return 0

    def _redis_increment(self, key: str) -> int:
        try:
            pipe = self._redis.pipeline()
            pipe.incr(key)
            pipe.expire(key, _seconds_until_midnight())
            results = pipe.execute()
            return int(results[0])
        except Exception:
            self._use_redis = False
            return 0

    def check_and_consume(self, action_type: str) -> bool:
        limit = _ACTION_LIMITS.get(action_type)
        if limit is None:
            return True

        if self._use_redis and self._redis is not None:
            key = _today_key(action_type)
            current = self._redis_get(key)
            if current >= limit:
                return False
            new_val = self._redis_increment(key)
            return new_val <= limit

        self._ensure_fallback_reset()
        current = self._fallback.get(action_type, 0)
        if current >= limit:
            return False
        self._fallback[action_type] = current + 1
        return True

    def get_remaining(self, action_type: str) -> int:
        limit = _ACTION_LIMITS.get(action_type, 0)

        if self._use_redis and self._redis is not None:
            key = _today_key(action_type)
            used = self._redis_get(key)
            return max(0, limit - used)

        self._ensure_fallback_reset()
        used = self._fallback.get(action_type, 0)
        return max(0, limit - used)

    def get_all_budgets(self) -> dict[str, dict[str, int]]:
        result: dict[str, dict[str, int]] = {}
        for action_type, limit in _ACTION_LIMITS.items():
            remaining = self.get_remaining(action_type)
            result[action_type] = {
                "limit": limit,
                "used": limit - remaining,
                "remaining": remaining,
            }
        return result

    def reset_all(self) -> None:
        if self._use_redis and self._redis is not None:
            try:
                for action_type in _ACTION_TYPES:
                    key = _today_key(action_type)
                    self._redis.delete(key)
                return
            except Exception:
                self._use_redis = False

        self._ensure_fallback_reset()
        self._fallback = {}
