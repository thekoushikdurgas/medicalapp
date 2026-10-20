"""
Two-factor authentication (TOTP) model for sensitive accounts.
"""

from __future__ import annotations

import uuid
from sqlalchemy import Boolean, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class TwoFactorAuth(Base, TimestampMixin):
    """Stores 2FA configuration, TOTP secrets, and recovery codes."""

    __tablename__ = "two_factor_auth"
    __table_args__ = (Index("ix_two_factor_user_id", "user_id", unique=True),)

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), unique=True, nullable=False
    )
    secret_key: Mapped[str] = mapped_column(String(255), nullable=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    backup_codes: Mapped[str | None] = mapped_column(String(1000), nullable=True)

    def __repr__(self) -> str:
        return f"<TwoFactorAuth user_id={self.user_id} enabled={self.is_enabled}>"
