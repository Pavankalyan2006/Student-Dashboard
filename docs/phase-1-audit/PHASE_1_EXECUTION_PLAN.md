# Phase 1 Execution Plan

Scope: the 12 Learning Workspace pages (Dashboard, Semester Command Center, AI Tutor, AI Agent,
Courses, Notes, Documents, Doubt Solver, AI Flashcards, Spaced Revision, Study Planner,
Language Learning) plus the dependencies needed to verify them (auth, onboarding/profile,
persistence, AI provider, file storage, Knowledge Base).

Branch: `claude/project-thread-g85yyh`, restarted from `main` after PR #2 merged.

## Method
1. **Inventory**: `scripts/phase1/component-inventory.cjs` follows every relative `.tsx` import from each page entry and records buttons, inputs, handlers, state, effects and API calls per file (`COMPONENT_INVENTORY.md`).
2. **Click crawl**: `scripts/phase1/click-crawl.cjs` opens each route in Chromium as a fresh synthetic student, then clicks every visible, non-destructive button/tab/link one at a time (page reloaded between clicks). It records navigation, API calls and failures, DOM change, console and page errors. A click with none of those is flagged `NO-EFFECT` and inspected by hand.
3. **Code review per page**: event handlers, API client, route, service and store, looking for fake success, hardcoded data, missing ownership checks and swallowed errors.
4. **API tests**: two synthetic students (A, B) against a local server (`PORT=3100`). Every write is read back by A and repeated by B to check isolation. Persistence is checked by restarting the server with a temporary snapshot file (`DATA_SNAPSHOT_PATH`), never the real one.
5. **Fix, regression test, re-verify**: smallest safe change; a regression test in `src/tests/phase1_learning_workspace.test.ts`; full `vitest`, `tsc`, `build`.
6. **Responsive and accessibility**: the 6-width overflow sweep from batch 2, plus heading/label/button-name checks.

## Batches
| Batch | Pages | Status |
|---|---|---|
| 1 | Discovery, routes, inventory, baseline | done |
| 2 | Dashboard, Semester Command Center | done |
| 3 | AI Tutor, AI Agent | pending |
| 4 | Courses, Notes | pending |
| 5 | Documents, Doubt Solver | pending |
| 6 | AI Flashcards, Spaced Revision | pending |
| 7 | Study Planner, Language Learning | pending |
| 8 | Shared components, integrations, security, responsive, regression | pending |

## Environment limits
- No `GEMINI_API_KEY`: real model output is BLOCKED; only the "AI unavailable" path can be verified.
- Synthetic students only; demo accounts (`std_demo_1`, `std_01j8k9x2p4`) are read, never modified.
- Nothing is deployed.
