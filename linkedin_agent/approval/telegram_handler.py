from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any

import structlog
from telegram import Update
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    MessageHandler,
    filters,
)

from linkedin_agent.config import settings

log = structlog.get_logger(__name__)

# ── shared batch state (updated by orchestrator after each pipeline run) ───────
_connection_batch: list[dict] = []
_comment_queue: list[dict] = []

# ── edit-flow state: chat_id → {action_id, original_draft} ───────────────────
_pending_edits: dict[int, dict] = {}


def set_connection_batch(batch: list[dict]) -> None:
    global _connection_batch
    _connection_batch = list(batch)


def set_comment_queue(queue: list[dict]) -> None:
    global _comment_queue
    _comment_queue = list(queue)


def _is_authorized(update: Update) -> bool:
    return (
        update.effective_chat is not None
        and str(update.effective_chat.id) == settings.telegram_chat_id
    )


# ── inline button callbacks (✅ Send / ✏️ Edit / ❌ Skip) ─────────────────────

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    if query is None:
        return
    await query.answer()
    if not _is_authorized(update):
        return

    data = query.data or ""
    parts = data.split(":", 1)
    if len(parts) != 2:
        return
    verb, action_id = parts[0], parts[1]

    if verb == "approve":
        await _do_approve(query, action_id, update)
    elif verb == "edit":
        await _do_edit_prompt(query, action_id, update)
    elif verb == "reject":
        await _do_reject(query, action_id)


async def _do_approve(query: Any, action_id: str, update: Update) -> None:
    from sqlalchemy import select as sa_select
    from linkedin_agent.database import async_session
    from linkedin_agent.models import Action, Contact
    from linkedin_agent.scraper.linkedin_client import LinkedInClient
    from linkedin_agent.utils.rate_limiter import RateLimiter

    try:
        uid = uuid.UUID(action_id)
    except ValueError:
        await query.edit_message_text("❌ Invalid action ID.")
        return

    async with async_session() as session:
        action = await session.scalar(sa_select(Action).where(Action.id == uid))
        if not action:
            await query.edit_message_text("⚠️ Action not found — may have expired.")
            return
        if action.status != "pending":
            await query.edit_message_text(f"Already {action.status}.")
            return

        content = action.edited_content or action.draft_content or ""
        meta = action.metadata_ or {}
        profile_id = meta.get("profile_id", "")

        linkedin = LinkedInClient()
        rate = RateLimiter()
        now = datetime.now(timezone.utc)
        ok = False

        if action.action_type == "connection_request":
            if not rate.check_and_consume("connection_request"):
                await query.edit_message_text("⚠️ Daily connection limit reached — try tomorrow.")
                return
            ok = await linkedin.send_connection_request(profile_id, message=content)
            if ok:
                contact = await session.scalar(
                    sa_select(Contact).where(Contact.linkedin_profile_id == profile_id)
                )
                if contact:
                    contact.connection_status = "request_pending"

        elif action.action_type in ("intro_message", "follow_up_message", "revival_message"):
            if not rate.check_and_consume("message"):
                await query.edit_message_text("⚠️ Daily message limit reached — try tomorrow.")
                return
            ok = await linkedin.send_message(recipients=[profile_id], text=content)

        else:
            await query.edit_message_text(f"⚠️ Unknown action type: {action.action_type}")
            return

        if ok:
            action.status = "sent"
            action.final_content = content
            action.sent_at = now
            action.reviewed_at = now
        else:
            action.status = "failed"
            action.reviewed_at = now

        await session.commit()

    if ok:
        await query.edit_message_text("✅ Sent.")
    else:
        await query.edit_message_text("❌ LinkedIn returned an error — check logs.")


async def _do_edit_prompt(query: Any, action_id: str, update: Update) -> None:
    from sqlalchemy import select as sa_select
    from linkedin_agent.database import async_session
    from linkedin_agent.models import Action

    chat_id = update.effective_chat.id if update.effective_chat else 0

    try:
        uid = uuid.UUID(action_id)
    except ValueError:
        await query.edit_message_text("❌ Invalid action ID.")
        return

    async with async_session() as session:
        action = await session.scalar(sa_select(Action).where(Action.id == uid))
        if not action:
            await query.edit_message_text("⚠️ Action not found.")
            return
        original = action.draft_content or ""

    _pending_edits[chat_id] = {"action_id": action_id, "original": original}
    await query.edit_message_text(
        f"✏️ *Send your edited message now.*\n\nOriginal:\n{original}\n\n_(Send /cancel to abort)_",
        parse_mode="Markdown",
    )


