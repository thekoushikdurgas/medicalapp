"""
Centralized error definitions and utilities.
"""


class AppError(Exception):
    """Base application error."""

    def __init__(self, message: str, code: str = "APP_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code


class NotFoundError(AppError):
    def __init__(self, entity: str, identifier: str | int):
        super().__init__(f"{entity} '{identifier}' not found", code="NOT_FOUND")


class ValidationError(AppError):
    def __init__(self, message: str):
        super().__init__(message, code="VALIDATION_ERROR")


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, code="UNAUTHORIZED")


class ForbiddenError(AppError):
    def __init__(self, message: str = "Forbidden"):
        super().__init__(message, code="FORBIDDEN")
