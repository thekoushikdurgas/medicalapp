"""
Application configuration — loaded from environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    # General
    APP_NAME: str = "PharmacyFantasy"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Auth
    SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/pharmacyfantasy"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    # GST
    DEFAULT_SGST_RATE: float = 2.5
    DEFAULT_CGST_RATE: float = 2.5
    COMPANY_GSTIN: str = ""
    COMPANY_NAME: str = ""


settings = Settings()
