# 🎨 Pharmacy Fantasy — Backend Python & GraphQL Style Guide

> **Coding Conventions, Type Safety & Architectural Patterns for Backend**

---

## 1. Python Standards & Type Annotations

- **Strict Type Annotations**: Every function and resolver must annotate parameter types and return types:
  ```python
  # Correct
  async def get_order_by_id(order_id: uuid.UUID) -> Order | None:
      ...
  ```
- **Union Types**: Use `A | B` syntax, never `Union[A, B]` or `Optional[A]`.
- **Built-in Generics**: Use `list[str]`, `dict[str, Any]`, `tuple[int, ...]`, never `typing.List` or `typing.Dict`.
- **Imports Grouping**:
  1. Standard library (`import os`, `import uuid`, `from datetime import datetime`)
  2. Third-party packages (`import strawberry`, `from sqlalchemy import select`)
  3. Local application imports (`from app.db.models import Order`, `from app.core.config import settings`)

---

## 2. SQLAlchemy 2.0 Standards

- **Model Declarations**:
  - Always use `Mapped[T] = mapped_column(...)`.
  - Use `Uuid(as_uuid=True)` for UUID primary keys.
  - Foreign keys must explicitly specify column name (`ForeignKey("orders.id")`).
  - Relationships must explicitly state `back_populates` and `lazy` or use query-level preloading (`selectinload`).
- **Querying**:
  ```python
  # Preferred 2.0 Syntax
  stmt = (
      select(Order)
      .options(selectinload(Order.items).selectinload(OrderItem.product))
      .where(Order.status == OrderStatus.PLACED)
      .order_by(Order.placed_at.desc())
  )
  result = await session.execute(stmt)
  orders = result.scalars().all()
  ```

---

## 3. Strawberry GraphQL Standards

- **Resolver Names**: Use `snake_case` in Python; client accesses them via `camelCase`.
- **Query Functions**: Keep query functions side-effect free (read-only).
- **Mutations**: All mutations that modify multiple records must run inside an atomic database transaction.
- **Nullability**:
  - Nullable GraphQL fields: `field: str | None = None`
  - Required fields: `field: str` (no default value)

---

## 4. Error Handling & Exceptions

- Define domain exceptions in `app/core/exceptions.py`:
  - `EntityNotFoundError`
  - `InsufficientStockError`
  - `CreditLimitExceededError`
  - `InvalidOrderStateTransitionError`
- Never return uncaught `500 Internal Server Error` to GraphQL clients. Return clean error messages that the frontend can display as user notifications.
