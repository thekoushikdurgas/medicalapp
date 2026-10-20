"""
Payment & Advance Deposit GraphQL resolvers — queries and mutations.
"""

import uuid
import strawberry
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.models import AdvancePayment, PaymentMethod, UserRole
from app.db.session import async_session_factory
from app.graphql.resolvers.auth import _get_caller
from app.graphql.types import (
    AdvancePaymentType,
    RecordAdvancePaymentInput,
)
from app.services.payment_service import record_advance_payment as svc_record_advance


def _advance_to_type(p: AdvancePayment) -> AdvancePaymentType:
    s_name = p.shopkeeper.full_name if p.shopkeeper else None
    return AdvancePaymentType(
        id=p.id,
        receipt_number=p.receipt_number,
        shopkeeper_id=p.shopkeeper_id,
        amount=float(p.amount),
        payment_method=p.payment_method.value,
        reference_no=p.reference_no,
        notes=p.notes,
        paid_at=p.paid_at,
        shopkeeper_name=s_name,
    )


@strawberry.type
class PaymentQuery:
    @strawberry.field
    async def advance_payments(
        self,
        info: strawberry.Info,
        shopkeeper_id: uuid.UUID | None = None,
        page: int = 1,
        per_page: int = 50,
    ) -> list[AdvancePaymentType]:
        """List advance payments, optionally filtered by shopkeeper."""
        user_id_str, role = _get_caller(info)
        async with async_session_factory() as session:
            stmt = select(AdvancePayment).options(
                selectinload(AdvancePayment.shopkeeper)
            )
            if role == UserRole.SHOPKEEPER.value:
                stmt = stmt.where(
                    AdvancePayment.shopkeeper_id == uuid.UUID(user_id_str)
                )
            elif shopkeeper_id:
                stmt = stmt.where(AdvancePayment.shopkeeper_id == shopkeeper_id)

            stmt = (
                stmt.order_by(AdvancePayment.paid_at.desc())
                .offset((page - 1) * per_page)
                .limit(per_page)
            )
            result = await session.execute(stmt)
            payments = result.scalars().all()
            return [_advance_to_type(p) for p in payments]


@strawberry.type
class PaymentMutation:
    @strawberry.mutation
    async def record_advance_payment(
        self,
        info: strawberry.Info,
        input: RecordAdvancePaymentInput,
    ) -> AdvancePaymentType:
        """Record an advance deposit from a retail shopkeeper."""
        user_id_str, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception(
                "Permission denied: Only Admin or Staff can record advance payments."
            )

        recorded_by = uuid.UUID(user_id_str)
        try:
            method_enum = PaymentMethod(input.payment_method)
        except ValueError:
            method_enum = PaymentMethod.CASH

        async with async_session_factory() as session:
            payment = await svc_record_advance(
                session=session,
                shopkeeper_id=input.shopkeeper_id,
                amount=input.amount,
                payment_method=method_enum,
                reference_no=input.reference_no,
                notes=input.notes,
                recorded_by=recorded_by,
            )
            await session.commit()
            await session.refresh(payment)

            stmt = (
                select(AdvancePayment)
                .options(selectinload(AdvancePayment.shopkeeper))
                .where(AdvancePayment.id == payment.id)
            )
            res = await session.execute(stmt)
            full_payment = res.scalar_one()
            return _advance_to_type(full_payment)
