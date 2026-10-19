# 🐍 Backend Architecture & Engineering Guide

> **Pharmacy Fantasy — FastAPI, Strawberry GraphQL, SQLAlchemy 2.0 Async & Service Layer**

---

## 1. Architectural Philosophy & Layered Organization

The Pharmacy Fantasy backend follows a strict **Layered Service Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                 FASTAPI HTTP & ASGI ENTRYPOINT              │
│                     (backend/app/main.py)                   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  STRAWBERRY GRAPHQL ROUTER                  │
│                   (backend/app/graphql/)                    │
│  - schema.py (Root Query & Mutation)                        │
│  - types.py (GraphQL Output Types & Input Objects)          │
│  - resolvers/ (auth, products, orders, delivery, challan)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     SERVICE DOMAIN LAYER                    │
│                   (backend/app/services/)                   │
│  - order_service.py (State machine & credit limit checks)   │
│  - inventory_service.py (FEFO batch allocation engine)      │
│  - invoice_service.py (Statutory GST calculations & PDF)    │
│  - challan_service.py (Delivery Challans & Challan Returns) │
│  - return_service.py (Credit notes & GST reversals)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATA LAYER (SQLALCHEMY 2.0)                 │
│                      (backend/app/db/)                      │
│  - models.py (Async SQLAlchemy Declarative Mapped Models)   │
│  - session.py (Async Engine, sessionmaker, asyncpg/sqlite)  │
│  - alembic/ (Schema migrations)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure & Component Roles

```
backend/
├── alembic/                      # Database migration scripts
│   ├── env.py
│   └── versions/
├── app/
│   ├── core/
│   │   ├── config.py             # Pydantic Settings, environment variables
│   │   ├── security.py           # Bcrypt password hashing, JWT encoding/decoding
│   │   └── logger.py             # Centralized structured logging formatters
│   ├── db/
│   │   ├── base.py               # SQLAlchemy DeclarativeBase
│   │   ├── models.py             # All ORM mapped entities & constraints
│   │   └── session.py            # Async engine, connection pool & sessionmaker
│   ├── graphql/
│   │   ├── resolvers/
│   │   │   ├── auth.py           # Login, registration, user management, RBAC
│   │   │   ├── products.py       # Catalog, SKUs, inventory rack batches
│   │   │   ├── orders.py         # Wholesale order queries, picking, packing
│   │   │   └── delivery.py       # Courier assignments, trips, signature POD
│   │   ├── schema.py             # Root Strawberry Schema compilation
│   │   └── types.py              # Strawberry type definitions & input schemas
│   ├── services/
│   │   ├── inventory_service.py  # FEFO allocation & stock batch management
│   │   ├── order_service.py      # Wholesale order state orchestration
│   │   └── invoice_service.py    # Invoice generation & GST computation
│   ├── utils/
│   │   ├── gst.py                # Statutory GST tax formulas & line calculations
│   │   └── invoice_gen.py        # Printable HTML/PDF tax invoice templates
│   ├── scripts/
│   │   ├── seed_superadmin.py    # Seeds root Super Admin account
│   │   └── seed_demo_data.py     # Seeds realistic West Bengal medicines & retailers
│   └── main.py                   # FastAPI application initialization & CORS
├── tests/
│   ├── test_gst.py               # Unit tests for West Bengal GST & discount math
│   └── test_services.py          # Integration tests for FEFO, orders & credits
├── requirements.txt              # Production Python package dependencies
└── pyproject.toml
```

---

## 3. Core Domain Engines & Business Logic

