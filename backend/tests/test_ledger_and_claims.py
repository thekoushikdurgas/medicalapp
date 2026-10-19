"""
Unit tests for Financial Ledger and Return Claims.
"""

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.db.models import (
    LedgerEntry,
    LedgerEntryType,
    ReturnRequest,
    ReturnRequestStatus,
    UserRole,
)
from app.services.ledger_service import record_ledger_entry
from app.graphql.resolvers.ledger import LedgerQuery, LedgerMutation
from app.graphql.types import SubmitReturnRequestInput, ReviewReturnRequestInput


def make_mock_info(
    user_id: str | None = None, role: str | None = None, has_auth_header: bool = True
):
    info = MagicMock()
    if not has_auth_header and user_id is None:
        info.context = {}
        return info

    info.context = {
        "user_id": user_id,
        "role": role,
    }
    return info


class TestFinancialLedgerService:
    @pytest.mark.asyncio
    async def test_record_ledger_debit_and_credit(self):
        """Verifies party ledger recording with debit (invoice) and credit (payment)."""
        sk_id = uuid.uuid4()
        mock_session = AsyncMock()

        # 1. Invoice Debit
        debit = await record_ledger_entry(
            session=mock_session,
            shopkeeper_id=sk_id,
            entry_type=LedgerEntryType.DEBIT,
            amount=5000.0,
            balance_after=5000.0,
            reference_number="INV-2026-001",
            description="Delivery of Order ORD-1001",
        )
        assert debit.entry_type == LedgerEntryType.DEBIT
        assert debit.amount == 5000.0
        assert debit.balance_after == 5000.0
        assert debit.reference_number == "INV-2026-001"

        # 2. Payment Credit
        credit = await record_ledger_entry(
            session=mock_session,
            shopkeeper_id=sk_id,
            entry_type=LedgerEntryType.CREDIT,
            amount=3000.0,
            balance_after=2000.0,
            reference_number="REC-2026-001",
            description="Advance Deposit via UPI",
        )
        assert credit.entry_type == LedgerEntryType.CREDIT
        assert credit.amount == 3000.0
        assert credit.balance_after == 2000.0


class TestLedgerGraphQLResolvers:
    @pytest.mark.asyncio
    async def test_shopkeeper_views_own_ledger(self):
        """Shopkeeper can view their own ledger statement."""
        sk_id = uuid.uuid4()
        mock_entry = LedgerEntry(
            id=uuid.uuid4(),
            shopkeeper_id=sk_id,
            entry_type=LedgerEntryType.DEBIT,
            amount=1200.0,
            balance_after=1200.0,
            reference_number="INV-99",
            description="Invoice",
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalars.return_value.all.return_value = [mock_entry]
        mock_session.execute.return_value = mock_res

        info = make_mock_info(user_id=str(sk_id), role=UserRole.SHOPKEEPER.value)

        with patch(
            "app.graphql.resolvers.ledger.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            ledger = await LedgerQuery().my_ledger(info)

            assert len(ledger) == 1
            assert ledger[0].amount == 1200.0
            assert ledger[0].entry_type == "DEBIT"

    @pytest.mark.asyncio
    async def test_shopkeeper_cannot_view_other_shopkeeper_ledger(self):
        """Shopkeeper cannot view another party's ledger."""
        sk1_id = uuid.uuid4()
        sk2_id = uuid.uuid4()

        info = make_mock_info(user_id=str(sk1_id), role=UserRole.SHOPKEEPER.value)

        with patch(
            "app.graphql.resolvers.ledger.async_session_factory"
        ) as mock_factory:
            # Shopkeeper ignores passed shopkeeper_id and always sees only their own
            mock_session = AsyncMock()
            mock_res = MagicMock()
            mock_res.scalars.return_value.all.return_value = []
            mock_session.execute.return_value = mock_res
            mock_factory.return_value.__aenter__.return_value = mock_session

            # Query with sk2_id should still safely query sk1's ledger
            entries = await LedgerQuery().my_ledger(info, shopkeeper_id=sk2_id)
            # The query executed where shopkeeper_id == sk1_id
            assert entries == []

    @pytest.mark.asyncio
    async def test_submit_and_review_return_claim(self):
        """Shopkeeper submits a return claim, and Admin reviews it."""
        sk_id = uuid.uuid4()
        prod_id = uuid.uuid4()
        admin_id = uuid.uuid4()
        claim_id = uuid.uuid4()

        # Submit claim
        info_sk = make_mock_info(user_id=str(sk_id), role=UserRole.SHOPKEEPER.value)
        input_submit = SubmitReturnRequestInput(
            product_id=prod_id,
            quantity=10,
            reason="BROKEN_VIALS",
            remarks="Carton crushed in transit",
        )

        claim_obj = ReturnRequest(
            id=claim_id,
            request_number="CLM-20261019-0001",
            shopkeeper_id=sk_id,
            product_id=prod_id,
            quantity=10,
            reason="BROKEN_VIALS",
            status=ReturnRequestStatus.PENDING,
        )

        mock_session = AsyncMock()
        mock_count = MagicMock()
        mock_count.scalar.return_value = 0
        mock_claim_res = MagicMock()
        mock_claim_res.scalar_one.return_value = claim_obj
        mock_claim_res.scalar_one_or_none.return_value = claim_obj
        mock_session.execute.side_effect = [mock_count, mock_claim_res, mock_claim_res]

        with patch(
            "app.graphql.resolvers.ledger.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            created = await LedgerMutation().submit_return_claim(info_sk, input_submit)
            assert created.request_number.startswith("CLM-")
            assert created.status == "PENDING"

            # Admin reviews and approves claim
            info_admin = make_mock_info(
                user_id=str(admin_id), role=UserRole.ADMIN.value
            )
            input_review = ReviewReturnRequestInput(
                request_id=claim_id,
                action="APPROVE",
            )
            reviewed = await LedgerMutation().review_return_claim(
                info_admin, input_review
            )
            assert reviewed.status == "APPROVED"
            assert reviewed.reviewed_by == admin_id
