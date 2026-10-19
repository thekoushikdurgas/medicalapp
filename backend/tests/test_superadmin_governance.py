"""
Unit tests for Super Admin Governance, Bulk Price Dry-Run Simulation,
Emergency Automation Circuit Breakers, and Two-Man Dual Approval.
"""

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.db.models import (
    Product,
    StockBatch,
    User,
    UserRole,
    HighRiskApproval,
)
from app.graphql.resolvers.superadmin_governance import (
    SuperAdminGovernanceQuery,
    SuperAdminGovernanceMutation,
)


def make_mock_info(user_id: str | None = None, role: str | None = None):
    info = MagicMock()
    info.context = {
        "user_id": user_id or str(uuid.uuid4()),
        "role": role or UserRole.SUPER_ADMIN.value,
    }
    return info


class TestSuperAdminGovernance:
    @pytest.mark.asyncio
    async def test_simulate_bulk_price_update_dry_run_no_db_changes(self):
        """Dry-run simulation computes margins, detects MRP violations without mutating DB."""
        p1_id = uuid.uuid4()
        p1 = Product(
            id=p1_id,
            name="Amoxicillin 500mg",
            pack_size="10S",
            category="Antibiotics",
            default_mrp=100.0,
            is_active=True,
            stock_batches=[
                StockBatch(
                    id=uuid.uuid4(),
                    product_id=p1_id,
                    purchase_rate=65.0,
                    mrp=100.0,
                    quantity_available=100,
                )
            ],
        )

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [p1]
        mock_session.execute.return_value = mock_result

        query = SuperAdminGovernanceQuery()
        info = make_mock_info(role=UserRole.SUPER_ADMIN.value)

        with patch(
            "app.graphql.resolvers.superadmin_governance.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session

            # Simulate 10% discount
            res = await query.simulate_bulk_price_update(
                info=info,
                action="PERCENTAGE_DISCOUNT",
                value=10.0,
                category="Antibiotics",
            )

            assert res.dry_run is True
            assert res.total_matched == 1
            assert len(res.preview_items) == 1
            item = res.preview_items[0]
            assert item.current_mrp == 100.0
            assert item.new_mrp == 100.0
            # Current PTR approx 78.0 -> 10% discount gives 70.2
            assert item.new_ptr == 70.2
            # 70.2 > cost 65.0, margin = ((70.2 - 65.0)/70.2)*100 = ~7.41%
            assert item.projected_margin_pct > 7.0
            assert res.can_apply is True
            # Verified session.commit() was NEVER called during simulation
            mock_session.commit.assert_not_called()

    @pytest.mark.asyncio
    async def test_apply_bulk_price_update_enforces_super_admin_and_reason(self):
        """Applying bulk price updates requires Super Admin role and documented justification."""
        mutation = SuperAdminGovernanceMutation()

        # Admin attempting to apply live changes must fail
        admin_info = make_mock_info(role=UserRole.ADMIN.value)
        with pytest.raises(
            Exception, match="Only Super Admin can apply live bulk pricing updates"
        ):
            await mutation.apply_bulk_price_update(
                info=admin_info,
                action="PERCENTAGE_DISCOUNT",
                value=5.0,
                reason="Year-end sale",
            )

        # Super Admin without sufficient reason must fail
        super_admin_info = make_mock_info(role=UserRole.SUPER_ADMIN.value)
        with pytest.raises(Exception, match="Documented justification reason"):
            await mutation.apply_bulk_price_update(
                info=super_admin_info,
                action="PERCENTAGE_DISCOUNT",
                value=5.0,
                reason="hi",
            )

    @pytest.mark.asyncio
    async def test_toggle_automation_circuit_breaker(self):
        """Super Admin can safely toggle emergency pause switch on critical automations."""
        caller_id = uuid.uuid4()
        admin_user = User(
            id=caller_id,
            email="superadmin@pharmacy.in",
            full_name="Chief Executive Officer",
            role=UserRole.SUPER_ADMIN,
        )

        mock_session = AsyncMock()
        mock_user_res = MagicMock()
        mock_user_res.scalar_one_or_none.return_value = admin_user
        mock_breaker_res = MagicMock()
        mock_breaker_res.scalar_one_or_none.return_value = None
        mock_session.execute.side_effect = [mock_user_res, mock_breaker_res]

        mutation = SuperAdminGovernanceMutation()
        info = make_mock_info(user_id=str(caller_id), role=UserRole.SUPER_ADMIN.value)

        with patch(
            "app.graphql.resolvers.superadmin_governance.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session

            res = await mutation.toggle_automation_circuit(
                info=info,
                subsystem="ORDER_FULFILLMENT",
                paused=True,
                reason="Warehouse server network maintenance",
            )

            assert res.subsystem == "ORDER_FULFILLMENT"
            assert res.is_paused is True
            assert res.paused_by == "Chief Executive Officer"
            assert "maintenance" in (res.pause_reason or "")
            mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_two_man_rule_prevent_self_approval(self):
        """Enforces Two-Man Rule: Initiator of a high-risk approval cannot self-approve."""
        initiator_id = uuid.uuid4()
        req_id = uuid.uuid4()

        initiator = User(
            id=initiator_id,
            email="admin1@pharmacy.in",
            full_name="Operations Admin John",
            role=UserRole.ADMIN,
        )
        high_risk_req = HighRiskApproval(
            id=req_id,
            action_type="CREDIT_LIMIT_OVERRIDE",
            target_id=str(uuid.uuid4()),
            description="Raise credit limit to ₹250,000 for hospital partner",
            status="PENDING",
            requested_by_id=initiator_id,
            requested_by=initiator,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = high_risk_req
        mock_session.execute.return_value = mock_res

        mutation = SuperAdminGovernanceMutation()
        # Same user attempting to approve their own request
        info = make_mock_info(
            user_id=str(initiator_id), role=UserRole.SUPER_ADMIN.value
        )

        with patch(
            "app.graphql.resolvers.superadmin_governance.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session

            with pytest.raises(Exception, match="Two-Man Rule Violation"):
                await mutation.review_high_risk_approval(
                    info=info,
                    request_id=req_id,
                    approve=True,
                )

    @pytest.mark.asyncio
    async def test_two_man_rule_second_approver_success(self):
        """Second independent Super Admin successfully reviews and approves high-risk request."""
        initiator_id = uuid.uuid4()
        approver_id = uuid.uuid4()
        req_id = uuid.uuid4()

        initiator = User(
            id=initiator_id,
            email="admin1@pharmacy.in",
            full_name="Operations Admin John",
            role=UserRole.ADMIN,
        )
        approver = User(
            id=approver_id,
            email="governor@pharmacy.in",
            full_name="Super Admin Mary",
            role=UserRole.SUPER_ADMIN,
        )

        high_risk_req = HighRiskApproval(
            id=req_id,
            action_type="CREDIT_LIMIT_OVERRIDE",
            target_id=str(uuid.uuid4()),
            description="Raise credit limit to ₹250,000 for hospital partner",
            status="PENDING",
            requested_by_id=initiator_id,
            requested_by=initiator,
        )

        mock_session = AsyncMock()
        mock_req_res = MagicMock()
        mock_req_res.scalar_one_or_none.return_value = high_risk_req
        mock_approver_res = MagicMock()
        mock_approver_res.scalar_one_or_none.return_value = approver
        mock_profile_res = MagicMock()
        mock_profile_res.scalar_one_or_none.return_value = None

        mock_session.execute.side_effect = [
            mock_req_res,
            mock_approver_res,
            mock_profile_res,
        ]

        mutation = SuperAdminGovernanceMutation()
        # Different user (Mary) approving
        info = make_mock_info(user_id=str(approver_id), role=UserRole.SUPER_ADMIN.value)

        with patch(
            "app.graphql.resolvers.superadmin_governance.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session

            res = await mutation.review_high_risk_approval(
                info=info,
                request_id=req_id,
                approve=True,
                reason="Financial background verification validated.",
            )

            assert res.status == "APPROVED"
            assert res.approved_by_id == approver_id
            assert res.approved_by_name == "Super Admin Mary"
            mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_super_admin_governance_overview(self):
        """Governance overview consolidates purchase reconciliations, MFA status, and automation version."""
        mock_session = AsyncMock()
        mock_priv_res = MagicMock()
        mock_priv_res.scalars.return_value.all.return_value = [
            User(id=uuid.uuid4(), email="sa@pharma.in", role=UserRole.SUPER_ADMIN),
            User(id=uuid.uuid4(), email="admin@pharma.in", role=UserRole.ADMIN),
        ]
        mock_mfa_res = MagicMock()
        mock_mfa_res.scalar_one_or_none.return_value = None  # default to True

        mock_recon_res = MagicMock()
        mock_recon_res.scalars.return_value.all.return_value = []

        mock_session.execute.side_effect = [mock_priv_res, mock_mfa_res, mock_recon_res]

        query = SuperAdminGovernanceQuery()
        info = make_mock_info(role=UserRole.SUPER_ADMIN.value)

        with patch(
            "app.graphql.resolvers.superadmin_governance.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await query.super_admin_governance_overview(info=info)

            assert res.mfa_enforced is True
            assert res.privileged_accounts_count >= 2
            assert res.automation_rules_version.startswith("v2.4")
            assert len(res.supplier_reconciliations) >= 1
            assert res.bank_reconciled_percentage > 90.0

    @pytest.mark.asyncio
    async def test_toggle_mfa_enforcement(self):
        """Super Admin can toggle platform-wide MFA requirement on privileged accounts."""
        mock_session = AsyncMock()
        mock_policy_res = MagicMock()
        mock_policy_res.scalar_one_or_none.return_value = None

        mock_session.execute.return_value = mock_policy_res

        mutation = SuperAdminGovernanceMutation()
        info = make_mock_info(role=UserRole.SUPER_ADMIN.value)

        with patch(
            "app.graphql.resolvers.superadmin_governance.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await mutation.toggle_mfa_enforcement(info=info, enable=True)

            assert res is True
            mock_session.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_resolve_supplier_reconciliation(self):
        """Administrators can resolve supplier 3-way invoice discrepancies."""
        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = None

        mock_session.execute.return_value = mock_res

        mutation = SuperAdminGovernanceMutation()
        info = make_mock_info(role=UserRole.SUPER_ADMIN.value)

        with patch(
            "app.graphql.resolvers.superadmin_governance.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await mutation.resolve_supplier_reconciliation(
                info=info,
                record_id="recon-1",
                status="RESOLVED",
                notes="Credit note credited by Sun Pharma",
            )

            assert res.status == "RESOLVED"
            assert res.id == "recon-1"
