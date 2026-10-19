#!/usr/bin/env python3
"""
FastAPI Best Practices Checker — 121-Point Checklist (+ import_analysis)

Checks a FastAPI/Python codebase against 121 scored points
organised into 9 categories (plus ``import_analysis`` in JSON reports):

  1. Project Structure          (10 points)
  2. Code Organization          (15 points)
  3. Models & Database          (12 points)
  4. FastAPI & GraphQL          (20 points: 38–49, 103–110 Strawberry/GraphQL extras)
  5. Security                   (16 points: 50–61, 111–114 GraphQL security extras)
  6. Performance                (12 points: 62–71, 115–116 query/cache extras)
  7. Testing                    (10 points: 72–79, 117–118 GraphQL test extras)
  8. Deployment & Ops           (9 points: 80–85, 119–121 schema/observability extras)
  9. Python Code Quality        (17 points: 86–102, incl. import placement)

Usage (via CLI wrapper):
    python scripts/check_best_practices.py
    python scripts/check_best_practices.py --category "Security"
    python scripts/check_best_practices.py --output reports/check.json

Direct usage:
    from scripts.api_checker import FastAPIBestPracticesChecker
    checker = FastAPIBestPracticesChecker(Path("."))
    checker.run_all_checks()
"""

from __future__ import annotations

import argparse
import ast
import json
import re
import sys
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Data classes (mirrors contact360.io/2 scripts/django_checker.py shape)
# ---------------------------------------------------------------------------


@dataclass
class CheckResult:
    """Result of a single check."""

    point_number: int
    category: str
    description: str
    passed: bool
    message: str
    severity: str = "info"  # info | warning | error


@dataclass
class CategorySummary:
    """Summary for a category."""

    category: str
    total_points: int
    passed: int
    failed: int
    results: list[CheckResult] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Secret-pattern heuristic (same idea as django_checker)
# ---------------------------------------------------------------------------

