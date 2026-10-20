"""
Application configuration — loaded from environment variables.
"""

from __future__ import annotations

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", case_sensitive=True, extra="ignore"
    )

    # General
    APP_NAME: str = "PharmacyFantasy"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Auth & Sessions
    SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_SECURE: bool = True

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/pharmacyfantasy"
    )

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # GST
    DEFAULT_SGST_RATE: float = 2.5
    DEFAULT_CGST_RATE: float = 2.5

    # Performance, Diagnostics & Limits
    SLOW_QUERY_THRESHOLD: float = 2.0
    GRAPHQL_INTROSPECTION_ENABLED: bool = True
    GRAPHQL_RATE_LIMIT_REQUESTS_PER_MINUTE: int = 120
    GRAPHQL_QUERY_DEPTH_LIMIT: int = 15
    GRAPHQL_QUERY_COMPLEXITY_LIMIT: int = 200
    MAX_BODY_SIZE: int = 10 * 1024 * 1024  # 10 MB limit


@lru_cache
def get_settings() -> Settings:
    """Return cached application settings singleton."""
    return Settings()


settings = get_settings()
