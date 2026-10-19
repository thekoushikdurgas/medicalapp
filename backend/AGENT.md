# 🐍 Pharmacy Fantasy — Backend Agent Playbook

> **Operational Guidelines for Backend Engineers & AI Subagents**  
> _Stack:_ Python 3.11+ · FastAPI · Strawberry GraphQL · SQLAlchemy 2.0 (Async) · Alembic · PostgreSQL / SQLite

---

## 1. Directory Structure & Architecture

```
backend/
├── alembic/                 # Database migration scripts & environment
│   └── versions/            # Versioned migration revisions
├── app/
│   ├── main.py              # FastAPI app setup, CORS, GraphQL router mount
│   ├── core/                # Configuration, JWT security, auth dependencies
│   │   ├── config.py        # Pydantic Settings (DATABASE_URL, SECRET_KEY)
│   │   ├── deps.py          # FastApi / Strawberry Context dependencies
│   │   └── security.py      # Passlib bcrypt hashing, JWT encode/decode
│   ├── db/                  # Relational data persistence
│   │   ├── base.py          # DeclarativeBase definition
│   │   ├── models.py        # SQLAlchemy 2.0 ORM models
│   │   └── session.py       # async_engine & async_session_factory
│   ├── graphql/             # Strawberry GraphQL API
│   │   ├── schema.py        # Root Query & Mutation union
│   │   ├── types.py         # Output types, Paginated types, Input payloads
│   │   └── resolvers/       # Domain queries & mutations (auth, orders, etc.)
│   ├── services/            # Pure business logic layer (DDD services)
│   ├── utils/               # Tax math (gst.py), invoice PDF generators
│   └── scripts/             # DB seeding & admin bootstrap scripts
├── tests/                   # Pytest test suite
├── requirements.txt         # Pinned pip dependencies
├── alembic.ini              # Alembic config
└── Dockerfile               # Backend container recipe
```

---

## 2. Essential Commands

### Environment Setup & Dependency Installation

```powershell
# From ./backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

### Database Migration Protocol

Whenever modifying `app/db/models.py`:

```powershell
# 1. Generate migration script
alembic revision --autogenerate -m "describe_change"

# 2. Inspect generated file in alembic/versions/

# 3. Apply migration to database
alembic upgrade head

# 4. Rollback last migration if needed
alembic downgrade -1
```

### Seeding Data

```powershell
# Bootstrap Super Admin user
python -m app.scripts.seed_superadmin

# Seed realistic West Bengal pharma inventory & demo orders
python -m app.scripts.seed_demo_data
```

### Running Server & Test Suite

```powershell
# Run FastAPI with auto-reload
uvicorn app.main:app --reload --port 8000

# Execute Pytest suite
pytest tests/ -v
```

---

## 3. Critical Backend Rules for Agents

### Rule 1: SQLAlchemy 2.0 Async Session Usage

Always manage database sessions within context blocks:

```python
async with async_session_factory() as session:
    # Always use selectinload or joinedload for related entities
    result = await session.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
```

_Never_ attempt lazy-loading relationships outside of query preloading; doing so causes `MissingGreenlet` exceptions in async SQLAlchemy.

### Rule 2: Precision Financial Math

All currency calculations must use `Decimal` or precise numeric floats with rounding:

- Use `app.utils.gst.calculate_line_gst` for order line items.
- Line totals must equal: $\text{taxable\_value} + \text{sgst\_amount} + \text{cgst\_amount}$.
- Never store raw unrounded floats in the database (`Numeric(10, 2)` or `Numeric(12, 2)` mapped columns).

### Rule 3: Error Handling in Resolvers

- Return Strawberry error payloads or raise descriptive exceptions:

```python
if not product:
    raise Exception(f"Product with ID {product_id} not found")
```

- Ensure transactions roll back automatically on unhandled errors via `async with async_session_factory()` context scope.
