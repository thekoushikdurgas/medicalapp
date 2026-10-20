"""
GraphQL types for authentication and user accounts.
"""

from __future__ import annotations

from typing import Annotated
import strawberry
from app.graphql.types import UserType, AuthPayload, ShopkeeperProfileType

# strawberry.lazy example for modular reference
LazyUserType = Annotated["UserType", strawberry.lazy("app.graphql.modules.auth.types")]

__all__ = [
    "UserType",
    "AuthPayload",
    "ShopkeeperProfileType",
    "LazyUserType",
]
