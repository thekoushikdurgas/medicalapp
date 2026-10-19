# 🚀 Production Deployment & Operations Manual

> **Pharmacy Fantasy — Docker Compose, AWS EC2, Nginx, CI/CD & Database Operations**

---

## 1. Production Topology & Architecture

```
Internet (HTTPS :443)
       │
       ▼
┌────────────────────────────────────────────────────────┐
│             NGINX REVERSE PROXY & SSL TERMINATION      │
│  - Certbot Let's Encrypt Auto-Renewal                  │
│  - Gzip / Brotli compression & security headers        │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
        /api & /graphql                /* (SSR & Static)
               │                          │
               ▼                          ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│     FASTAPI ASGI BACKEND     │ │   NEXT.js FRONTEND    │
│  - Python 3.12 + Uvicorn     │ │   - Node 20 / Alpine  │
│  - Port 8000 (Internal)      │ │   - Port 3000         │
└──────────────┬───────────────┘ └───────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌──────────────┐ ┌──────────────┐
│  POSTGRES 15 │ │   REDIS 7    │
│  (Data Store)│ │ (Cache & Pub)│
└──────────────┘ └──────────────┘
```

---

## 2. Environment Variables Configuration

Create a production `.env` file in the project root:

```ini
# ── Application Environment ──────────────────────────────────
ENVIRONMENT=production
DEBUG=false
APP_NAME="Pharmacy Fantasy"

# ── Backend Security & JWT ───────────────────────────────────
# Generate with: openssl rand -hex 32
SECRET_KEY=9a3f2b8c7d1e4f5a6b0c9d8e7f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# ── Database (PostgreSQL) ─────────────────────────────────────
POSTGRES_USER=pharmacy_prod
POSTGRES_PASSWORD=super_secure_db_password_123!
POSTGRES_DB=pharmacy_fantasy_prod
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql+asyncpg://pharmacy_prod:super_secure_db_password_123!@postgres:5432/pharmacy_fantasy_prod

# ── Cache & Session (Redis) ───────────────────────────────────
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_URL=redis://redis:6379/0

# ── CORS & Host Origins ───────────────────────────────────────
ALLOWED_ORIGINS=https://pharmacyfantasy.com,https://www.pharmacyfantasy.com

# ── Frontend Public Variables ─────────────────────────────────
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://pharmacyfantasy.com/graphql
```

---

## 3. Production Docker Compose Setup

Run all services seamlessly using Docker Compose:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: pf-postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: pf-redis
    restart: always
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: pf-backend
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    env_file: .env
    command: >
      sh -c "alembic upgrade head &&
             python -m app.scripts.seed_superadmin &&
             uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4"
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: pf-frontend
    restart: always
    depends_on:
      - backend
    env_file: .env
    ports:
      - "3000:3000"

volumes:
  pgdata:
  redisdata:
```

---

## 4. EC2 Production Deployment & Troubleshooting

### 4.1 Initial Host Provisioning (Ubuntu 22.04/24.04 LTS)
```bash
# Update system & install Docker engine
sudo apt-get update && sudo apt-get upgrade -y
sudo apt-get install -y curl git ufw nginx certbot python3-certbot-nginx

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 4.2 Resolving Git Deploy Conflicts on EC2
*(Fix for the deployment failure observed in `error.txt` where local uncommitted changes blocked `git pull`):*

On the EC2 host:
```bash
cd /home/ubuntu/medicalapp

# Stash or reset any local unstaged changes on the server:
git stash --include-untracked

# Clean pull from main:
git fetch origin main
git reset --hard origin/main

# Re-run docker deployment:
docker compose up -d --build
```

---

## 5. Automated Database Backup & Retention

Set up a daily automated backup cron job on the production host:

```bash
#!/bin/bash
# /opt/scripts/backup_db.sh
BACKUP_DIR="/var/backups/pharmacy_fantasy"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

docker exec pf-postgres pg_dump -U pharmacy_prod pharmacy_fantasy_prod | gzip > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Retain backups for 30 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -exec rm {} +
```

Add to crontab (`crontab -e`):
```cron
0 2 * * * /opt/scripts/backup_db.sh >> /var/log/db_backup.log 2>&1
```

---

## 6. Health Checks & Verification Commands

```bash
# Verify backend service health
curl -f http://localhost:8000/health

# Verify GraphQL endpoint availability
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}'

# Inspect live container logs
docker compose logs -f --tail=100 backend
docker compose logs -f --tail=100 frontend
```

---

## 🔮 Future Works & Implementation TODOs

### 📋 Phase DP.1: Automated CI/CD & Zero-Downtime Deployments
- [ ] **DP.1.1 Blue/Green Zero-Downtime Rollout**:
  - Update GitHub Actions workflow to spin up secondary backend/frontend container instances on EC2.
  - Run internal health check probes against the new instances before switching Nginx upstream pointers, ensuring zero downtime for live pharmacy orders.
- [ ] **DP.1.2 Automated Git Merge Sanity in CI**:
  - Add an automated pre-flight script in the deployment pipeline to automatically discard or stash untracked server logs/artifacts before running `git pull`, preventing the merge conflict error documented in `error.txt`.

### 📋 Phase DP.2: Cloud Storage & Off-Site Disaster Recovery
- [ ] **DP.2.1 S3 / MinIO Object Storage Sync**:
  - Automatically sync signed Proof of Delivery (POD) images and generated GST Tax Invoice PDFs to an S3-compatible bucket (AWS S3 or Cloudflare R2).
- [ ] **DP.2.2 Encrypted Off-Site Backup Replication**:
  - Extend `/opt/scripts/backup_db.sh` to encrypt daily PostgreSQL dumps with GPG and replicate them to a geographically distant cold storage bucket.

### 📋 Phase DP.3: Security, WAF & High Availability
- [ ] **DP.3.1 Cloudflare Edge WAF & Geo-Fencing**:
  - Configure Cloudflare Web Application Firewall (WAF) to restrict retail portal and backend traffic to Indian IP blocks, mitigating foreign DDoS attacks and bot scraping.
- [ ] **DP.3.2 Uptime Heartbeat & PagerDuty Alerting**:
  - Configure external ping monitors (BetterStack or Uptime Kuma) probing `/health` every 60 seconds with instant SMS/Telegram alerts if the API server is unreachable.

