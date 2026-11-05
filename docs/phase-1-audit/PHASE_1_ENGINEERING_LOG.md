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
