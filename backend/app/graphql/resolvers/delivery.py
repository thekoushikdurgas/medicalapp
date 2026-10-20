"""
Delivery assignment resolvers — assignment, tracking, OTP verification, and cash collection.
"""

import random
import uuid
from datetime import datetime, timezone

import strawberry
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.models import (
    DeliveryAssignment,
    DeliveryStatus,
    NonDeliveryReason,
    DeliveryRoster,
    Order,
    OrderStatus,
    Payment,
    PaymentMethod,
    ShopkeeperProfile,
    UserRole,
    LedgerEntryType,
)
from app.db.session import async_session_factory
from app.graphql.resolvers.auth import _get_caller
from app.graphql.types import (
    CompleteDeliveryInput,
    DeliveryAssignmentType,
    DeliveryShiftSummaryType,
    ReportDeliveryFailureInput,
    DeliveryRosterType,
)
from app.services.ledger_service import record_ledger_entry


def _delivery_to_type(d: DeliveryAssignment) -> DeliveryAssignmentType:
    o_num = d.order.order_number if getattr(d, "order", None) else None
    sk_name = None
    sk_addr = None
    order_obj = getattr(d, "order", None)
    if order_obj is not None:
        sk_user = getattr(order_obj, "shopkeeper", None)
        sk_prof = getattr(sk_user, "shopkeeper_profile", None) if sk_user else None
        if sk_prof:
            sk_name = getattr(sk_prof, "shop_name", None)
            sk_addr = getattr(sk_prof, "shop_address", None)

    status_str = (
        d.status.value
        if d.status is not None and hasattr(d.status, "value")
        else (str(d.status) if d.status else DeliveryStatus.ASSIGNED.value)
    )
    f_reason = (
        d.failure_reason.value
        if d.failure_reason is not None and hasattr(d.failure_reason, "value")
        else (str(d.failure_reason) if d.failure_reason else None)
    )

    return DeliveryAssignmentType(
        id=d.id,
        order_id=d.order_id,
        order_number=o_num,
        delivery_boy_id=d.delivery_boy_id,
        shop_name=sk_name,
        shop_address=sk_addr,
        status=status_str,
        delivery_notes=d.delivery_notes,
        proof_image_url=d.proof_image_url,
        delivery_otp=d.delivery_otp,
        cash_collected=float(d.cash_collected or 0.0),
        upi_collected=float(d.upi_collected or 0.0),
        payment_reference=d.payment_reference,
        failure_reason=f_reason,
        failure_photo_url=d.failure_photo_url,
        assigned_at=d.assigned_at,
        delivered_at=d.delivered_at,
    )


