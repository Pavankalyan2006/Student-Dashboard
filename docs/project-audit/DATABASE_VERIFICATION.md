# Database Verification

## Actual storage
- No database is used by the running app. `DatabaseStore` (`server/db/database.ts`) holds 170 `Map`s seeded at startup; `LearningModulesService` and `ExternalIntegrationService` hold 14 more static Maps (study plans, exams, doubts, decks, labs, ML experiments, designs, knowledge items/collections, applications, integration connections/activities/profiles/jobs).
- `DATABASE_URL`, `REDIS_URL`, the Postgres/Redis services in `docker-compose.yml`, and the Python `backend/alembic` migrations are not wired to the Node server.

## Persistence (BUG-010)
- Before: every restart deleted every registered student and all their data (verified).
- After: `server/db/persistence.ts` writes `data/runtime/db-snapshot.json` (git-ignored, mode 600) ~1s after any successful non-GET `/api` request and on SIGINT/SIGTERM; at startup it merges the snapshot over seed data.
- Verified: account login, a note and a flashcard deck survived SIGTERM + restart.
- Config: `DATA_PERSISTENCE=off` disables; `DATA_SNAPSHOT_PATH` overrides the path; disabled automatically under Vitest.
- Limits: single process only; whole-store rewrite (~7MB with seed catalogs); data changed only by GET handlers is saved on the next write or shutdown; a hard kill can lose up to ~1s of writes.

## CRUD & isolation tests
| Entity | Create | Read | Update | Delete | Isolation |
|--------|--------|------|--------|--------|-----------|
| Note | PASS | PASS | PASS (after BUG-006) | PASS | PASS |
| Flashcard deck / card | PASS | PASS | not tested | not tested | PASS |
| Learning goal | PASS | not tested | not tested | not tested | PASS (after BUG-012) |
| Course enrollment / lesson progress | PASS | PASS | PASS | not tested | PASS |
| Custom course | PASS | PASS | PASS | not tested | PASS |
| Course resource | PASS | PASS | — | PASS (owner only) | PASS (after BUG-008) |

## Data quality
- Course catalog: 108 unique course IDs (`GET /courses?limit=200`).
- DSA catalog: 150 problems; starter code fixed (BUG-011).
