# Phase 1 Database / Persistence Test Report

**Storage model.** The app keeps all data in memory, and Postgres is not used. `server.ts` registers the stores with `server/db/persistence.ts`:
- `db`;
- `LearningModulesService` (study plans, doubts, decks and others);
- onboarding stores;
- career, ML Lab and SQL Lab;
- the semester state store;
- external integrations.

The stores are written to a JSON snapshot after each successful write request and when the server shuts down.

**Choice of default.** The persistence default for this phase is the snapshot, chosen as the sensible default and easy to change later. Moving to Postgres is not part of Phase 1.

**Test.** Run `scripts/audit/phase1-persistence.cjs` on a server started with a scratch `DATA_SNAPSHOT_PATH`:
1. Student A creates one record of each type listed below.
2. The server is stopped and started again.
3. A logs in again, and A and B both query every list.

| Record | After restart and re-login (A) | Visible to B |
|---|---|---|
| Note | FOUND | no |
| Flashcard deck | FOUND | no |
| Card with review state | FOUND | no (404) |
| Study plan with added task | FOUND | no |
| Doubt | FOUND | no |
| Language enrollment | FOUND | no |
| Language lesson completion | FOUND | no (404) |
| Language conversation | FOUND | no |
| Document | FOUND | no |
| AI Tutor conversation | FOUND | no |

**Fixed during Phase 1.**
- P1-002 (P0): onboarding stores were never persisted.
- P1-011: career, ML Lab and SQL Lab were also missing from the snapshot.

**Limits.**
- The snapshot is a single file with no concurrency control between processes. It suits one server instance.
- No migration or backup tooling exists.
