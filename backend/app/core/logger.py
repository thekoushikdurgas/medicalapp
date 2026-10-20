"""
Structured logging configuration for Pharmacy Fantasy backend.
"""

from __future__ import annotations

import logging
import sys

from app.core.config import settings
from app.core.logging_config import configure_structured_logging

LOG_FORMAT = "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(use_json: bool = False):
    if use_json:
        configure_structured_logging(debug=settings.DEBUG)
        return
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    logging.basicConfig(
        level=log_level,
        format=LOG_FORMAT,
        datefmt=DATE_FORMAT,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )


def get_logger(name: str = "pharmacyfantasy") -> logging.Logger:
    return logging.getLogger(name)


logger = get_logger()
