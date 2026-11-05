# Phase 1 Page Inventory

Router: custom pathname switch in `src/App.tsx` (`renderRoute()`), rendered inside `AppShell`.
All pages require a signed-in student (JWT bearer token; `requireAuth` on the API).

| # | Page | Route(s) | Main component | Child components (files) | Frontend API client | Backend route → service | Store | Existing tests |
|---|---|---|---|---:|---|---|---|---|
| 1 | Dashboard | `/dashboard`, `/` | `src/pages/DashboardPage.tsx` | 33 | `features/dashboard/api`, widget-level clients (quiz, coding, dsa, career, learning modules, integrations) | `/dashboard` → `DashboardService` + `db.getStudentDashboardData` | `db` Maps | `dashboard.test.ts` |
| 2 | Semester Command Center | `/semester-command-center[/overview\|subjects\|calendar\|study-stream\|slip-tests\|exams\|recovery\|setup]`, `/semester/*` | `features/semester-command-center/pages/*` (7 pages) + `SemesterCommandCenterLayout` | 10 | `src/api/semesterCommandCenterApi.ts` | `/semester/*` → `semesterCommandCenterService` | per-student `semesterStateStore` (was one global object) + onboarding syllabus | `learning_modules_e2e.test.ts`, `phase1_learning_workspace.test.ts` |
| 3 | AI Tutor | `/ai-tutor`, `/ai-agent` | `src/pages/AiAgentPage.tsx` | 11 | `features/ai-agent/api`, `useAIChat` (SSE) | `/ai/chat`, `/ai/conversations`, `/ai/tutor/context-options` → `AIService`, orchestration | `db` conversations | `ai.test.ts`, `ai_tutor_master.test.ts` |
| 4 | AI Agent | same page as AI Tutor (`AiAgentPage`) | shared | — | same | `/ai/agent/*`, tools in `server/ai/tools.ts` | | `agent.test.ts`, `multi_agent_orchestration.test.ts` |
| 5 | Courses | `/courses`, `/courses/:id`, `/courses/:id/learn[/:lessonId]` | `features/courses/pages/*` | 22 | `features/courses/api` | `/courses/*` → `CourseService` | `db` | `courses*.test.ts` |
| 6 | Notes | `/notes`, `/notes/create`, `/notes/:id` | `features/notes/pages/NotesPage.tsx`, `NoteDetailPage.tsx` | 12 | `features/notes/api` | `/notes/*` → `NotesService` | `db` | `notes.test.ts` |
| 7 | Documents | `/documents`, `/documents/upload`, `/documents/:id[/page/:n\|chat\|summary\|notes]` | `features/documents/pages/*` | 25 | `features/documents/api` | `/documents/*` → `DocumentService`, storage vault | `db` + `data/vault` | `documents*.test.ts`, `storage.test.ts` |
| 8 | Doubt Solver | `/doubts`, `/doubt-solver` | `features/doubts/pages/DoubtSolverPage.tsx` | 3 | `learningModulesApi.doubts` | `/doubts`, `/doubts/:id` → `LearningModulesService` | `LearningModulesService.doubts` | `learning_modules_e2e.test.ts` |
| 9 | AI Flashcards | `/flashcards` | `features/flashcards/pages/FlashcardsPage.tsx` | 10 | flashcards API | `/flashcards/decks[/:id[/cards/:cardId]]`, `/flashcards/due`, `/flashcards/stats` → `db` | `db` | `flashcards_master_production.test.ts` |
| 10 | Spaced Revision | `/revision` | same `FlashcardsPage` (revision tab) | — | same | `/flashcards/due` + card review | `db` | same |
| 11 | Study Planner | `/study-planner` | `features/study-planner/pages/StudyPlannerPage.tsx` | 3 | `learningModulesApi.studyPlanner` | `/study-planner/plans[/:id]`, `/study-planner/plans/:id/tasks/:taskId`, `/study-planner/today` → `LearningModulesService` | `LearningModulesService.studyPlans` | `learning_modules_e2e.test.ts` |
| 12 | Language Learning | `/languages`, `/language-learning`, `/language` (+ sub-paths) | `features/languages/pages/LanguageLearningPage.tsx` | 13 | `features/languages/api` | to be traced in batch 7 | | `languages_platform_master.test.ts` |

Child component counts come from `COMPONENT_INVENTORY.md` (all `.tsx` files reachable by relative import, shared UI included).
