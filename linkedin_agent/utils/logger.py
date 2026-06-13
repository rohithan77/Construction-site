from __future__ import annotations

import logging
import sys
from pathlib import Path

import structlog

Path("logs").mkdir(exist_ok=True)


def get_logger(name: str) -> structlog.BoundLogger:
    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.stdlib.add_logger_name,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
        logger_factory=structlog.PrintLoggerFactory(),
    )
    return structlog.get_logger(name)
