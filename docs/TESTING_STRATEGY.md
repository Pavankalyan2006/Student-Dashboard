# Testing Strategy

Created in Phase 6 (no earlier file existed). It describes how this repository is tested today.

| Layer | Tool | Where | Runs |
|---|---|---|---|
| Types | `npx tsc --noEmit` | whole repo | before every push (must be 0 errors) |
| Unit + HTTP integration | Vitest | `src/tests/*.test.ts`; HTTP tests start the API in-process (`helpers/httpApp.ts`) | `npm test`; CI |
| Database (Supabase schema, RLS, migration) | Vitest + local PostgreSQL 16 | `phase5_supabase_pg.test.ts` (skipped unless `PHASE5_PG_URL` is set) | manually |
| Synthetic end-to-end (API) | Node script | `scripts/pilot/phase6-synthetic-journeys.cjs` (10 pilot workflows, 2 synthetic students) | against a running server |
| Browser / responsive | Playwright (Chromium) | `scripts/pilot/phase6-ui-walkthrough.cjs`, `scripts/audit/*` | against a running server |
| Real users | Controlled pilot | `docs/phase-6/` | Stage 2/3, after owner approval |

Rules:
- Synthetic data only (`@example.test`). Never real student data in tests, fixtures or reports.
- With no AI key, AI routes must return `AI_UNAVAILABLE`. Tests that need generated output stub `AIService.generate`
  (`src/tests/helpers/mockAIModel.ts`). Template fallbacks never count as AI output.
- Every fixed bug gets a regression test in that phase's test file (`phase6_pilot.test.ts` for P6-xxx).
- Status words: PASS / FAIL / BLOCKED / NOT TESTED, and "awaiting real student participation" for pilot results.
- Rate limits are off inside Vitest unless `AUTH_RATE_LIMIT_IN_TESTS` is set.
