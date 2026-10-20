"""
Audit logging service for tracking sensitive GraphQL mutations.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any
from app.core.logger import logger


async def append_graphql_audit_event(
    actor_id: str | uuid.UUID | None,
    action: str,
    target_resource: str,
    resource_id: str | uuid.UUID | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    """Record an audit trail event for security-critical GraphQL mutations."""
    event = {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "actor_id": str(actor_id) if actor_id else "anonymous",
        "action": action,
        "target_resource": target_resource,
        "resource_id": str(resource_id) if resource_id else None,
        "metadata": metadata or {},
    }
    logger.info(
        f"[AUDIT] {event['action']} on {event['target_resource']}: actor={event['actor_id']}"
    )
