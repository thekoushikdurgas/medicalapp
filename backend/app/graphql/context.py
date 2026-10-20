"""
GraphQL execution context module.
"""

from typing import Any
from strawberry.fastapi import BaseContext
from sqlalchemy.ext.asyncio import AsyncSession


class GraphQLContext(BaseContext):
    """Custom Strawberry GraphQL context providing database session access."""

    def __init__(self, session: AsyncSession | None = None, **kwargs: Any):
        super().__init__(**kwargs)
        self.session = session
