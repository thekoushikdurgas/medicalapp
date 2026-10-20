#!/usr/bin/env python3
"""Write tests/schema_snapshot.graphql from the live Strawberry schema.

Used by codebase.bat 0 and after intentional GraphQL SDL changes.
"""

from __future__ import annotations

import sys
from pathlib import Path


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))

    from app.graphql.schema import schema

    out = root / "tests" / "schema_snapshot.graphql"
    sdl = schema.as_str()
    out.write_text(sdl, encoding="utf-8")
    print(f"Wrote {out.relative_to(root)} ({len(sdl)} chars)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
