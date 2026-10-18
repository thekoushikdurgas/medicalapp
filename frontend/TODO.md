# 📋 Pharmacy Fantasy — Frontend Engineering Backlog & TODO

> **Component Backlog:** Next.js 14 / TypeScript / React / Apollo Client / UI

---

## 🚀 Priority 0: Component Refactoring & Code Quality

- [ ] **Extract Reusable UI Components to `src/components/`**:
  - [ ] `StatusBadge.tsx`: Color-coded chip for `OrderStatus` and `DeliveryStatus`.
  - [ ] `StatCard.tsx`: Metric card with icon, percentage change, and tooltip.
  - [ ] `Modal.tsx`: Accessible wrapper around native `<dialog>` element.
  - [ ] `DataTable.tsx`: Generic paginated table with sorting, search input, and skeleton loading state.
- [ ] **Setup GraphQL Code Generator**:
  - [ ] Install `@graphql-codegen/cli` and `@graphql-codegen/typescript-react-apollo`.
  - [ ] Automatically generate typed hooks from Strawberry GraphQL schema.

---

## 📦 Priority 1: Screen Completions & Operational Polish

- [ ] **Invoice PDF & Print Preview (`dashboard/invoices/`)**:
  - [ ] Implement printable GST invoice modal with print styles (`@media print`).
  - [ ] Render exact West Bengal tax bill layout with HSN summary breakdown.
- [ ] **Delivery Courier Mobile View (`dashboard/deliveries/`)**:
  - [ ] Mobile-optimized layout for delivery staff on smartphones.
  - [ ] One-tap phone dialer button for shopkeeper contact.
  - [ ] Photo upload or digital signature pad for Proof of Delivery (POD).
- [ ] **Shopkeeper Self-Service Catalog**:
  - [ ] Grid/List view with composition search, therapeutic categories, and pack sizes.
  - [ ] Live cart drawer showing running subtotal, GST estimates, and free goods calculation.

---

## 🧪 Priority 2: Performance, Validation & Polish

- [ ] **Form Validation Hardening**:
  - [ ] Integrate React Hook Form or native validation with `:user-invalid` styling on all batch and user creation forms.
- [ ] **Loading & Error Skeletons**:
  - [ ] Replace generic "Loading..." text with animated pulse skeleton placeholders across all table views.
- [ ] **Dark / Light Theme Toggle**:
  - [ ] Implement theme switcher leveraging CSS variables in `globals.css`.
