# Phase 2 Repository Inventory

Scope: the 12 lab and assessment pages named in the Phase 2 brief. Branch `claude/project-thread-7zxxwt`,
started from `main` at 7124ecb (PR #2 and PR #3 merged). Inventory taken 2026-11-05.

## Stack (unchanged)

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19, Vite, Tailwind, custom pathname router in `src/App.tsx` | No React Router. Pages live in `src/features/<module>/pages`. |
| Backend | Express on `tsx`, routers mounted under `/api/v1` | `requireAuth` sets `req.user.userId` from a signed JWT. Route handlers take the student id from there, not from the body or query. |
| Storage | In-memory Maps saved to a JSON snapshot (`DATA_SNAPSHOT_PATH`) | `registerPersistentSource` in `server.ts` saves after every non-GET request that returns < 400. There is no SQL database. Phase 2 kept this design, as the coordinator asked. |
| Code execution | `server/execution/sandbox.ts` and `isolation.ts` (Phase 2) | Child processes run in Linux namespaces with ulimits. See the security report. |
| SQL Lab | `sql.js` (SQLite compiled to WASM) in a worker thread (Phase 2) | Replaces a regex-based SQL emulator. |
| ML | `server/services/mlAlgorithms.ts` (Phase 2) | Pure TypeScript. No Python or external ML service. |
| AI | `AIService.generate` (Gemini when `GEMINI_API_KEY` is set) | No key was available. Every AI path returns 503 `AI_UNAVAILABLE` and was tested with stubs. |
| Tests | Vitest (`src/tests`), HTTP harness `src/tests/helpers/httpApp.ts` | Probe scripts in `scripts/audit/phase2-*.cjs` drive a real running server. |

## Page map

| # | Page (brief) | Route(s) in `src/App.tsx` | Page component | Backend router | Status |
|---|---|---|---|---|---|
| 1 | Coding Lab | `/coding`, `/coding-lab`, `/coding/editor`, `/coding/saved`, `/coding/history` | `src/features/coding/pages/CodingLabPage.tsx` and 3 more pages | `server/api/routes/coding.ts` (25 endpoints) | PASS |
| 2 | DSA Lab | `/dsa`, `/dsa-lab`, `/dsa/topics`, `/dsa/topic/:id`, `/dsa/practice`, `/dsa/problem/:id`, `/dsa/progress`, `/dsa/visualize/:id`, `/dsa/tutor/:id?` | `src/features/dsa/pages/DSALabPage.tsx` and 7 more pages | `server/api/routes/dsa.ts` (22) | PASS |
| 3 | SQL Lab | `/sql-lab` | `src/features/sql-lab/pages/SqlLabPage.tsx` | `learningModules.ts` `/sql-lab/*` (19) | PASS |
| 4 | Sandbox | `/sandbox` | Renders `CodingLabPage` | Same as Coding Lab | PASS (an alias of Coding Lab, not a separate module) |
| 5 | AI/ML Lab | `/ml-lab` | `src/features/ml-lab/pages/MlLabPage.tsx` | `learningModules.ts` `/ml-lab/*` (16) | PASS |
| 6 | Machine Learning | No route of its own | Covered by `/ml-lab` | Same as AI/ML Lab | NOT IMPLEMENTED as a separate page. No duplicate was created; see "Decisions". |
| 7 | System Design Lab | `/system-design` | `src/features/system-design/pages/SystemDesignLabPage.tsx` | `server/api/routes/systemDesign.ts` (28) | PASS |
| 8 | Lab Assistant | `/labs`, `/lab-assistant` | `src/features/labs/pages/LabAssistantPage.tsx` | `server/api/routes/labAssistant.ts` (31) | PASS |
| 9 | Viva | `/viva` | `LabAssistantPage`, with the viva part of `ExperimentWorkspace.tsx` | `labAssistant.ts` `/viva/*` | PARTIAL: works; without an AI key, feedback is a labelled keyword check |
| 10 | Quiz | `/quiz`, `/quiz/create`, `/quiz/history`, `/quiz/progress`, `/quiz/:id`, `/quiz/:id/result`, `/quiz/:id/review` | `src/features/quiz/pages/QuizPage.tsx` and 6 more pages | `server/api/routes/quiz.ts` (19) | PASS |
| 11 | Exam Preparation | `/exams`, `/exam-preparation` | `src/features/exams/pages/ExamPreparationPage.tsx` | `learningModules.ts` `/exams/*` (5 after Phase 2) | PASS |
| 12 | GATE Exam Preparation | `/assessment/gate-preparation`, `/gate`, `/gate-preparation`, `/assessment/gate` | `src/features/gate/pages/GateExamPreparationPage.tsx` | `server/api/routes/gate.ts` (23) | PARTIAL: works; the seeded question bank is small (see Limitations) |

Endpoint counts are the number of `router.get/post/patch/put/delete` calls in each file at the end of Phase 2.

## Related modules touched for integration

| Module | Why | Files |
|---|---|---|
| Study Planner | Exam Prep now writes revision tasks into it (J9) | `ExamPreparationPage.tsx` calls the existing `POST /study-planner/plans` |
| Notifications | Quiz and DSA events create notifications whose text and links were wrong | `server/events/eventBus.ts` |
| Dashboard lab widget | Reads `GET /labs`, which now returns experiments and counts | `labAssistantService.getLabs`, `LabDashboard.tsx` |
| AI agent tools | Used the legacy lab methods, which now delegate to the owner-scoped service | `learningModulesService.getLabs/getLabById/evaluateVivaAnswer` |
| Error handling | Oversized or malformed JSON bodies returned 500 | `server/middleware/errorHandler.ts` |

## Decisions

- **Sandbox** is a second URL for Coding Lab. It shares the same component and API. Building a second editor would duplicate a module, which the brief forbids, so the Coding Lab work covers it.
- **Machine Learning** has no page, route or API separate from AI/ML Lab. All ML features (datasets, preprocessing, training, evaluation, prediction) live in `/ml-lab`. No new page was created, to avoid duplicating a module. If a separate page is wanted, it should reuse the `/ml-lab` API.
- **Viva** lives inside Lab Assistant: `/viva` renders `LabAssistantPage`, and each experiment carries its viva questions. Viva history is stored per experiment.
- No admin role or admin page was added. Nothing was deployed.

## Evidence

- Route list: `grep -n "path ===\|path.startsWith" src/App.tsx`.
- Responsive sweep: 11 distinct routes (Machine Learning shares `/ml-lab`) × 6 widths loaded without page errors. See `phase2-responsive.json`.
- Diff from `main`: `git diff --stat 7124ecb..HEAD` shows 80 files.