_SECRET_PATTERNS: list[tuple[str, re.Pattern[str]]] = [
    ("Stripe live key", re.compile(r"sk_live_[0-9a-zA-Z]{20,}")),
    ("AWS access key id", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("PEM private key", re.compile(r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("GitHub PAT (classic)", re.compile(r"ghp_[0-9a-zA-Z]{36}")),
    (
        "Hardcoded password",
        re.compile(r'(?i)(?<![A-Za-z_])password\s*=\s*["\'][^"\']{8,}["\']'),
    ),
]

# ---------------------------------------------------------------------------
# Import placement analysis (PEP 8 header vs mid-file / nested)
# ---------------------------------------------------------------------------


def _is_string_expr_stmt(stmt: ast.stmt) -> bool:
    if not isinstance(stmt, ast.Expr):
        return False
    v = stmt.value
    return isinstance(v, ast.Constant) and isinstance(v.value, str)


def _is_future_import(stmt: ast.stmt) -> bool:
    return isinstance(stmt, ast.ImportFrom) and stmt.module == "__future__"


def _expr_is_type_checking(expr: ast.expr) -> bool:
    if isinstance(expr, ast.Name) and expr.id == "TYPE_CHECKING":
        return True
    if isinstance(expr, ast.Attribute) and expr.attr == "TYPE_CHECKING":
        return True
    return False


def _block_is_only_imports_and_pass(stmts: list[ast.stmt]) -> bool:
    for s in stmts:
        if isinstance(s, ast.Import | ast.ImportFrom):
            continue
        if isinstance(s, ast.Expr) and _is_string_expr_stmt(s):
            continue
        if isinstance(s, ast.Pass):
            continue
        if isinstance(s, ast.AnnAssign) and s.value is None:
            continue
        return False
    return True


def _collect_header_import_nodes(body: list[ast.stmt]) -> set[ast.AST]:
    """Contiguous imports at module start + chained ``if TYPE_CHECKING:`` import-only blocks."""
    header: set[ast.AST] = set()
    i = 0
    if i < len(body) and _is_string_expr_stmt(body[i]):
        i += 1
    while i < len(body) and _is_future_import(body[i]):
        header.add(body[i])
        i += 1
    while i < len(body):
        stmt = body[i]
        if isinstance(stmt, ast.Import | ast.ImportFrom):
            header.add(stmt)
            i += 1
        elif (
            isinstance(stmt, ast.If)
            and _expr_is_type_checking(stmt.test)
            and _block_is_only_imports_and_pass(stmt.body)
        ):
            header.add(stmt)
            for s in stmt.body:
                if isinstance(s, ast.Import | ast.ImportFrom):
                    header.add(s)
            i += 1
        else:
            break
    return header


def _import_stmt_text(node: ast.Import | ast.ImportFrom) -> str:
    try:
        return ast.unparse(node).strip().replace("\n", " ")
    except (AttributeError, TypeError):
        return node.__class__.__name__


def _import_line_range(node: ast.AST) -> tuple[int, int]:
    start = getattr(node, "lineno", 1) or 1
    end = getattr(node, "end_lineno", start) or start
    return start, end


def _collect_delayed_module_imports(
    mod: ast.Module, header: set[ast.AST]
) -> list[ast.Import | ast.ImportFrom]:
    """Imports at module scope but outside the header region.

    ``if TYPE_CHECKING:`` blocks whose body is import-only are excluded — they are
    a normal pattern for circular-import avoidance (even after other module code).
    """
    out: list[ast.Import | ast.ImportFrom] = []

    def walk_block(stmts: list[ast.stmt]) -> None:
        for st in stmts:
            if isinstance(st, ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef):
                continue
            if isinstance(st, ast.Import | ast.ImportFrom):
                if st not in header:
                    out.append(st)
            elif isinstance(st, ast.If):
                if _expr_is_type_checking(st.test) and _block_is_only_imports_and_pass(
                    st.body
                ):
                    continue
                walk_block(st.body)
                walk_block(st.orelse)
            elif isinstance(st, ast.Try):
                walk_block(st.body)
                for h in st.handlers:
                    walk_block(h.body)
                walk_block(st.orelse)
                walk_block(st.finalbody)
            elif isinstance(st, ast.With):
                walk_block(st.body)
            elif isinstance(st, ast.For | ast.While):
                walk_block(st.body)
                walk_block(st.orelse)
            elif isinstance(st, ast.Match):  # py3.10+
                for case in st.cases:
                    walk_block(case.body)

    walk_block(mod.body)
    return out


class _NestedImportVisitor(ast.NodeVisitor):
    """Collect import/from inside function, async function, or class bodies."""

    def __init__(self, rel_path: str) -> None:
        self.rel_path = rel_path
        self._scope: list[str] = []
        self.nested: list[dict[str, Any]] = []

    def _scope_label(self) -> str:
        return "/".join(self._scope) if self._scope else ""

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._scope.append(f"function:{node.name}")
        self.generic_visit(node)
        self._scope.pop()

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._scope.append(f"async_function:{node.name}")
        self.generic_visit(node)
        self._scope.pop()

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        self._scope.append(f"class:{node.name}")
        self.generic_visit(node)
        self._scope.pop()

    def visit_Import(self, node: ast.Import) -> None:
        if self._scope:
            lo, hi = _import_line_range(node)
            self.nested.append(
                {
                    "path": self.rel_path,
                    "line": lo,
                    "end_line": hi,
                    "scope": self._scope_label(),
                    "kind": "import",
                    "statement": _import_stmt_text(node),
                }
            )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        if self._scope:
            lo, hi = _import_line_range(node)
            self.nested.append(
                {
                    "path": self.rel_path,
                    "line": lo,
                    "end_line": hi,
                    "scope": self._scope_label(),
                    "kind": "from",
                    "statement": _import_stmt_text(node),
                }
            )
        self.generic_visit(node)


def analyze_file_imports(source: str, rel_path: str) -> dict[str, Any] | None:
    """Return import placement breakdown for one file, or None if parse failed."""
    try:
        mod = ast.parse(source, filename=rel_path)
    except SyntaxError:
        return None
    if not isinstance(mod, ast.Module):
        return None

    header = _collect_header_import_nodes(mod.body)
    top_list: list[dict[str, Any]] = []
    for st in mod.body:
        if st in header and isinstance(st, ast.Import | ast.ImportFrom):
            lo, hi = _import_line_range(st)
            top_list.append(
                {
                    "line": lo,
                    "end_line": hi,
                    "kind": "import" if isinstance(st, ast.Import) else "from",
                    "statement": _import_stmt_text(st),
                }
            )
        elif st in header and isinstance(st, ast.If):
            for s in st.body:
                if isinstance(s, ast.Import | ast.ImportFrom):
                    lo, hi = _import_line_range(s)
                    top_list.append(
                        {
                            "line": lo,
                            "end_line": hi,
                            "kind": "import" if isinstance(s, ast.Import) else "from",
                            "statement": _import_stmt_text(s),
                            "via": "TYPE_CHECKING",
                        }
                    )

    delayed_nodes = _collect_delayed_module_imports(mod, header)
    delayed = [
        {
            "line": _import_line_range(n)[0],
            "end_line": _import_line_range(n)[1],
            "kind": "import" if isinstance(n, ast.Import) else "from",
            "statement": _import_stmt_text(n),
        }
        for n in delayed_nodes
    ]

    visitor = _NestedImportVisitor(rel_path)
    visitor.visit(mod)

    return {
        "path": rel_path,
        "top_imports": top_list,
        "mid_file_imports": delayed
        + [{**x, "category": "nested"} for x in visitor.nested],
        "delayed_module_imports": delayed,
        "nested_imports": visitor.nested,
    }


def scan_tree_imports(
    project_root: Path,
    subdirs: list[str],
) -> dict[str, Any]:
    """Scan *.py under *subdirs* (relative to project_root)."""
    per_file: dict[str, Any] = {}
    parse_errors: list[str] = []
    totals = {
        "files_scanned": 0,
        "top_import_statements": 0,
        "delayed_module_import_statements": 0,
        "nested_import_statements": 0,
    }

    for sub in subdirs:
        base = project_root / sub
        if not base.is_dir():
            continue
        for path in base.rglob("*.py"):
            if "__pycache__" in path.parts:
                continue
            rel = str(path.relative_to(project_root)).replace("\\", "/")
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            totals["files_scanned"] += 1
            info = analyze_file_imports(text, rel)
            if info is None:
                parse_errors.append(rel)
                continue
            per_file[rel] = info
            totals["top_import_statements"] += len(info["top_imports"])
            totals["delayed_module_import_statements"] += len(
                info["delayed_module_imports"]
            )
            totals["nested_import_statements"] += len(info["nested_imports"])

    return {
        "scan_roots": subdirs,
        "totals": totals,
        "parse_errors": parse_errors,
        "per_file": per_file,
    }


# ---------------------------------------------------------------------------
# Main checker
# ---------------------------------------------------------------------------


class FastAPIBestPracticesChecker:
    """Checks a FastAPI/Python codebase against 121 best-practice points (+ import JSON)."""

    def __init__(self, project_root: Path) -> None:
        self.project_root = project_root.resolve()
        self.results: list[CheckResult] = []
        self.config: dict[str, Any] = self._load_config()
        self.import_analysis: dict[str, Any] = {}

    # ------------------------------------------------------------------
    # Config
    # ------------------------------------------------------------------

    def _load_config(self) -> dict[str, Any]:
        cfg_path = self.project_root / ".api-checker-config.json"
        if cfg_path.exists():
            try:
                return json.loads(cfg_path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                pass
        return {}

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _add_result(
        self,
        point_number: int,
        category: str,
        description: str,
        passed: bool,
        message: str,
        severity: str = "info",
    ) -> None:
        ignore = set(self.config.get("ignore_points", []))
        skip_cats = [s.lower() for s in self.config.get("skip_categories", [])]
        if point_number in ignore:
            return
        if any(category.lower() == s for s in skip_cats):
            return
        self.results.append(
            CheckResult(
                point_number=point_number,
                category=category,
                description=description,
                passed=passed,
                message=message,
                severity=severity,
            )
        )

    def _exists(self, *parts: str) -> bool:
        return (self.project_root / Path(*parts)).exists()

    def _is_dir(self, *parts: str) -> bool:
        p = self.project_root / Path(*parts)
        return p.exists() and p.is_dir()

    def _read(self, *parts: str) -> str:
        p = self.project_root / Path(*parts)
        try:
            return p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            return ""

    def _find_files(self, pattern: str) -> list[Path]:
        """Glob relative to project_root."""
        return list(self.project_root.glob(pattern))

    def _find_py_files(self, subdir: str) -> list[Path]:
        base = self.project_root / subdir
        if not base.exists():
            return []
        return [p for p in base.rglob("*.py") if "__pycache__" not in p.parts]

    def _any_file_contains(self, subdir: str, pattern: str | re.Pattern[str]) -> bool:
        """Return True if any .py file under subdir matches pattern."""
        if isinstance(pattern, str):
            pattern = re.compile(pattern)
        for f in self._find_py_files(subdir):
            try:
                text = f.read_text(encoding="utf-8", errors="ignore")
                if pattern.search(text):
                    return True
            except OSError:
                pass
        return False

    def _count_py_files_with(self, subdir: str, pattern: str | re.Pattern[str]) -> int:
        if isinstance(pattern, str):
            pattern = re.compile(pattern)
        count = 0
        for f in self._find_py_files(subdir):
            try:
                if pattern.search(f.read_text(encoding="utf-8", errors="ignore")):
                    count += 1
            except OSError:
                pass
        return count

    def _requirements_text(self) -> str:
        return self._read("requirements.txt") + self._read("pyproject.toml")

    def _has_dep(self, name: str) -> bool:
        return name.lower() in self._requirements_text().lower()

    # ------------------------------------------------------------------
    # 1. Project Structure  (points 1–10)
    # ------------------------------------------------------------------

    def _check_project_structure(self) -> None:
        cat = "Project Structure"
        print(f"Checking {cat}...")

        # 1 — app/ package
        self._add_result(
            1,
            cat,
            "app/ package directory exists",
            self._is_dir("app"),
            "app/ " + ("found" if self._is_dir("app") else "missing"),
        )

        # 2 — pyproject.toml or requirements.txt
        has_pyproject = self._exists("pyproject.toml")
        has_req = self._exists("requirements.txt")
        self._add_result(
            2,
            cat,
            "pyproject.toml or requirements.txt present",
            has_pyproject or has_req,
            f"pyproject.toml: {has_pyproject}, requirements.txt: {has_req}",
        )

        # 3 — tests/
        self._add_result(
            3,
            cat,
            "tests/ directory exists",
            self._is_dir("tests"),
            "tests/ " + ("found" if self._is_dir("tests") else "missing"),
        )

        # 4 — scripts/
        self._add_result(
            4,
            cat,
            "scripts/ directory for maintenance scripts",
            self._is_dir("scripts"),
            "scripts/ " + ("found" if self._is_dir("scripts") else "missing"),
        )

        # 5 — .env.example
        self._add_result(
            5,
            cat,
            ".env.example documents environment variables",
            self._exists(".env.example"),
            ".env.example " + ("found" if self._exists(".env.example") else "missing"),
        )

        # 6 — .gitignore covers .env, __pycache__, .pytest_cache
        gi = self._read(".gitignore")
        gi_ok = (
            self._exists(".gitignore")
            and ".env" in gi
            and "__pycache__" in gi
            and ".pytest_cache" in gi
        )
        self._add_result(
            6,
            cat,
            ".gitignore excludes .env, __pycache__, .pytest_cache",
            gi_ok,
            (
                "OK"
                if gi_ok
                else "Missing .gitignore patterns: .env / __pycache__ / .pytest_cache"
            ),
        )

        # 7 — README.md with substance
        readme_text = self._read("README.md")
        readme_ok = bool(readme_text) and len(readme_text.strip()) >= 500
        self._add_result(
            7,
            cat,
            "README.md with setup/local-dev/deployment instructions (>=500 chars)",
            readme_ok,
            f"README.md {'present, length=' + str(len(readme_text.strip())) if readme_text else 'missing'}",
        )

        # 8 — Dockerfile
        self._add_result(
            8,
            cat,
            "Dockerfile for containerised deploy",
            self._exists("Dockerfile"),
            "Dockerfile " + ("found" if self._exists("Dockerfile") else "missing"),
        )

        # 9 — alembic/ for DB migrations
        self._add_result(
            9,
            cat,
            "alembic/ directory for database migrations",
            self._is_dir("alembic"),
            "alembic/ " + ("found" if self._is_dir("alembic") else "missing"),
        )

        # 10 — deploy/ or infra/
        has_deploy = self._is_dir("deploy") or self._is_dir("infra")
        self._add_result(
            10,
            cat,
            "deploy/ or infra/ for deployment configs",
            has_deploy,
            "deploy/infra dir " + ("found" if has_deploy else "missing"),
        )

        print("  [ok] Completed\n")

    # ------------------------------------------------------------------
    # 2. Code Organization  (points 11–25)
    # ------------------------------------------------------------------

    def _check_code_organization(self) -> None:
        cat = "Code Organization"
        print(f"Checking {cat}...")

        layers = {
            11: ("app/services", "app/services/ — business logic layer"),
            12: ("app/repositories", "app/repositories/ — data-access layer"),
            13: ("app/clients", "app/clients/ — external HTTP service clients"),
            14: ("app/models", "app/models/ — SQLAlchemy/domain models"),
            15: ("app/graphql", "app/graphql/ — GraphQL schema & resolvers"),
            16: ("app/core", "app/core/ — config, security, middleware"),
            17: ("app/utils", "app/utils/ — shared utilities"),
            18: ("app/db", "app/db/ — DB session, base, engine"),
        }
        for point, (subdir, desc) in layers.items():
            self._add_result(
                point,
                cat,
                desc,
                self._is_dir(subdir),
                subdir + (" found" if self._is_dir(subdir) else " missing"),
            )

        # 19 — per-module queries.py + mutations.py pattern
        modules_dir = self.project_root / "app" / "graphql" / "modules"
        if modules_dir.exists():
            module_dirs = [d for d in modules_dir.iterdir() if d.is_dir()]
            have_both = sum(
                1
                for d in module_dirs
                if (d / "queries.py").exists() and (d / "mutations.py").exists()
            )
            self._add_result(
                19,
                cat,
                "GraphQL modules use queries.py + mutations.py pattern",
                have_both >= 3,
                f"{have_both}/{len(module_dirs)} modules have queries+mutations",
            )
        else:
            self._add_result(
                19,
                cat,
                "GraphQL modules use queries.py + mutations.py pattern",
                False,
                "app/graphql/modules/ not found",
            )

        # 20 — base HTTP client
        self._add_result(
            20,
            cat,
            "Base HTTP client class (clients/base.py)",
            self._exists("app/clients/base.py"),
            "app/clients/base.py "
            + ("found" if self._exists("app/clients/base.py") else "missing"),
        )

        # 21 — centralised error utilities
        self._add_result(
            21,
            cat,
            "Centralised error utilities (app/utils/external_errors.py or similar)",
            self._exists("app/utils/external_errors.py")
            or self._exists("app/graphql/errors.py"),
            "external_errors.py/graphql errors "
            + (
                "found"
                if (
                    self._exists("app/utils/external_errors.py")
                    or self._exists("app/graphql/errors.py")
                )
                else "missing"
            ),
        )

        # 22 — app/graphql/schema.py
        self._add_result(
            22,
            cat,
            "app/graphql/schema.py assembles the schema",
            self._exists("app/graphql/schema.py"),
            "app/graphql/schema.py "
            + ("found" if self._exists("app/graphql/schema.py") else "missing"),
        )

        # 23 — GraphQL context
        self._add_result(
            23,
            cat,
            "GraphQL context module (graphql/context.py)",
            self._exists("app/graphql/context.py"),
            "app/graphql/context.py "
            + ("found" if self._exists("app/graphql/context.py") else "missing"),
        )

        # 24 — dataloader / N+1 mitigation
        self._add_result(
            24,
            cat,
            "DataLoaders to prevent N+1 queries (app/graphql/dataloaders.py)",
            self._exists("app/graphql/dataloaders.py"),
            "dataloaders.py "
            + ("found" if self._exists("app/graphql/dataloaders.py") else "missing"),
        )

        # 25 — validation utilities
        has_validation = self._exists(
            "app/utils/validation.py"
        ) or self._any_file_contains("app/utils", r"validate_")
        self._add_result(
            25,
            cat,
            "Input validation utilities in app/utils/",
            has_validation,
            "Validation utilities " + ("found" if has_validation else "not found"),
        )

        print("  [ok] Completed\n")

    # ------------------------------------------------------------------
    # 3. Models & Database  (points 26–37)
    # ------------------------------------------------------------------

    def _check_models_database(self) -> None:
        cat = "Models & Database"
        print(f"Checking {cat}...")

        # 26 — SQLAlchemy async used
        self._add_result(
            26,
            cat,
            "SQLAlchemy async models (AsyncAttrs / MappedAsDataclass / async_sessionmaker)",
            self._any_file_contains(
                "app", re.compile(r"AsyncAttrs|async_sessionmaker|AsyncSession")
            ),
            "AsyncSession/async_sessionmaker "
            + (
                "found"
                if self._any_file_contains(
                    "app", re.compile(r"AsyncAttrs|async_sessionmaker|AsyncSession")
                )
                else "missing"
            ),
        )

        # 27 — Alembic migrations exist
        versions = (
            list((self.project_root / "alembic" / "versions").glob("*.py"))
            if (self.project_root / "alembic" / "versions").exists()
            else []
        )
        self._add_result(
            27,
            cat,
            "Alembic migration files present (alembic/versions/)",
            len(versions) > 0,
            f"{len(versions)} migration file(s) found",
        )

        # 28 — Timestamp columns present (base mixin or per-model)
        base_text = self._read("app/db/base.py")
        has_timestamps_in_base = bool(re.search(r"created_at|updated_at", base_text))
        has_timestamps_in_models = self._any_file_contains(
            "app/models", r"created_at|updated_at"
        )
        has_timestamps = has_timestamps_in_base or has_timestamps_in_models
        self._add_result(
            28,
            cat,
            "Timestamp columns (created_at/updated_at) in base mixin or models",
            has_timestamps,
            "created_at/updated_at "
            + (
                "in base mixin"
                if has_timestamps_in_base
                else "in individual models" if has_timestamps_in_models else "not found"
            ),
        )

        # 29 — UUID PKs
        models_text = " ".join(
            f.read_text(encoding="utf-8", errors="ignore")
            for f in self._find_py_files("app/models")
            if f.exists()
        )
        has_uuid = bool(re.search(r"UUID|uuid", models_text))
        self._add_result(
            29,
            cat,
            "UUID primary keys used in models",
            has_uuid,
            "UUID " + ("found in models" if has_uuid else "not found in models"),
        )

        # 30 — DB session context manager
        session_text = self._read("app/db/session.py")
        has_session = bool(
            re.search(
                r"async_sessionmaker|AsyncSession|get_db|session_scope", session_text
            )
        )
        self._add_result(
            30,
            cat,
            "Async DB session factory/context (app/db/session.py)",
            has_session,
            "Session factory " + ("found" if has_session else "missing in session.py"),
        )

        # 31 — Connection pool configured
        config_text = self._read("app/core/config.py") + self._read("app/db/session.py")
        has_pool = bool(
            re.search(
                r"pool_size|max_overflow|pool_pre_ping|NullPool|pool_recycle",
                config_text,
            )
        )
        self._add_result(
            31,
            cat,
            "Database connection pool configured",
            has_pool,
            "Pool settings " + ("found" if has_pool else "not configured"),
        )

        # 32 — DATABASE_URL from env
        self._add_result(
            32,
            cat,
            "DATABASE_URL or POSTGRES_* from environment (not hardcoded)",
            "DATABASE_URL" in config_text or "POSTGRES_HOST" in config_text,
            "DATABASE_URL/POSTGRES_* "
            + (
                "env-backed"
                if ("DATABASE_URL" in config_text or "POSTGRES_HOST" in config_text)
                else "not found in config"
            ),
        )

        # 33 — No raw SQL in app code (heuristic: bare execute()/text() with hand-written SELECT
        #       outside of SQLAlchemy ORM patterns; ignores legitimate health-check counts)
        raw_sql_files: list[str] = []
        # Only flag SELECT statements that look like complex business logic (multi-word queries)
        _raw_sql_re = re.compile(
            r'execute\s*\(\s*["\']SELECT\s+\w+.*FROM\s+\w+.*WHERE'
            r'|text\s*\(\s*["\']SELECT\s+(?!\s*COUNT\s*\(\s*\*\s*\))[^"\']{30,}'
        )
        for f in self._find_py_files("app"):
            txt = f.read_text(encoding="utf-8", errors="ignore")
            if _raw_sql_re.search(txt):
                raw_sql_files.append(str(f.relative_to(self.project_root)))
        self._add_result(
            33,
            cat,
            "No raw SQL strings (ORM used throughout)",
            len(raw_sql_files) == 0,
            "Raw SQL "
            + (
                f"found in: {', '.join(raw_sql_files[:3])}"
                if raw_sql_files
                else "not found — ORM used"
            ),
            "warning" if raw_sql_files else "info",
        )

        # 34 — selectinload / joinedload for eager loading
        has_eager = self._any_file_contains(
            "app", re.compile(r"selectinload|joinedload|subqueryload")
        )
        self._add_result(
            34,
            cat,
            "selectinload/joinedload used for eager loading (avoid N+1)",
            has_eager,
            "Eager loading "
            + ("found" if has_eager else "not found — check for N+1 queries"),
            "warning" if not has_eager else "info",
        )

        # 35 — indexes on models
        has_indexes = bool(
            re.search(r"db_index|Index\s*\(|__table_args__", models_text)
        )
        self._add_result(
            35,
            cat,
            "Database indexes defined on models",
            has_indexes,
            "Index definitions " + ("found" if has_indexes else "not found"),
        )

        # 36 — alembic/env.py present
        self._add_result(
            36,
            cat,
            "alembic/env.py for migration config",
            self._exists("alembic/env.py"),
            "alembic/env.py "
            + ("found" if self._exists("alembic/env.py") else "missing"),
        )

        # 37 — token_blacklist or session revocation
        has_blacklist = self._exists(
            "app/models/token_blacklist.py"
        ) or self._any_file_contains("app", r"token_blacklist")
        self._add_result(
            37,
            cat,
            "Token blacklist / session revocation model",
            has_blacklist,
            "Token blacklist " + ("found" if has_blacklist else "not found"),
        )

        print("  [ok] Completed\n")

    # ------------------------------------------------------------------
    # 4. FastAPI & GraphQL  (points 38–49)
    # ------------------------------------------------------------------

    def _check_fastapi_graphql(self) -> None:
        cat = "FastAPI & GraphQL"
        print(f"Checking {cat}...")

        main_text = self._read("app/main.py")

        # 38 — strawberry-graphql dependency
        self._add_result(
            38,
            cat,
            "strawberry-graphql in dependencies",
            "strawberry" in self._requirements_text(),
            "strawberry-graphql "
            + ("found" if "strawberry" in self._requirements_text() else "missing"),
        )

        # 39 — app/main.py
        self._add_result(
            39,
            cat,
            "app/main.py — FastAPI application entry point",
            self._exists("app/main.py"),
            "app/main.py " + ("found" if self._exists("app/main.py") else "missing"),
        )

        # 40 — health endpoint
        has_health = bool(re.search(r"/health", main_text)) or self._exists(
            "app/graphql/modules/health"
        )
        self._add_result(
            40,
            cat,
            "Health endpoint configured",
            has_health,
            "Health endpoint " + ("found" if has_health else "not found"),
        )

        # 41 — CORS configured
        has_cors = bool(
            re.search(r"CORSMiddleware|allow_origins|ALLOWED_ORIGINS", main_text)
        )
        self._add_result(
            41,
            cat,
            "CORS middleware configured",
            has_cors,
            "CORSMiddleware " + ("found" if has_cors else "not in main.py"),
        )

        # 42 — Rate limiting configured
        config_text = self._read("app/core/config.py")
        has_rate = bool(
            re.search(
                r"RATE_LIMIT|rate_limit|throttl", config_text + main_text, re.IGNORECASE
            )
        )
        self._add_result(
            42,
            cat,
            "Rate limiting configured (GRAPHQL_RATE_LIMIT_REQUESTS_PER_MINUTE or middleware)",
            has_rate,
            "Rate limiting " + ("found" if has_rate else "not configured"),
        )

        # 43 — Query depth / complexity limits
        has_limits = bool(
            re.search(
                r"COMPLEXITY_LIMIT|DEPTH_LIMIT|depth_limit|complexity",
                config_text + main_text,
                re.IGNORECASE,
            )
        )
        self._add_result(
            43,
            cat,
            "Query depth/complexity limits configured",
            has_limits,
            "Depth/complexity limits " + ("found" if has_limits else "not found"),
        )

        # 44 — Introspection toggle
        has_intro = bool(
            re.search(r"INTROSPECTION|introspection", config_text, re.IGNORECASE)
        )
        self._add_result(
            44,
            cat,
            "GraphQL introspection toggled via config (env-backed)",
            has_intro,
            "Introspection config " + ("found" if has_intro else "not found"),
        )

        # 45 — Idempotency middleware
        has_idempotency = (
            self._exists("app/core/middleware.py")
            and bool(
                re.search(
                    r"idempoten", self._read("app/core/middleware.py"), re.IGNORECASE
                )
            )
        ) or bool(re.search(r"idempoten", main_text, re.IGNORECASE))
        self._add_result(
            45,
            cat,
            "Idempotency middleware for mutations",
            has_idempotency,
            "Idempotency " + ("found" if has_idempotency else "not found"),
        )

        # 46 — Auth middleware / security dependency
        has_auth = bool(
            re.search(
                r"require_auth|get_current_user|JWTBearer|HTTPBearer",
                main_text + self._read("app/core/security.py"),
            )
        )
        self._add_result(
            46,
            cat,
            "Auth middleware / dependency injection (require_auth / JWTBearer)",
            has_auth,
            "Auth guard " + ("found" if has_auth else "not found"),
        )

        # 47 — Response size limit
        has_body_limit = bool(
            re.search(
                r"MAX_BODY|body_size|MaxBodySize",
                config_text + main_text,
                re.IGNORECASE,
            )
        )
        self._add_result(
            47,
            cat,
            "Request body size limit configured",
            has_body_limit,
            "Body size limit " + ("found" if has_body_limit else "not configured"),
        )

        # 48 — GraphQL extensions (tracing / error handling)
        self._add_result(
            48,
            cat,
            "GraphQL extensions (tracing/error, app/graphql/extensions.py)",
            self._exists("app/graphql/extensions.py"),
            "extensions.py "
            + ("found" if self._exists("app/graphql/extensions.py") else "missing"),
        )

        # 49 — Pagination helper
        has_pagination = self._exists(
            "app/graphql/common/pagination.py"
        ) or self._any_file_contains("app", r"paginate|page_size|offset")
        self._add_result(
            49,
            cat,
            "Pagination helper implemented",
            has_pagination,
            "Pagination " + ("found" if has_pagination else "not found"),
        )

        print("  [ok] Completed\n")

    # ------------------------------------------------------------------
    # 4b. FastAPI & GraphQL — extended (points 103–110, Strawberry checklist)
    # ------------------------------------------------------------------

    def _check_fastapi_graphql_extended(self) -> None:
        cat = "FastAPI & GraphQL"
        print(f"Checking {cat} (extended 103–110)...")

        modules_dir = self.project_root / "app" / "graphql" / "modules"
        types_count = 0
        inputs_count = 0
        if modules_dir.is_dir():
            for d in modules_dir.iterdir():
                if d.is_dir() and (d / "types.py").exists():
                    types_count += 1
                if d.is_dir() and (d / "inputs.py").exists():
                    inputs_count += 1

        self._add_result(
            103,
            cat,
            "GraphQL modules define types.py (separate schema types)",
            types_count >= 5,
            f"{types_count} module(s) with types.py (threshold: 5)",
        )

        self._add_result(
            104,
            cat,
            "GraphQL modules define inputs.py (@strawberry.input for complex args)",
            inputs_count >= 3,
            f"{inputs_count} module(s) with inputs.py (threshold: 3)",
        )

        ctx_text = self._read("app/graphql/context.py")
        has_base_context = bool(
            re.search(r"class\s+\w+\s*\([^)]*BaseContext", ctx_text)
        )
        self._add_result(
            105,
            cat,
            "GraphQL context subclasses strawberry.fastapi BaseContext",
            has_base_context,
            "BaseContext subclass "
            + ("found" if has_base_context else "not found in context.py"),
        )

        has_lazy = self._any_file_contains("app/graphql", r"strawberry\.lazy")
        self._add_result(
            106,
            cat,
            "strawberry.lazy used for circular / forward type references",
            has_lazy,
            "strawberry.lazy " + ("found" if has_lazy else "not found"),
        )

        main_text = self._read("app/main.py")
        ide_hardcoded_true = bool(
            re.search(r"graphql_ide\s*=\s*True\b|graphiql\s*=\s*True\b", main_text)
        )
        ide_env_guarded = bool(
            re.search(r"graphql_ide\s*=.*(?:settings\.|DEBUG|ENVIRONMENT)", main_text)
        ) or bool(re.search(r"graphql_ide\s*=\s*None\s+if", main_text))
        ide_explicit_none = bool(re.search(r"graphql_ide\s*=\s*None\b", main_text))
        ide_ok = not ide_hardcoded_true and (
            "graphql_ide" not in main_text or ide_env_guarded or ide_explicit_none
        )
        self._add_result(
            107,
            cat,
            "GraphQL IDE (GraphiQL/Apollo Sandbox) gated by settings/env, not hardcoded True",
            ide_ok,
            "graphql_ide "
            + (
                "OK (guarded or absent)"
                if ide_ok
                else "hardcoded True or missing env guard in main.py"
            ),
            "warning" if not ide_ok else "info",
        )

        dl_text = self._read("app/graphql/dataloaders.py")
        per_request_dl = "DataLoaders(" in ctx_text
        module_level_dl_assign = False
        if dl_text:
            for line in dl_text.splitlines():
                stripped = line.lstrip()
                if not stripped or stripped.startswith("#"):
                    continue
                indent = len(line) - len(stripped)
                if indent == 0 and "DataLoader(" in stripped:
                    if stripped.startswith("from ") or stripped.startswith("import "):
                        continue
                    if stripped.startswith("class "):
                        continue
                    module_level_dl_assign = True
                    break
        dl_pattern_ok = per_request_dl and not module_level_dl_assign
        self._add_result(
            108,
            cat,
            "DataLoaders instantiated per-request in context (no module-level DataLoader factories)",
            dl_pattern_ok,
            "context DataLoaders( "
            + ("OK" if per_request_dl else "missing")
            + "; module-level DataLoader "
            + ("found (avoid)" if module_level_dl_assign else "none"),
        )

        info_files = self._count_py_files_with(
            "app/graphql", r"info:\s*strawberry\.Info"
        )
        self._add_result(
            109,
            cat,
            "Resolvers use typed strawberry.Info parameter (explicit signatures)",
            info_files >= 10,
            f"files with info: strawberry.Info: {info_files} (threshold: 10)",
            "warning" if info_files < 10 else "info",
        )

        has_straw_enum = self._any_file_contains("app/graphql", r"@strawberry\.enum")
        self._add_result(
            110,
            cat,
            "@strawberry.enum for GraphQL enums",
            has_straw_enum,
            "@strawberry.enum " + ("found" if has_straw_enum else "not found"),
            "warning" if not has_straw_enum else "info",
        )

        print("  [ok] Completed (extended)\n")

    # ------------------------------------------------------------------
    # 5. Security  (points 50–61)
    # ------------------------------------------------------------------

    def _check_security(self) -> None:
        cat = "Security"
        print(f"Checking {cat}...")

        config_text = self._read("app/core/config.py")
        security_text = self._read("app/core/security.py")

        # 50 — SECRET_KEY from env
        secret_ok = (
            bool(re.search(r"SECRET_KEY", config_text))
            and "hardcoded" not in config_text
        )
        self._add_result(
            50,
            cat,
            "SECRET_KEY loaded from environment (not hardcoded)",
            secret_ok,
            "SECRET_KEY "
            + (
                "env-backed in config"
                if secret_ok
                else "not found or possibly hardcoded"
            ),
        )

        # 51 — DEBUG env-backed
        debug_ok = bool(re.search(r"DEBUG\s*[:=]", config_text))
        self._add_result(
            51,
            cat,
            "DEBUG flag env-backed (not hardcoded True in production)",
            debug_ok,
            "DEBUG " + ("env-backed" if debug_ok else "not found in config"),
        )

        # 52 — ALLOWED_ORIGINS not wildcard by default
        origins_line = re.search(r"ALLOWED_ORIGINS.*?=.*", config_text)
        origins_ok = not (origins_line and '"*"' in origins_line.group(0))
        self._add_result(
            52,
            cat,
            "ALLOWED_ORIGINS not wildcard (*) as default",
            origins_ok,
            "ALLOWED_ORIGINS "
            + ("OK" if origins_ok else "set to * — restrict in production"),
            "warning" if not origins_ok else "info",
        )

        # 53 — JWT validation (python-jose)
        has_jwt = "python-jose" in self._requirements_text() or bool(
            re.search(r"jose|jwt", security_text, re.IGNORECASE)
        )
        self._add_result(
            53,
            cat,
            "JWT validation with python-jose or equivalent",
            has_jwt,
            "JWT " + ("found" if has_jwt else "not found"),
        )

        # 54 — bcrypt for password hashing
        has_bcrypt = "bcrypt" in self._requirements_text()
        self._add_result(
            54,
            cat,
            "bcrypt used for password hashing",
            has_bcrypt,
            "bcrypt " + ("found in deps" if has_bcrypt else "not found"),
        )

        # 55 — No hardcoded secrets (heuristic scan)
        secret_hits: list[str] = []
        scan_dirs = ["app"]
        for sd in scan_dirs:
            for f in self._find_py_files(sd):
                try:
                    text = f.read_text(encoding="utf-8", errors="ignore")
                    for name, pattern in _SECRET_PATTERNS:
                        if pattern.search(text):
                            secret_hits.append(
                                f"{name} in {f.relative_to(self.project_root)}"
                            )
                            if len(secret_hits) >= 5:
                                break
                except OSError:
                    pass
                if len(secret_hits) >= 5:
                    break
        self._add_result(
            55,
            cat,
            "No hardcoded secrets in app/ (heuristic scan)",
            len(secret_hits) == 0,
            "No secrets found" if not secret_hits else "; ".join(secret_hits),
            "error" if secret_hits else "info",
        )

        # 56 — Token blacklist
        has_blacklist = self._exists("app/models/token_blacklist.py")
        self._add_result(
            56,
            cat,
            "Token blacklist for JWT revocation",
            has_blacklist,
            "token_blacklist model " + ("found" if has_blacklist else "missing"),
        )

        # 57 — API key support
        has_api_key = self._exists("app/models/api_key.py") or self._any_file_contains(
            "app", r"api_key|ApiKey"
        )
        self._add_result(
            57,
            cat,
            "API key authentication support",
            has_api_key,
            "API key " + ("found" if has_api_key else "not found"),
        )

        # 58 — 2FA support
        has_2fa = self._exists("app/models/two_factor.py") or self._is_dir(
            "app/graphql/modules/two_factor"
        )
        self._add_result(
            58,
            cat,
            "Two-factor authentication (TOTP/HOTP) support",
            has_2fa,
            "2FA " + ("found" if has_2fa else "not found"),
        )

        # 59 — Pre-commit hooks (secret scanning)
        pre_commit_text = self._read(".pre-commit-config.yaml")
        has_precommit = bool(pre_commit_text)
        self._add_result(
            59,
            cat,
            ".pre-commit-config.yaml for secret/lint scanning",
            has_precommit,
            ".pre-commit-config.yaml " + ("found" if has_precommit else "missing"),
        )

        # 60 — GRAPHQL_INTROSPECTION_ENABLED env-backed
        intro_env_backed = "GRAPHQL_INTROSPECTION_ENABLED" in config_text
        self._add_result(
            60,
            cat,
            "GraphQL introspection env-backed (disable in production)",
            intro_env_backed,
            "GRAPHQL_INTROSPECTION_ENABLED "
            + ("in config" if intro_env_backed else "not found"),
        )

        # 61 — Session security / httponly
        has_session_security = bool(
            re.search(r"httponly|secure.*cookie|SESSION", config_text, re.IGNORECASE)
        )
        self._add_result(
            61,
            cat,
            "Session cookies httponly/secure OR session table present",
            has_session_security or self._exists("app/models/session.py"),
            "Session security "
            + (
                "found"
                if (has_session_security or self._exists("app/models/session.py"))
                else "not configured"
            ),
        )

        print("  [ok] Completed\n")

    # ------------------------------------------------------------------
    # 5b. Security — extended (points 111–114, GraphQL checklist)
    # ------------------------------------------------------------------

    def _check_security_extended(self) -> None:
        cat = "Security"
        print(f"Checking {cat} (extended 111–114)...")

        gq_mod = self.project_root / "app" / "graphql" / "modules"
        resolver_auth_heuristic = False
        if gq_mod.is_dir():
            auth_pat = re.compile(
                r"ForbiddenError|require_role|SuperAdmin|is_admin|role\s*==|\.role\b",
                re.IGNORECASE,
            )
            for path in gq_mod.rglob("*.py"):
                if "__pycache__" in path.parts:
                    continue
                if path.name not in ("queries.py", "mutations.py"):
                    continue
                try:
                    txt = path.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    continue
                if auth_pat.search(txt):
                    resolver_auth_heuristic = True
                    break

        self._add_result(
            111,
            cat,
            "Resolver-level authorization hints in GraphQL modules (roles/ForbiddenError)",
            resolver_auth_heuristic,
            "GraphQL resolvers "
            + (
                "reference roles/forbidden checks"
                if resolver_auth_heuristic
                else "no obvious field-level auth pattern"
            ),
            "warning" if not resolver_auth_heuristic else "info",
        )

        err_path = self.project_root / "app" / "graphql" / "errors.py"
        err_text = self._read("app/graphql/errors.py") if err_path.exists() else ""
        has_sanitized = err_path.exists() and bool(
            re.search(r"GraphQLAppError|handle_graphql_error", err_text)
        )
        self._add_result(
            112,
            cat,
            "Sanitized GraphQL errors (GraphQLAppError / handle_graphql_error)",
            has_sanitized,
            "app/graphql/errors.py "
            + (
                "defines GraphQLAppError/handle_graphql_error"
                if has_sanitized
                else "missing or incomplete"
            ),
        )

        audit_svc = self._exists("app/services/graphql_audit_service.py")
        audit_imports = 0
        if gq_mod.is_dir():
            for path in gq_mod.rglob("mutations.py"):
                try:
                    t = path.read_text(encoding="utf-8", errors="ignore")
                    if (
                        "graphql_audit_service" in t
                        or "append_graphql_audit_event" in t
                    ):
                        audit_imports += 1
                except OSError:
                    pass
        audit_ok = audit_svc and audit_imports >= 1
        self._add_result(
            113,
            cat,
            "GraphQL audit service used for sensitive mutations",
            audit_ok,
            f"graphql_audit_service.py: {audit_svc}; mutations files importing audit: {audit_imports}",
            "warning" if not audit_ok else "info",
        )

        http_raise_files: list[str] = []
        if gq_mod.is_dir():
            for path in gq_mod.rglob("*.py"):
                if "__pycache__" in path.parts:
                    continue
                try:
                    t = path.read_text(encoding="utf-8", errors="ignore")
                except OSError:
                    continue
                if re.search(r"raise\s+HTTPException\b", t):
                    http_raise_files.append(str(path.relative_to(self.project_root)))
        self._add_result(
            114,
            cat,
            "No raise HTTPException inside GraphQL module resolvers (use GraphQL errors)",
            len(http_raise_files) == 0,
            (
                "OK"
                if not http_raise_files
                else f"raise HTTPException in: {', '.join(http_raise_files[:5])}"
            ),
            "warning" if http_raise_files else "info",
        )

        print("  [ok] Completed (extended)\n")

    # ------------------------------------------------------------------
    # 6. Performance  (points 62–71)
    # ------------------------------------------------------------------

    def _check_performance(self) -> None:
        cat = "Performance"
        print(f"Checking {cat}...")

        # 62 — async def throughout app/
        # Threshold 40%: many app/ files are __init__.py / constants / type stubs with no functions.
        async_count = self._count_py_files_with("app", r"async def ")
        total_py = len(self._find_py_files("app"))
        async_pct = (async_count / total_py * 100) if total_py else 0
        self._add_result(
            62,
            cat,
            "async/await used in ≥40% of app/ Python files",
            async_pct >= 40,
            f"async def in {async_count}/{total_py} files ({async_pct:.1f}%)",
            "warning" if async_pct < 40 else "info",
        )

        # 63 — tenacity retry on clients
        has_tenacity = self._any_file_contains("app/clients", r"@retry|tenacity")
        self._add_result(
            63,
            cat,
            "tenacity retry decorators on external HTTP clients",
            has_tenacity,
            "tenacity @retry "
            + ("found" if has_tenacity else "not found in app/clients"),
        )

        # 64 — pagination in list queries
        has_pagination = self._any_file_contains(
            "app/graphql", r"limit\s*[:=]|offset\s*[:=]|page_size|paginate"
        )
        self._add_result(
            64,
            cat,
            "Pagination (limit/offset or page_size) in list queries",
            has_pagination,
            "Pagination "
            + ("found" if has_pagination else "not found in GraphQL resolvers"),
        )

        # 65 — timeout on HTTP clients
        has_timeout = self._any_file_contains("app/clients", r"timeout|TIMEOUT")
        self._add_result(
            65,
            cat,
            "Timeout configured on all HTTP clients",
            has_timeout,
            "Timeout " + ("found" if has_timeout else "not found in clients"),
        )

        # 66 — connection pool for DB
        pool_text = self._read("app/db/session.py") + self._read("app/core/config.py")
        has_pool = bool(
            re.search(r"pool_size|pool_pre_ping|NullPool|max_overflow", pool_text)
        )
        self._add_result(
            66,
            cat,
            "Database connection pool settings",
            has_pool,
            "Pool settings " + ("found" if has_pool else "not found"),
        )

        # 67 — lru_cache / singleton for expensive objects
        has_cache = self._any_file_contains(
            "app", r"@lru_cache|lru_cache\s*\(|functools\.cache"
        )
        self._add_result(
            67,
            cat,
            "lru_cache / cached singletons for heavy resources (settings, clients)",
            has_cache,
            "@lru_cache " + ("found" if has_cache else "not found"),
        )

        # 68 — selectinload / joinedload
        has_eager = self._any_file_contains(
            "app", re.compile(r"selectinload|joinedload")
        )
        self._add_result(
            68,
            cat,
            "selectinload/joinedload for eager loading",
            has_eager,
            "Eager loading " + ("found" if has_eager else "not found — potential N+1"),
            "warning" if not has_eager else "info",
        )

        # 69 — background tasks
        has_bg = (
            self._any_file_contains("app", r"BackgroundTasks|background_tasks")
            or "celery" in self._requirements_text()
        )
        self._add_result(
            69,
            cat,
            "Background tasks (FastAPI BackgroundTasks or Celery)",
            has_bg,
            "Background tasks " + ("found" if has_bg else "not found"),
        )

        # 70 — DataLoaders (batched DB reads)
        has_dl = self._exists("app/graphql/dataloaders.py") or self._any_file_contains(
            "app/graphql", r"DataLoader|StrawberryDataLoader"
        )
        self._add_result(
            70,
            cat,
            "DataLoaders for batched DB reads (GraphQL N+1 prevention)",
            has_dl,
            "DataLoaders " + ("found" if has_dl else "not found"),
        )

        # 71 — Middleware performance (RED metrics, SLO)
        has_metrics = self._any_file_contains(
            "app", re.compile(r"RED_METRICS|SLO|request_id|RED_metric", re.IGNORECASE)
        )
        self._add_result(
            71,
            cat,
            "RED metrics / SLO monitoring middleware",
            has_metrics,
            "RED/SLO metrics " + ("found" if has_metrics else "not found"),
        )

        print("  [ok] Completed\n")

    # ------------------------------------------------------------------
    # 6b. Performance — extended (points 115–116)
    # ------------------------------------------------------------------

    def _check_performance_extended(self) -> None:
        cat = "Performance"
        print(f"Checking {cat} (extended 115–116)...")

        config_text = self._read("app/core/config.py")
        has_slow_threshold = "SLOW_QUERY_THRESHOLD" in config_text
        self._add_result(
            115,
            cat,
            "SLOW_QUERY_THRESHOLD configured for slow GraphQL operation logging",
            has_slow_threshold,
            "SLOW_QUERY_THRESHOLD "
            + ("in config" if has_slow_threshold else "not found"),
            "warning" if not has_slow_threshold else "info",
        )

        app_text_sample = self._read("app/graphql/context.py") + self._read(
            "app/core/config.py"
        )
        has_ttl_cache = bool(
            re.search(
                r"ENABLE_USER_CACHE|TTLCache|redis", app_text_sample, re.IGNORECASE
            )
        ) or self._any_file_contains(
            "app",
            re.compile(
                r"ENABLE_USER_CACHE|TTLCache|@cache|redis\.Redis", re.IGNORECASE
            ),
        )
        self._add_result(
            116,
            cat,
            "Optional cross-request cache (TTLCache/Redis/ENABLE_USER_CACHE) for hot paths",
            has_ttl_cache,
            "Caching hooks " + ("found" if has_ttl_cache else "not found"),
            "warning" if not has_ttl_cache else "info",
        )

        print("  [ok] Completed (extended)\n")

    # ------------------------------------------------------------------
    # 7. Testing  (points 72–79)
    # ------------------------------------------------------------------

    def _check_testing(self) -> None:
        cat = "Testing"
        print(f"Checking {cat}...")

        # 72 — tests/ exists with files
        test_files = (
            list((self.project_root / "tests").rglob("test_*.py"))
            if self._is_dir("tests")
            else []
        )
        self._add_result(
            72,
            cat,
            "tests/ directory with test files",
            len(test_files) > 0,
            f"{len(test_files)} test_*.py file(s) found",
        )

        # 73 — pytest configured (pytest.ini or pyproject.toml)
        pytest_cfg = self._exists("pytest.ini") or bool(
            re.search(r"\[tool\.pytest", self._read("pyproject.toml"))
        )
        self._add_result(
            73,
            cat,
            "pytest configured (pytest.ini or [tool.pytest] in pyproject.toml)",
            pytest_cfg,
            "pytest config " + ("found" if pytest_cfg else "missing"),
        )

        # 74 — pytest-asyncio
        self._add_result(
            74,
            cat,
            "pytest-asyncio for async test support",
            self._has_dep("pytest-asyncio"),
            "pytest-asyncio "
            + ("found" if self._has_dep("pytest-asyncio") else "missing"),
        )

        # 75 — pytest-cov for coverage
        self._add_result(
            75,
            cat,
            "pytest-cov for test coverage measurement",
            self._has_dep("pytest-cov"),
            "pytest-cov " + ("found" if self._has_dep("pytest-cov") else "missing"),
        )

        # 76 — tests/conftest.py
        self._add_result(
            76,
            cat,
            "tests/conftest.py for shared fixtures",
            self._exists("tests/conftest.py"),
            "tests/conftest.py "
            + ("found" if self._exists("tests/conftest.py") else "missing"),
        )

        # 77 — mock/patch usage
        has_mock = self._any_file_contains("tests", r"mock|patch|MagicMock|AsyncMock")
        self._add_result(
            77,
            cat,
            "Mock / patch used for external service isolation in tests",
            has_mock,
            "mock/patch " + ("found" if has_mock else "not found in tests/"),
        )

        # 78 — integration tests
        has_integration = self._is_dir("tests/integration") or self._is_dir(
            "tests/graphql"
        )
        self._add_result(
            78,
            cat,
            "Integration/GraphQL tests present (tests/integration/ or tests/graphql/)",
            has_integration,
            "Integration tests " + ("found" if has_integration else "not found"),
        )

        # 79 — validate_env script
        has_validate = self._exists("scripts/validate_env.py")
        self._add_result(
            79,
            cat,
            "scripts/validate_env.py to catch environment issues early",
            has_validate,
            "validate_env.py " + ("found" if has_validate else "missing"),
        )

        print("  [ok] Completed\n")

    # ------------------------------------------------------------------
    # 7b. Testing — extended (points 117–118)
    # ------------------------------------------------------------------

    def _check_testing_extended(self) -> None:
        cat = "Testing"
        print(f"Checking {cat} (extended 117–118)...")

        has_asgi_client = self._any_file_contains(
            "tests",
            re.compile(r"httpx|AsyncClient|TestClient", re.IGNORECASE),
        )
        self._add_result(
            117,
            cat,
            "ASGI/HTTP test client used in tests (httpx AsyncClient or TestClient)",
            has_asgi_client,
            "httpx/TestClient "
            + ("found in tests/" if has_asgi_client else "not found"),
            "warning" if not has_asgi_client else "info",
        )

        graphql_tests = self.project_root / "tests" / "graphql"
        auth_fail_tested = False
        if graphql_tests.is_dir():
            auth_pat = re.compile(
                r"UNAUTHORIZED|FORBIDDEN|unauthenticated|ForbiddenError|401|403",
                re.IGNORECASE,
            )
            for path in graphql_tests.rglob("*.py"):
                try:
                    if auth_pat.search(
                        path.read_text(encoding="utf-8", errors="ignore")
                    ):
                        auth_fail_tested = True
                        break
                except OSError:
                    pass
        self._add_result(
            118,
            cat,
            "GraphQL tests cover auth failure paths (401/403/Forbidden patterns)",
            auth_fail_tested,
            "tests/graphql/ "
            + (
                "has auth-failure assertions"
                if auth_fail_tested
                else "no obvious auth-failure coverage"
            ),
            "warning" if not auth_fail_tested else "info",
        )

        print("  [ok] Completed (extended)\n")

    # ------------------------------------------------------------------
    # 8. Deployment & Ops  (points 80–85)
    # ------------------------------------------------------------------

    def _check_deployment(self) -> None:
        cat = "Deployment & Ops"
        print(f"Checking {cat}...")

        # 80 — Dockerfile
        self._add_result(
            80,
            cat,
            "Dockerfile for reproducible deployment",
            self._exists("Dockerfile"),
            "Dockerfile " + ("found" if self._exists("Dockerfile") else "missing"),
        )

        # 81 — docker-compose.yml (optional; controlled by config)
        require_compose = self.config.get("require_docker_compose", False)
        has_compose = any(self.project_root.glob("docker-compose*.yml"))
        if require_compose:
            self._add_result(
                81,
                cat,
                "docker-compose.yml present (required by config)",
                has_compose,
                "docker-compose.yml " + ("found" if has_compose else "missing"),
            )
        else:
            self._add_result(
                81,
                cat,
                "docker-compose.yml (optional for this repo)",
                has_compose or True,  # advisory
                "docker-compose.yml "
                + ("found" if has_compose else "not present (optional)"),
                "warning" if not has_compose else "info",
            )

        # 82 — structured JSON logging
        logging_text = self._read("app/core/logging_config.py")
        has_structured = bool(
            re.search(r"json|JSON|structlog|structuredlog", logging_text, re.IGNORECASE)
        )
        self._add_result(
            82,
            cat,
            "Structured JSON logging configured (app/core/logging_config.py)",
            has_structured or bool(logging_text),
            "Structured logging "
            + (
                "found"
                if has_structured
                else "logging_config.py present" if logging_text else "not found"
            ),
        )

        # 83 — verify_health.py script
        self._add_result(
            83,
            cat,
            "scripts/verify_health.py for health-check automation",
            self._exists("scripts/verify_health.py"),
            "verify_health.py "
            + ("found" if self._exists("scripts/verify_health.py") else "missing"),
        )

        # 84 — CI/CD workflow (optional; controlled by config)
        require_ci = self.config.get("require_ci_workflow", False)
        has_ci = bool(
            list(self.project_root.glob(".github/workflows/*.yml"))
            + list(self.project_root.glob(".github/workflows/*.yaml"))
        )
        self._add_result(
            84,
            cat,
            ".github/workflows CI/CD pipeline",
            has_ci or (not require_ci),
            ".github/workflows "
            + (
                "found"
                if has_ci
                else "not found (set require_ci_workflow=true to enforce)"
            ),
            "info" if has_ci else ("error" if require_ci else "warning"),
        )

        # 85 — .env.example covers key satellite URLs
        env_example = self._read(".env.example")
        has_satellite_docs = bool(
            re.search(
                r"EMAIL_SERVER|CONNECTRA|S3STORAGE_SERVER|AI_SERVER|LAMBDA_EMAIL|LAMBDA_S3|LAMBDA_AI",
                env_example,
            )
        )
        self._add_result(
            85,
            cat,
            ".env.example documents satellite service URLs",
            has_satellite_docs,
            "Satellite URL docs "
            + ("found" if has_satellite_docs else "not found in .env.example"),
        )

        print("  [ok] Completed\n")

    # ------------------------------------------------------------------
    # 8b. Deployment & Ops — extended (points 119–121)
    # ------------------------------------------------------------------

    def _check_deployment_extended(self) -> None:
        cat = "Deployment & Ops"
        print(f"Checking {cat} (extended 119–121)...")

        has_common = self._is_dir("app/graphql/common")
        self._add_result(
            119,
            cat,
            "app/graphql/common/ for shared GraphQL helpers (pagination, etc.)",
            has_common,
            "app/graphql/common/ " + ("found" if has_common else "missing"),
        )

        ctx_text = self._read("app/graphql/context.py")
        mw_text = self._read("app/core/middleware.py")
        trace_ok = bool(
            re.search(
                r"request_id|trace_id|X-Request-ID|X-Trace-ID",
                ctx_text + mw_text,
                re.IGNORECASE,
            )
        )
        self._add_result(
            120,
            cat,
            "Request or trace ID propagated (context or middleware)",
            trace_ok,
            "request_id/trace_id pattern " + ("found" if trace_ok else "not found"),
            "warning" if not trace_ok else "info",
        )

        sdl_hits: list[Path] = []
        for sub in ("scripts", "docs"):
            base = self.project_root / sub
            if base.is_dir():
                sdl_hits.extend(base.rglob("*.graphql"))
        has_schema_changelog = self._exists("SCHEMA_CHANGELOG.md") or self._exists(
            "docs/SCHEMA_CHANGELOG.md"
        )
        has_export_script = self._any_file_contains(
            "scripts",
            re.compile(
                r"export_schema|schema_export|print_schema|as_sdl", re.IGNORECASE
            ),
        )
        schema_doc_ok = bool(sdl_hits) or has_schema_changelog or has_export_script
        self._add_result(
            121,
            cat,
            "Schema SDL file, export script, or SCHEMA_CHANGELOG for evolution tracking",
            schema_doc_ok,
            (
                f".graphql file(s): {len(sdl_hits)}; changelog: {has_schema_changelog}; export script hint: {has_export_script}"
            ),
            "warning" if not schema_doc_ok else "info",
        )

        print("  [ok] Completed (extended)\n")

    # ------------------------------------------------------------------
    # Import placement audit (report + points 101–102)
    # ------------------------------------------------------------------

    def _run_import_placement_audit(self) -> None:
        """Populate ``import_analysis`` and add checklist points 101–102, 122–123."""
        cat = "Python Code Quality"
        roots_raw = self.config.get("import_scan_roots", ["app", "tests", "scripts"])
        roots = [
            str(r).strip().rstrip("/").replace("\\", "/")
            for r in roots_raw
            if str(r).strip()
        ]
        if not roots:
            roots = ["app", "tests", "scripts"]

        print(f"  Scanning import placement ({', '.join(roots)})...")
        self.import_analysis = scan_tree_imports(self.project_root, roots)

        per_file: dict[str, Any] = self.import_analysis.get("per_file", {})
        app_delayed = 0
        app_nested = 0
        app_top = 0
        total_delayed = 0
        total_nested = 0
        for rel, data in per_file.items():
            r = rel.replace("\\", "/")
            delayed_n = len(data.get("delayed_module_imports", []))
            nested_n = len(data.get("nested_imports", []))
            total_delayed += delayed_n
            total_nested += nested_n
            if not r.startswith("app/"):
                continue
            app_top += len(data.get("top_imports", []))
            app_delayed += delayed_n
            app_nested += nested_n

        # 101 — delayed module-level imports under app/ (tighten via .api-checker-config.json)
        max_delayed_cfg = self.config.get("max_delayed_module_imports_app", 0)
        try:
            max_delayed = int(max_delayed_cfg)
        except (TypeError, ValueError):
            max_delayed = 0
        passed_101 = app_delayed <= max_delayed
        self._add_result(
            101,
            cat,
            "Module-level imports in app/ stay in the header block "
            f"(allowed delayed: {max_delayed}; set max_delayed_module_imports_app in config)",
            passed_101,
            (
                "No delayed module imports in app/"
                if app_delayed == 0
                else f"{app_delayed} delayed module-level import(s) in app/ — see import_analysis.per_file"
            ),
            "warning" if not passed_101 else "info",
        )

        # 102 — nested imports under app/
        max_nested_app_cfg = self.config.get("max_nested_imports_app")
        if max_nested_app_cfg is not None:
            try:
                max_nested_app = int(max_nested_app_cfg)
            except (TypeError, ValueError):
                max_nested_app = 0
            passed_102 = app_nested <= max_nested_app
            msg_102 = (
                "No nested imports in app/"
                if app_nested == 0
                else f"{app_nested} nested import(s) in app/ (allowed {max_nested_app})"
            )
            sev_102 = "warning" if not passed_102 else "info"
        else:
            nested_warn_threshold = int(
                self.config.get("nested_import_warn_threshold", 120)
            )
            passed_102 = app_nested < nested_warn_threshold
            msg_102 = (
                f"{app_nested} nested import statement(s) under app/ "
                f"(threshold {nested_warn_threshold}; see import_analysis)"
            )
            sev_102 = "warning" if not passed_102 else "info"
        self._add_result(
            102,
            cat,
            "Nested imports in app/ stay at module scope when possible "
            "(set max_nested_imports_app in config)",
            passed_102,
            msg_102,
            sev_102,
        )

        # 122 — delayed imports across all scan roots
        max_delayed_total_cfg = self.config.get("max_delayed_module_imports_total")
        if max_delayed_total_cfg is not None:
            try:
                max_delayed_total = int(max_delayed_total_cfg)
            except (TypeError, ValueError):
                max_delayed_total = 0
            passed_122 = total_delayed <= max_delayed_total
            self._add_result(
                122,
                cat,
                "Module-level imports stay in header across import_scan_roots "
                f"(allowed delayed total: {max_delayed_total})",
                passed_122,
                (
                    "No delayed module imports in scan roots"
                    if total_delayed == 0
                    else f"{total_delayed} delayed module-level import(s) — see import_analysis"
                ),
                "warning" if not passed_122 else "info",
            )

        # 123 — nested imports across all scan roots
        max_nested_total_cfg = self.config.get("max_nested_imports_total")
        if max_nested_total_cfg is not None:
            try:
                max_nested_total = int(max_nested_total_cfg)
            except (TypeError, ValueError):
                max_nested_total = 0
            passed_123 = total_nested <= max_nested_total
            self._add_result(
                123,
                cat,
                "Nested imports across import_scan_roots "
                f"(allowed nested total: {max_nested_total})",
                passed_123,
                (
                    "No nested imports in scan roots"
                    if total_nested == 0
                    else f"{total_nested} nested import(s) — see import_analysis"
                ),
                "warning" if not passed_123 else "info",
            )

    # ------------------------------------------------------------------
    # 9. Python Code Quality  (points 86–100)
    # ------------------------------------------------------------------

    def _check_python_quality(self) -> None:
        cat = "Python Code Quality"
        print(f"Checking {cat}...")

        pyproject_text = self._read("pyproject.toml")

        # 86 — Type hints in app/ (files containing functions with return annotations)
        # Threshold 40%: many app/ files are __init__.py / constants / Strawberry types
        # with no explicit return annotations (they rely on Pydantic / dataclass inference).
        typed_files = self._count_py_files_with("app", r"def \w+.*->")
        total_py = len(self._find_py_files("app"))
        typed_pct = (typed_files / total_py * 100) if total_py else 0
        self._add_result(
            86,
            cat,
            "Return-type annotations in ≥40% of app/ files",
            typed_pct >= 40,
            f"Type annotated: {typed_files}/{total_py} files ({typed_pct:.1f}%)",
            "warning" if typed_pct < 40 else "info",
        )

        # 87 — ruff configured
        has_ruff = bool(re.search(r"\[tool\.ruff\]", pyproject_text)) or self._exists(
            "ruff.toml"
        )
        self._add_result(
            87,
            cat,
            "ruff linting configured ([tool.ruff] in pyproject.toml or ruff.toml)",
            has_ruff,
            "ruff config " + ("found" if has_ruff else "missing"),
        )

        # 88 — mypy configured
        has_mypy = (
            bool(re.search(r"\[tool\.mypy\]", pyproject_text))
            or self._exists("mypy.ini")
            or self._exists(".mypy.ini")
        )
        self._add_result(
            88,
            cat,
            "mypy type-checking configured",
            has_mypy,
            "mypy config " + ("found" if has_mypy else "missing"),
        )

        # 89 — black in dev deps
        has_black = "black" in self._requirements_text()
        self._add_result(
            89,
            cat,
            "black formatter in dev dependencies",
            has_black,
            "black " + ("found" if has_black else "not in deps"),
        )

        # 90 — .pre-commit-config.yaml
        self._add_result(
            90,
            cat,
            ".pre-commit-config.yaml for pre-commit hooks",
            self._exists(".pre-commit-config.yaml"),
            ".pre-commit-config.yaml "
            + ("found" if self._exists(".pre-commit-config.yaml") else "missing"),
        )

        # 91 — requirements.txt pins versions (== or >=)
        req_text = self._read("requirements.txt")
        pinned = len(re.findall(r"==\d|>=\d", req_text))
        self._add_result(
            91,
            cat,
            "requirements.txt uses pinned versions (== or >=)",
            pinned >= 5,
            f"{pinned} pinned version(s) found",
        )

        # 92 — [project] section in pyproject.toml
        has_project = bool(re.search(r"\[project\]", pyproject_text))
        self._add_result(
            92,
            cat,
            "[project] section in pyproject.toml",
            has_project,
            "[project] " + ("found" if has_project else "missing in pyproject.toml"),
        )

        # 93 — Python 3.11+ target
        has_311 = bool(
            re.search(
                r"python_requires.*3\.1[1-9]|target-version.*py31[1-9]|py311|py312",
                pyproject_text,
            )
        )
        self._add_result(
            93,
            cat,
            "Python 3.11+ target declared",
            has_311,
            "Python 3.11+ "
            + ("declared" if has_311 else "not found in pyproject.toml"),
        )

        # 94 — from __future__ import annotations
        future_count = self._count_py_files_with(
            "app", r"from __future__ import annotations"
        )
        self._add_result(
            94,
            cat,
            "from __future__ import annotations used (deferred evaluation)",
            future_count >= 3,
            f"__future__ annotations in {future_count} app/ files",
        )

        # 95 — proper __init__.py files
        init_count = len(list(self.project_root.glob("app/**/__init__.py")))
        self._add_result(
            95,
            cat,
            "__init__.py in every app/ package directory",
            init_count >= 5,
            f"{init_count} __init__.py file(s) found under app/",
        )

        # 96 — no print() in app code (use logger)
        # Exempt: logging_config.py (legitimate pre-logger startup fallback),
        #         __init__.py files, and lines with noqa comments or inside except clauses
        _print_exempt = {"logging_config.py", "exceptions.py"}
        print_files: list[str] = []
        for f in self._find_py_files("app"):
            if f.name in _print_exempt:
                continue
            try:
                txt = f.read_text(encoding="utf-8", errors="ignore")
                lines = [
                    ln.strip()
                    for ln in txt.splitlines()
                    if re.match(r"\s*print\s*\(", ln)
                    and not ln.strip().startswith("#")
                    and "noqa" not in ln
                ]
                if lines:
                    print_files.append(str(f.relative_to(self.project_root)))
            except OSError:
                pass
        self._add_result(
            96,
            cat,
            "No bare print() statements in app/ (use logger)",
            len(print_files) == 0,
            (
                "No print() found"
                if not print_files
                else f"print() in: {', '.join(print_files[:3])}"
            ),
            "warning" if print_files else "info",
        )

        # 97 — app/utils/logger.py
        has_logger = self._exists("app/utils/logger.py") or self._any_file_contains(
            "app/utils", r"get_logger|getLogger"
        )
        self._add_result(
            97,
            cat,
            "Centralised logger utility (app/utils/logger.py)",
            has_logger,
            "Logger utility " + ("found" if has_logger else "not found"),
        )

        # 98 — ENVIRONMENT-based config branching
        config_full = self._read("app/core/config.py")
        has_env_branch = bool(
            re.search(
                r"ENVIRONMENT|environment.*==|is_production", config_full, re.IGNORECASE
            )
        )
        self._add_result(
            98,
            cat,
            "ENVIRONMENT-based config branching (dev/staging/production)",
            has_env_branch,
            "Environment branching " + ("found" if has_env_branch else "not in config"),
        )

        # 99 — validate_env.py script
        self._add_result(
            99,
            cat,
            "scripts/validate_env.py for env validation",
            self._exists("scripts/validate_env.py"),
            "validate_env.py "
            + ("found" if self._exists("scripts/validate_env.py") else "missing"),
        )

        # 100 — pydantic-settings for env-backed config
        self._add_result(
            100,
            cat,
            "pydantic-settings for environment-backed configuration",
            "pydantic-settings" in self._requirements_text(),
            "pydantic-settings "
            + (
                "found"
                if "pydantic-settings" in self._requirements_text()
                else "missing"
            ),
        )

        # Import placement audit (JSON: import_analysis) + scored checks 101–102
        self._run_import_placement_audit()

        print("  [ok] Completed\n")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def run_all_checks(self) -> dict[str, Any]:
        """Run all category checks and return a summary dict."""
        print("=" * 70)
        print(
            "FastAPI Best Practices Checker — 121-Point Checklist (+ import_analysis JSON)"
        )
        print("=" * 70)
        print(f"Project root: {self.project_root}")
        print()

        self._check_project_structure()
        self._check_code_organization()
        self._check_models_database()
        self._check_fastapi_graphql()
        self._check_fastapi_graphql_extended()
        self._check_security()
        self._check_security_extended()
        self._check_performance()
        self._check_performance_extended()
        self._check_testing()
        self._check_testing_extended()
        self._check_deployment()
        self._check_deployment_extended()
        self._check_python_quality()

        return self._generate_summary()

    def _generate_summary(self) -> dict[str, Any]:
        """Generate summary report (same structure as django_checker)."""
        categories: dict[str, dict[str, Any]] = {}
        for result in self.results:
            if result.category not in categories:
                categories[result.category] = {
                    "total": 0,
                    "passed": 0,
                    "failed": 0,
                    "results": [],
                }
            categories[result.category]["total"] += 1
            if result.passed:
                categories[result.category]["passed"] += 1
            else:
                categories[result.category]["failed"] += 1
            categories[result.category]["results"].append(asdict(result))

        total_points = len(self.results)
        total_passed = sum(1 for r in self.results if r.passed)
        total_failed = total_points - total_passed
        score = (total_passed / total_points * 100) if total_points > 0 else 0.0

        out: dict[str, Any] = {
            "timestamp": datetime.now().isoformat(),
            "project_root": str(self.project_root),
            "summary": {
                "total_points": total_points,
                "passed": total_passed,
                "failed": total_failed,
                "score": round(score, 2),
            },
            "categories": categories,
            "all_results": [asdict(r) for r in self.results],
        }
        if self.import_analysis:
            out["import_analysis"] = self.import_analysis
        return out

    def save_report(self, output_file: Path) -> None:
        """Save JSON report to *output_file* (same API as django_checker)."""
        report = self._generate_summary()
        output_file.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"\nReport saved to: {output_file}")


# ---------------------------------------------------------------------------
# Standalone entry point (use check_best_practices.py in production)
# ---------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(
        description="FastAPI codebase best-practices checker (121 points + import_analysis).",
    )
    parser.add_argument(
        "--category",
        type=str,
        default=None,
        help='Run checks for a specific category (e.g. "Security")',
    )
    parser.add_argument(
        "--output", type=str, default=None, help="Output path for JSON report"
    )
    parser.add_argument(
        "--format",
        dest="fmt",
        choices=["json", "text", "both"],
        default="both",
        help="Output format (default: both)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=80.0,
        help="Minimum passing score %% (default: 80)",
    )
    parser.add_argument(
        "--no-fail", action="store_true", help="Always exit 0 (advisory / CI mode)"
    )
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    checker = FastAPIBestPracticesChecker(project_root)

    checker.run_all_checks()

    if args.category:
        checker.results = [r for r in checker.results if r.category == args.category]

    report = checker._generate_summary()

    if args.fmt in ("text", "both"):
        _print_summary(report)

    if args.fmt in ("json", "both"):
        out_path = _resolve_output(args.output, project_root)
        checker.save_report(out_path)

    if args.fmt == "json":
        print(json.dumps(report, indent=2))

    score = report["summary"]["score"]
    if not args.no_fail and score < args.threshold:
        sys.exit(1)
    return 0


def _print_summary(report: dict[str, Any]) -> None:
    summary = report["summary"]
    print("\n" + "=" * 70)
    print("FastAPI Best Practices Check Summary")
    print("=" * 70)
    print(f"Total Points : {summary['total_points']}")
    print(f"Passed       : {summary['passed']}")
    print(f"Failed       : {summary['failed']}")
    print(f"Score        : {summary['score']}%")
    print()

    for category, data in report["categories"].items():
        passed = data["passed"]
        total = data["total"]
        pct = (passed / total * 100) if total else 0.0
        indicator = "[ok]" if pct >= 80 else ("[!]" if pct >= 60 else "[x]")
        print(f"  {indicator} {category}: {passed}/{total} ({pct:.1f}%)")

    print()
    score = report["summary"]["score"]
    if score >= 80:
        print("[ok] Codebase meets best practices threshold (80%+)")
    else:
        print("[!] Codebase does not meet best practices threshold (80%+)")


def _resolve_output(output_arg: str | None, project_root: Path) -> Path:
    if output_arg:
        p = Path(output_arg)
        if not p.is_absolute():
            p = project_root / p
        p.parent.mkdir(parents=True, exist_ok=True)
        return p
    reports_dir = project_root / "reports"
    reports_dir.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return reports_dir / f"check_report_{stamp}.json"


if __name__ == "__main__":
    sys.exit(main())
