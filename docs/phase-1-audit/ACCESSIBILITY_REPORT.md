# Phase 1 Accessibility Report

**Scope.** These are automated checks, run with `scripts/audit/phase1-responsive.cjs` at six widths, plus spot checks in the browser. It is not a full WCAG audit, and no screen-reader session was run.

| Check | Before | After | Status |
|---|---|---|---|
| Visible buttons without an accessible name | 1 on every page at mobile widths (the sidebar close button) | 0 | PASS |
| Form fields with only a placeholder as their name | 26 across Dashboard, AI Tutor, Courses, Notes, Documents, Doubt Solver and Flashcards | 0 | PASS (P1-046) |
| Exactly one `h1` per page | AI Tutor had 0; Language Learning had 2 | 1 on all 11 routes | PASS (P1-047) |
| Images without `alt` | 0 | 0 | PASS |
| Toggle state exposed (Courses grid/list) | missing | `aria-pressed` | PASS (P1-023) |
| Error messages reach the user | Several toasts hid the server's reason | The server message is shown (Language Learning, Doubt Solver, Notes) | PASS |
| Closed mobile drawer removed from tab order | No | No | OPEN, P1-O06 (P3) |
| Colour contrast, focus order, keyboard-only use of modals | not measured | — | NOT TESTED |

Re-run the checks with the same script. It prints `unlabeledButtons`, `unlabeledInputs` and `h1` for each route and width.
