# 🚀 Pharmacy Fantasy — Master Production Deployment Guide

> **Enterprise Infrastructure, Orchestration & DevOps Blueprint**  
> *Target Environments:* Linux VPS (Docker Compose), Cloud Containers (GCP Cloud Run / AWS ECS), Kubernetes (EKS/GKE)

---

## 1. System Deployment Topology

```
                              Internet / Clients
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │   Cloudflare / Route 53   │ (DNS, DDoS Protection, SSL)
                        └─────────────┬─────────────┘
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │    Nginx Reverse Proxy    │ (Port 80/443, SSL Termination,
                        │   or Cloud Load Balancer  │  Gzip/Brotli, Rate Limiting)
                        └───────┬───────────┬───────┘
                                │           │
            /api /graphql       │           │   / (Static & SSR)
            HTTP & WS           │           │
                                ▼           ▼
            ┌───────────────────────┐   ┌───────────────────────┐
            │   FastAPI Backend     │   │    Next.js Frontend   │
            │  (Gunicorn + Uvicorn) │   │   (Node SSR / Edge)   │
            │      Port 8000        │   │       Port 3000       │
            └───────────┬───────────┘   └───────────────────────┘
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
┌──────────────┐                 ┌──────────────┐
│  PostgreSQL  │                 │    Redis     │
│  Version 15+ │                 │  Version 7+  │
│ (ACID Store) │                 │(Cache & Pub) │
└──────────────┘                 └──────────────┘
```

---

## 2. Infrastructure Deployment Strategies

### Strategy A: Production Docker Compose (Single Node / VPS)
Ideal for single-server setups (Ubuntu 22.04 / 24.04 LTS, 4+ vCPU, 8GB+ RAM).

#### Step 1: Server Provisioning
```bash
# Update and install Docker + Compose
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

#### Step 2: Configure Firewall (UFW)
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

#### Step 3: Clone Repository & Configure Secrets
```bash
git clone <repo-url> /opt/pharmacyfantasy
cd /opt/pharmacyfantasy
cp .env.example .env

# Generate high-entropy secret key
openssl rand -hex 32
# Paste into .env as SECRET_KEY
```

#### Step 4: Production `docker-compose.prod.yml`
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

#### Step 5: Database Migration & Bootstrap
```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python -m app.scripts.seed_superadmin
```

---

### Strategy B: Managed Cloud Services (High-Availability Production)

| Tier | AWS Architecture | Google Cloud (GCP) Architecture |
| :--- | :--- | :--- |
| **Frontend SSR** | AWS ECS Fargate or Vercel Pro | Cloud Run (Managed Serverless) |
| **GraphQL Backend** | AWS ECS Fargate / EKS | Cloud Run (Min instances = 1) |
| **Relational Database** | Amazon RDS PostgreSQL 15 (Multi-AZ) | Cloud SQL for PostgreSQL 15 |
| **In-Memory Cache** | Amazon ElastiCache (Redis) | Cloud Memorystore for Redis |
| **Document Storage** | Amazon S3 + CloudFront CDN | Google Cloud Storage (GCS) |
| **Secrets Management** | AWS Secrets Manager / Parameter Store | GCP Secret Manager |

---

## 3. Production Environment Configuration (`.env`)

```ini
# Core Environment
APP_NAME=PharmacyFantasy
APP_ENV=production
DEBUG=false

# Security & Tokens
SECRET_KEY=e83b4c91a0f837d92847a98b1c0283e9d8e7c6b5a41324354657687980abcdef
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Database Connection Pool (Production PostgreSQL)
DATABASE_URL=postgresql+asyncpg://pf_user:StrongPassword123@db-host:5432/pharmacyfantasy_prod
POSTGRES_USER=pf_user
POSTGRES_PASSWORD=StrongPassword123
POSTGRES_DB=pharmacyfantasy_prod

# Redis Cache & Sessions
REDIS_URL=rediss://default:RedisSecurePassword@redis-host:6379/0

# Frontend Networking
NEXT_PUBLIC_GRAPHQL_URL=https://api.pharmacyfantasy.com/graphql
NEXT_PUBLIC_APP_URL=https://app.pharmacyfantasy.com

# S3/MinIO Invoice Storage
STORAGE_BACKEND=s3
S3_BUCKET_NAME=pf-invoices-production
S3_ENDPOINT_URL=https://s3.ap-south-1.amazonaws.com
S3_ACCESS_KEY=AKIAXXXXXXXXXXXXXXXX
S3_SECRET_KEY=YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY

# Statutory Company Details (GST Compliance)
COMPANY_GSTIN=19BKMPG6092H1ZO
COMPANY_NAME=MAA ESWARI PHARMACEUTICALS
COMPANY_ADDRESS=BENACHITY, DURGAPUR-13, WEST BENGAL
COMPANY_PHONE=9614081313
```

---

## 4. Nginx Reverse Proxy & SSL Configuration

```nginx
# /etc/nginx/sites-available/pharmacyfantasy.conf

# Rate Limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;

# Frontend Reverse Proxy
server {
    server_name app.pharmacyfantasy.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/app.pharmacyfantasy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.pharmacyfantasy.com/privkey.pem;
}

# Backend API Reverse Proxy
server {
    server_name api.pharmacyfantasy.com;

    location /graphql {
        limit_req zone=api_limit burst=50 nodelay;
        proxy_pass http://127.0.0.1:8000/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }

    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/api.pharmacyfantasy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.pharmacyfantasy.com/privkey.pem;
}
```

---

## 5. Automated Backup & Disaster Recovery

### Daily Automated Database Snapshot
Create `/opt/scripts/backup-db.sh`:
```bash
#!/usr/bin/env bash
set -eo pipefail

BACKUP_DIR="/var/backups/pharmacyfantasy"
DATE=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/db_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"
docker compose -f /opt/pharmacyfantasy/docker-compose.yml exec -T postgres pg_dump -U postgres pharmacyfantasy | gzip > "$FILENAME"

# Retain 14 days locally
find "$BACKUP_DIR" -type f -mtime +14 -delete
```

Add cron job (`crontab -e`):
```cron
0 2 * * * /opt/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

---

## 6. Pre-Flight Production Checklist

- [ ] `DEBUG=false` confirmed in production `.env`.
- [ ] Database credentials rotated away from defaults (`postgres`/`postgres`).
- [ ] All database tables indexed per [docs/DATABASE.md](file:///e:/chanchal/pharmacyfantasy/docs/DATABASE.md).
- [ ] SSL certificates active with auto-renewal (`certbot renew --dry-run`).
- [ ] Daily backup cron verified with restore test on staging database.
- [ ] Non-root execution verified inside Docker containers.
- [ ] CORS headers restricted strictly to `app.pharmacyfantasy.com`.
