"""
Structured logging configuration for Pharmacy Fantasy backend.
"""

import logging
import sys
from app.core.config import settings

LOG_FORMAT = "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging():
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
