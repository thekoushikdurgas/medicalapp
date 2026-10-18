"""
Auth resolvers — login, token refresh, current user.
"""

import strawberry
from strawberry.types import Info
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import verify_password, create_access_token, create_refresh_token, decode_token, hash_password
from app.db.models import User
from app.db.session import async_session_factory
from app.graphql.types import AuthPayload, UserType, CreateUserInput


def _user_to_type(user: User) -> UserType:
    return UserType(
        id=user.id,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at,
    )


@strawberry.type
class AuthQuery:
    @strawberry.field
    async def me(self, info: Info) -> UserType:
        """Return the currently authenticated user."""
        # In production, extract user_id from context (set by middleware)
        request = info.context["request"]
        auth_header = request.headers.get("authorization", "")
        if not auth_header.startswith("Bearer "):
            raise Exception("Not authenticated")

        token = auth_header.split(" ", 1)[1]
        payload = decode_token(token)
        user_id = payload.get("sub")

        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise Exception("User not found")
            return _user_to_type(user)


@strawberry.type
class AuthMutation:
    @strawberry.mutation
    async def login(self, email: str, password: str) -> AuthPayload:
        """Authenticate a user and return JWT tokens."""
        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

            if not user or not verify_password(password, user.password_hash):
                raise Exception("Invalid email or password")

            if not user.is_active:
                raise Exception("Account is deactivated")

            token_data = {"sub": str(user.id), "role": user.role.value}
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)

            return AuthPayload(
                access_token=access_token,
                refresh_token=refresh_token,
                user=_user_to_type(user),
            )

    @strawberry.mutation
    async def refresh_token(self, refresh_token: str) -> AuthPayload:
        """Exchange a refresh token for new access + refresh tokens."""
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise Exception("Invalid token type")

        user_id = payload.get("sub")
        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user or not user.is_active:
                raise Exception("User not found or deactivated")

            token_data = {"sub": str(user.id), "role": user.role.value}
            new_access = create_access_token(token_data)
            new_refresh = create_refresh_token(token_data)

            return AuthPayload(
                access_token=new_access,
                refresh_token=new_refresh,
                user=_user_to_type(user),
            )

    @strawberry.mutation
    async def create_user(self, input: CreateUserInput) -> UserType:
        """Create a new user (admin-only in production)."""
        async with async_session_factory() as session:
            user = User(
                email=input.email,
                phone=input.phone,
                password_hash=hash_password(input.password),
                full_name=input.full_name,
                role=input.role,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            return _user_to_type(user)
