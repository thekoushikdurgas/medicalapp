"""
Delivery assignment resolvers.
"""

import uuid
from datetime import datetime, timezone

import strawberry
from sqlalchemy import select

from app.db.models import DeliveryAssignment, DeliveryStatus, Order, OrderStatus
from app.db.session import async_session_factory
from app.graphql.types import DeliveryAssignmentType


def _delivery_to_type(d: DeliveryAssignment) -> DeliveryAssignmentType:
    return DeliveryAssignmentType(
        id=d.id,
        status=d.status.value,
        delivery_notes=d.delivery_notes,
        assigned_at=d.assigned_at,
        delivered_at=d.delivered_at,
    )


@strawberry.type
class DeliveryQuery:
    @strawberry.field
    async def my_deliveries(
        self, delivery_boy_id: uuid.UUID, status: str | None = None
    ) -> list[DeliveryAssignmentType]:
        """Get deliveries assigned to a delivery boy."""
        async with async_session_factory() as session:
            query = select(DeliveryAssignment).where(
                DeliveryAssignment.delivery_boy_id == delivery_boy_id
            )
            if status:
                query = query.where(DeliveryAssignment.status == status)
            query = query.order_by(DeliveryAssignment.assigned_at.desc())

            result = await session.execute(query)
            assignments = result.scalars().all()
            return [_delivery_to_type(a) for a in assignments]


@strawberry.type
class DeliveryMutation:
    @strawberry.mutation
    async def assign_delivery(
        self,
        order_id: uuid.UUID,
        delivery_boy_id: uuid.UUID,
        assigned_by: uuid.UUID,
    ) -> DeliveryAssignmentType:
        """Assign a delivery boy to an order."""
        async with async_session_factory() as session:
            # Verify order is in a dispatchable state
            order_result = await session.execute(
                select(Order).where(Order.id == order_id)
            )
            order = order_result.scalar_one_or_none()
            if not order:
                raise Exception("Order not found")
            if order.status not in (OrderStatus.CONFIRMED, OrderStatus.PACKED):
                raise Exception("Order must be CONFIRMED or PACKED to assign delivery")

            assignment = DeliveryAssignment(
                order_id=order_id,
                delivery_boy_id=delivery_boy_id,
                assigned_by=assigned_by,
            )
            session.add(assignment)
            order.status = OrderStatus.DISPATCHED
            await session.commit()
            await session.refresh(assignment)
            return _delivery_to_type(assignment)

    @strawberry.mutation
    async def update_delivery_status(
        self,
        assignment_id: uuid.UUID,
        status: str,
        notes: str | None = None,
        proof_image_url: str | None = None,
    ) -> DeliveryAssignmentType:
        """Update delivery status (delivery boy action)."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(DeliveryAssignment).where(
                    DeliveryAssignment.id == assignment_id
                )
            )
            assignment = result.scalar_one_or_none()
            if not assignment:
                raise Exception("Delivery assignment not found")

            assignment.status = DeliveryStatus(status)
            if notes:
                assignment.delivery_notes = notes
            if proof_image_url:
                assignment.proof_image_url = proof_image_url
            if status == "DELIVERED":
                assignment.delivered_at = datetime.now(timezone.utc)

            await session.commit()
            await session.refresh(assignment)
            return _delivery_to_type(assignment)
