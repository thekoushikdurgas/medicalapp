# 💊 Pharmacy Fantasy — Backend Service

FastAPI + Strawberry GraphQL + SQLAlchemy 2.0 async backend for the Pharmacy Fantasy B2B pharmaceutical wholesale platform.

## Architecture

- **Web Framework**: FastAPI 0.115+
- **API Paradigm**: Strawberry GraphQL (Code-first async schema)
- **Database ORM**: SQLAlchemy 2.0 (AsyncPG for PostgreSQL 15, AioSQLite for local testing)
- **Migrations**: Alembic with async migration runner
- **Authentication**: JWT with Role-Based Access Control (RBAC) and bcrypt password hashing
- **Testing**: Pytest with `pytest-asyncio` and `pytest-cov`
- **Linting & Formatting**: Ruff, Black, Prettier, and Mypy strict type verification

## Local Development Setup

```bash
# 1. Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt
pip install black ruff mypy pytest-cov types-passlib

# 3. Configure environment
cp .env.example .env

# 4. Run database migrations
alembic upgrade head

# 5. Seed initial data
python -m app.scripts.seed_demo_data

# 6. Start development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Quality Assurance & Verification

Run the comprehensive 10-step verification suite:

```cmd
codebase.bat
```

Or individual quality gates:

```bash
python -m mypy app/
python -m ruff check app/ scripts/ tests/
python -m black --check app/ scripts/ tests/
python -m pytest tests/ --cov=app
python scripts/check_best_practices.py
```

## API Access Points

- **GraphQL Playground**: `http://localhost:8000/graphql`
- **Health Check**: `http://localhost:8000/health`
