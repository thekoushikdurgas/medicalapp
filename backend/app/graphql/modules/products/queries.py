"""
GraphQL queries for catalog search and stock inquiries.
"""

from __future__ import annotations

from app.graphql.resolvers.products import ProductQuery
from app.graphql.errors import ForbiddenError

__all__ = ["ProductQuery", "ForbiddenError"]
