"""
Unit tests for Operations Admin Automation, Onboarding Decision Notifications, and Integration Health.
"""

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.db.models import (
    AutomationJob,
    JobStatus,
    Notification,
    ShopkeeperProfile,
    User,
    UserRole,
)
from app.graphql.resolvers.auth import AuthMutation
from app.graphql.resolvers.ops_automation import (
    OpsAutomationMutation,
    OpsAutomationQuery,
)


def make_mock_info(user_id: str | None = None, role: str | None = None):
    info = MagicMock()
    info.context = {
        "user_id": user_id or str(uuid.uuid4()),
        "role": role or UserRole.ADMIN.value,
    }
    return info


class TestOpsAdminAutomationAndHealth:
    @pytest.mark.asyncio
    async def test_update_shopkeeper_kyc_creates_notification(self):
        """When admin verifies or rejects a shopkeeper, a notification is sent to the retailer."""
        sk_user_id = uuid.uuid4()
        profile_id = uuid.uuid4()

        user = User(
            id=sk_user_id,
            email="chemist@medstore.in",
            full_name="Koushik Chemist",
            role=UserRole.SHOPKEEPER,
        )
        profile = ShopkeeperProfile(
            id=profile_id,
            user_id=sk_user_id,
            shop_name="Koushik Meds",
            verification_status="PENDING_VERIFICATION",
            user=user,
        )

        mock_session = AsyncMock()
        # Mock profile lookup
        mock_res1 = MagicMock()
        mock_res1.scalar_one_or_none.return_value = profile
        # Mock count(orders)
        mock_res2 = MagicMock()
        mock_res2.scalar.return_value = 0
        mock_session.execute.side_effect = [mock_res1, mock_res2]

        info = make_mock_info(role=UserRole.ADMIN.value)

        with patch("app.graphql.resolvers.auth.async_session_factory") as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await AuthMutation().update_shopkeeper_kyc(
                info,
                shopkeeper_id=profile_id,
                status="VERIFIED",
                notes="Form 20B and Form 21B licenses authenticated with drug control database.",
            )

            assert res.verification_status == "VERIFIED"
            assert profile.verification_status == "VERIFIED"
            # Session add called for notification
            assert mock_session.add.call_count >= 1
            added_objects = [
                c.args[0] for c in mock_session.add.call_args_list if c.args
            ]
            notif = next(
                (o for o in added_objects if isinstance(o, Notification)), None
            )
            assert notif is not None
            assert notif.user_id == sk_user_id
            assert notif.category == "ONBOARDING"
            assert "verified" in notif.title.lower()

    @pytest.mark.asyncio
    async def test_retry_failed_job_recovers_job(self):
        """Admin can safely retry a failed job, incrementing retry count and marking it COMPLETED."""
        job_id = uuid.uuid4()
        job = AutomationJob(
            id=job_id,
            job_type="NOTIFICATION_DISPATCH",
            payload='{"order_id": "ORD-1"}',
            status=JobStatus.FAILED,
            retry_count=1,
            max_retries=3,
            error_message="SMS gateway 504 timeout",
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = job
        mock_session.execute.return_value = mock_res

        info = make_mock_info(role=UserRole.ADMIN.value)

        with patch(
            "app.graphql.resolvers.ops_automation.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await OpsAutomationMutation().retry_failed_job(info, job_id=job_id)

            assert res.status == "COMPLETED"
            assert job.status == JobStatus.COMPLETED
            assert job.retry_count == 2
            assert "Recovered" in job.error_message

    @pytest.mark.asyncio
    async def test_retry_failed_job_exceeding_max_retries_raises(self):
        """Retrying a job that has exceeded max_retries is blocked for manual intervention."""
        job_id = uuid.uuid4()
        job = AutomationJob(
            id=job_id,
            job_type="GST_EINVOICE_SYNC",
            status=JobStatus.FAILED,
            retry_count=3,
            max_retries=3,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = job
        mock_session.execute.return_value = mock_res

        info = make_mock_info(role=UserRole.ADMIN.value)

        with patch(
            "app.graphql.resolvers.ops_automation.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            with pytest.raises(Exception, match="Max retries"):
                await OpsAutomationMutation().retry_failed_job(info, job_id=job_id)

    @pytest.mark.asyncio
    async def test_integration_health_query(self):
        """Integration health query returns database, GST, and gateway status."""
        mock_session = AsyncMock()
        # Mock failed jobs count
        mock_res1 = MagicMock()
        mock_res1.scalar.return_value = 0
        # Mock failed notifs count
        mock_res2 = MagicMock()
        mock_res2.scalar.return_value = 1
        mock_session.execute.side_effect = [mock_res1, mock_res2]

        info = make_mock_info(role=UserRole.ADMIN.value)

        with patch(
            "app.graphql.resolvers.ops_automation.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            health = await OpsAutomationQuery().integration_health(info)

            assert health.database_status == "HEALTHY"
            assert health.gst_einvoice_portal == "ONLINE_19BKMPG"
            assert health.sms_dlt_gateway == "CONNECTED"
            assert health.whatsapp_api == "CONNECTED"
            assert health.failed_jobs_count == 0
            assert health.failed_notifications_count == 1

    @pytest.mark.asyncio
    async def test_assign_staff_work_queue(self):
        """Operations admin can assign warehouse staff to a specific work queue."""
        staff_id = uuid.uuid4()
        staff = User(
            id=staff_id,
            email="picker@warehouse.com",
            full_name="Ramesh Picker",
            role=UserRole.WAREHOUSE,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = staff
        mock_session.execute.return_value = mock_res

        info = make_mock_info(role=UserRole.ADMIN.value)

        with patch(
            "app.graphql.resolvers.ops_automation.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            user_type = await OpsAutomationMutation().assign_staff_work_queue(
                info, user_id=staff_id, work_queue="PICKING_PACKING"
            )

            assert staff.assigned_work_queue == "PICKING_PACKING"
            assert user_type.assigned_work_queue == "PICKING_PACKING"
            assert mock_session.add.call_count >= 1

    @pytest.mark.asyncio
    async def test_trigger_user_password_reset(self):
        """Operations admin can trigger a recovery OTP and audit log for a user."""
        target_id = uuid.uuid4()
        target_user = User(
            id=target_id,
            email="partner@shop.in",
            phone="9832145678",
            full_name="Shop Owner",
            role=UserRole.SHOPKEEPER,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = target_user
        mock_session.execute.return_value = mock_res

        info = make_mock_info(role=UserRole.ADMIN.value)

        with patch(
            "app.graphql.resolvers.ops_automation.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await OpsAutomationMutation().trigger_user_password_reset(
                info, user_id=target_id
            )

            assert res is True
            assert mock_session.add.call_count == 2  # Audit log + Notification

    @pytest.mark.asyncio
    async def test_operations_incident_summary(self):
        """Operations incident summary aggregates breached SLAs, staff availability, and credit anomalies."""
        mock_session = AsyncMock()
        mock_res1 = MagicMock()
        mock_res1.scalar.return_value = 2  # breached SLA orders
        mock_res2 = MagicMock()
        mock_res2.scalar.return_value = 5  # pickers
        mock_res3 = MagicMock()
        mock_res3.scalar.return_value = 7  # couriers
        mock_res4 = MagicMock()
        mock_res4.scalar.return_value = 3  # late payers
        mock_session.execute.side_effect = [mock_res1, mock_res2, mock_res3, mock_res4]

        info = make_mock_info(role=UserRole.ADMIN.value)

        with patch(
            "app.graphql.resolvers.ops_automation.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            summary = await OpsAutomationQuery().operations_incident_summary(info)

            assert summary.breached_sla_orders_count == 2
            assert summary.active_warehouse_pickers == 5
            assert summary.active_delivery_couriers == 7
            assert summary.flagged_late_payers_count == 3
            assert summary.reporting_data_balanced is True

    @pytest.mark.asyncio
    async def test_send_retailer_payment_reminder(self):
        """Operations admin can send payment due notifications to retailers."""
        sk_id = uuid.uuid4()
        sk_user = User(
            id=sk_id,
            email="chemist@med.in",
            full_name="Chemist Partner",
            role=UserRole.SHOPKEEPER,
        )

        mock_session = AsyncMock()
        mock_res = MagicMock()
        mock_res.scalar_one_or_none.return_value = sk_user
        mock_session.execute.return_value = mock_res

        info = make_mock_info(role=UserRole.ADMIN.value)

        with patch(
            "app.graphql.resolvers.ops_automation.async_session_factory"
        ) as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            res = await OpsAutomationMutation().send_retailer_payment_reminder(
                info, shopkeeper_id=sk_id
            )

            assert res is True
            assert mock_session.add.call_count >= 1
