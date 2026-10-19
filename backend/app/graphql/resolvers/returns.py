"""
Invoice Return / Credit Note GraphQL resolvers — queries and mutations.
"""

import uuid
import strawberry
from strawberry.types import Info
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.models import InvoiceReturn, UserRole
from app.db.session import async_session_factory
from app.graphql.resolvers.auth import _get_caller
from app.graphql.types import (
    InvoiceReturnType,
    InvoiceReturnItemType,
    CreateInvoiceReturnInput,
)
from app.services.return_service import create_invoice_return


def _return_to_type(r: InvoiceReturn) -> InvoiceReturnType:
    items = []
    if r.items:
        for i in r.items:
            p_name = i.product.name if i.product else None
            items.append(
                InvoiceReturnItemType(
                    id=i.id,
                    product_id=i.product_id,
                    stock_batch_id=i.stock_batch_id,
                    quantity=i.quantity,
                    rate=float(i.rate),
                    discount_pct=float(i.discount_pct),
                    product_name=p_name,
                )
            )

    return InvoiceReturnType(
        id=r.id,
        invoice_id=r.invoice_id,
        credit_note_no=r.credit_note_no,
        return_date=r.return_date,
        refund_subtotal=float(r.refund_subtotal),
        refund_sgst=float(r.refund_sgst),
        refund_cgst=float(r.refund_cgst),
        grand_refund=float(r.grand_refund),
        reason=r.reason,
        restock_status=r.restock_status,
        created_at=r.created_at,
        items=items,
    )


@strawberry.type
class ReturnQuery:
    @strawberry.field
    async def invoice_returns(
        self,
        info: Info,
        page: int = 1,
        per_page: int = 50,
    ) -> list[InvoiceReturnType]:
        """List all GST credit notes / invoice returns."""
        _get_caller(info)
        async with async_session_factory() as session:
            stmt = (
                select(InvoiceReturn)
                .options(selectinload(InvoiceReturn.items))
                .order_by(InvoiceReturn.created_at.desc())
                .offset((page - 1) * per_page)
                .limit(per_page)
            )
            result = await session.execute(stmt)
            returns = result.scalars().all()
            return [_return_to_type(r) for r in returns]


@strawberry.type
class ReturnMutation:
    @strawberry.mutation
    async def create_invoice_return(
        self,
        info: Info,
        input: CreateInvoiceReturnInput,
    ) -> InvoiceReturnType:
        """Issue an official GST Credit Note for an invoice."""
        user_id_str, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception(
                "Permission denied: Only Admin or Warehouse staff can issue credit notes."
            )

        created_by = uuid.UUID(user_id_str)
        return_items = [
            {
                "product_id": str(i.product_id),
                "stock_batch_id": str(i.stock_batch_id),
                "quantity": i.quantity,
                "rate": i.rate,
                "discount_pct": i.discount_pct,
            }
            for i in input.items
        ]

        async with async_session_factory() as session:
            crn = await create_invoice_return(
                session=session,
                invoice_id=input.invoice_id,
                return_items=return_items,
                restock_status=input.restock_status,
                reason=input.reason,
                created_by=created_by,
            )
            await session.commit()
            await session.refresh(crn)

            stmt = (
                select(InvoiceReturn)
                .options(selectinload(InvoiceReturn.items))
                .where(InvoiceReturn.id == crn.id)
            )
            res = await session.execute(stmt)
            full_crn = res.scalar_one()
            return _return_to_type(full_crn)
