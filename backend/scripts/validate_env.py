#!/usr/bin/env python3
"""Validate environment variables for Pharmacy Fantasy Backend (preflight / CI).

Loads .env from project root and verifies configuration parameters against app.core.config.Settings.

Exit codes:
  0 — no blocking errors (warnings may be present)
  1 — blocking validation errors

Usage:
  python scripts/validate_env.py
  python scripts/validate_env.py --verbose
  python scripts/validate_env.py --env-file .env.dev
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv as _load_dotenv_impl


def _project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def _load_env_file_plain(path: Path) -> None:
    """Parse simple KEY=VALUE lines without python-dotenv (fallback)."""
    try:
        text = path.read_text(encoding="utf-8")
    except OSError:
        return
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.lower().startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            continue
        key, _, rest = line.partition("=")
        key = key.strip()
        if not key:
            continue
        val = rest.strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in ('"', "'"):
            val = val[1:-1]
        os.environ[key] = val


def _load_dotenv(env_path: Path) -> None:
    """Load .env via python-dotenv if installed, else fallback."""
    if not env_path.is_file():
        return
    if _load_dotenv_impl is not None:
        _load_dotenv_impl(env_path, override=True)
    else:
        _load_env_file_plain(env_path)


def _is_set(name: str) -> bool:
    v = os.environ.get(name)
    if v is None:
        return False
    s = str(v).strip()
    if not s:
        return False
    lowered = s.lower()
    if lowered.startswith("replace-with") or lowered == "change-me-in-production":
        return False
    return True


def _mask(name: str, value: str) -> str:
    sensitive = ("SECRET", "KEY", "PASS", "TOKEN", "DATABASE_URL")
    if any(x in name.upper() for x in sensitive):
        if len(value) <= 8:
            return "***"
        return value[:4] + "…" + f"({len(value)} chars)"
    if len(value) > 64:
        return value[:60] + "…"
    return value


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate Pharmacy Fantasy backend environment variables."
    )
    parser.add_argument(
        "--env-file",
        type=Path,
        default=None,
        help="Path to .env (default: <project_root>/.env)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Print every checked variable (values partially masked)",
    )
    args = parser.parse_args()

    root = _project_root()
    env_path = args.env_file if args.env_file is not None else root / ".env"
    _load_dotenv(env_path.resolve())

    env_found = env_path.is_file()
    app_env = os.environ.get("APP_ENV", "development").strip().lower()
    is_production = app_env == "production"

    errors: list[str] = []
    warnings: list[str] = []
    info: list[str] = []

    if not env_found:
        warnings.append(
            f"No .env file found at {env_path}. Using environment variables or default settings."
        )

    # 1. Secret Key validation
    secret_key = os.environ.get("SECRET_KEY", "change-me-in-production")
    if is_production:
        if not _is_set("SECRET_KEY"):
            errors.append(
                "SECRET_KEY must be securely set in production (not default placeholder)."
            )
        elif len(secret_key) < 32:
            warnings.append(
                "SECRET_KEY is shorter than 32 characters; recommend 64+ hex characters for production."
            )
    else:
        if secret_key == "change-me-in-production":
            info.append(
                "SECRET_KEY is using development default ('change-me-in-production')."
            )

    # 2. Database URL validation
    db_url = os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/pharmacyfantasy",
    )
    if not db_url.startswith(
        ("postgresql+asyncpg://", "sqlite+aiosqlite://", "sqlite://")
    ):
        warnings.append(
            f"DATABASE_URL does not use recognized async dialect (postgresql+asyncpg / sqlite+aiosqlite): {db_url[:20]}…"
        )

    # 3. Redis URL validation
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    if not redis_url.startswith(("redis://", "rediss://")):
        warnings.append(
            f"REDIS_URL does not start with redis:// or rediss:// ({redis_url[:15]}…)"
        )

    # 4. GST validation
    try:
        sgst = float(os.environ.get("DEFAULT_SGST_RATE", "2.5"))
        if sgst < 0 or sgst > 50:
            warnings.append(
                f"DEFAULT_SGST_RATE ({sgst}) is outside expected range [0, 50]."
            )
    except ValueError:
        errors.append("DEFAULT_SGST_RATE must be a numeric float (e.g. 2.5).")

    try:
        cgst = float(os.environ.get("DEFAULT_CGST_RATE", "2.5"))
        if cgst < 0 or cgst > 50:
            warnings.append(
                f"DEFAULT_CGST_RATE ({cgst}) is outside expected range [0, 50]."
            )
    except ValueError:
        errors.append("DEFAULT_CGST_RATE must be a numeric float (e.g. 2.5).")

    gstin = os.environ.get("COMPANY_GSTIN", "").strip()
    if is_production and not gstin:
        warnings.append(
            "COMPANY_GSTIN is empty in production; GST invoicing requires valid GSTIN."
        )

    # 5. CORS Origins
    cors = os.environ.get("CORS_ORIGINS", "")
    if is_production and ("*" in cors or not cors):
        warnings.append(
            "CORS_ORIGINS should be explicitly restricted to production frontend domains."
        )

    # Print Report
    print(f"Environment Preflight Check: APP_ENV={app_env}")
    if args.verbose:
        print("-" * 50)
        checked_keys = [
            "APP_NAME",
            "APP_ENV",
            "DEBUG",
            "SECRET_KEY",
            "DATABASE_URL",
            "REDIS_URL",
            "DEFAULT_SGST_RATE",
            "DEFAULT_CGST_RATE",
            "COMPANY_GSTIN",
            "CORS_ORIGINS",
        ]
        for k in checked_keys:
            val = os.environ.get(k, "<not set>")
            print(f"  {k:22s} = {_mask(k, val)}")
        print("-" * 50)

    for item in info:
        print(f"  [INFO] {item}")
    for item in warnings:
        print(f"  [WARN] {item}")
    for item in errors:
        print(f"  [ERROR] {item}")

    if errors:
        print(
            f"\nFailed: {len(errors)} blocking error(s) found in environment configuration."
        )
        return 1

    print(f"\nOK: Environment validation passed ({len(warnings)} warning(s)).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
