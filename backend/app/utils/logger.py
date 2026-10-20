"""
Centralized logger utility re-export.
"""

from app.core.logger import logger, setup_logging

__all__ = ["logger", "setup_logging"]
