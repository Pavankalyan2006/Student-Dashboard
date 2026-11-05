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
- 2026-11-05 13:40 Batch 2 done (Sandbox, AI/ML Lab, Machine Learning).
  Sandbox: `/sandbox` renders Coding Lab, so it is covered by the batch 1 isolation work; nothing duplicated.
  Machine Learning: no separate page or route exists; the ML features live in AI/ML Lab (`/ml-lab`). No new page was created.
  AI/ML Lab fixes: Random Forest, Decision Tree and Logistic Regression were silently replaced by k-NN or linear
  regression and the preprocessing controls were ignored. Now `server/services/mlAlgorithms.ts` implements CART trees,
  bagged forests and softmax logistic regression, with preprocessing (impute, scale, one-hot) fitted on training rows only
  and a seeded split. Unsupported models are refused with 400. Experiments and predictions are owner-checked (404 for other
  students). Prediction inputs are validated (required, numeric, known category) and saved to a persisted history.
  CSV upload uses an RFC 4180 parser with 5 MB, 20,000-row and 100-column limits, header and row-width checks, and a
  duplicate-row count. Uploaded datasets can be removed (built-in ones cannot).
  UI: k-NN option, only the hyperparameters each model uses, CSV file picker, remove-dataset button, category dropdowns
  and training ranges in the prediction form, prediction history table, and an "Algorithm trained" banner.
  Evidence: `scripts/audit/phase2-batch2.cjs create` 19/19 PASS, `verify` after restart 6/6 PASS; `src/tests/phase2_ml_lab.test.ts`
  8 tests; browser run of upload, train k-NN, predict, blank-input error and history (`/tmp/p2/ui-b2.cjs`, no page errors).
  Full suite 838/838 before the final UI tweak.
