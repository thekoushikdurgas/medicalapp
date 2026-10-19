# Design Specification: Pharmacy Fantasy Backend State Check Pipeline (`codebase.bat`)

**Date:** 2026-10-20  
**Status:** Approved  
**Target Directory:** `e:\chanchal\pharmacyfantasy\backend`  
**Reference Source:** `e:\ayan\contact360\contact360.io\api\codebase.bat`

---

## 1. Overview & Objective

To provide a single-command, reproducible quality gate and development orchestrator (`codebase.bat`) for `e:\chanchal\pharmacyfantasy\backend`. It mirrors the architecture and user experience of Contact360 API's `codebase.bat`, tailored to Pharmacy Fantasy's FastAPI, Strawberry GraphQL, SQLAlchemy 2.0 Async, and Alembic stack.

---

## 2. Modes of Operation

1. **Full State Check (`codebase.bat`)**:
   Runs steps 0 through 9 sequentially, outputs a formatted color summary, presents actionable remediation tips, and offers to launch the Uvicorn dev server if all blocking gates pass.
2. **GraphQL Schema Snapshot (`codebase.bat 0` or `codebase.bat snapshot`)**:
   Regenerates `tests/schema_snapshot.graphql` from the live Strawberry schema and runs `tests/test_schema_snapshot.py` to ensure schema contract integrity.
3. **Help (`codebase.bat help` or `-h`)**:
   Displays usage syntax, subcommands, and available configuration flags.

---

## 3. Pipeline Steps Specification

- **Step [0] Source Inventory**:
  Lists all Python source modules under `app/`, `scripts/`, and `tests/` into `reports/backend-source-inventory.txt`. Skippable with `SKIP_CSS_INVENTORY=1`.
- **Step [1] Pip Dependencies**:
  Runs `python -m pip install --upgrade pip` and `python -m pip install --no-warn-script-location -r requirements.txt`. Skippable with `SKIP_PIP_INSTALL=1`.
- **Step [2] Environment Preflight Validation**:
  Executes `scripts/validate_env.py` checking `.env` variables against `app.core.config.Settings`. Non-fatal warning mode via `ENV_VALIDATE_NO_FAIL=1`; skippable with `SKIP_CODEGEN=1`.
- **Step [3] Type Checking (mypy)**:
  Runs `python -m mypy app/`. Automatically purges `.mypy_cache` and retries if cache corruption occurs. Warning by default; strict failure if `MYPY_STRICT=1`. Skippable with `SKIP_MYPY=1`.
- **Step [4] Formatting Check (black)**:
  Runs `python -m black --check app/ scripts/ tests/`. Skippable with `SKIP_FORMAT_CHECK=1`.
- **Step [4b] Prettier Check & Auto-Write**:
  Runs `npx.cmd prettier --check .`. If unformatted files exist, automatically runs `npx.cmd prettier --write .`. Skippable with `SKIP_PRETTIER=1`.
- **Step [5] Linting (ruff)**:
  Runs `python -m ruff check app/ scripts/ tests/`. Skippable with `SKIP_LINT=1`.
- **Step [6] Pytest Suite & Coverage**:
  Sets `APP_ENV=testing` and `DATABASE_URL=sqlite+aiosqlite:///:memory:`. Runs `pytest tests/ -q --tb=short --cov=app --cov-report=term-missing --cov-report=xml`. Skippable with `SKIP_TESTS=1`. Fast run without coverage via `SKIP_TEST_COVERAGE=1`.
- **Step [7] Best Practices Audit**:
  Runs `scripts/check_best_practices.py` against `.api-checker-config.json`, outputting `reports/check_report_bat.json`. Skippable with `SKIP_BEST_PRACTICES=1`. Advisory mode with `BEST_PRACTICES_NO_FAIL=1`.
- **Step [8] Final Auto-Format (black)**:
  Applies `python -m black app/ scripts/ tests/`. If Step 4 previously reported format errors, successfully applying formatting marks Step 4 as `FIXED` and decrements `ERROR_COUNT`. Skippable with `SKIP_FINAL_FORMAT=1`.
- **Step [9] Build & Import Integrity**:
  Runs `python -m pip check` and smoke-imports the FastAPI app: `python -c "from app.main import app"`. Skippable with `SKIP_BUILD=1`.
- **Dev Server (Interactive)**:
  On 0 errors, prompts `Start API server? (Y/N)` to start `uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` (configurable via `API_PORT`).

---

## 4. Components & Files to Create

### 4.1 Master Batch Script: `backend/codebase.bat`
- Windows CMD with `EnableDelayedExpansion`.
- ANSI color escape resolution via PowerShell `[char]27`.
- Colon/equal-safe `:color_echo` subroutine.
- Virtual environment resolution order:
  1. `venv\Scripts\python.exe`
  2. `.venv\Scripts\python.exe`
  3. `py -3`
  4. System `python` on `PATH`
- Complete section status tracker, error counter, warning counter, and `:print_next_steps` remediation guide.

### 4.2 GraphQL Schema Snapshot Tools
- `backend/scripts/regen_schema_snapshot.py`:
  Extracts SDL via `app.graphql.schema.schema.as_str()` and writes `backend/tests/schema_snapshot.graphql`.
- `backend/tests/test_schema_snapshot.py`:
  Pytest test asserting `schema.as_str() == snapshot_file.read_text()`.
- `backend/tests/schema_snapshot.graphql`:
  Baseline SDL export.

### 4.3 Environment Validator: `backend/scripts/validate_env.py`
- Parses `.env` (using `python-dotenv` with fallback plain reader).
- Validates variables from `app/core/config.py`:
  - `SECRET_KEY`: warns if default `"change-me-in-production"` in production mode.
  - `DATABASE_URL`: validates connection string presence.
  - `REDIS_URL`: validates redis format.
  - GST rates (`DEFAULT_SGST_RATE`, `DEFAULT_CGST_RATE`), `COMPANY_GSTIN`.
  - Supports `--verbose` (with secret masking) and `--env-file`.

### 4.4 Best Practices AST Checker: `backend/scripts/api_checker.py` & `check_best_practices.py`
- Adapted from contact360's AST scanner for FastAPI & Strawberry:
  - Validates project structure, models & database patterns, Strawberry query/mutation conventions, error handling, security practices, and import placement.
- `backend/.api-checker-config.json`:
  Configures thresholds and exemptions for Pharmacy Fantasy.

---

## 5. Verification Plan

1. Test `codebase.bat help` displays usage text.
2. Test `codebase.bat 0` generates `tests/schema_snapshot.graphql` and passes `test_schema_snapshot.py`.
3. Test `python scripts/validate_env.py` against `.env` / default settings.
4. Test `python scripts/check_best_practices.py` passes or reports informative metrics.
5. Run full `codebase.bat` run and verify that all passing checks reflect green status and test coverage XML is produced.
