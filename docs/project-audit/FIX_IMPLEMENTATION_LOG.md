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
