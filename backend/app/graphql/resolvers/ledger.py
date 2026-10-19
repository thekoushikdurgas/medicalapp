"""
Financial Ledger & Return Claims GraphQL resolvers.
"""

import uuid
from datetime import date, datetime, timezone
import strawberry
from strawberry.types import Info
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.models import (
    LedgerEntry,
    ReturnRequest,
    ReturnRequestStatus,
    Product,
    StockBatch,
    ShopkeeperProfile,
    User,
    UserRole,
)
from app.db.session import async_session_factory
from app.graphql.resolvers.auth import _get_caller
from app.graphql.types import (
    LedgerRecordType,
    ReturnClaimType,
    SubmitReturnRequestInput,
    ReviewReturnRequestInput,
)
from app.services.ledger_service import get_shopkeeper_ledger


def _ledger_to_type(l: LedgerEntry) -> LedgerRecordType:
    s_name = l.shopkeeper.full_name if getattr(l, "shopkeeper", None) else None
    return LedgerRecordType(
        id=l.id,
        shopkeeper_id=l.shopkeeper_id,
        entry_type=l.entry_type.value,
        amount=float(l.amount),
        balance_after=float(l.balance_after),
        reference_number=l.reference_number,
        description=l.description,
        created_at=l.created_at,
        shopkeeper_name=s_name,
    )


def _claim_to_type(c: ReturnRequest) -> ReturnClaimType:
    p_name = c.product.name if getattr(c, "product", None) else None
    b_num = c.stock_batch.batch_number if getattr(c, "stock_batch", None) else None
    s_name = c.shopkeeper.full_name if getattr(c, "shopkeeper", None) else None

    return ReturnClaimType(
        id=c.id,
        request_number=c.request_number,
        shopkeeper_id=c.shopkeeper_id,
        product_id=c.product_id,
        product_name=p_name,
        stock_batch_id=c.stock_batch_id,
        batch_number=b_num,
        quantity=c.quantity,
        reason=c.reason,
        remarks=c.remarks,
        image_url=c.image_url,
        status=c.status.value,
        reviewed_by=c.reviewed_by,
        rejection_reason=c.rejection_reason,
        created_at=c.created_at,
        updated_at=c.updated_at,
        shopkeeper_name=s_name,
    )


