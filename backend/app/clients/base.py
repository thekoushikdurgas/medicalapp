"""
Base HTTP Client with standard timeouts and async utilities.
"""

from typing import Any, cast
import httpx


class BaseHTTPClient:
    """Base HTTP client wrapper around httpx.AsyncClient."""

    def __init__(self, base_url: str = "", timeout: float = 10.0):
        self.base_url = base_url
        self.timeout = timeout

    async def get(
        self, path: str, params: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.base_url}{path}", params=params)
            resp.raise_for_status()
            return cast(dict[str, Any], resp.json())
