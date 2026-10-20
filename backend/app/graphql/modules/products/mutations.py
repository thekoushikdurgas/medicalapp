"""
GraphQL mutations for creating and updating catalog products.
"""

from __future__ import annotations

from app.graphql.resolvers.products import ProductMutation
from app.graphql.errors import ForbiddenError
from app.services.graphql_audit_service import append_graphql_audit_event

__all__ = ["ProductMutation", "ForbiddenError", "append_graphql_audit_event"]
