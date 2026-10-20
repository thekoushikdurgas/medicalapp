"""
Alembic env.py — configured for async SQLAlchemy.
"""

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

from app.core.config import settings
from app.db.base import Base
from app.db.models import *  # noqa: F401,F403 — register all models

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    try:
        async with connectable.connect() as connection:
            await connection.run_sync(do_run_migrations)
        await connectable.dispose()
    except (ConnectionRefusedError, OSError) as exc:
        import sys
        url = config.get_main_option("sqlalchemy.url")
        print(
            "\n" + "=" * 70 +
            f"\nDATABASE CONNECTION FAILED: {url}\n" +
            "=" * 70 +
            f"\nCould not connect to the database server. Detailed error: {exc}\n\n"
            "To resolve this, choose one of the following:\n"
            "  1. Start local PostgreSQL via Docker:\n"
            "     docker compose up -d postgres\n\n"
            "  2. Or tunnel to the remote staging PostgreSQL database:\n"
            "     ssh -i contact360app.pem -N -L 5432:localhost:5432 ubuntu@13.223.50.113\n\n"
            "  3. Or run migrations directly on the remote server:\n"
            "     ssh -i contact360app.pem ubuntu@13.223.50.113 \"sudo docker exec -i pf-backend alembic upgrade head\"\n\n"
            "  4. Or for local zero-dependency SQLite development, set:\n"
            "     DATABASE_URL=sqlite+aiosqlite:///./pharmacyfantasy.db in backend/.env\n" +
            "=" * 70 + "\n",
            file=sys.stderr,
        )
        sys.exit(1)


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
