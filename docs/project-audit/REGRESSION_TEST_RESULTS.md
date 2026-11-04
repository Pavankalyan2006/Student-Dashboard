# Regression Test Results

All commands run from the repo root on 2026-11-04.

| Command | Before | After |
|---------|--------|-------|
| `npx vitest run` | 47 files, 784 passed | 48 files, 794 passed (adds `src/tests/audit_regressions.test.ts`, 10 tests) |
| `npx tsc --noEmit` | 568 errors | 357 errors (no new errors in changed files) |
| `npm run build` | passes | passes (chunk-size warning only) |
| `node scripts/audit/api-checks.cjs` (against a running server) | 5 failures of 46 checks | 59 of 59 pass |
| `node scripts/audit/crawl-routes.cjs` (41 sidebar routes) | 41 pages with failing API calls, 1 page with a 500, KaTeX CSP error on all | 0 failing API calls, 0 page errors (one external image blocked by the sandbox network) |

Regression tests in `audit_regressions.test.ts` were run against the original
`server/db/database.ts` and 4 of 7 failed, confirming they catch the defects.

Known flaky test (pre-existing): `practice_labs_e2e.test.ts` › "trains ML model…" asserts
accuracy ≥ 0.9 on a randomly generated dataset; failed once in five runs, unrelated to these changes.
