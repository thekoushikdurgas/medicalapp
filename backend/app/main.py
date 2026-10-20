"""
Pharmacy Fantasy — FastAPI Application Entrypoint
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter

from app.core.config import settings
from app.core.logger import setup_logging, logger
from app.graphql.schema import schema
from app.db.base import Base
from app.db.session import engine
from app.db import models  # noqa: F401

setup_logging()
logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode")


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        if conn.dialect.name == "postgresql":
            from sqlalchemy import text

            for table_name, table in Base.metadata.tables.items():
                for column in table.columns:
                    col_name = column.name
                    col_type = column.type.compile(dialect=conn.dialect)
                    sql = f'ALTER TABLE "{table_name}" ADD COLUMN IF NOT EXISTS "{col_name}" {col_type};'
                    try:
                        await conn.execute(text(sql))
                    except Exception as ex:
                        logger.warning(
                            f"Auto-sync notice for {table_name}.{col_name}: {ex}"
                        )
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="B2B Pharmaceutical Distribution Platform",
    lifespan=lifespan,
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
graphql_router = GraphQLRouter(schema, graphiql=settings.GRAPHQL_INTROSPECTION_ENABLED)
app.include_router(graphql_router, prefix="/graphql")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": settings.APP_NAME}
