# Accessibility Report

## Added

- Skip link ("Skip to content") as the first focusable element; `<main id="main-content">`.
- One global `:focus-visible` outline (2 px brand, offset 2) for links, buttons, inputs, tabs, menu items and anything with `tabindex`.
- `prefers-reduced-motion: reduce` turns off page transitions, shimmer, and transitions app-wide.
- Sidebar: `<nav aria-label>`, group toggles with `aria-expanded`/`aria-controls`, `aria-current="page"` on the active item, tooltips with names in the collapsed rail and `sr-only` labels, Escape closes the mobile drawer, labelled open/close buttons.
- Header: `<nav aria-label="Breadcrumb">`; icon-only buttons carry `aria-label`.
- `role="progressbar"` with values on shared progress bars; `role="status"` on loading states, `role="alert"` on error states and error alerts.
- Footer `<nav aria-label="Footer">`.

## Contrast (computed, WCAG 2.1)

| Pair | Ratio |
| --- | --- |
| Body text `slate-900` on white | 17.7:1 |
| Secondary `slate-600` on white | 7.5:1 |
| Muted `slate-500` on white / canvas | 5.3:1 / 4.9:1 |
| White on primary `blue-600` | 5.8:1 |
| Sidebar text #A3ADC6 on navy | 8.4:1 |
| Sidebar group labels and icons #7F8BB0 on navy | 5.6:1 |

`slate-500` was darkened (#6A7387 → #636C80) and the sidebar group label colour raised (3.99:1 → 5.6:1) during the
review so both pass AA for small text.

## Known gaps

- `slate-400` (#9AA3B5, 2.5:1) is still used by some pages for placeholder text and decorative captions; acceptable for placeholders, not for content. Worth a follow-up sweep.
- Many page-level controls are still `<button>`s without visible labels on icon-only actions inside feature pages (e.g. card overflow menus). Not audited one by one.
- No automated axe run was possible in this pass.