@strawberry.type
class LedgerQuery:
    @strawberry.field
    async def my_ledger(
        self,
        info: Info,
        shopkeeper_id: uuid.UUID | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[LedgerRecordType]:
        """
        Retrieve financial ledger statement:
        - Retail Shopkeeper can only view their own ledger.
        - Admin can pass a shopkeeper_id to view any party ledger.
        """
        user_id_str, role = _get_caller(info)
        if role == UserRole.SHOPKEEPER.value:
            target_sk_id = uuid.UUID(user_id_str)
        elif role in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
            if not shopkeeper_id:
                raise Exception("Shopkeeper ID is required when viewing ledger as Admin.")
            target_sk_id = shopkeeper_id
        else:
            raise Exception("Permission denied: You cannot view financial ledgers.")

        async with async_session_factory() as session:
            entries = await get_shopkeeper_ledger(
                session=session,
                shopkeeper_id=target_sk_id,
                limit=limit,
                offset=offset,
            )
            return [_ledger_to_type(e) for e in entries]

    @strawberry.field
    async def return_claims(
        self,
        info: Info,
        status: str | None = None,
        page: int = 1,
        per_page: int = 50,
    ) -> list[ReturnClaimType]:
        """
        List return claims:
        - Shopkeeper sees their own submitted claims.
        - Admin and Warehouse staff see all incoming claims.
        """
        user_id_str, role = _get_caller(info)
        async with async_session_factory() as session:
            stmt = (
                select(ReturnRequest)
                .options(
                    selectinload(ReturnRequest.product),
                    selectinload(ReturnRequest.stock_batch),
                    selectinload(ReturnRequest.shopkeeper),
                )
            )

            if role == UserRole.SHOPKEEPER.value:
                stmt = stmt.where(ReturnRequest.shopkeeper_id == uuid.UUID(user_id_str))
            elif role not in (
                UserRole.SUPER_ADMIN.value,
                UserRole.ADMIN.value,
                UserRole.WAREHOUSE.value,
            ):
                raise Exception("Permission denied: You cannot view return claims.")

            if status:
                stmt = stmt.where(ReturnRequest.status == ReturnRequestStatus(status))

            stmt = (
                stmt.order_by(ReturnRequest.created_at.desc())
                .offset((page - 1) * per_page)
                .limit(per_page)
            )
            res = await session.execute(stmt)
            claims = res.scalars().all()
            return [_claim_to_type(c) for c in claims]


@strawberry.type
class LedgerMutation:
    @strawberry.mutation
    async def submit_return_claim(
        self,
        info: Info,
        input: SubmitReturnRequestInput,
    ) -> ReturnClaimType:
        """
        Retail Shopkeeper submits a claim for damaged or expired stock.
        """
        user_id_str, role = _get_caller(info)
        if role != UserRole.SHOPKEEPER.value:
            raise Exception("Only Retail Shopkeepers can submit return claims.")

        sk_id = uuid.UUID(user_id_str)
        async with async_session_factory() as session:
            # Generate sequential request number: CLM-YYYYMMDD-XXXX
            today_str = date.today().strftime("%Y%m%d")
            count_q = select(func.count(ReturnRequest.id))
            current_count = (await session.execute(count_q)).scalar() or 0
            req_num = f"CLM-{today_str}-{(current_count + 1):04d}"

            claim = ReturnRequest(
                request_number=req_num,
                shopkeeper_id=sk_id,
                product_id=input.product_id,
                stock_batch_id=input.stock_batch_id,
                quantity=input.quantity,
                reason=input.reason,
                remarks=input.remarks,
                image_url=input.image_url,
                status=ReturnRequestStatus.PENDING,
            )
            session.add(claim)
            await session.commit()
            await session.refresh(claim)

            # Eager load relationships for response
            res = await session.execute(
                select(ReturnRequest)
                .options(
                    selectinload(ReturnRequest.product),
                    selectinload(ReturnRequest.stock_batch),
                    selectinload(ReturnRequest.shopkeeper),
                )
                .where(ReturnRequest.id == claim.id)
            )
            full_claim = res.scalar_one()
            return _claim_to_type(full_claim)

    @strawberry.mutation
    async def review_return_claim(
        self,
        info: Info,
        input: ReviewReturnRequestInput,
    ) -> ReturnClaimType:
        """
        Operations Admin or Warehouse Staff approves or rejects a return claim.
        """
        user_id_str, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception("Permission denied: Only Admin or Warehouse Staff can review return claims.")

        reviewer_id = uuid.UUID(user_id_str)
        action = input.action.upper()
        if action not in ("APPROVE", "REJECT"):
            raise Exception("Action must be APPROVE or REJECT.")

        async with async_session_factory() as session:
            res = await session.execute(
                select(ReturnRequest)
                .options(
                    selectinload(ReturnRequest.product),
                    selectinload(ReturnRequest.stock_batch),
                    selectinload(ReturnRequest.shopkeeper),
                )
                .where(ReturnRequest.id == input.request_id)
            )
            claim = res.scalar_one_or_none()
            if not claim:
                raise Exception("Return claim not found.")

            if action == "APPROVE":
                claim.status = ReturnRequestStatus.APPROVED
                claim.reviewed_by = reviewer_id
            else:
                claim.status = ReturnRequestStatus.REJECTED
                claim.reviewed_by = reviewer_id
                claim.rejection_reason = input.rejection_reason or "Claim rejected by administrator."

            claim.updated_at = datetime.now(timezone.utc)
            await session.commit()
            await session.refresh(claim)
            return _claim_to_type(claim)
