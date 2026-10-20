#!/usr/bin/env python3
"""
Check FastAPI codebase against 121-point best-practices checklist (+ import_analysis).

Mirrors the interface of contact360.io/2's Django management command:
    python manage.py check_best_practices [--category X] [--output Y] [--format Z]

Usage:
    python scripts/check_best_practices.py
    python scripts/check_best_practices.py --category "Security"
    python scripts/check_best_practices.py --output reports/check_report.json
    python scripts/check_best_practices.py --format json
    python scripts/check_best_practices.py --format both --threshold 80
    python scripts/check_best_practices.py --no-fail
    python scripts/check_best_practices.py --import-top 0   # list every file with delayed/nested imports

Exit codes:
    0  — score >= threshold (default 80%) or --no-fail
    1  — score < threshold (fail CI)

Config overrides: .api-checker-config.json at project root
    {
      "ignore_points": [81],
      "skip_categories": [],
      "require_docker_compose": false,
      "require_ci_workflow": false,
      "import_scan_roots": ["app", "tests", "scripts"],
      "max_delayed_module_imports_app": 0,
      "max_delayed_module_imports_total": 0,
      "max_nested_imports_app": 0,
      "max_nested_imports_total": 0,
      "nested_import_warn_threshold": 120
    }
"""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Resolve paths: this script lives in scripts/; project root is one level up.
# ---------------------------------------------------------------------------
_SCRIPTS_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _SCRIPTS_DIR.parent

_api_checker_path = _SCRIPTS_DIR / "api_checker.py"
try:
    _spec = importlib.util.spec_from_file_location(
        "api_checker", str(_api_checker_path)
    )
    if _spec is None or _spec.loader is None:
        raise ImportError(f"invalid import spec for {_api_checker_path}")
    _api_checker_mod = importlib.util.module_from_spec(_spec)
    sys.modules["api_checker"] = _api_checker_mod
    _spec.loader.exec_module(_api_checker_mod)
except (ImportError, OSError) as exc:
    print(
        f"ERROR: Could not load api_checker — make sure "
        f"scripts/api_checker.py exists.\n  {exc}",
        file=sys.stderr,
    )
    sys.exit(2)

FastAPIBestPracticesChecker = _api_checker_mod.FastAPIBestPracticesChecker
_print_summary = _api_checker_mod._print_summary
_resolve_output = _api_checker_mod._resolve_output

# ---------------------------------------------------------------------------
# ANSI colour helpers (same feel as Django management command output)
# ---------------------------------------------------------------------------
_RESET = "\033[0m"
_GREEN = "\033[92m"
_YELLOW = "\033[93m"
_RED = "\033[91m"
_BLUE = "\033[94m"
_CYAN = "\033[96m"


def _c(color: str, text: str) -> str:
    """Wrap text in ANSI color if stdout is a tty."""
    if sys.stdout.isatty():
        return f"{color}{text}{_RESET}"
    return text


def _print_import_placement_text(
    report: dict[str, Any],
    *,
    import_top: int = 8,
) -> None:
    """Summarise AST import placement; full detail lives under import_analysis in JSON.

    import_top:
        Max files to print per category (delayed / nested), sorted by count descending.
        Use 0 to print every file that has at least one such import (not truncated).
    """
    ia = report.get("import_analysis")
    if not ia:
        return
    totals = ia.get("totals") or {}
    per_file = ia.get("per_file") or {}
    parse_errors = ia.get("parse_errors") or []

    print()
    print("=" * 70)
    print(_c(_CYAN, "Import placement (all import / from statements)"))
    print("=" * 70)
    print(
        "  Every file lists: top_imports (header + chained TYPE_CHECKING import blocks),"
    )
    print(
        "  delayed_module_imports (module scope after header), nested_imports (def/class)."
    )
    print()
    print(
        f"  Files scanned : {totals.get('files_scanned', 0)}  roots={ia.get('scan_roots', [])}"
    )
    print(
        f"  Top-of-file   : {totals.get('top_import_statements', 0)}  "
        f"(header import/from statements)"
    )
    print(
        f"  Mid-file      : {totals.get('delayed_module_import_statements', 0)} delayed at module scope "
        f"+ {totals.get('nested_import_statements', 0)} nested in def/class"
    )
    if parse_errors:
        print(
            _c(
                _YELLOW,
                f"  Parse errors  : {len(parse_errors)} file(s) skipped (syntax)",
            )
        )
    if import_top == 0:
        print(
            _c(
                _BLUE,
                "  (--import-top 0: listing every file with delayed/nested imports)",
            )
        )
    else:
        print(
            f"  (showing up to {import_top} files per category; use --import-top 0 for full list)"
        )

    def _rank_by(subkey: str, label: str, limit: int) -> None:
        ranked = sorted(
            per_file.items(),
            key=lambda item: len(item[1].get(subkey, [])),
            reverse=True,
        )
        hot = [(r, d) for r, d in ranked if d.get(subkey)]
        if not hot:
            return
        shown = hot if limit == 0 else hot[:limit]
        total_with_issues = len(hot)
        omitted = (
            0 if limit == 0 or total_with_issues <= limit else total_with_issues - limit
        )
        print()
        if limit == 0:
            heading = f"  All {total_with_issues} file(s) by {label}:"
        else:
            heading = f"  Top {min(limit, total_with_issues)} of {total_with_issues} by {label}:"
        print(heading)
        for rel, data in shown:
            n = len(data.get(subkey, []))
            print(f"    {n:4d}  {rel}")
        if omitted > 0:
            print(
                f"    ... and {omitted} more file(s) (use --import-top 0 to list all)"
            )

    _rank_by("delayed_module_imports", "delayed module-level imports", import_top)
    _rank_by("nested_imports", "nested imports", import_top)


