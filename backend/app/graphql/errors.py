"""
Sanitized GraphQL error handling and custom domain error hierarchy.
"""

from __future__ import annotations

from typing import Any
from strawberry.exceptions import StrawberryGraphQLError


class GraphQLAppError(StrawberryGraphQLError):
    """Base application exception formatted safely for GraphQL clients."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = 500,
        extensions: dict[str, Any] | None = None,
    ):
        ext = extensions or {}
        ext.setdefault("code", code)
        ext.setdefault("status_code", status_code)
        super().__init__(message=message, extensions=ext)


class AuthenticationError(GraphQLAppError):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message=message, code="UNAUTHENTICATED", status_code=401)


class ForbiddenError(GraphQLAppError):
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message=message, code="FORBIDDEN", status_code=403)


class NotFoundError(GraphQLAppError):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message=message, code="NOT_FOUND", status_code=404)


class ValidationError(GraphQLAppError):
    def __init__(self, message: str, field_errors: dict[str, str] | None = None):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
            status_code=422,
            extensions={"field_errors": field_errors or {}},
        )


def handle_graphql_error(exc: Exception) -> GraphQLAppError:
    """Sanitize internal errors to prevent leaking database or sensitive system details."""
    if isinstance(exc, GraphQLAppError):
        return exc
    # Mask unhandled internal exceptions
    return GraphQLAppError(
        message="An unexpected server error occurred. Please try again later.",
        code="INTERNAL_ERROR",
        status_code=500,
    )
