# Phase 3 Database and Persistence Audit

## Storage model

There is no database server. Records live in memory:

- the `db` store in `server/db/database.ts`;
- static Maps on some services.

`server/db/persistence.ts` writes the registered stores to a JSON snapshot after each change (debounced) and restores
them at start-up. Maps and Sets are encoded with type tags.

- **Snapshot path:** `DATA_SNAPSHOT_PATH`, by default `./data/runtime/db-snapshot.json`.
- **Turning it off:** `DATA_PERSISTENCE=off`.
- **Tests:** unit tests never touch disk unless a snapshot path is set.

This is suitable for a single local instance. It is not a production database (see Phase 4).

## Registered sources (`server.ts`)

| Source | Holds | Phase 3 change |
|---|---|---|
| `db` | users, projects, resumes, research, documents, mock interviews, GitHub, placements, jobs and the rest | unchanged; new Phase 3 fields are saved with their records |
| `learningModules` | applications, SQL lab and other learning module state | |
| `externalIntegrations` | Integrations Center connections and activity | |
| `career` | career profiles | unchanged |
| `vectorStore` | RAG vectors | added; P3-033, the index was lost on restart |
| `gitLab` | Git lab progress and repositories | new |
| `onboarding`, `mlLab`, `sqlLab`, `semesterCommandCenter` | earlier phases | unchanged |

## Ownership

Each student record carries `student_id` (or `user_id`). Services filter on the authenticated id, and a lookup by
record id also checks the owner. Isolation is checked by every create probe, where student B is refused, and by the
unit tests.

## Removing invented data

Older versions seeded made-up records into the store. A snapshot written by an older version would bring them back
on restore. Two things were changed:

1. **The seeds are gone.** Removed:
   - demo mock interviews with fixed scores;
   - a GitHub connection and repositories for the demo account;
   - external platform profiles and Integrations Center activity;
   - "verified" job listings;
   - Google, Microsoft and Amazon sample applications.
2. **Start-up cleanup.** After `restoreSnapshot()`, `server.ts` calls:
   - `db.retireFabricatedDemoData()`
   - `db.retireFabricatedJobData()`
   - `LearningModulesService.retireSeededApplications()`

   Each one deletes records by their known seed ids and logs how many it removed. Records students created are not
   touched.

Probe `phase3-demo-account.cjs` (6/6) signs in as the demo student and finds none of these records.

## Restart verification

Each batch probe writes records over HTTP. `/tmp/p3/restart.sh` then stops the server and starts it on the same
snapshot, and a `verify` probe reads the records back.

| Batch | Checks after restart |
|---|---|
| 1 | 5/5: mock interview history and score, project with tasks and repository URL |
| 2 | 12/12: Git lab progress, research paper and notes, knowledge base document and citation |
| 3 | 7/7: RAG citation, career role and roadmap step, resume with project and score |
| 4 | 6/6: application status and analysis, placement history, platform link state |
| Phase 2 | batches 1, 2 and 5: 8, 7 and 12, no failures |

## Known limits

- Writes are whole-file JSON rewrites. They are not transactional, and two processes must not share one file.
- There are no schema migrations. Restore merges the snapshot over the seed by key.
- Two link stores exist for connected platforms (P3-090).