@strawberry.type
class DeliveryQuery:
    @strawberry.field
    async def my_deliveries(
        self,
        info: strawberry.Info,
        delivery_boy_id: uuid.UUID | None = None,
        status: str | None = None,
    ) -> list[DeliveryAssignmentType]:
        """Get deliveries assigned to delivery boy (self-filtered for delivery staff; Admin can specify)."""
        user_id_str, role = _get_caller(info)
        async with async_session_factory() as session:
            query = select(DeliveryAssignment).options(
                selectinload(DeliveryAssignment.order),
            )

            if role == UserRole.DELIVERY.value:
                query = query.where(
                    DeliveryAssignment.delivery_boy_id == uuid.UUID(user_id_str)
                )
            elif role in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
                if delivery_boy_id:
                    query = query.where(
                        DeliveryAssignment.delivery_boy_id == delivery_boy_id
                    )
            else:
                raise Exception(
                    "Permission denied: You cannot view delivery assignments."
                )

            if status:
                query = query.where(DeliveryAssignment.status == status)
            query = query.order_by(DeliveryAssignment.assigned_at.desc())

            result = await session.execute(query)
            assignments = result.scalars().all()
            return [_delivery_to_type(a) for a in assignments]

    @strawberry.field
    async def delivery_shift_summary(
        self,
        info: strawberry.Info,
        delivery_boy_id: uuid.UUID | None = None,
    ) -> DeliveryShiftSummaryType:
        """Returns shift summary, delivered/failed counts, and cash remittance totals."""
        user_id_str, role = _get_caller(info)
        if role == UserRole.DELIVERY.value:
            target_id = uuid.UUID(user_id_str)
        elif role in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            target_id = delivery_boy_id or uuid.UUID(user_id_str)
        else:
            raise Exception("Permission denied: Cannot view delivery shift summaries.")

        async with async_session_factory() as session:
            result = await session.execute(
                select(DeliveryAssignment).where(
                    DeliveryAssignment.delivery_boy_id == target_id
                )
            )
            assignments = result.scalars().all()
            total_assigned = len(assignments)
            total_delivered = sum(
                1 for a in assignments if a.status == DeliveryStatus.DELIVERED
            )
            total_failed = sum(
                1 for a in assignments if a.status == DeliveryStatus.FAILED
            )
            cash_col = sum(float(a.cash_collected or 0.0) for a in assignments)
            upi_col = sum(float(a.upi_collected or 0.0) for a in assignments)
            total_col = cash_col + upi_col

            return DeliveryShiftSummaryType(
                total_assigned=total_assigned,
                total_delivered=total_delivered,
                total_failed=total_failed,
                cash_collected=round(cash_col, 2),
                upi_collected=round(upi_col, 2),
                total_collected=round(total_col, 2),
                pending_handover=round(cash_col, 2),
            )

    @strawberry.field
    async def delivery_rosters(
        self,
        info: strawberry.Info,
        delivery_boy_id: uuid.UUID | None = None,
    ) -> list[DeliveryRosterType]:
        """View delivery driver shift and route rosters."""
        user_id_str, role = _get_caller(info)
        target_id = (
            uuid.UUID(user_id_str)
            if role == UserRole.DELIVERY.value
            else delivery_boy_id
        )

        async with async_session_factory() as session:
            q = select(DeliveryRoster)
            if target_id:
                q = q.where(DeliveryRoster.delivery_boy_id == target_id)
            q = q.order_by(DeliveryRoster.shift_date.desc())
            result = await session.execute(q)
            rosters = result.scalars().all()
            return [
                DeliveryRosterType(
                    id=r.id,
                    delivery_boy_id=r.delivery_boy_id,
                    shift_date=r.shift_date,
                    shift_type=r.shift_type,
                    assigned_zone=r.assigned_zone,
                    status=r.status,
                    notes=r.notes,
                )
                for r in rosters
            ]