def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        prog="check_best_practices",
        description="FastAPI codebase best-practices checker — 121 points + import_analysis JSON.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--category",
        type=str,
        default=None,
        metavar="CATEGORY",
        help='Run checks for a specific category only (e.g. "Security", "Testing")',
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        metavar="PATH",
        help="Output file path for JSON report (default: reports/check_report_<timestamp>.json)",
    )
    parser.add_argument(
        "--format",
        dest="fmt",
        choices=["json", "text", "both"],
        default="both",
        metavar="FORMAT",
        help="Output format: json | text | both  (default: both)",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=80.0,
        metavar="N",
        help="Minimum passing score %% — exit 1 if below (default: 80)",
    )
    parser.add_argument(
        "--no-fail",
        action="store_true",
        help="Always exit 0 regardless of score (CI advisory mode, like || true in /2)",
    )
    parser.add_argument(
        "--import-top",
        type=int,
        default=8,
        metavar="N",
        help=(
            "How many files to list per import category (delayed / nested), by count. "
            "Use 0 for the complete sorted list of every file with any such imports. Default: 8."
        ),
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(argv)

    # Initialise checker
    checker = FastAPIBestPracticesChecker(_PROJECT_ROOT)
    effective_argv = sys.argv[1:] if argv is None else argv
    if "threshold" in checker.config and "--threshold" not in effective_argv:
        args.threshold = float(checker.config["threshold"])
    if checker.config.get("no_fail") and "--no-fail" not in effective_argv:
        args.no_fail = True

    # Run all checks
    if args.category:
        print(_c(_YELLOW, f"Running checks for category: {args.category}"))
    checker.run_all_checks()

    # Filter by category if requested
    if args.category:
        checker.results = [
            r for r in checker.results if r.category.lower() == args.category.lower()
        ]

    # Generate summary
    report = checker._generate_summary()

    # ----------------------------------------------------------------
    # Text output (mirrors Django command)
    # ----------------------------------------------------------------
    if args.fmt in ("text", "both"):
        summary = report["summary"]

        print()
        print("=" * 70)
        print(_c(_CYAN, "FastAPI Best Practices Check Summary"))
        print("=" * 70)
        if args.category:
            print(f"Category filter : {args.category}")
        print(f"Total Points    : {summary['total_points']}")
        print(_c(_GREEN, f"Passed          : {summary['passed']}"))
        print(
            _c(_RED, f"Failed          : {summary['failed']}")
            if summary["failed"]
            else _c(_GREEN, f"Failed          : {summary['failed']}")
        )
        print(f"Score           : {summary['score']}%")
        print()

        for category, data in report["categories"].items():
            passed = data["passed"]
            total = data["total"]
            pct = (passed / total * 100) if total else 0.0

            if pct >= 80:
                color, marker = _GREEN, "[ok]"
            elif pct >= 60:
                color, marker = _YELLOW, "[!]"
            else:
                color, marker = _RED, "[x]"

            print(
                _c(
                    color,
                    f"  {marker} {category}: {passed}/{total} passed ({pct:.1f}%)",
                )
            )

        import_top = args.import_top
        if import_top < 0:
            import_top = 8
        _print_import_placement_text(report, import_top=import_top)

        print()

        score = summary["score"]
        if score >= args.threshold:
            print(
                _c(
                    _GREEN,
                    f"[ok] Codebase meets best practices threshold ({args.threshold}%+)",
                )
            )
        else:
            print(
                _c(
                    _YELLOW,
                    f"[!] Codebase does not meet best practices threshold ({args.threshold}%+)",
                )
            )

    # ----------------------------------------------------------------
    # JSON output
    # ----------------------------------------------------------------
    if args.fmt in ("json", "both"):
        out_path = _resolve_output(args.output, _PROJECT_ROOT)
        checker.save_report(out_path)
        print(_c(_GREEN, f"\nReport saved to: {out_path}"))

    if args.fmt == "json" and args.output is None:
        # If caller only wants JSON on stdout (piping), emit it.
        # When format=both we already wrote the file above; don't double-print.
        pass  # file already written; stdout is the text summary already printed

    # ----------------------------------------------------------------
    # Failed checks detail (for text/both modes)
    # ----------------------------------------------------------------
    if args.fmt in ("text", "both"):
        failed = [r for r in checker.results if not r.passed]
        if failed:
            print()
            print(_c(_RED, "Failed checks:"))
            for r in failed:
                sev_color = _RED if r.severity == "error" else _YELLOW
                print(
                    _c(
                        sev_color,
                        f"  [{r.point_number:>3}] [{r.category}] {r.description}",
                    )
                )
                print(f"        {r.message}")

    # ----------------------------------------------------------------
    # Exit code
    # ----------------------------------------------------------------
    score = report["summary"]["score"]
    if args.no_fail:
        return 0
    if score < args.threshold:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
