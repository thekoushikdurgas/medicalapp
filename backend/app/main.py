"""
Pharmacy Fantasy — FastAPI Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import strawberry
from strawberry.fastapi import GraphQLRouter

from app.core.config import settings
from app.core.logger import setup_logging, logger
from app.graphql.schema import schema

setup_logging()
logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode")

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="B2B Pharmaceutical Distribution Platform",
)

# ── CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── GraphQL ──────────────────────────────────────────────
graphql_router = GraphQLRouter(schema)
app.include_router(graphql_router, prefix="/graphql")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
