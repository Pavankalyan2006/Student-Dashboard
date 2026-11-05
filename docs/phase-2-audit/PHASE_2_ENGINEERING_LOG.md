# Phase 2 Engineering Log

Branch `claude/project-thread-7zxxwt`, started 2026-11-05 from `main` at 7124ecb (PR #3 merged).
Baseline: `npx tsc --noEmit` 0 errors, `npx vitest run` 818/818.

Conventions carried from Phase 1: PASS / PARTIAL / BLOCKED / NOT IMPLEMENTED; bug ids `P2-NNN`;
no AI key, so AI paths return 503 AI_UNAVAILABLE and are stub-tested; persistence default is the JSON snapshot.

## Resume here
See the last entry. Probe scripts live in `scripts/audit/phase2-*.cjs` and need a running server (`BASE=http://localhost:PORT`).

## Entries
- 2026-11-05 12:00 Discovery. Sandbox route `/sandbox` is an alias of Coding Lab; there is no separate Machine Learning page (only `/ml-lab`). Viva lives inside Lab Assistant (`/viva` alias).
- 2026-11-05 12:45 Batch 1 done (Coding, DSA, SQL). Fixed P2-001..P2-012 (see bug tracker once written):
  sandbox isolation (`server/execution/isolation.ts`), honest language availability, DSA hidden tests stripped,
  unauthenticated `/dsa/problems/:id/run` and `/dsa/tutor/chat`, SQL Lab rewritten on SQLite (`sqlWorker.cjs`,
  `sqlEngine.ts`), saved queries + CSV export, Coding AI 503 instead of templates, Monaco CDN fallback editor.
  Evidence: `scripts/audit/phase2-code-sandbox.cjs` (27 cases), `phase2-batch1.cjs create|verify` (20/20 PASS across restart),
  `src/tests/phase2_labs.test.ts`. Old SQL Lab snapshot data (key `studentDatabases`) is not migrated; new key `studentDbImages`.
