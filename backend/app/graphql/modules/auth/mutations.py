"""
GraphQL mutations for authentication, token issuance, and role assignments.
"""

from __future__ import annotations

from app.graphql.resolvers.auth import AuthMutation
from app.graphql.errors import ForbiddenError
from app.services.graphql_audit_service import append_graphql_audit_event

__all__ = ["AuthMutation", "append_graphql_audit_event", "ForbiddenError"]
