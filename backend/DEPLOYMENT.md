# 🚀 Pharmacy Fantasy — Backend Production Deployment Guide

> **FastAPI · Strawberry GraphQL · SQLAlchemy 2.0 (Async) · PostgreSQL · Redis**  
> *Target:* Backend DevOps, Platform Engineers & Site Reliability Engineers (SRE)

---

## 1. Process Management & Concurrency Topology

In production, never run `uvicorn app.main:app --reload`. Instead, use **Gunicorn** as a process manager wrapping **Uvicorn** worker processes:

```
                      Master Gunicorn Process
                       (PID 1 / Supervisor)
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  Worker 1 (Async)        Worker 2 (Async)        Worker 3 (Async)
UvicornWorker (ASGI)    UvicornWorker (ASGI)    UvicornWorker (ASGI)
```

### Process Sizing Formula:
$$\text{Workers} = (2 \times \text{CPU Cores}) + 1$$
For a 2 vCPU production instance: $2 \times 2 + 1 = 5$ workers.

### Production Start Command
```bash
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile - \
  --timeout 60 \
  --keep-alive 5
```

---

## 2. Hardened Production Dockerfile

Replace development Dockerfile with this production multi-stage recipe:

```dockerfile
# ── Stage 1: Build & Wheels ───────────────────────────────
FROM python:3.11-slim as builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -r requirements.txt

# ── Stage 2: Runtime Image ────────────────────────────────
FROM python:3.11-slim

WORKDIR /app

# Security: Create non-root system user
RUN groupadd -r pfgroup && useradd -r -g pfgroup pfuser

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /build/wheels /wheels
RUN pip install --no-cache-dir /wheels/* && rm -rf /wheels

COPY . .
RUN chown -R pfuser:pfgroup /app

USER pfuser

EXPOSE 8000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["gunicorn", "app.main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

---

## 3. Database Connection Pooling in Production

Update `app/db/session.py` settings for high-throughput concurrency:

```python
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,           # Persistent connections per worker
    max_overflow=10,        # Temporary burst headroom
    pool_timeout=30,        # Timeout waiting for pool connection
    pool_recycle=1800,      # Recycle stale connections (30 minutes)
    pool_pre_ping=True,     # Validate connection vitality before query
    echo=False,             # Disable raw SQL stdout logging in production
)
```

---

## 4. Pre-Start Migration & Healthcheck Pipeline

### Container Pre-Start Script (`scripts/prestart.sh`)
```bash
#!/usr/bin/env bash
set -e

echo "1. Checking database connection..."
python -c "
import asyncio
from app.db.session import engine
async def test():
    async with engine.connect() as conn:
        print('DB Connected successfully.')
asyncio.run(test())
"

echo "2. Applying Alembic migrations..."
alembic upgrade head

echo "3. Seeding admin bootstrap if empty..."
python -m app.scripts.seed_superadmin

echo "4. Launching Gunicorn application server..."
exec "$@"
```

### Health & Readiness Endpoints
Expose dedicated endpoints in `app/main.py`:
- `GET /health`: Liveness probe (verifies FastAPI runtime).
- `GET /ready`: Readiness probe (verifies database pool ping & Redis connectivity).

---

## 5. Production Environment Variables Reference

| Variable | Recommended Production Value | Description |
| :--- | :--- | :--- |
| `APP_ENV` | `production` | Disables debug logs and playground documentation if configured. |
| `DATABASE_URL` | `postgresql+asyncpg://...` | Managed PostgreSQL connection string with SSL mode enabled. |
| `REDIS_URL` | `rediss://...` | TLS-encrypted Redis connection string for caching and sessions. |
| `SECRET_KEY` | *64-char Hex String* | High-entropy secret for signing JWT auth tokens. |
| `CORS_ORIGINS` | `https://app.pharmacyfantasy.com` | Strict whitelist of allowed browser origins. |
