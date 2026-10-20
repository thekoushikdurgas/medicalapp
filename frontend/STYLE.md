# 🎨 Pharmacy Fantasy — Frontend Styling & UI Code Standards

> **UI Component Conventions, CSS Design Tokens & Accessibility Guidelines**

---

## 1. CSS Design Tokens & Styling Rules

All styling must be guided by the design tokens declared in `src/app/globals.css`.

### Core Rules:
1. **No Raw Magic Numbers**: Use CSS variables for spacing, colors, and border radii:
   ```css
   /* Correct */
   padding: var(--space-4);
   background: var(--color-surface);
   border-radius: var(--radius-lg);

   /* Avoid */
   padding: 17px;
   background: #1e293b;
   border-radius: 9px;
   ```
2. **Native Web Platform APIs (Modern Web Guidance)**:
   - Use native `<dialog>` for modal surfaces with `::backdrop` styling.
   - Use `:user-invalid` for validation feedback that activates only after user interaction.
   - Use `text-wrap: balance` for headings and titles.
   - Use `overflow-wrap: break-word` and `scrollbar-color` for custom tabular scrollbars.

3. **Inline Styles Baseline & Inventory Gate**:
   - **Baseline:** 1506 dynamic/intentional `style={{` lines across `src/`.
   - Max audit threshold: `CSS_INLINE_SRC_MAX=1600`.
   - Continuous auditing via `scripts/css-inventory.mjs` (`npm run css:inventory`).
   - Static layout styles (`display: flex`, `padding`, `margin`, `border`) must be moved to `src/app/globals.css` utility or component classes.

---

## 2. React & TypeScript Component Patterns

### Props Interface Convention
Every component must declare an explicit TypeScript interface:
```tsx
interface StatusBadgeProps {
  status: "DRAFT" | "PLACED" | "CONFIRMED" | "PICKING" | "PACKED" | "DISPATCHED" | "DELIVERED" | "CANCELLED";
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  // ...
}
```

### Component Composition
- Keep components focused and single-purpose.
- Deconstruct complex tables: split into `<TableHeader />`, `<TableRow />`, `<TableEmptyState />`.
- Colocate small helper subcomponents or place shared components in `src/components/`.

---

## 3. Accessibility Standards (WCAG 2.1 AA)

1. **Keyboard Accessibility**: Every interactive button and input must have a clear `:focus-visible` outline.
2. **Form Labels**: Always pair `<label htmlFor="field-id">` with `<input id="field-id">`.
3. **Color Contrast**: Text on background cards must achieve a minimum contrast ratio of 4.5:1.
4. **Semantic HTML**: Use `<header>`, `<main>`, `<nav>`, `<aside>`, `<section>`, and `<table>` rather than nested `<div>` wrappers.
