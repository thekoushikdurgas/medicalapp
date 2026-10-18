# 🚀 Pharmacy Fantasy — Deployment Overview

> **Infrastructure & Deployment Reference Hub**

For comprehensive, tier-specific production deployment documentation, refer to:

- 🌐 **[Master Production Deployment Guide (Root)](file:///e:/chanchal/pharmacyfantasy/DEPLOYMENT.md)**  
  Full stack orchestration, Docker Compose production, Nginx reverse proxy, SSL termination, and automated database backup.

- 🐍 **[Backend Deployment Guide (`backend/`)](file:///e:/chanchal/pharmacyfantasy/backend/DEPLOYMENT.md)**  
  FastAPI runtime process management (Gunicorn + Uvicorn workers), production Dockerfile, asyncpg pooling tuning, and migration startup pipelines.

- ⚛️ **[Frontend Deployment Guide (`frontend/`)](file:///e:/chanchal/pharmacyfantasy/frontend/DEPLOYMENT.md)**  
  Next.js 14 App Router standalone output, multi-stage Alpine Dockerfile, Vercel/Edge deployment, and production security headers.

---

## ⚡ Quick Summary: Running Production Locally

```bash
# 1. Clone repository
git clone <repo-url>
cd pharmacyfantasy

# 2. Configure environment
cp .env.example .env
# Edit .env with production credentials and secure secrets

# 3. Launch with Docker Compose
docker compose up --build -d

# 4. Migrate and Seed
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.scripts.seed_superadmin
```