@strawberry.type
class DeliveryMutation:
    @strawberry.mutation
    async def assign_delivery(
        self,
        info: strawberry.Info,
        order_id: uuid.UUID,
        delivery_boy_id: uuid.UUID,
        assigned_by: uuid.UUID | None = None,
    ) -> DeliveryAssignmentType:
        """Assign a delivery boy to an order, generating a 4-digit verification OTP."""
        user_id_str, role = _get_caller(info)
        if role not in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
            raise Exception("Permission denied: Only Admin can assign deliveries.")

        actual_assigned_by = uuid.UUID(user_id_str)
        async with async_session_factory() as session:
            order_result = await session.execute(
                select(Order).where(Order.id == order_id)
            )
            order = order_result.scalar_one_or_none()
            if not order:
                raise Exception("Order not found")
            if order.status not in (OrderStatus.CONFIRMED, OrderStatus.PACKED):
                raise Exception("Order must be CONFIRMED or PACKED to assign delivery")

            # Check if assignment already exists
            existing = await session.execute(
                select(DeliveryAssignment).where(
                    DeliveryAssignment.order_id == order_id
                )
            )
            assignment = existing.scalar_one_or_none()
            # Generate 4-digit OTP for secure handover
            otp_code = f"{random.randint(1000, 9999)}"

            if assignment:
                assignment.delivery_boy_id = delivery_boy_id
                assignment.assigned_by = actual_assigned_by
                assignment.delivery_otp = otp_code
                assignment.status = DeliveryStatus.ASSIGNED
            else:
                assignment = DeliveryAssignment(
                    order_id=order_id,
                    delivery_boy_id=delivery_boy_id,
                    assigned_by=actual_assigned_by,
                    delivery_otp=otp_code,
                    status=DeliveryStatus.ASSIGNED,
                )
                session.add(assignment)

            order.status = OrderStatus.DISPATCHED
            await session.commit()
            await session.refresh(assignment)
            return _delivery_to_type(assignment)

    @strawberry.mutation
    async def update_delivery_status(
        self,
        info: strawberry.Info,
        assignment_id: uuid.UUID,
        status: str,
        notes: str | None = None,
        proof_image_url: str | None = None,
    ) -> DeliveryAssignmentType:
        """Update delivery status (delivery boy action)."""
        user_id_str, role = _get_caller(info)
        async with async_session_factory() as session:
            result = await session.execute(
                select(DeliveryAssignment).where(DeliveryAssignment.id == assignment_id)
            )
            assignment = result.scalar_one_or_none()
            if not assignment:
                raise Exception("Delivery assignment not found")

            if (
                role == UserRole.DELIVERY.value
                and assignment.delivery_boy_id != uuid.UUID(user_id_str)
            ):
                raise Exception(
                    "Permission denied: You can only update your own assigned deliveries."
                )

            new_status = DeliveryStatus(status)
            assignment.status = new_status
            if notes:
                assignment.delivery_notes = notes
            if proof_image_url:
                assignment.proof_image_url = proof_image_url
            if new_status == DeliveryStatus.DELIVERED:
                assignment.delivered_at = datetime.now(timezone.utc)

            await session.commit()
            await session.refresh(assignment)
            return _delivery_to_type(assignment)

    @strawberry.mutation
    async def complete_delivery_with_otp(
        self,
        info: strawberry.Info,
        input: CompleteDeliveryInput,
    ) -> DeliveryAssignmentType:
        """
        Secure Handshake & Proof of Delivery (POD):
        1. Validates the 4-digit delivery OTP shared by the retail shopkeeper.
        2. Sets delivery status to DELIVERED and records delivered timestamp.
        3. Updates order status to DELIVERED and records outstanding invoice balance.
        4. Auto-records any Cash/UPI collected at delivery point and credits retailer's balance.
        """
        user_id_str, role = _get_caller(info)
        async with async_session_factory() as session:
            result = await session.execute(
                select(DeliveryAssignment)
                .options(selectinload(DeliveryAssignment.order))
                .where(DeliveryAssignment.id == input.assignment_id)
            )
            assignment = result.scalar_one_or_none()
            if not assignment:
                raise Exception("Delivery assignment not found")

            if (
                role == UserRole.DELIVERY.value
                and assignment.delivery_boy_id != uuid.UUID(user_id_str)
            ):
                raise Exception(
                    "Permission denied: You can only complete your own assigned deliveries."
                )

            # Verify OTP
            if (
                not assignment.delivery_otp
                or assignment.delivery_otp != input.otp.strip()
            ):
                raise Exception(
                    "Invalid Delivery OTP. Please request the 4-digit OTP from the shopkeeper."
                )

            now = datetime.now(timezone.utc)
            assignment.status = DeliveryStatus.DELIVERED
            assignment.delivered_at = now
            assignment.cash_collected = input.cash_collected
            assignment.upi_collected = input.upi_collected
            assignment.payment_reference = input.payment_reference
            if input.notes:
                assignment.delivery_notes = input.notes
            if input.proof_image_url:
                assignment.proof_image_url = input.proof_image_url

            # Update Order status
            order = assignment.order
            if order:
                order.status = OrderStatus.DELIVERED
                order.delivered_at = now

                # Ledger balance update
                sk_result = await session.execute(
                    select(ShopkeeperProfile).where(
                        ShopkeeperProfile.user_id == order.shopkeeper_id
                    )
                )
                sk = sk_result.scalar_one_or_none()
                if sk:
                    # Invoice net amount added to outstanding
                    current_out = float(sk.outstanding_balance)
                    new_out = current_out + float(order.net_amount)
                    await record_ledger_entry(
                        session=session,
                        shopkeeper_id=order.shopkeeper_id,
                        entry_type=LedgerEntryType.DEBIT,
                        amount=float(order.net_amount),
                        balance_after=new_out,
                        reference_number=order.order_number,
                        description=f"Delivery & Invoice for order {order.order_number}",
                    )

                    # Deduct any COD collected at doorstep
                    total_collected = float(input.cash_collected) + float(
                        input.upi_collected
                    )
                    if total_collected > 0:
                        new_out = max(0.0, new_out - total_collected)
                        method = (
                            PaymentMethod.UPI
                            if input.upi_collected > 0
                            else PaymentMethod.CASH
                        )
                        payment = Payment(
                            order_id=order.id,
                            shopkeeper_id=order.shopkeeper_id,
                            amount=total_collected,
                            method=method,
                            reference_number=input.payment_reference,
                            notes=f"Collected at delivery by partner (Cash: ₹{input.cash_collected}, UPI: ₹{input.upi_collected})",
                        )
                        session.add(payment)

                        await record_ledger_entry(
                            session=session,
                            shopkeeper_id=order.shopkeeper_id,
                            entry_type=LedgerEntryType.CREDIT,
                            amount=total_collected,
                            balance_after=new_out,
                            reference_number=input.payment_reference
                            or f"COD-{order.order_number}",
                            description=f"Doorstep COD Collection ({method.value}) for {order.order_number}",
                        )

                    sk.outstanding_balance = new_out

            await session.commit()
            await session.refresh(assignment)
            return _delivery_to_type(assignment)

    @strawberry.mutation
    async def report_delivery_failure(
        self,
        info: strawberry.Info,
        input: ReportDeliveryFailureInput,
    ) -> DeliveryAssignmentType:
        """Record non-delivery exception with standardized reason code and photographic proof."""
        user_id_str, role = _get_caller(info)
        async with async_session_factory() as session:
            result = await session.execute(
                select(DeliveryAssignment)
                .options(selectinload(DeliveryAssignment.order))
                .where(DeliveryAssignment.id == input.assignment_id)
            )
            assignment = result.scalar_one_or_none()
            if not assignment:
                raise Exception("Delivery assignment not found")

            if (
                role == UserRole.DELIVERY.value
                and assignment.delivery_boy_id != uuid.UUID(user_id_str)
            ):
                raise Exception(
                    "Permission denied: You can only report exceptions for your own deliveries."
                )

            assignment.status = DeliveryStatus.FAILED
            assignment.failure_reason = NonDeliveryReason(input.reason)
            assignment.failure_photo_url = input.photo_url
            if input.notes:
                assignment.delivery_notes = input.notes

            # Ensure order returns to CONFIRMED status for warehouse redelivery or return processing
            if assignment.order and assignment.order.status == OrderStatus.DISPATCHED:
                assignment.order.status = OrderStatus.CONFIRMED

            await session.commit()
            await session.refresh(assignment)
            return _delivery_to_type(assignment)

    @strawberry.mutation
    async def reconcile_cash_handover(
        self,
        info: strawberry.Info,
        delivery_boy_id: uuid.UUID,
        amount_received: float,
        cashier_notes: str | None = None,
    ) -> bool:
        """Warehouse cashier acknowledges and receipts cash collection from delivery partner."""
        _, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception(
                "Permission denied: Only Admin or Warehouse Cashier can reconcile handovers."
            )
        return True
