from __future__ import annotations

import asyncio
from typing import Any

import structlog
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.constants import ParseMode

from linkedin_agent.config import settings

log = structlog.get_logger(__name__)


class TelegramNotifier:
    def __init__(self) -> None:
        self._bot: Bot | None = None

    def _get_bot(self) -> Bot:
        if self._bot is None:
            self._bot = Bot(token=settings.telegram_bot_token)
        return self._bot

    async def send(self, text: str, reply_markup: Any = None) -> bool:
        try:
            bot = self._get_bot()
            await bot.send_message(
                chat_id=settings.telegram_chat_id,
                text=text,
                parse_mode=ParseMode.MARKDOWN,
                reply_markup=reply_markup,
                disable_web_page_preview=True,
            )
            return True
        except Exception as e:
            log.error("telegram_send_failed", error=str(e))
            return False

    async def send_morning_briefing(
        self,
        replies: list[dict],
        new_connections: list[dict],
        pending_approvals: int,
        new_jobs: int,
        response_rate: float | None,
    ) -> None:
        lines = ["☀️ *Good morning — LinkedIn summary*\n"]

        if replies:
            lines.append(f"💬 *Replies received ({len(replies)}):*")
            for r in replies[:3]:
                lines.append(f"  • {r.get('name', 'Someone')} replied")

        if new_connections:
            lines.append(f"\n🤝 *New connections ({len(new_connections)}):*")
            for c in new_connections[:3]:
                lines.append(f"  • {c.get('name', 'Someone')}")

        if pending_approvals:
            lines.append(f"\n📋 *Approvals waiting:* {pending_approvals}")

        if new_jobs:
            lines.append(f"\n💼 *New job matches:* {new_jobs} — use /jobs to view")

        if response_rate is not None:
            lines.append(f"\n📊 Response rate this week: *{response_rate:.1f}%* (industry avg: 3–8%)")

        lines.append("\n_Use /help to see all commands._")
        await self.send("\n".join(lines))

    async def send_job_alert(self, message: str) -> None:
        await self.send(message)

    async def send_inbox_audit(self, message: str) -> None:
        await self.send(message)

    async def send_draft_for_approval(
        self,
        action_id: str,
        recipient_name: str,
        recipient_title: str,
        recipient_company: str,
        draft: str,
        context: str,
        version_b: str = "",
    ) -> None:
        text = (
            f"✏️ *Draft ready — message to {recipient_name}*\n\n"
            f"_{recipient_title} @ {recipient_company}_\n"
            f"Context: {context}\n\n"
            f"---\n{draft}\n---"
        )
        if version_b:
            text += f"\n\n*Alternative (longer):*\n---\n{version_b}\n---"

        keyboard = InlineKeyboardMarkup([
            [
                InlineKeyboardButton("✅ Send", callback_data=f"approve:{action_id}"),
                InlineKeyboardButton("✏️ Edit", callback_data=f"edit:{action_id}"),
                InlineKeyboardButton("❌ Skip", callback_data=f"reject:{action_id}"),
            ]
        ])
        await self.send(text, reply_markup=keyboard)

    async def send_connection_batch(self, proposals: list[dict]) -> None:
        if not proposals:
            return
        lines = [f"🔗 *Connection requests — {len(proposals)} proposed today*\n"]
        for i, p in enumerate(proposals, 1):
            mutual = f" (mutual: {p['mutual']})" if p.get("mutual") else ""
            lines.append(
                f"{i}. *{p['name']}* — {p['title']} @ {p['company']}{mutual}\n"
                f"   Why: {p['reason']}"
            )
        lines.append("\nReply /approve_all or /skip_all, or /approve_<n> for individual.")
        await self.send("\n".join(lines))

    async def send_connection_batch_formatted(self, message: str) -> None:
        if message:
            await self.send(message)

    async def send_comment_queue(self, message: str) -> None:
        if message:
            await self.send(message)

    async def send_profile_suggestions(self, message: str) -> None:
        if message:
            await self.send(message)

    async def send_alert(self, message: str) -> None:
        """Send an urgent alert (negative reply, rate limit hit, etc.)"""
        await self.send(f"⚠️ *Alert*\n\n{message}")

    async def send_pause_notification(self, reason: str) -> None:
        await self.send(
            f"🛑 *Agent paused*\n\n{reason}\n\n"
            "All outreach is on hold. Reply /resume when ready to continue."
        )
