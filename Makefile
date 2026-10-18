.PHONY: help dev-backend dev-frontend db-up db-migrate db-reset test lint

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Infrastructure ───────────────────────────────────────────
infra-up: ## Start Postgres + Redis containers
	docker-compose up -d postgres redis

infra-down: ## Stop infrastructure containers
	docker-compose down

# ── Backend ──────────────────────────────────────────────────
dev-backend: ## Run backend dev server
	cd backend && uvicorn app.main:app --reload --port 8000

db-migrate: ## Run Alembic migrations
	cd backend && alembic upgrade head

db-revision: ## Create a new migration (usage: make db-revision MSG="add users table")
	cd backend && alembic revision --autogenerate -m "$(MSG)"

db-reset: ## Drop and recreate the database
	cd backend && alembic downgrade base && alembic upgrade head

seed: ## Seed database with demo products, invoices, and users from bills
	cd backend && python -m app.scripts.seed_demo_data

# ── Frontend ─────────────────────────────────────────────────
dev-frontend: ## Run frontend dev server
	cd frontend && npm run dev

# ── Quality ──────────────────────────────────────────────────
lint: ## Lint backend + frontend
	cd backend && ruff check .
	cd frontend && npm run lint

test: ## Run all tests
	cd backend && pytest -v
	cd frontend && npm test

# ── Docker (full stack) ──────────────────────────────────────
up: ## Start full stack via Docker
	docker-compose up --build -d

down: ## Stop full stack
	docker-compose down
