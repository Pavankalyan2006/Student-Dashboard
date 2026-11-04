# Accessibility Audit

Automated checks at 390×844 on 41 sidebar routes (`scripts/audit/mobile-check.cjs`):
- `<h1>` count: 1 on 39 pages; **0 on AI Tutor**; **2 on Language Learning**.
- Visible buttons with no text, `aria-label` or `title`: 1 on every page (shell), 2 on community list pages.
- `<img>` without `alt`: none found.
- Sidebar toggle, notification bell and profile menu buttons have `aria-label`s (code review).

Not yet done: keyboard-only navigation, focus order in dialogs, colour contrast, screen-reader pass.
