"""
Unit tests for Role-Based Access Control (RBAC) guards in Auth mutations.
"""

import uuid
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.db.models import User, UserRole
from app.graphql.resolvers.auth import AuthMutation
from app.graphql.types import CreateUserInput


def make_mock_info(user_id: str | None = None, role: str | None = None, has_auth_header: bool = True):
    info = MagicMock()
    if not has_auth_header and user_id is None:
        info.context = {}
        return info

    info.context = {
        "user_id": user_id,
        "role": role,
    }
    return info


class TestAuthRBACGuards:
    @pytest.mark.asyncio
    async def test_unauthenticated_create_user_rejected(self):
        """Unauthenticated caller cannot create users."""
        info = make_mock_info(has_auth_header=False)
        input_data = CreateUserInput(
            full_name="Test Staff",
            phone="9876543210",
            email="staff@test.com",
            password="password123",
            role=UserRole.WAREHOUSE.value,
        )

        with pytest.raises(Exception, match="Not authenticated"):
            await AuthMutation().create_user(info, input_data)

    @pytest.mark.asyncio
    async def test_non_admin_cannot_create_user(self):
        """Warehouse, Delivery, or Shopkeeper roles cannot create users."""
        for unauthorized_role in [UserRole.WAREHOUSE.value, UserRole.DELIVERY.value, UserRole.SHOPKEEPER.value]:
            info = make_mock_info(user_id=str(uuid.uuid4()), role=unauthorized_role)
            input_data = CreateUserInput(
                full_name="New Person",
                phone="9876543211",
                email="new@test.com",
                password="password123",
                role=UserRole.SHOPKEEPER.value,
            )
            with pytest.raises(Exception, match="Permission denied"):
                await AuthMutation().create_user(info, input_data)

    @pytest.mark.asyncio
    async def test_admin_cannot_create_super_admin(self):
        """Operations Admin (ADMIN) cannot create a Super Admin account."""
        admin_id = str(uuid.uuid4())
        info = make_mock_info(user_id=admin_id, role=UserRole.ADMIN.value)
        input_data = CreateUserInput(
            full_name="Rogue Super Admin",
            phone="9876543212",
            email="rogue@test.com",
            password="password123",
            role=UserRole.SUPER_ADMIN.value,
        )
        with pytest.raises(Exception, match="Operations Admin cannot create Super Admin or Admin"):
            await AuthMutation().create_user(info, input_data)

    @pytest.mark.asyncio
    async def test_admin_cannot_create_admin(self):
        """Operations Admin (ADMIN) cannot create another Admin account."""
        admin_id = str(uuid.uuid4())
        info = make_mock_info(user_id=admin_id, role=UserRole.ADMIN.value)
        input_data = CreateUserInput(
            full_name="Another Admin",
            phone="9876543213",
            email="admin2@test.com",
            password="password123",
            role=UserRole.ADMIN.value,
        )
        with pytest.raises(Exception, match="Operations Admin cannot create Super Admin or Admin"):
            await AuthMutation().create_user(info, input_data)

    @pytest.mark.asyncio
    async def test_admin_cannot_assign_super_admin_role(self):
        """Operations Admin cannot promote any user to Super Admin."""
        admin_id = str(uuid.uuid4())
        target_id = uuid.uuid4()
        info = make_mock_info(user_id=admin_id, role=UserRole.ADMIN.value)

        with pytest.raises(Exception, match="Operations Admin cannot assign Admin or Super Admin"):
            await AuthMutation().assign_user_role(info, target_id, UserRole.SUPER_ADMIN.value)

    @pytest.mark.asyncio
    async def test_admin_cannot_modify_super_admin(self):
        """Operations Admin cannot demote or alter a Super Admin user."""
        admin_id = str(uuid.uuid4())
        super_admin_target = User(
            id=uuid.uuid4(),
            email="super@pharma.com",
            phone="9999999999",
            password_hash="hashed",
            full_name="Chief Executive",
            role=UserRole.SUPER_ADMIN,
            is_active=True,
        )
        info = make_mock_info(user_id=admin_id, role=UserRole.ADMIN.value)

        mock_session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = super_admin_target
        mock_session.execute.return_value = mock_result

        with patch("app.graphql.resolvers.auth.async_session_factory") as mock_factory:
            mock_factory.return_value.__aenter__.return_value = mock_session
            with pytest.raises(Exception, match="Operations Admin cannot modify Super Admin or Admin"):
                await AuthMutation().assign_user_role(info, super_admin_target.id, UserRole.WAREHOUSE.value)

    @pytest.mark.asyncio
    async def test_shopkeeper_cannot_assign_role(self):
        """Retail shopkeeper cannot assign roles."""
        shopkeeper_id = str(uuid.uuid4())
        target_id = uuid.uuid4()
        info = make_mock_info(user_id=shopkeeper_id, role=UserRole.SHOPKEEPER.value)

        with pytest.raises(Exception, match="Permission denied"):
            await AuthMutation().assign_user_role(info, target_id, UserRole.ADMIN.value)
