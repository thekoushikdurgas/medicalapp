# 🎨 Pharmacy Fantasy — Monorepo Coding Style & Engineering Standards

> **Universal Code Quality, Architectural Conventions & Formatting Standards**  
> *Target:* All Contributors, Subagents & Reviewers

---

## 1. General Principles

1. **Clarity Over Cleverness**: Code must read like plain technical prose. Avoid dense one-liners where multi-line readability aids maintainability.
2. **Type Safety Across Boundaries**: No `Any` in Python without explicit rationale; no `any` in TypeScript. All GraphQL queries must have typed inputs and returns.
3. **Fail Fast with Clear Diagnostics**: Validate payloads at API boundaries (Pydantic / GraphQL input types). Raise typed domain errors, not raw generic exceptions.
4. **Surgical Diffs**: Match existing file formatting. Do not reformat entire files when changing five lines.

---

## 2. Python & Backend Standards

### Formatting & Syntax

- **Language Level**: Python 3.11+.
- **Formatter**: `black` (88 character line limit) + `isort` for import grouping.
- **Typing**: Use standard library generic syntax (`list[str]`, `dict[str, Any]`, `X | None` instead of `typing.Optional`, `typing.Union`).
- **Async First**: All I/O operations (database, Redis, external APIs) must use `async`/`await`. Avoid synchronous blocking calls inside async resolvers.

### SQLAlchemy 2.0 Conventions

- Use `Mapped[...]` and `mapped_column(...)` exclusively:

  ```python
  # Correct (SQLAlchemy 2.0 style)
  class StockBatch(Base):
      __tablename__ = "stock_batches"
      
      id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
      quantity_available: Mapped[int] = mapped_column(Integer, default=0)
  ```

- Use 2.0 `select()` statements with explicit execution:

  ```python
  result = await session.execute(select(Product).where(Product.is_active == True))
  products = result.scalars().all()
  ```

### Strawberry GraphQL Conventions

- Field names: `snake_case` in Python resolvers; Strawberry automatically exposes them as `camelCase` in GraphQL.
- Output Types: Inherit from `@strawberry.type`.
- Input Payloads: Inherit from `@strawberry.input`.
- Keep resolvers lean: Delegate database queries and domain logic to service modules in `app/services/`.

---

## 3. TypeScript & Frontend Standards

### Formatting & Syntax

- **Language Level**: TypeScript 5.0+ on Next.js 14+ (App Router).
- **Strict Mode**: `strict: true` in `tsconfig.json`.
- **Component Style**: Functional components with explicit props interface:

  ```tsx
  interface OrderCardProps {
    orderNumber: string;
    status: OrderStatus;
    netAmount: number;
    onSelect?: (id: string) => void;
  }

  export function OrderCard({ orderNumber, status, netAmount, onSelect }: OrderCardProps) {
    // ...
  }
  ```

### Styling & CSS System

- **CSS Architecture**: Use centralized design tokens defined in `globals.css` via CSS variables (`var(--color-primary-600)`, `var(--radius-lg)`).
- **No Random Hex Codes**: Always reference semantic color tokens to ensure light/dark mode and brand consistency.
- **Modern Web Guidance**:
  - Prefer native `<dialog>` for modal dialogs.
  - Use `:user-invalid` for form validation feedback after interaction.
  - Use `text-wrap: balance` for headings and `field-sizing: content` for dynamic textareas where supported.

---

## 4. GraphQL API Contracts

### Query & Mutation Naming

- Queries: Plural nouns for collections (`orders`, `products`), singular for IDs (`order(id: ...)`).
- Mutations: Verb + Noun format (`placeOrder`, `confirmOrder`, `assignDelivery`, `createProduct`).
- Inputs: Append `Input` suffix (`PlaceOrderInput`, `CreateProductInput`).

---

## 5. Git & Commit Guidelines

- **Commit Message Format**: Follow Conventional Commits:
  - `feat(inventory): add FEFO batch auto-allocation algorithm`
  - `fix(gst): correct SGST rounding precision on multi-item bills`
  - `refactor(frontend): extract shared StatCard and Modal components`
  - `docs(design): update order state machine diagram`
