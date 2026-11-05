# Phase 1 Engineering Log

## Stack (discovered)
- Frontend: React 19, Vite 8, Tailwind 4, Radix UI primitives, lucide icons, react-query in places, custom pathname router in `src/App.tsx`, `zustand` UI store.
- Backend: Express 4 (`server.ts`, routers in `server/api/routes`, mounted under `/api/v1`), TypeScript run by `tsx`.
- Data: in-memory Maps (`server/db/database.ts` plus module/static Maps in services), saved to `data/runtime/db-snapshot.json` by `server/db/persistence.ts`. No ORM; Postgres is not used.
- Auth: JWT bearer token (`requireAuth`), also an httpOnly cookie.
- AI: Gemini via REST (`server/ai/provider.ts`); no key in this environment.
- Files: local vault under `data/vault`.
- Tests: Vitest (`src/tests`), Playwright available for browser checks.

## Batch 1 — discovery (2026-11-05)
- Routes mapped in `PHASE_1_PAGE_INVENTORY.md`; AI Tutor and AI Agent share `AiAgentPage`; AI Flashcards and Spaced Revision share `FlashcardsPage`.
- Component inventory: 142 component files reachable from the 12 page entries, 107 with event handlers (`COMPONENT_INVENTORY.md`).
- Baseline: `vitest` 795/795, `tsc` 0 errors, build passes.

## Batch 2 — Dashboard, Semester Command Center
- Dashboard: removed invented values from 7 widgets (P1-008..010). The dashboard summary itself was already rebuilt from real records in the previous audit batch.
- Semester: found one global semester shared by all students (P1-001, P0) and a frontend client that hid every failure behind mock data (P1-003). Rewrote the service around a per-student store and the client as a thin API wrapper.
- Found onboarding data was never persisted (P1-002, P0); registered it and three other unsaved stores (P1-011).
- Evidence: API run with students A/B on port 3100; restart with `DATA_SNAPSHOT_PATH` in the scratch area; `src/tests/phase1_learning_workspace.test.ts` (5 tests); full suite 800/800.
- Files: `server/services/semesterCommandCenterService.ts`, `server/api/routes/semesterCommandCenter.ts`, `server/services/courses.ts` (call site), `server/services/onboardingService.ts`, `server.ts`, `src/api/semesterCommandCenterApi.ts`, `features/semester-command-center/{components/SemesterCommandCenterLayout,pages/SemesterSetupWizardPage,pages/SemesterStudyStreamPage,pages/SemesterSubjectsSyllabusPage}.tsx`, 7 dashboard widgets, `src/tests/learning_modules_e2e.test.ts` (now names the demo account it reads).
- Next: batch 3 (AI Tutor, AI Agent). Re-run the click crawl on the restarted server for the batch 2 pages.

## Batch 3 — AI Tutor, AI Agent
- Verified with students A/B over HTTP: create/list/rename/delete conversations, messages saved with the provider's "AI unavailable" reply, empty message → 400, B gets 403 on A's conversation. Difficulty buttons change state (browser). Generate note and create study task work.
- Default for no AI key: every generator returns 503 `AI_UNAVAILABLE` and saves nothing; chat replies carry the provider's notice. Real model output is BLOCKED in this environment (no key).
- Fixed P1-012..P1-019: quiz filler questions, wrong-answer default, template tutor flashcards, fake attach, sample decks for every student, canned multi-agent output with fake sources, plan step states, static model/verified labels.
- Evidence: `phase1_learning_workspace.test.ts` now 9 tests (the 2 agent tests fail against the old handlers); browser checks of attach and the agent plan; full suite 804/804, `tsc` 0 errors.
- Files: `server/services/quizGeneration.ts`, `server/api/routes/ai.ts`, `server/ai/{service,provider}.ts`, `server/ai/orchestration/{agentHandlers,master,planner}.ts`, `server/models/types.ts`, `server/db/database.ts` (flashcard seed guard), `src/features/ai-agent/{api/conversationApi.ts,types/ai.ts,components/AIComposer.tsx,components/ChatWorkspace.tsx,components/MessageItem.tsx,components/RichCards.tsx}`, tests `quiz`, `ai_tutor_master`, `agent`, `resume_career_skills` (stubbed model via `helpers/mockAIModel.ts`).
- Next: batch 4 (Courses, Notes).

