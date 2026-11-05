# Phase 1 Frontend to Backend Mapping

All paths below are under `/api/v1`, and all require auth unless marked public. Storage is in-memory Maps saved by the snapshot (`data/runtime/db-snapshot.json`, configured in `server.ts`). Component counts per page are in `PHASE_1_PAGE_INVENTORY.md` and `COMPONENT_INVENTORY.md`.

| Page | Frontend client | Main endpoints | Service | Store, persisted |
|---|---|---|---|---|
| Dashboard | `features/dashboard/api` and widget clients | `GET /dashboard`, plus widget endpoints (quiz, coding, flashcards, doubts, applications, integrations) | `DashboardService`, `db.getStudentDashboardData` | `db` Maps, yes |
| Semester Command Center | `src/api/semesterCommandCenterApi.ts` | `/semester/overview, config, subjects[/:id], events, stream, slip-tests, minors, end-sem-readiness, recovery, today-guidance, weekly-review` | `semesterCommandCenterService` | `semesterStateStore.states` per student, yes (P1-001) |
| AI Tutor | `features/ai-agent/api/conversationApi.ts`, `useAIChat` (SSE) | `/ai/conversations[/:id]`, `/ai/chat`, `/ai/tutor/context-options`, `GET /ai/status` | `AIService`, provider | `db` conversations, yes |
| AI Agent | same | `/ai/agent/*`, orchestration in `server/ai/orchestration/*` with tools in `server/ai/tools.ts` | master, planner, agentHandlers | conversations, yes |
| Courses | `features/courses/api` | `/courses` (public catalog), `/courses/:id`, enroll, bookmark, archive, `/lessons/:id`, lesson progress and complete | `CourseService`, `db` | yes |
| Notes | `features/notes/api` | `/notes`, `/notes/search`, `/notes/:id` (GET, PATCH, DELETE), favorite, versions, regenerate, summarize, flashcards, quiz, explain-section | `NotesService` | yes |
| Documents | `features/documents/api` | `/documents` (GET, POST), `/documents/:id`, download, file, versions, pages, search, chat, summary, folders | `DocumentService`, `DocumentSummaryService`, storage vault | `db` plus `data/vault`, yes |
| Doubt Solver | `learningModulesApi.doubts` | `/doubts`, `/doubts/:id` | `LearningModulesService.createDoubt` | `LearningModulesService.doubts`, yes |
| AI Flashcards | flashcards API | `/flashcards/decks[/:id[/cards[/:cardId[/review]]]]`, `/flashcards/stats`, generate (topic, course, note, document) | `db`, `LearningModulesService` | yes |
| Spaced Revision | same page, revision tab | `/flashcards/due`, card review | `db` (SM-2) | yes |
| Study Planner | `learningModulesApi.studyPlanner` | `/study-planner/plans[/:id]`, `POST /study-planner/plans/:id/tasks` (new), `PATCH .../tasks/:taskId`, `/study-planner/today`, schedule review | `LearningModulesService` | `studyPlans`, yes |
| Language Learning | `features/languages/api/languageApi.ts` | `GET /languages` (public), `/:code` (public), `/:code/paths` (public), enroll, dashboard, lessons and lesson complete, vocabulary with bookmark and review, revisions/due, writing, conversations and messages, quizzes submit, `POST /languages/translate` (auth since P1-041), `/analytics/my`, `/enrollments/my` | `LanguageLearningService` | `db` language maps, yes |
