# 💊 Pharmacy Fantasy

> **B2B Pharmaceutical Distribution Platform** — Powering bulk medicine sales from warehouse to shopkeeper doorstep.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![GraphQL](https://img.shields.io/badge/API-GraphQL-E10098?style=flat-square&logo=graphql)](https://graphql.org/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/DB-PostgreSQL-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

---

## 📋 Overview

**Pharmacy Fantasy** is a full-stack pharmaceutical distribution management system that digitizes the supply chain from warehouse to retail shopkeeper. The platform manages:

- **Warehouse Inventory** — Track medicines with batch numbers, expiry dates, HSN codes, GST rates, MRP, and stock levels
- **Bulk Order Processing** — Shopkeepers place orders; warehouse staff processes, packs, and dispatches
- **Delivery Management** — Delivery boys are assigned orders, with real-time tracking and proof of delivery
- **GST-Compliant Invoicing** — Auto-generated invoices with SGST/CGST breakdowns, discounts, and free goods
- **Multi-Role Access** — Super Admin, Admin, Warehouse Staff, Delivery Boy, and Shopkeeper roles

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                  │
│  Shopkeeper Portal │ Admin Dashboard │ Delivery App     │
└──────────────────────────┬──────────────────────────────┘
                           │ GraphQL (HTTP + WebSocket)
┌──────────────────────────┴──────────────────────────────┐
│                  BACKEND (FastAPI + Strawberry)          │
│  Auth │ Orders │ Inventory │ Invoicing │ Delivery       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────┐
│              PostgreSQL  │  Redis  │  S3/MinIO          │
│              (Data)      │ (Cache) │ (Invoice PDFs)     │
└─────────────────────────────────────────────────────────┘
```

## 📂 Project Structure

```
pharmacyfantasy/
├── README.md                  # You are here
├── .env.example               # Environment variable template
├── docker-compose.yml         # Full-stack local development
├── Makefile                   # Common dev commands
│
├── docs/                      # Documentation & reference
│   ├── PROJECT.md             # Detailed project specification
│   ├── DATABASE.md            # Schema design & ERD
│   ├── API.md                 # GraphQL API reference
│   ├── ROLES.md               # Role-based access control
│   ├── DEPLOYMENT.md          # Deployment guide
│   └── bills/                 # Reference invoices (domain context)
│
├── backend/                   # FastAPI + GraphQL (Python)
│   ├── app/
│   │   ├── main.py            # Application entrypoint
│   │   ├── core/              # Config, security, dependencies
│   │   ├── db/                # Database models & migrations
│   │   ├── graphql/           # Strawberry GraphQL schema
│   │   ├── services/          # Business logic layer
│   │   └── utils/             # Helpers (invoice gen, GST calc)
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Test suite
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/                  # Next.js (React)
    ├── src/
    │   ├── app/               # App Router pages
    │   ├── components/        # Reusable UI components
    │   ├── lib/               # GraphQL client, utilities
    │   ├── hooks/             # Custom React hooks
    │   └── types/             # TypeScript type definitions
    ├── public/
    ├── package.json
    └── Dockerfile
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Development Setup

```bash
# 1. Clone and enter
git clone <repo-url>
cd pharmacyfantasy

# 2. Start infrastructure
docker-compose up -d postgres redis

# 3. Backend
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 4. Frontend
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

### Access Points

| Service       | URL                           |
|---------------|-------------------------------|
| Frontend      | <http://localhost:3000>          |
| GraphQL API   | <http://localhost:8000/graphql>  |
| GraphQL Playground | <http://localhost:8000/graphql> |

## 👥 User Roles

| Role             | Capabilities                                                        |
|------------------|---------------------------------------------------------------------|
| **Super Admin**  | Full system control, user management, warehouse config, analytics   |
| **Admin**        | Inventory management, order processing, delivery assignment         |
| **Warehouse Staff** | Stock updates, batch entry, expiry tracking, picking & packing   |
| **Delivery Boy** | View assigned orders, update delivery status, collect payment proof |
| **Shopkeeper**   | Browse catalog, place bulk orders, track orders, view invoices      |

## 🔑 Business Domain (from real invoices)

This system models the real pharmaceutical distribution chain in West Bengal, India:

- **Distributors** (e.g., MAA Medical Agency) supply to **Warehouses** (e.g., MAA Eswari Pharmaceuticals)
- **Warehouses** sell to **Retail Shopkeepers** (e.g., Cheap Medical Stores)
- Invoices include: Product, Pack size, Batch, Expiry, HSN, Qty, Free goods, MRP, Rate, Discount%, SGST, CGST, Amount
- GST compliance with split SGST/CGST calculations
- Support for free goods (promotional schemes), multiple discount tiers (DIS1%, DIS2%)

## 📄 License

Proprietary — All rights reserved.
