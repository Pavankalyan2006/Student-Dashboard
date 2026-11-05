# Fix Implementation Log

Each entry: defect → files → evidence. Defect details in `BUG_TRACKER.md`.

| Defect | Files changed | Evidence |
|--------|---------------|----------|
| BUG-001 | `src/context/StudentContext.tsx` | Playwright crawl of 41 sidebar routes: 3 failing API calls per page before, 0 after |
| BUG-002 | `server/api/routes/ai.ts` | `GET /ai/tutor/context-options` 500 → 200 with 108 courses |
| BUG-003 | `src/pages/AiAgentPage.tsx` | 403 on `/ai/conversations/conv_01` no longer requested |
| BUG-004 | `src/api/client.ts` | `audit_regressions.test.ts` › appendQueryParams |
| BUG-005 | `src/features/flashcards/components/CreateFlashcardsModal.tsx` | Code fix; matches `NotesListResponse.items` / `DocumentsListResponse.items` |
| BUG-006 | `server/db/database.ts` (`updateNote`) | API NOTE-4b/4c pass; regression test fails on old code |
| BUG-007, BUG-008 | `server/db/database.ts`, `server/models/types.ts` | API SEC-11, SEC-13..16 and CRS-7..10 pass; regression tests fail on old code |
| BUG-009 | `server/services/labAssistantService.ts`, `server/services/githubService.ts` | Type errors at those call sites gone; calls now match `AIService.generate(messages, promptKey, temperature)` |
| BUG-010 | `server/db/persistence.ts` (new), `server.ts`, `server/db/database.ts` (single-flight `initialize`), `.gitignore` | Registered student, note and flashcard deck present after SIGTERM + restart; unit test for Map/Set/nested Map round-trip |
| BUG-011 | `server/db/dsa150Catalog.ts`, `server/db/seedDsa.ts`, `server/models/dsaTypes.ts`, `src/features/dsa/types/dsa.ts` | All 150 JS starters parse (`new Function`), all 150 Python starters parse (`ast.parse`); 166 typecheck errors removed |
| BUG-012 | 23 files in `server/api/routes/` | Cross-student goal read/delete 500 → 403 |
| BUG-013 | `server/db/database.ts` | `POST /auth/login` with the old published admin password now 401 |
| BUG-014 | `server/core/config.ts` | Code review; only active when `NODE_ENV=production` |
| BUG-015 | `server/ai/provider.ts`, `server/ai/orchestration/agentHandlers.ts` | `/ai/chat` stream now ends with "AI unavailable…" and no fake source |
| BUG-016, 017, 019 | `CourseAIActions.tsx`, `routes/profile.ts`, `routes/learningModules.ts` | `/profile/export` 200; `from-document` without id 400 |
| BUG-018 | `index.html`, `src/main.tsx` | CSP console error gone in crawl |
| BUG-020 | `server/services/documents.ts` | Duplicate-implementation type error gone |

## Batch 2 (2026-11-05)

| Defect | Files changed | Evidence |
|--------|---------------|----------|
| BUG-021 | `server/db/database.ts` (`getStudentDashboardData`, `seedTodayPlanIfEmpty`), `server/services/dashboard.ts` | New student sees zeros and an empty plan; enrolling and completing a lesson changes the dashboard (`dashboard.test.ts`) |
| BUG-022 | `server/services/progressService.ts` | Quiz attempt, code run, DSA submit and interview each show up in `/progress` for A only |
| BUG-023 | `server/services/courses.ts` | B lists subjects after A enrolls: not enrolled, no private course id |
| BUG-024 | `server/services/profileService.ts` | `PATCH /profile` branch/semester then `GET /dashboard` shows the new values |
| BUG-025 | `server/api/routes/gate.ts`, `systemDesign.ts`, `learningModules.ts` | Unauthenticated requests → 401 |
| BUG-026 | `server/db/database.ts` (`getQuizzes`) | New student's quiz list has no other student's quizzes |
| BUG-027 | `server/services/mlLabService.ts` | Iris k-NN accuracy equals confusion-matrix diagonal / total; setosa sample predicts setosa (`sql_ml_labs_e2e.test.ts`) |
| BUG-028 | `server/services/learningModulesService.ts` | New student has no demo applications/doubts/decks; starter plan is 0 h, all pending |
| BUG-029 | `server/services/resumeService.ts` | New resume has empty phone/location; project import twice gives one entry |
| BUG-030 | `server/services/externalIntegrationService.ts` | LeetCode sync → status ERROR with "not available yet", no activity logged |
| BUG-031 | `server/services/githubService.ts`, `src/tests/helpers/mockGitHubApi.ts` | Invalid token rejected; repo/commit/tree tests run against a mocked GitHub API |
| BUG-032 | `server/services/sqlLabSandboxService.ts` | `SELECT 1` and unsupported statements return errors recorded in history |
| BUG-033 | `server/ai/provider.ts`, `server/ai/service.ts`, `server/services/notes.ts`, `knowledgeBaseService.ts` | Note generation with AI off → 503, nothing saved; KB answer confidence 0 |
| BUG-034 | `server/services/notes.ts`, `server/api/routes/notes.ts`, `server/api/routes/ai.ts` | Manual note with `course_id` lists under that course; tutor context lists enrolled courses first |
| BUG-035 | `server/services/onboardingService.ts`, `semesterCommandCenterService.ts`, `server/models/onboardingTypes.ts` | Template syllabus subjects at 0%, dates marked estimated |
| BUG-036 | `server/db/database.ts` | GOOD review counted as GOOD in stats |
| BUG-037 | `server/services/mockInterviewEngineService.ts`, `placementService.ts` | Empty interview scores 0; coding readiness follows solved count |
| BUG-038 | `server/ai/tools.ts` | Agent tool counts match the student's DSA/quiz records |
| BUG-039 | `src/features/profile/pages/ExternalProfileHubPage.tsx` | Tab shows "Career Consistency (0%)" for a new student in Chromium (was 94%) |
| BUG-040 | `src/components/layout/PageComponents.tsx` and 16 page/component files (class changes only) | Sweep: 28 overflowing page/width combinations before, 0 after |
