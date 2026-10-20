"""
Strawberry DataLoaders for batched database reads and GraphQL N+1 prevention.
"""

from __future__ import annotations

import uuid
from typing import Sequence
from strawberry.dataloader import DataLoader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import User, Product, Order


async def _batch_load_users(
    keys: Sequence[uuid.UUID], session: AsyncSession
) -> list[User | None]:
    result = await session.execute(select(User).where(User.id.in_(keys)))
    users_by_id = {u.id: u for u in result.scalars().all()}
    return [users_by_id.get(k) for k in keys]


async def _batch_load_products(
    keys: Sequence[uuid.UUID], session: AsyncSession
) -> list[Product | None]:
    result = await session.execute(select(Product).where(Product.id.in_(keys)))
    prods_by_id = {p.id: p for p in result.scalars().all()}
    return [prods_by_id.get(k) for k in keys]


async def _batch_load_orders(
    keys: Sequence[uuid.UUID], session: AsyncSession
) -> list[Order | None]:
    result = await session.execute(select(Order).where(Order.id.in_(keys)))
    orders_by_id = {o.id: o for o in result.scalars().all()}
    return [orders_by_id.get(k) for k in keys]


class DataLoaders:
    """Per-request container of instantiated DataLoader objects."""

    def __init__(self, session: AsyncSession | None = None) -> None:
        self.session = session
        self.user_loader: DataLoader[uuid.UUID, User | None] = DataLoader(
            load_fn=lambda keys: _batch_load_users(keys, self.session)  # type: ignore[arg-type]
        )
        self.product_loader: DataLoader[uuid.UUID, Product | None] = DataLoader(
            load_fn=lambda keys: _batch_load_products(keys, self.session)  # type: ignore[arg-type]
        )
        self.order_loader: DataLoader[uuid.UUID, Order | None] = DataLoader(
            load_fn=lambda keys: _batch_load_orders(keys, self.session)  # type: ignore[arg-type]
        )
