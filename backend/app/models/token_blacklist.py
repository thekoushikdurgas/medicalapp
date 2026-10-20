"""
Token blacklist model for revoked JWT tokens and session termination.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin


class TokenBlacklist(Base, TimestampMixin):
    """Stores revoked JWT tokens (by JTI) until expiry."""

    __tablename__ = "token_blacklist"
    __table_args__ = (
        Index("ix_token_blacklist_jti", "token_jti", unique=True),
        Index("ix_token_blacklist_expires_at", "expires_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    token_jti: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(PG_UUID(as_uuid=True), nullable=True)
    revoked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )

    def __repr__(self) -> str:
        return f"<TokenBlacklist jti={self.token_jti} revoked_at={self.revoked_at}>"
