# Project Engineering Log

## 2026-11-04 — Session 1 (spec Part 1)

**Repository discovered**
- Frontend: React 19 + Vite 8 + Tailwind 4, TanStack Query, Zustand. Custom pathname router in `src/App.tsx` (~100 route patterns); sidebar in `src/components/navigation/Sidebar.tsx` (41 links).
- Backend: Express 4 in `server.ts`, 43 route files under `server/api/routes` (793 route handlers), services in `server/services`.
- Data: `server/db/database.ts` (`DatabaseStore`, ~13,000 lines, 170 in-memory Maps) plus static Maps in `LearningModulesService` and `ExternalIntegrationService`. Postgres/Redis in `docker-compose.yml` and `DATABASE_URL` are **not used** by the Node app. `backend/` holds an unused Python/Alembic skeleton.
- AI: `server/ai/provider.ts` (Gemini REST, key from `GEMINI_API_KEY`, server-side only) with a template fallback; multi-agent orchestration in `server/ai/orchestration`.
- Tests: Vitest, 47 files / 784 tests at start (all passing); 1 flaky.
- Typecheck: `npx tsc --noEmit` failed with 568 errors at start (so the CI typecheck step fails).

**Startup**: `npm ci --legacy-peer-deps`, then `npm run dev` (tsx server.ts, Vite middleware, port 3000). No `.env` needed for local; no database to start. Startup succeeded first try.

**Test environment**: synthetic students registered through `POST /api/v1/auth/register` and onboarding completed via `POST /api/v1/students/me/onboarding/complete`. No real credentials used. AI key absent, so AI behaviour is BLOCKED beyond the fallback path.

**Work done** (commits on `claude/project-thread-g85yyh`)
1. `d0a34ce` broken API calls, note data loss, catalog course authorization, error status codes, params-as-headers, missing imports, wrong AI call signatures, KaTeX CSP.
2. `2d4cc20` snapshot persistence; seeded admin password; production JWT secret guard.
3. `3dc7bed` honest AI fallback and removal of a fabricated citation.
4. `4b818da` DSA 150 starter templates and catalog type fields.

**Checkpoint / next exact actions**
1. Exercise Documents upload (valid/invalid type, oversize, empty, duplicate name, cross-student download).
2. Exercise Coding Lab / DSA execution and SQL sandbox isolation.
3. Click-through UI tests for Notes, Flashcards (incl. "create from note"), Courses lesson flow.
4. Fix responsive overflow pages (OPEN-002).
5. Continue reducing typecheck errors (OPEN-001).
