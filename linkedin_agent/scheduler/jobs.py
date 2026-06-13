from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

import structlog
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger

from linkedin_agent.config import settings

log = structlog.get_logger(__name__)

_scheduler: AsyncIOScheduler | None = None


def get_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler(
            jobstores={"default": MemoryJobStore()},
            job_defaults={"coalesce": True, "max_instances": 1, "misfire_grace_time": 1800},
            timezone="UTC",
        )
    return _scheduler


def _random_time_today(hour_start: int, hour_end: int) -> datetime:
    """Pick a random datetime today within [hour_start, hour_end) UTC."""
    now = datetime.now(timezone.utc)
    today = now.replace(second=0, microsecond=0)
    start_minutes = hour_start * 60
    end_minutes = hour_end * 60
    offset_minutes = random.randint(start_minutes, end_minutes - 1)
    run_time = today.replace(hour=0, minute=0) + timedelta(minutes=offset_minutes)
    return run_time


def _random_time_tomorrow(hour_start: int, hour_end: int) -> datetime:
    today_run = _random_time_today(hour_start, hour_end)
    return today_run + timedelta(days=1)


def _schedule_next_day(scheduler: AsyncIOScheduler, pipeline_fn) -> None:
    """Schedule tomorrow's morning and evening runs. Called at end of each day."""
    morning = _random_time_tomorrow(
        settings.morning_window_start, settings.morning_window_end
    )
    evening = _random_time_tomorrow(
        settings.evening_window_start, settings.evening_window_end
    )

    scheduler.add_job(
        pipeline_fn,
        trigger=DateTrigger(run_date=morning),
        id="morning_run",
        replace_existing=True,
    )
    scheduler.add_job(
        pipeline_fn,
        trigger=DateTrigger(run_date=evening),
        id="evening_run",
        replace_existing=True,
    )
    # Re-schedule next day after evening run completes
    scheduler.add_job(
        lambda: _schedule_next_day(scheduler, pipeline_fn),
        trigger=DateTrigger(run_date=evening + timedelta(minutes=5)),
        id="daily_reschedule",
        replace_existing=True,
    )
    log.info(
        "schedule_set",
        morning=morning.strftime("%H:%M UTC"),
        evening=evening.strftime("%H:%M UTC"),
    )


def start_scheduler(pipeline_fn) -> None:
    """Start the two-window daily scheduler.

    Picks a random time within the morning window and a random time within the
    evening window. Both change every day. Today's runs are scheduled immediately;
    tomorrow's are set after the evening run completes.
    """
    scheduler = get_scheduler()
    now = datetime.now(timezone.utc)

    morning = _random_time_today(settings.morning_window_start, settings.morning_window_end)
    evening = _random_time_today(settings.evening_window_start, settings.evening_window_end)

    # If morning has already passed today, skip to tomorrow
    if morning <= now:
        morning = _random_time_tomorrow(settings.morning_window_start, settings.morning_window_end)
        log.info("morning_window_passed_scheduling_tomorrow")

    # If evening has also already passed, push both to tomorrow
    if evening <= now:
        evening = _random_time_tomorrow(settings.evening_window_start, settings.evening_window_end)

    scheduler.add_job(
        pipeline_fn,
        trigger=DateTrigger(run_date=morning),
        id="morning_run",
        replace_existing=True,
    )
    scheduler.add_job(
        pipeline_fn,
        trigger=DateTrigger(run_date=evening),
        id="evening_run",
        replace_existing=True,
    )
    # After evening run: schedule next day
    scheduler.add_job(
        lambda: _schedule_next_day(scheduler, pipeline_fn),
        trigger=DateTrigger(run_date=evening + timedelta(minutes=5)),
        id="daily_reschedule",
        replace_existing=True,
    )

    scheduler.start()
    log.info(
        "scheduler_started",
        morning=morning.strftime("%Y-%m-%d %H:%M UTC"),
        evening=evening.strftime("%Y-%m-%d %H:%M UTC"),
    )


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown()
        _scheduler = None
        log.info("scheduler_stopped")
