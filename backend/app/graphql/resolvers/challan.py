"""
Delivery Challan GraphQL resolvers — queries and mutations.
"""

import uuid
import strawberry
from strawberry.types import Info
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.models import DeliveryChallan, ChallanReturn, UserRole
from app.db.session import async_session_factory
from app.graphql.resolvers.auth import _get_caller
from app.graphql.types import (
    DeliveryChallanType,
    ChallanItemType,
    ChallanReturnType,
    CreateChallanInput,
    CreateChallanReturnInput,
)
from app.services.challan_service import (
    create_challan_for_order,
    process_challan_return,
)


def _challan_to_type(c: DeliveryChallan) -> DeliveryChallanType:
    items = []
    if c.items:
        for i in c.items:
            p_name = i.product.name if i.product else None
            items.append(
                ChallanItemType(
                    id=i.id,
                    product_id=i.product_id,
                    stock_batch_id=i.stock_batch_id,
                    quantity=i.quantity,
                    free_quantity=i.free_quantity,
                    product_name=p_name,
                )
            )

    returns = []
    if c.returns:
        for r in c.returns:
            returns.append(
                ChallanReturnType(
                    id=r.id,
                    challan_id=r.challan_id,
                    return_number=r.return_number,
                    return_date=r.return_date,
                    reason=r.reason,
                    created_at=r.created_at,
                )
            )

    return DeliveryChallanType(
        id=c.id,
        order_id=c.order_id,
        challan_number=c.challan_number,
        challan_date=c.challan_date,
        transporter_name=c.transporter_name,
        vehicle_number=c.vehicle_number,
        total_cartons=c.total_cartons,
        created_at=c.created_at,
        items=items,
        returns=returns,
    )


@strawberry.type
class ChallanQuery:
    @strawberry.field
    async def delivery_challans(
        self,
        info: Info,
        page: int = 1,
        per_page: int = 50,
    ) -> list[DeliveryChallanType]:
        """List delivery challans with items and returns."""
        _get_caller(info)
        async with async_session_factory() as session:
            stmt = (
                select(DeliveryChallan)
                .options(
                    selectinload(DeliveryChallan.items),
                    selectinload(DeliveryChallan.returns),
                )
                .order_by(DeliveryChallan.created_at.desc())
                .offset((page - 1) * per_page)
                .limit(per_page)
            )
            result = await session.execute(stmt)
            challans = result.scalars().all()
            return [_challan_to_type(c) for c in challans]

    @strawberry.field
    async def delivery_challan(
        self,
        info: Info,
        id: uuid.UUID,
    ) -> DeliveryChallanType | None:
        """Get a single delivery challan by ID."""
        _get_caller(info)
        async with async_session_factory() as session:
            stmt = (
                select(DeliveryChallan)
                .options(
                    selectinload(DeliveryChallan.items),
                    selectinload(DeliveryChallan.returns),
                )
                .where(DeliveryChallan.id == id)
            )
            result = await session.execute(stmt)
            challan = result.scalar_one_or_none()
            return _challan_to_type(challan) if challan else None


@strawberry.type
class ChallanMutation:
    @strawberry.mutation
    async def create_delivery_challan(
        self,
        info: Info,
        input: CreateChallanInput,
    ) -> DeliveryChallanType:
        """Create a delivery challan for a confirmed/packed order."""
        user_id_str, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception("Permission denied: Only Warehouse staff or Admin can create challans.")

        created_by = uuid.UUID(user_id_str)
        async with async_session_factory() as session:
            challan = await create_challan_for_order(
                session=session,
                order_id=input.order_id,
                transporter_name=input.transporter_name,
                vehicle_number=input.vehicle_number,
                total_cartons=input.total_cartons,
                created_by=created_by,
            )
            await session.commit()
            await session.refresh(challan)

            stmt = (
                select(DeliveryChallan)
                .options(
                    selectinload(DeliveryChallan.items),
                    selectinload(DeliveryChallan.returns),
                )
                .where(DeliveryChallan.id == challan.id)
            )
            res = await session.execute(stmt)
            full_challan = res.scalar_one()
            return _challan_to_type(full_challan)

    @strawberry.mutation
    async def create_challan_return(
        self,
        info: Info,
        input: CreateChallanReturnInput,
    ) -> ChallanReturnType:
        """Process a logistics return from a delivery challan."""
        user_id_str, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception("Permission denied: Only Warehouse staff or Admin can process returns.")

        processed_by = uuid.UUID(user_id_str)
        return_items = [
            {
                "product_id": str(i.product_id),
                "stock_batch_id": str(i.stock_batch_id),
                "quantity": i.quantity,
            }
            for i in input.items
        ]

        async with async_session_factory() as session:
            ret = await process_challan_return(
                session=session,
                challan_id=input.challan_id,
                return_items=return_items,
                reason=input.reason,
                processed_by=processed_by,
            )
            await session.commit()
            await session.refresh(ret)
            return ChallanReturnType(
                id=ret.id,
                challan_id=ret.challan_id,
                return_number=ret.return_number,
                return_date=ret.return_date,
                reason=ret.reason,
                created_at=ret.created_at,
            )
