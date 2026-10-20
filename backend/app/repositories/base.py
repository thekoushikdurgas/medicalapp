"""
Base repository pattern implementation for SQLAlchemy async sessions.
"""

from typing import Generic, TypeVar, Type, Sequence, Any
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Generic CRUD repository for domain entities."""

    def __init__(self, model_cls: Type[ModelT], session: AsyncSession):
        self.model_cls = model_cls
        self.session = session

    async def get_by_id(self, entity_id: uuid.UUID) -> ModelT | None:
        col: Any = getattr(self.model_cls, "id", None)
        if col is None:
            return None
        result = await self.session.execute(
            select(self.model_cls).where(col == entity_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self, limit: int = 100, offset: int = 0) -> Sequence[ModelT]:
        result = await self.session.execute(
            select(self.model_cls).limit(limit).offset(offset)
        )
        return result.scalars().all()
