---
trigger: always_on
description: Modern web platform best practices and APIs from Google Chrome and Microsoft Edge.
---

## modern-web-guidance

When implementing frontend features (HTML, CSS, client-side JavaScript, UI components, forms, animations, performance, or accessibility):
- Use the `modern-web-guidance` skill to check for modern native web platform APIs before defaulting to legacy workarounds, heavyweight libraries, or custom JS for capabilities natively supported by modern browsers (e.g. Popover API, `<dialog>`, CSS Anchor Positioning, View Transitions, Container Queries, `:has()`, `:user-valid`/`:user-invalid`, `field-sizing: content`, `scheduler.yield()`, native form validation).
- Search guides: `npx.cmd -y modern-web-guidance@latest search "<query>"` (or inspect local guides in the skill folder).
- Retrieve guide: `npx.cmd -y modern-web-guidance@latest retrieve "<id>"`.
- Ensure Baseline compatibility and include standard fallbacks where appropriate.
