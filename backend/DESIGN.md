# 🏗️ Pharmacy Fantasy — Backend System Design

> **Micro-Architecture & Core Subsystem Specification**  
> _Target:_ Backend Core Engineers & Architects

---

## 1. Architectural Layers & Separation of Concerns

The backend follows a layered Clean Architecture pattern:

```
┌────────────────────────────────────────────────────────┐
│                   INTERFACE LAYER                      │
│      FastAPI App Router · Strawberry GraphQL Resolvers │
│      (Validates inputs, maps DTOs, handles context)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    SERVICE LAYER                       │
│    app/services/ (OrderService, InventoryService, ...) │
│    (Pure domain rules, state machines, transactions)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                  DATA ACCESS LAYER                     │
│      SQLAlchemy 2.0 ORM Models · Async Session Pool    │
│      (Persistence, relationship loading, migrations)   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Service Layer Blueprint

Resolvers currently contain direct database operations. The target architecture delegates this to dedicated service classes:

### 2.1 `OrderService` (`app/services/order_service.py`)

- `place_order(shopkeeper_id, items, remarks)`:
  1. Validates shopkeeper credit limit against outstanding balance.
  2. Calculates GST, discounts, and line totals via `app.utils.gst`.
  3. Inserts `Order` in `PLACED` status and line items.
- `confirm_order(order_id, confirmed_by)`:
  1. Executes FEFO batch reservation for all line items.
  2. Generates sequential GST `Invoice`.
  3. Transitions order status to `CONFIRMED`.
- `cancel_order(order_id, user_id, reason)`:
  1. Validates status allows cancellation (`DRAFT`, `PLACED`, `CONFIRMED`).
  2. Rolls back any allocated batch quantities if already reserved.
  3. Sets status to `CANCELLED`.

### 2.2 `InventoryService` (`app/services/inventory_service.py`)

- `allocate_batch_fefo(product_id, required_quantity)`:
  - Queries active batches ordered by `expiry_date ASC`.
  - Filters where `quantity_available > 0`.
  - Splits allocations across multiple batches if necessary.
- `receive_purchase_entry(supplier_data, items, entered_by)`:
  - Records distributor invoice.
  - Generates new `StockBatch` records.

---

## 3. GST Calculation Engine (`app/utils/gst.py`)

All calculations follow statutory Indian tax math:

```python
def calculate_line_gst(
    quantity: int,
    rate: float,
    discount1_pct: float = 0.0,
    discount2_pct: float = 0.0,
    sgst_pct: float = 2.5,
    cgst_pct: float = 2.5,
) -> dict:
    base_amount = quantity * rate
    total_disc_pct = discount1_pct + discount2_pct
    discount_amount = round(base_amount * (total_disc_pct / 100.0), 2)
    taxable_value = round(base_amount - discount_amount, 2)

    sgst_amount = round(taxable_value * (sgst_pct / 100.0), 2)
    cgst_amount = round(taxable_value * (cgst_pct / 100.0), 2)
    line_total = round(taxable_value + sgst_amount + cgst_amount, 2)

    return {
        "base_amount": base_amount,
        "discount_amount": discount_amount,
        "taxable_value": taxable_value,
        "sgst_amount": sgst_amount,
        "cgst_amount": cgst_amount,
        "line_total": line_total,
    }
```

---

## 4. Authentication & Security Architecture

1. **Password Security**:
   - `passlib.context.CryptContext(schemes=["bcrypt"], deprecated="auto")`.
   - Passwords never stored in plaintext.
2. **JWT Payload Design**:
   ```json
   {
     "sub": "user-uuid-v4",
     "role": "SUPER_ADMIN",
     "email": "superadmin@pharmacyfantasy.com",
     "exp": 1740000000
   }
   ```
3. **Strawberry Context Injection**:
   - HTTP Bearer token parsed in `GraphQLRouter.get_context`.
   - Authenticated user injected into `info.context.current_user`.
