"""SDL snapshot: intentional schema changes must update tests/schema_snapshot.graphql.

The snapshot file is checked to ensure schema contract integrity;
``schema.as_str()`` output must match the file exactly.
"""

from pathlib import Path

from app.graphql.schema import schema


def test_graphql_schema_matches_snapshot() -> None:
    snapshot_path = Path(__file__).resolve().parent / "schema_snapshot.graphql"
    assert snapshot_path.is_file(), (
        f"Missing snapshot file at {snapshot_path}. Run:\n"
        "  codebase.bat 0\n"
        "  (or: python scripts/regen_schema_snapshot.py)"
    )
    expected = snapshot_path.read_text(encoding="utf-8")
    assert schema.as_str() == expected, (
        "GraphQL SDL changed. If deliberate, regenerate:\n"
        "  codebase.bat 0\n"
        "  (or: python scripts/regen_schema_snapshot.py)"
    )