### 3.1 First-Expiry-First-Out (FEFO) Allocation Algorithm
Implemented in [`backend/app/services/inventory_service.py`](file:///e:/chanchal/pharmacyfantasy/backend/app/services/inventory_service.py):
1. When an order is confirmed, the allocation engine queries active batches:
   ```python
   stmt = (
       select(StockBatch)
       .where(
           StockBatch.product_id == item.product_id,
           StockBatch.quantity_available > 0,
           StockBatch.expiry_date > date.today(),
       )
       .order_by(StockBatch.expiry_date.asc())
   )
   ```
2. **Shelf-Life Advisory**: If a batch has less than 60 days of shelf life remaining, an advisory warning is recorded.
3. **Atomic Stock Decrement**: Units are deducted directly from `StockBatch.quantity_available` inside an async database transaction. If inventory across all lots is insufficient, an `InsufficientStockError` is raised.

### 3.2 Statutory GST & Discount Math Engine
Implemented in [`backend/app/utils/gst.py`](file:///e:/chanchal/pharmacyfantasy/backend/app/utils/gst.py):
The math matches statutory pharmaceutical trade invoices in West Bengal:
1. **Base Value**:
   $$\text{Base Amount} = \text{Quantity} \times \text{Rate}$$
2. **Trade Discounts**:
   $$\text{Discount 1 Amount} = \text{Base Amount} \times \frac{\text{DIS1}\%}{100}$$
   $$\text{Taxable Value} = \text{Base Amount} - \text{Discount 1 Amount}$$
3. **Statutory Taxes (Pharmaceuticals)**:
   $$\text{SGST} = \text{Taxable Value} \times \frac{2.50}{100}$$
   $$\text{CGST} = \text{Taxable Value} \times \frac{2.50}{100}$$
4. **Line Total**:
   $$\text{Line Total} = \text{Taxable Value} + \text{SGST} + \text{CGST}$$
5. **Grand Total**:
   Sum of all Line Totals, rounded to the nearest Rupee (statutory rounding).

### 3.3 Shopkeeper Credit Limit Guard
Implemented in [`backend/app/services/order_service.py`](file:///e:/chanchal/pharmacyfantasy/backend/app/services/order_service.py):
```python
current_outstanding = float(profile.outstanding_balance)
credit_limit = float(profile.credit_limit)

if current_outstanding + order_net > credit_limit:
    raise CreditLimitExceededError(
        f"Order value (₹{order_net:,.2f}) exceeds approved credit limit. "
        f"Current Outstanding: ₹{current_outstanding:,.2f}, Limit: ₹{credit_limit:,.2f}"
    )
```

### 3.4 Context-Aware Role Authorization in GraphQL
Strawberry GraphQL resolvers extract and verify user identity via context:
```python
def get_current_user_from_info(info: Info) -> tuple[uuid.UUID, UserRole]:
    request = info.context["request"]
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise AuthenticationError("Authentication token is required.")
    
    token = auth_header.split(" ", 1)[1]
    payload = decode_token(token)
    return uuid.UUID(payload["sub"]), UserRole(payload["role"])
```
- In `assign_user_role` and `create_user`:
  If `caller_role == UserRole.ADMIN` and `target_role == UserRole.SUPER_ADMIN`, the mutation raises `PermissionDenied("Operations Admin cannot create or assign Super Admin accounts.")`.

---

## 4. Database Session & Connection Management

- Handled via `async_session_factory` in [`backend/app/db/session.py`](file:///e:/chanchal/pharmacyfantasy/backend/app/db/session.py).
- Uses `AsyncEngine` with `NullPool` (for serverless/worker scenarios) or `QueuePool` with:
  - `pool_size = 20`
  - `max_overflow = 10`
  - `pool_recycle = 1800` (prevents stale DB connections on EC2/RDS)
- All database modifications are executed inside context managers:
  ```python
  async with async_session_factory() as session:
      async with session.begin():
          # Database operations commit automatically on clean exit
          # Rollbacks trigger automatically on unhandled exception
  ```

---

## 5. Running & Verifying Backend Tests

Run the complete test suite using `uv`:
```bash
uv run --with-requirements backend/requirements.txt pytest backend/tests
All tests run asynchronously using `pytest-asyncio` with strict async mode.

---

## 🔮 Future Works & Implementation TODOs

### 📋 Phase B.1: Concurrency Control & Race Prevention
- [ ] **B.1.1 Redis Distributed Locking for FEFO Allocation**:
  - Implement a distributed mutex lock around `order_service.confirm_order`:
    ```python
    async with redis_lock(f"lock:product:{item.product_id}"):
        # Atomic FEFO allocation prevents double allocation of last remaining units
    ```
- [ ] **B.1.2 Database Row-Level Locking (`select().with_for_update()`)**:
  - Add pessimistic locking on `StockBatch` rows during allocation to prevent race conditions across parallel ASGI workers.

### 📋 Phase B.2: Background Workers & Document Generation
- [ ] **B.2.1 Asynchronous PDF Task Queue (ARQ / Celery)**:
  - Offload heavy WeasyPrint / ReportLab PDF generation to an async worker queue.
  - Store generated PDFs directly into S3/MinIO and return presigned URLs to prevent blocking the event loop.
- [ ] **B.2.2 Automated Expiry Notification Cron**:
  - Run a daily scheduled task (`cron.py`) that identifies batches crossing 90, 60, and 30 days to expiry and dispatches alerts to Warehouse Staff and Operations Admins.

### 📋 Phase B.3: Observability & Production Monitoring
- [ ] **B.3.1 Prometheus Metrics Endpoint (`/metrics`)**:
  - Export system metrics: `orders_placed_total`, `fefo_allocation_latency_seconds`, `active_db_connections`, and `low_stock_sku_gauge`.
- [ ] **B.3.2 Sentry Exception & Breadcrumb Tracking**:
  - Integrate Sentry SDK with automatic user role context attachment for rapid triaging of production GraphQL errors.