async def _do_reject(query: Any, action_id: str) -> None:
    from sqlalchemy import select as sa_select
    from linkedin_agent.database import async_session
    from linkedin_agent.models import Action

    try:
        uid = uuid.UUID(action_id)
    except ValueError:
        await query.edit_message_text("❌ Invalid action ID.")
        return

    async with async_session() as session:
        action = await session.scalar(sa_select(Action).where(Action.id == uid))
        if not action:
            await query.edit_message_text("⚠️ Action not found.")
            return
        action.status = "rejected"
        action.reviewed_at = datetime.now(timezone.utc)
        await session.commit()
    await query.edit_message_text("❌ Skipped.")


# ── text handler — captures edited drafts ─────────────────────────────────────

async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_authorized(update) or not update.message:
        return
    chat_id = update.effective_chat.id if update.effective_chat else 0
    if chat_id not in _pending_edits:
        return

    state = _pending_edits.pop(chat_id)
    edited_text = (update.message.text or "").strip()

    if not edited_text:
        await update.message.reply_text("Empty text — edit cancelled.")
        return

    from sqlalchemy import select as sa_select
    from linkedin_agent.database import async_session
    from linkedin_agent.models import Action

    async with async_session() as session:
        try:
            uid = uuid.UUID(state["action_id"])
        except ValueError:
            return
        action = await session.scalar(sa_select(Action).where(Action.id == uid))
        if not action:
            await update.message.reply_text("⚠️ Action not found.")
            return
        action.edited_content = edited_text
        await session.commit()

    await update.message.reply_text(
        f"✏️ Edit saved:\n\n_{edited_text}_\n\nTap ✅ Send in the draft message to send this.",
        parse_mode="Markdown",
    )


# ── connection batch commands ──────────────────────────────────────────────────

