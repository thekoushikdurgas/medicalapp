"""
Integration and GraphQL auth-failure test suite.

Tests HTTP GraphQL endpoints with httpx.AsyncClient (ASGITransport)
to verify 401 Unauthorized and 403 Forbidden failure paths.
"""

from __future__ import annotations

import pytest
import httpx

from app.main import app
from app.core.security import create_access_token


@pytest.mark.asyncio
async def test_health_endpoint():
    """Verify health endpoint responds with healthy status via ASGI client."""
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


@pytest.mark.asyncio
async def test_graphql_unauthenticated_request_fails():
    """Verify executing protected query without authorization token yields auth failure."""
    query = """
    query {
        me {
            id
            email
        }
    }
    """
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/graphql", json={"query": query})
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        error_msgs = [e.get("message", "") for e in data["errors"]]
        assert any(
            "unauthorized" in msg.lower()
            or "401" in msg
            or "forbidden" in msg.lower()
            or "authenticated" in msg.lower()
            for msg in error_msgs
        )


@pytest.mark.asyncio
async def test_graphql_invalid_token_fails():
    """Verify request with malformed or invalid Bearer token fails with 401 or UNAUTHORIZED."""
    query = """
    query {
        me {
            id
            email
        }
    }
    """
    headers = {"Authorization": "Bearer invalid.jwt.token"}
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/graphql", json={"query": query}, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        assert any(
            "token" in e.get("message", "").lower()
            or "unauthorized" in e.get("message", "").lower()
            or "401" in e.get("message", "")
            for e in data["errors"]
        )


@pytest.mark.asyncio
async def test_graphql_role_forbidden_action():
    """Verify shopkeeper token is forbidden from executing superadmin operations (403 Forbidden)."""
    shopkeeper_token = create_access_token(
        {"sub": "00000000-0000-0000-0000-000000000001", "role": "SHOPKEEPER"}
    )
    headers = {"Authorization": f"Bearer {shopkeeper_token}"}
    mutation = """
    mutation {
        assignUserRole(userId: "00000000-0000-0000-0000-000000000002", newRole: "ADMIN") {
            id
        }
    }
    """
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/graphql", json={"query": mutation}, headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert "errors" in data
        err_text = str(data["errors"])
        assert (
            "ForbiddenError" in err_text
            or "Permission denied" in err_text
            or "FORBIDDEN" in err_text
            or "403" in err_text
        )
