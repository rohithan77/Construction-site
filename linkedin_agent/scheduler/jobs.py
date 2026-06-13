from __future__ import annotations

import random

import structlog
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from linkedin_agent.config import settings

log = structlog.get_logger(__name__)

_scheduler: AsyncIOScheduler | None = None


def get_scheduler() -> AsyncIOScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = AsyncIOScheduler(
            jobstores={"default": MemoryJobStore()},
            job_defaults={"coalesce": True, "max_instances": 1, "misfire_grace_time": 900},
            timezone="UTC",
        )
    return _scheduler


def _random_interval_hours() -> float:
    return random.uniform(
        settings.schedule_min_interval_hours,
        settings.schedule_max_interval_hours,
    )


def start_scheduler(pipeline_fn) -> None:
    """Start the scheduler with the main pipeline function."""
    scheduler = get_scheduler()

    # Main pipeline: randomized interval
    interval_hours = _random_interval_hours()
    scheduler.add_job(
        pipeline_fn,
        trigger=IntervalTrigger(hours=interval_hours),
        id="main_pipeline",
        replace_existing=True,
    )

    # Re-randomize interval after each run by rescheduling
    scheduler.add_job(
        lambda: _reschedule_pipeline(scheduler, pipeline_fn),
        trigger=IntervalTrigger(hours=interval_hours),
        id="reschedule",
        replace_existing=True,
    )

    scheduler.start()
    log.info("scheduler_started", interval_hours=round(interval_hours, 2))


def _reschedule_pipeline(scheduler: AsyncIOScheduler, pipeline_fn) -> None:
    new_interval = _random_interval_hours()
    scheduler.reschedule_job(
        "main_pipeline",
        trigger=IntervalTrigger(hours=new_interval),
    )
    scheduler.reschedule_job(
        "reschedule",
        trigger=IntervalTrigger(hours=new_interval),
    )
    log.info("pipeline_rescheduled", next_interval_hours=round(new_interval, 2))


def stop_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown()
        _scheduler = None
        log.info("scheduler_stopped")
