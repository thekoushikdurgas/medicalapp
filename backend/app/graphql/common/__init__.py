"""
Common GraphQL shared types and pagination helpers.
"""

from typing import TypeVar
import strawberry

T = TypeVar("T")


@strawberry.type
class PageInfo:
    """Standard Relay-compatible PageInfo."""

    has_next_page: bool
    has_previous_page: bool
    total_count: int
