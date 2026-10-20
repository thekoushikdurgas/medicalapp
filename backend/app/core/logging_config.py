"""
Structured JSON logging configuration for Pharmacy Fantasy backend.
"""

from __future__ import annotations

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any


class JSONFormatter(logging.Formatter):
    """Formats log records as structured JSON dictionaries."""

    def format(self, record: logging.LogRecord) -> str:
        log_obj: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "request_id"):
            log_obj["request_id"] = getattr(record, "request_id")
        return json.dumps(log_obj)


def configure_structured_logging(debug: bool = False) -> None:
    """Configure structured JSON logging handler on root logger."""
    level = logging.DEBUG if debug else logging.INFO
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())

    root = logging.getLogger()
    root.setLevel(level)
    # Avoid duplicate handlers
    if not any(isinstance(h.formatter, JSONFormatter) for h in root.handlers):
        root.handlers = [handler]
