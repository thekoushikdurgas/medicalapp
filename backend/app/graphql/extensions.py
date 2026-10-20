"""
GraphQL execution extensions for logging and performance monitoring.
"""

import time
from typing import Iterator
from strawberry.extensions import SchemaExtension
from app.core.logger import logger


class QueryExecutionTimeExtension(SchemaExtension):
    """Logs GraphQL operations exceeding execution time threshold."""

    def on_operation(self) -> Iterator[None]:
        start = time.perf_counter()
        yield
        duration = time.perf_counter() - start
        if duration > 2.0:
            logger.warning(f"Slow GraphQL operation took {duration:.2f}s")
