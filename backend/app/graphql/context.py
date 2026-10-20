"""
GraphQL execution context module with per-request DataLoaders, Request ID tracing, and BackgroundTasks.
"""

from __future__ import annotations

import uuid
from typing import Any
from fastapi import BackgroundTasks, Request
from strawberry.fastapi import BaseContext
from sqlalchemy.ext.asyncio import AsyncSession

from app.graphql.dataloaders import DataLoaders


class GraphQLContext(BaseContext):
    """Custom Strawberry GraphQL context providing session, dataloaders, and request_id."""

    def __init__(
        self,
        session: AsyncSession | None = None,
        request_id: str | None = None,
        background_tasks: BackgroundTasks | None = None,
        **kwargs: Any,
    ):
        super().__init__(**kwargs)
        self.session = session
        self.request_id = request_id or str(uuid.uuid4())
        self.background_tasks = background_tasks
        # Instantiate per-request dataloaders
        self.dataloaders = DataLoaders(session=session)


async def get_context(
    request: Request,
    background_tasks: BackgroundTasks,
) -> GraphQLContext:
    """Dependency / context_getter injecting request_id, background_tasks, and dataloaders."""
    req_id = (
        request.headers.get("X-Request-ID")
        or request.headers.get("X-Trace-ID")
        or str(uuid.uuid4())
    )
    return GraphQLContext(
        request_id=req_id,
        background_tasks=background_tasks,
    )
