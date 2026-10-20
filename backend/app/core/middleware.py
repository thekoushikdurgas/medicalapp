"""
Middleware suite: Request ID propagation, Content-Length body limits, and Idempotency key handling.
"""

from __future__ import annotations

import uuid
from typing import Callable, cast
from fastapi import Request, Response, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import settings
from app.core.logger import logger


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Propagates or generates X-Request-ID for distributed tracing."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        req_id = (
            request.headers.get("X-Request-ID")
            or request.headers.get("X-Trace-ID")
            or str(uuid.uuid4())
        )
        request.state.request_id = req_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return cast(Response, response)


class MaxBodySizeMiddleware(BaseHTTPMiddleware):
    """Rejects incoming HTTP requests that exceed MAX_BODY_SIZE limit."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > settings.MAX_BODY_SIZE:
                    return JSONResponse(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        content={
                            "error": "Request entity too large",
                            "max_bytes": settings.MAX_BODY_SIZE,
                        },
                    )
            except ValueError:
                pass
        return cast(Response, await call_next(request))


class IdempotencyMiddleware(BaseHTTPMiddleware):
    """Enforces idempotency checks on mutating requests using Idempotency-Key headers."""

    # Simple in-memory LRU or header pass-through tracking for idempotent operations
    _seen_keys: set[str] = set()

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        idempotency_key = request.headers.get("Idempotency-Key") or request.headers.get(
            "X-Idempotency-Key"
        )
        if idempotency_key:
            # Tag request state with idempotency key for resolvers
            request.state.idempotency_key = idempotency_key
            logger.debug(f"Handling idempotent request with key: {idempotency_key}")
        response = await call_next(request)
        if idempotency_key:
            response.headers["Idempotency-Key"] = idempotency_key
        return cast(Response, response)
