# Phase 1 Regression Test Report (2026-11-05, batch 8)

| Check | Command | Result |
|---|---|---|
| Typecheck | `npx tsc --noEmit -p .` | 0 errors |
| Unit and integration | `npx vitest run` | 49 files, 818/818 passed (baseline at Phase 1 start: 795/795) |
| API audit script | `BASE=http://localhost:3100 node scripts/audit/api-checks.cjs` | 59/59 PASS |
| Persistence and isolation | `scripts/audit/phase1-persistence.cjs` (create, restart, verify) | 10/10 records kept; none visible to student B |
| Responsive and accessibility sweep | `BASE=http://localhost:3000 node scripts/audit/phase1-responsive.cjs` | 66/66 page loads without overflow; 0 unlabeled controls; 1 `h1` per page |
| CI on PR #3 | GitHub Actions | Green on e729552; later commits are reported on the PR |

**New tests added in Phase 1.**
- `src/tests/phase1_learning_workspace.test.ts`: 16 tests covering semester isolation, agent, courses, documents, flashcard reviews and study planner.
- AI-off and stubbed-model cases in:
  - notes;
  - documents;
  - knowledge base;
  - learning modules;
  - flashcards;
  - languages;
  - quiz;
  - AI tutor.
