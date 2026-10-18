# 🎨 Pharmacy Fantasy — Frontend Architecture & UI Design

> **Information Architecture, Design Tokens & User Experience Blueprint**  
> *Target:* Frontend Engineers, UI/UX Designers & Subagents

---

## 1. Information Architecture & Navigation

The platform organizes wholesale pharmaceutical management into cohesive operational domains:

```
Portal Login (/)
   │
   ├── Super Admin & Admin ──> /dashboard (Executive KPIs & System Control)
   │                            ├── /dashboard/orders (Approval & fulfillment)
   │                            ├── /dashboard/inventory (Batch & FEFO management)
   │                            ├── /dashboard/invoices (GST tax bills)
   │                            ├── /dashboard/deliveries (Dispatch & couriers)
   │                            ├── /dashboard/products (Master SKU catalog)
   │                            ├── /dashboard/shopkeepers (Accounts & balances)
   │                            ├── /dashboard/reports (Sales & tax reconciliation)
   │                            └── /dashboard/users (RBAC user accounts)
   │
   ├── Warehouse Staff ───────> /dashboard/inventory + /dashboard/orders (Picking & Packing)
   │
   ├── Delivery Courier ──────> /dashboard/deliveries (Mobile-friendly assigned routes)
   │
   └── Retail Shopkeeper ─────> Catalog & Order Placement (Self-service replenishment)
```

---

## 2. Role-Tailored UX Matrix

| Persona | Primary Goal | Critical Screen | Key Actions |
| :--- | :--- | :--- | :--- |
| **Wholesale Admin** | High-level sales monitoring & order validation | `dashboard/page.tsx` & `orders/` | Review orders, approve credit, assign couriers, inspect GST summaries. |
| **Warehouse Manager** | Stock integrity & dispatch velocity | `inventory/` & `orders/` | Receive batches, monitor 90-day expiries, print picking slips, mark packed. |
| **Delivery Courier** | Rapid delivery execution & proof capture | `deliveries/` | View stop sequence, update status (`IN_TRANSIT`, `DELIVERED`), collect cash. |
| **Retail Shopkeeper** | Fast bulk ordering & invoice transparency | `products/` & `orders/` | Search medicines by composition, check schemes (Free goods), track delivery. |

---

## 3. Design System & CSS Token Architecture

The UI uses a centralized token system rooted in `globals.css`:

### Color Palette (Tailored for Pharmaceutical Trust)
- **Primary (Teal/Emerald)**: `--color-primary-600: #0d9488;` — Trust, clinical hygiene, primary CTAs.
- **Surface & Backgrounds**:
  - Dark Mode: `--color-bg: #0f172a;`, `--color-surface: #1e293b;`
  - High-Contrast Borders: `--color-border: #334155;`
- **Semantic Feedback**:
  - Success: `--color-success: #10b981;` (Delivered, Paid)
  - Warning: `--color-warning: #f59e0b;` (Pending, Expiring Soon)
  - Error: `--color-error: #ef4444;` (Cancelled, Overdue, Expired)

### Typography & Spacing
- **Font Stack**: System UI / Modern Sans (`Inter, system-ui, -apple-system, sans-serif`).
- **Elevation**: Multi-tier box shadows with subtle border outlines for depth.
- **Border Radius**: 8px (`var(--radius-md)`) to 16px (`var(--radius-xl)`) for modern card feel.

---

## 4. Apollo Client Caching Strategy

1. **Normalized Cache (`InMemoryCache`)**:
   - Normalized by `__typename` and `id`.
   - `Order` cache updates automatically upon mutation responses (`updateOrderStatus`).
2. **Polling for Live Operations**:
   - `DASHBOARD_STATS_QUERY` polls every 15,000ms on active dashboard views to ensure live sales counters.
3. **Optimistic UI**:
   - Delivery status changes and order confirmations update local Apollo cache immediately, reverting on server error.