## Batch 4 — Courses, Notes
- Courses over HTTP with A/B: catalog list/search/stats (108 courses), enroll, lesson complete (progress 8%, next lesson advances), invalid progress → 400, unknown lesson → 404, unauthenticated enroll → 401, B cannot edit/add chapters to catalog courses (403), B cannot read A's private course or lesson (403). Archive is per student (A unaffected by B).
- Found and fixed P1-020 (P0: enrolling in / tracking another student's private course), P1-021 (archive enrolled you), P1-023 (aria-pressed).
- Notes over HTTP with A/B: create (empty title → 400), read/patch/delete/favorite/versions by B → 403, versions recorded on edit, search and tag filter scoped to the owner, generate/regenerate → 503 with AI off. Fixed P1-022 (template takeaways, flashcards, quiz). P1-O01 closed as not a defect.
- Browser: grid/list toggle, course search, note favorite (persisted), summarize error toast.
- Tests: `phase1_learning_workspace.test.ts` 11, `notes.test.ts` updated with a stubbed model and an AI-off case; full suite green.
- Files: `server/db/database.ts`, `server/services/notes.ts`, `src/features/courses/components/{CourseCard,CourseHero,CourseFilters}.tsx`, `src/tests/notes.test.ts`, `src/tests/phase1_learning_workspace.test.ts`.
- Next: batch 5 (Documents, Doubt Solver).

## Batch 5 — Documents, Doubt Solver
- Documents over HTTP with A/B: valid text upload 201; .exe and .html → 400; declared 60 MB → 400; B get/download/file/delete → 403; B list empty; A download returns the bytes; pages and in-document search work; document chat with AI off returns an extractive passage labelled as such with a citation. Found P1-024..P1-029 and fixed them.
- Doubt Solver: new student starts with no doubts (demo seed limited to demo accounts); empty question → 400; every new doubt was "resolved" with fixed text (P1-030), now OPEN without a model. Browser: toast and panel say the doubt has no answer yet.
- PR #3 CI was green on e729552 before this batch.
- Files: `server/services/{documents,documentSummary,knowledgeBaseService,learningModulesService}.ts`, `server/ai/provider.ts`, `src/features/doubts/pages/DoubtSolverPage.tsx`, tests `documents`, `knowledge_base_master`, `learning_modules_e2e`, `phase1_learning_workspace` (13).
- Next: batch 6 (Flashcards, Spaced Revision).

## Batch 6 — Flashcards, Spaced Revision
- `/revision` and `/flashcards` render the same page. New student: no decks, zero stats, empty due list (P1-016 already removed the sample decks).
- HTTP with A/B: create deck (empty title → 400), add card (empty → 400), B get/edit/add/review/delete → 404. SM-2 checked: GOOD on a new card → REVIEW, next day; AGAIN → LEARNING, interval 1 day, ease −0.2.
- Fixed P1-031 (due queue reviews never saved, found in the browser), P1-032 (invalid ratings counted as GOOD), P1-033 (template topic/course cards). Deck from a document already returns 503 since P1-029; deck from a note since P1-022.
- Tests: `phase1_learning_workspace.test.ts` 14, `flashcards_master_production.test.ts` updated; full suite 814/814.
- Next: batch 7 (Study Planner, Language Learning).

## Batch 7 — Study Planner, Language Learning
- Study Planner over HTTP and in the browser (390px): a new student starts with no plans; create plan, add tasks (invalid date/duration → 400), mark done/undone with hours updated once, Today lists today's and overdue pending tasks. Fixed P1-034..P1-038.
- Language Learning over HTTP with A/B: catalog 150 unique codes; enrollment, conversations and writing are per student (B posting to A's conversation → 404). With AI off, writing, AI Partner replies and translation now return 503 and save nothing (P1-039..P1-041). Also fixed status codes (P1-042), fake lesson completion (P1-043), rating/quiz validation (P1-044), and misleading toasts (P1-045). Translate now requires sign-in.
- Note: a new conversation opens with the language's catalog greeting phrase (a fixed, real phrase, not presented as analysis); left as is.
- Pronunciation scoring: the page uses the browser's speech APIs only; no score is computed or stored, so nothing is fabricated there. Real model output is BLOCKED (no key).
- Tests: `phase1_learning_workspace.test.ts` 16, `languages_platform_master.test.ts` 20 (3 AI-off cases + stubbed model), `flashcards_master_production.test.ts` schedule test; full suite 818/818, `tsc` 0 errors.
- Files: `server/services/{learningModulesService,languageLearningService}.ts`, `server/api/routes/{learningModules,languages}.ts`, `src/api/learningModulesApi.ts`, `src/features/study-planner/pages/StudyPlannerPage.tsx`, `src/features/languages/components/{ConversationPartnerView,WritingPracticeView,ContextualTranslatorView,LessonWorkspaceView}.tsx`.
- Next: batch 8 (shared components, accessibility, security, responsive sweep, regression, final reports).