async def cmd_approve_all(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_authorized(update) or not update.message:
        return
    if not _connection_batch:
        await update.message.reply_text("No pending connection batch — run `/prospects` to fetch one.")
        return

    from linkedin_agent.scraper.linkedin_client import LinkedInClient
    from linkedin_agent.utils.rate_limiter import RateLimiter

    linkedin = LinkedInClient()
    rate = RateLimiter()
    sent = failed = 0
    budget_hit = False

    for prospect in list(_connection_batch):
        if not rate.check_and_consume("connection_request"):
            budget_hit = True
            break
        pid = prospect.get("profile_id", "")
        note = _build_connection_note(prospect)
        if await linkedin.send_connection_request(pid, message=note):
            sent += 1
        else:
            failed += 1

    _connection_batch.clear()
    extra = " (budget exhausted — rest skipped)" if budget_hit else ""
    await update.message.reply_text(
        f"🔗 {sent} connection request(s) sent, {failed} failed.{extra}"
    )


async def cmd_skip_all(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_authorized(update) or not update.message:
        return
    count = len(_connection_batch)
    _connection_batch.clear()
    await update.message.reply_text(f"Skipped all {count} connection proposal(s).")


async def cmd_approve_n(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles /approve_1 through /approve_N."""
    if not _is_authorized(update) or not update.message:
        return
    raw = (update.message.text or "").split("@")[0]  # strip @botname
    try:
        n = int(raw.strip("/").split("_")[-1]) - 1
    except (ValueError, IndexError):
        await update.message.reply_text("Usage: `/approve_1` (number from the list)", parse_mode="Markdown")
        return

    if n < 0 or n >= len(_connection_batch):
        await update.message.reply_text(
            f"No item {n + 1} in the current batch ({len(_connection_batch)} pending)."
        )
        return

    from linkedin_agent.scraper.linkedin_client import LinkedInClient
    from linkedin_agent.utils.rate_limiter import RateLimiter

    prospect = _connection_batch[n]
    linkedin = LinkedInClient()
    rate = RateLimiter()

    if not rate.check_and_consume("connection_request"):
        await update.message.reply_text("⚠️ Daily connection limit reached.")
        return

    note = _build_connection_note(prospect)
    ok = await linkedin.send_connection_request(prospect.get("profile_id", ""), message=note)
    if ok:
        _connection_batch.pop(n)
        await update.message.reply_text(
            f"✅ Connection request sent to {prospect.get('full_name', 'them')}."
        )
    else:
        await update.message.reply_text("❌ Failed — check logs.")


def _build_connection_note(prospect: dict) -> str:
    """Short, human-sounding connection note (max 299 chars)."""
    mutuals = prospect.get("mutual_connections", [])
    first = (prospect.get("full_name", "") or "").split()[0]
    if mutuals:
        mutual_first = (mutuals[0].get("name", "") or "").split()[0]
        note = (
            f"Hi {first}, we both know {mutual_first} — thought it'd be great "
            f"to connect in the Australian clinical research space."
        )
    else:
        note = (
            f"Hi {first}, I came across your profile and noticed we're both "
            f"in clinical research in Australia — would love to connect."
        )
    return note[:299]


# ── comment queue commands ─────────────────────────────────────────────────────

async def cmd_approve_comment_n(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles /approve_comment_1 through /approve_comment_N."""
    if not _is_authorized(update) or not update.message:
        return
    raw = (update.message.text or "").split("@")[0]
    try:
        n = int(raw.strip("/").rsplit("_", 1)[-1]) - 1
    except (ValueError, IndexError):
        await update.message.reply_text("Usage: `/approve_comment_1`", parse_mode="Markdown")
        return

    if n < 0 or n >= len(_comment_queue):
        await update.message.reply_text(
            f"No comment {n + 1} in the queue ({len(_comment_queue)} pending)."
        )
        return

    from linkedin_agent.scraper.linkedin_client import LinkedInClient

    opp = _comment_queue[n]
    post_urn = opp.get("post_urn", "")
    draft = opp.get("draft_comment", "")

    if not post_urn:
        await update.message.reply_text("⚠️ No post URN — cannot post comment.")
        return

    linkedin = LinkedInClient()
    ok = await linkedin.post_comment(post_urn, draft)
    if ok:
        _comment_queue.pop(n)
        await update.message.reply_text(
            f"✅ Comment posted on {opp.get('author_name', 'their')} post."
        )
    else:
        await update.message.reply_text("❌ Failed to post comment — check logs.")


async def cmd_skip_comment_n(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handles /skip_comment_1 through /skip_comment_N."""
    if not _is_authorized(update) or not update.message:
        return
    raw = (update.message.text or "").split("@")[0]
    try:
        n = int(raw.strip("/").rsplit("_", 1)[-1]) - 1
    except (ValueError, IndexError):
        await update.message.reply_text("Usage: `/skip_comment_1`", parse_mode="Markdown")
        return

    if n < 0 or n >= len(_comment_queue):
        await update.message.reply_text(f"No comment {n + 1} in the queue.")
        return

    opp = _comment_queue.pop(n)
    await update.message.reply_text(
        f"Skipped comment on {opp.get('author_name', 'their')} post."
    )


# ── utility commands ───────────────────────────────────────────────────────────

async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_authorized(update) or not update.message:
        return
    from linkedin_agent.utils.rate_limiter import RateLimiter

    budgets = RateLimiter().get_all_budgets()
    icons = {"connection_request": "🔗", "message": "💬", "profile_view": "👁", "search": "🔍"}

    lines = ["📊 *Today's budget (resets at midnight UTC)*\n"]
    for atype, data in budgets.items():
        remaining, used, limit = data["remaining"], data["used"], data["limit"]
        bar = "█" * remaining + "░" * used
        lines.append(
            f"{icons.get(atype, '•')} {atype.replace('_', ' ').title()}: "
            f"{remaining}/{limit}  {bar}"
        )

    if _connection_batch:
        lines.append(f"\n🔗 Connection batch: {len(_connection_batch)} proposals waiting")
    if _comment_queue:
        lines.append(f"💬 Comment queue: {len(_comment_queue)} drafts waiting")

    await update.message.reply_text("\n".join(lines), parse_mode="Markdown")


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_authorized(update) or not update.message:
        return
    await update.message.reply_text(
        "🤖 *LinkedIn Agent — Commands*\n\n"
        "*Message approvals* (inline ✅/✏️/❌ buttons on each draft)\n\n"
        "*Connection batches*\n"
        "`/approve_all` — send all proposed connections\n"
        "`/skip_all` — discard all proposed connections\n"
        "`/approve_1`, `/approve_2` … — approve one by number\n\n"
        "*Comment drafts*\n"
        "`/approve_comment_1` … — post a comment\n"
        "`/skip_comment_1` … — discard a comment draft\n\n"
        "*Info*\n"
        "`/status` — today's action budget\n"
        "`/jobs` — recent job matches\n\n"
        "*Controls*\n"
        "`/cancel` — cancel current edit session\n"
        "`/help` — this message",
        parse_mode="Markdown",
    )


async def cmd_jobs(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_authorized(update) or not update.message:
        return
    from datetime import timedelta
    from sqlalchemy import select as sa_select, desc
    from linkedin_agent.database import async_session
    from linkedin_agent.models import JobListing, User

    async with async_session() as session:
        user = await session.scalar(sa_select(User).where(User.is_active == True).limit(1))
        if not user:
            await update.message.reply_text("No active user configured.")
            return

        cutoff = datetime.now(timezone.utc) - timedelta(days=7)
        jobs = list(
            await session.scalars(
                sa_select(JobListing)
                .where(JobListing.user_id == user.id, JobListing.found_at > cutoff)
                .order_by(desc(JobListing.found_at))
                .limit(10)
            )
        )

    if not jobs:
        await update.message.reply_text("No new job matches in the last 7 days.")
        return

    lines = [f"💼 *{len(jobs)} recent job match(es)*\n"]
    for j in jobs:
        lines.append(f"• *{j.title}* @ {j.company}\n  {j.location} — [View]({j.job_url})")
    await update.message.reply_text(
        "\n".join(lines), parse_mode="Markdown", disable_web_page_preview=True
    )


async def cmd_cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not _is_authorized(update) or not update.message:
        return
    chat_id = update.effective_chat.id if update.effective_chat else 0
    if _pending_edits.pop(chat_id, None):
        await update.message.reply_text("Edit cancelled — original preserved.")
    else:
        await update.message.reply_text("Nothing to cancel.")


# ── application builder ────────────────────────────────────────────────────────

def build_application() -> Application:
    app = Application.builder().token(settings.telegram_bot_token).build()

    app.add_handler(CallbackQueryHandler(handle_callback))

    app.add_handler(CommandHandler("approve_all", cmd_approve_all))
    app.add_handler(CommandHandler("skip_all", cmd_skip_all))
    app.add_handler(CommandHandler("status", cmd_status))
    app.add_handler(CommandHandler("help", cmd_help))
    app.add_handler(CommandHandler("start", cmd_help))
    app.add_handler(CommandHandler("jobs", cmd_jobs))
    app.add_handler(CommandHandler("cancel", cmd_cancel))

    # Dynamic numbered commands — regex matches /approve_1, /approve_2, etc.
    app.add_handler(MessageHandler(filters.Regex(r"^/approve_\d+$"), cmd_approve_n))
    app.add_handler(MessageHandler(filters.Regex(r"^/approve_comment_\d+$"), cmd_approve_comment_n))
    app.add_handler(MessageHandler(filters.Regex(r"^/skip_comment_\d+$"), cmd_skip_comment_n))

    # Plain text = edit submission (only fires when _pending_edits is set)
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))

    return app


async def start_bot() -> None:
    """Start polling. Run as a background asyncio task alongside the scheduler."""
    app = build_application()
    await app.initialize()
    await app.start()
    await app.updater.start_polling(drop_pending_updates=True)
    log.info("telegram_handler_started")
    try:
        await asyncio.Event().wait()  # run until cancelled
    except asyncio.CancelledError:
        pass
    finally:
        await app.updater.stop()
        await app.stop()
        await app.shutdown()
        log.info("telegram_handler_stopped")
