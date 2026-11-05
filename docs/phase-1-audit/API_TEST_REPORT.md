# Phase 1 API Test Report

All runs used synthetic students on a local server: port 3100 with `DATA_PERSISTENCE=off`, and port 3200 with a scratch snapshot for the persistence run. No production systems were involved.

| Suite | How to run | Result (2026-11-05) |
|---|---|---|
| Earlier audit checks (auth, isolation, notifications, profile export, learning modules) | `BASE=http://localhost:3100 node scripts/audit/api-checks.cjs` | 59/59 PASS |
| Phase 1 persistence and isolation (10 record types) | `scripts/audit/phase1-persistence.cjs` create, restart, verify | 10/10 FOUND for A; 10/10 not visible to B |
| Vitest, including `phase1_learning_workspace.test.ts` (16 tests) | `npx vitest run` | 818/818 |

## Per-page HTTP checks
These were made by hand with `curl`/`fetch`. The commands are summarised in `PHASE_1_ENGINEERING_LOG.md` for each batch.

| Page | Checks | Result |
|---|---|---|
| Semester | Per-student config, subjects, events, slip tests; B cannot see A's | PASS |
| AI Tutor | Conversations CRUD; empty message 400; B 403 | PASS |
| AI Agent | Unrun steps reported as failed with a note | PASS |
| Courses | Enroll, progress, invalid progress 400, unknown lesson 404, private course 403, archive without enrollment 400 | PASS |
| Notes | CRUD, versions, search scoped, B 403, AI 503 | PASS |
| Documents | See `FILE_UPLOAD_VERIFICATION.md` | PASS |
| Doubt Solver | Empty 400; saved OPEN without a model | PASS |
| Flashcards | Deck and card validation; B 404; SM-2 intervals; due-queue review 200; invalid rating 400; generator 503 | PASS |
| Study Planner | New student empty; add task with validation; done and undone hours; free-text date 400 | PASS |
| Language | Catalog of 150; enrollment; writing, partner and translate 503 with nothing saved; translate 401 without a token; fake lesson 404; bad rating 400; bad quiz answers 400; B 404 on A's conversation | PASS |
