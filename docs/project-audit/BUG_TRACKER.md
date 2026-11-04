# Bug Tracker

Severity: CRITICAL > HIGH > MEDIUM > LOW. "Verified" means reproduced before the fix and
re-tested after it (API script, Playwright crawl, and/or `src/tests/audit_regressions.test.ts`).

| ID | Severity | Area | Defect | Root cause | Fix | Status |
|----|----------|------|--------|------------|-----|--------|
| BUG-001 | HIGH | All pages | Every page fired three 404s (`/student/goals`, `/student/notifications`, `/student/progress/summary`); profile, goals, unread count and progress never loaded into `StudentContext` | Wrong endpoint paths, and the code read `.data` from responses `apiClient` had already unwrapped | `src/context/StudentContext.tsx` uses `/goals`, `/notifications?unreadOnly=true`, `/progress` and the unwrapped payloads | FIXED, verified (re-crawl: 0 failing API calls on 41 routes) |
| BUG-002 | HIGH | AI Tutor | `GET /ai/tutor/context-options` returned 500 (`db.getDocumentsByStudentId is not a function`) so the context panel was empty | Called non-existent store methods; read `name`/`units_count` that courses do not have | `server/api/routes/ai.ts` uses `getDocuments`/`getNotes`, `title`, `total_chapters` | FIXED, verified (API 200, 108 courses) |
| BUG-003 | HIGH | AI Tutor | Opening AI Tutor requested `conv_01` (the demo student's conversation) and got 403 for every other student | Hard-coded default `selectedId` | `src/pages/AiAgentPage.tsx` starts with no conversation selected | FIXED, verified (crawl) |
| BUG-004 | MEDIUM | Knowledge Base, Languages, Mock Interviews, Jobs | Search/filter params silently ignored | Callers passed axios-style `{ params }`, which `apiClient.get/delete` sent as HTTP headers | `src/api/client.ts` accepts `{ params, headers }` and builds the query string | FIXED, unit-tested |
| BUG-005 | MEDIUM | Flashcards | "Create from note / document / course" pickers were always empty | Read `.notes`, `.documents` and treated a paginated object as an array | `CreateFlashcardsModal.tsx` reads `.items` | FIXED (code), UI flow not yet clicked through |
| BUG-006 | CRITICAL | Notes | Editing only a note's title erased its content and tags; later searches crashed with 500 | `PATCH /notes/:id` forwards every field; `db.updateNote` spread `undefined` over the stored note | `db.updateNote` drops undefined keys and rejects blank titles | FIXED, verified (API + regression test fails on old code) |
| BUG-007 | CRITICAL | Courses | Any student could rename, add chapters or add lessons to shared catalog courses, changing them for everyone | Ownership check only applied to custom courses | Catalog courses are read-only; only the owner may change a custom course | FIXED, verified |
| BUG-008 | HIGH | Courses | Resources a student attached to a catalog course (incl. their document/note links) were visible to and deletable by every student | Resources stored per course with no owner | Resources record `student_id`; reads are filtered; delete requires ownership | FIXED, verified |
| BUG-009 | MEDIUM | Lab Assistant, GitHub | AI-generated experiments, viva questions, lab doubts and resume bullets never called the AI provider | Called `AIService.generate({...})` with an object instead of `(messages, promptKey, temperature)` and read `.content` instead of `.text`; the TypeError was swallowed by fallbacks | Call sites corrected | FIXED (code + typecheck); live AI BLOCKED (no key) |
| BUG-010 | CRITICAL | Data integrity | All student accounts and data were lost on every server restart | The Node server keeps everything in in-memory Maps; `DATABASE_URL`/Postgres in docker-compose is never read | `server/db/persistence.ts` snapshots the store to `data/runtime/db-snapshot.json` and restores at startup | FIXED, verified (register + note + deck survive restart) |
| BUG-011 | HIGH | DSA Lab | 120 of 150 JavaScript starters and 9 Python starters did not compile; 6 Python ones also contained the reference solution | Generator emitted Python type hints into JS and mis-indented class stubs | Starters regenerated as valid stubs; topics get timestamps | FIXED, unit-tested |
| BUG-012 | MEDIUM | ~20 route files | 403/404/400 errors were returned as 500 (e.g. student B reading student A's goal) | Handlers used `err.status`, but `AppError` sets `statusCode` | `err.statusCode \|\| err.status \|\| 500` | FIXED, verified (goals now 403) |
| BUG-013 | CRITICAL | Security | Seeded `SUPER_ADMIN` (`admin@btech.edu`) used a password committed to the repo; logging in returned every student's record via `/api/v1/admin/students` | Hard-coded seed password | Password comes from `ADMIN_BOOTSTRAP_PASSWORD` (>=12 chars) or is random | FIXED, verified (login now rejected) |
| BUG-014 | HIGH | Security | Production could start with the published default JWT secrets, allowing forged tokens | Fallback secrets in `server/core/config.ts` | Startup fails in production without real secrets | FIXED (code) |
| BUG-015 | HIGH | AI Tutor | With no AI key, students received a fixed "Academic Overview" paragraph labelled as a grounded AI answer, citing a non-existent "University Engineering Curriculum Reference" | Silent template fallback and a hard-coded source | Fallback states that no AI answer was generated; placeholder citation removed | FIXED, verified (chat stream) |
| BUG-016 | MEDIUM | Courses | Course AI panel threw `ReferenceError: Button is not defined` when a result rendered | Missing import | Import added | FIXED (code) |
| BUG-017 | MEDIUM | Profile | `GET /profile/export` threw `db is not defined` | Missing import | Import added | FIXED, verified (200) |
| BUG-018 | LOW | Rendering | KaTeX stylesheet blocked by the app's own CSP, so maths rendered unstyled outside Documents | CDN link not allowed by `style-src` | Bundled `katex.min.css` via `src/main.tsx` | FIXED, verified (no CSP error) |
| BUG-019 | MEDIUM | Learning modules | `flashcards/generate/from-*` without an id threw `ReferenceError: ValidationError is not defined` (500) | Missing import | Import added; returns 400 | FIXED, verified |
| BUG-020 | MEDIUM | Documents | Two `updateDocument` implementations; the active one skipped title validation | Duplicate static method | Single implementation that trims, rejects blank titles and merges metadata | FIXED (code) |

## Open defects

| ID | Severity | Area | Defect | Next action |
|----|----------|------|--------|-------------|
| OPEN-001 | HIGH | Build/CI | `npx tsc --noEmit` reports 357 errors (was 568), so the CI typecheck step fails | Continue fixing type drift module by module; most remaining errors are model/type mismatches, some hide runtime bugs |
| OPEN-002 | MEDIUM | Responsive | Horizontal overflow at 390px: SQL Lab 320px, AI/ML Lab 307px, Applications 127px, External Profiles 79px, Community 61px, Exams 43px, Jobs 39px, Quiz 30px, Semester 16px | Fix wide tables/toolbars per page |
| OPEN-003 | LOW | Accessibility | AI Tutor page has no `<h1>`; Language Learning has two; one icon-only button without a label is present on every page | Add headings and `aria-label`s |
| OPEN-004 | MEDIUM | Tests | `practice_labs_e2e` ML accuracy assertion is flaky (random iris dataset, failed 1 of 5 runs) | Seed the generator or relax the threshold |
| OPEN-005 | HIGH | AI | All AI features are untested against a real model here: no `GEMINI_API_KEY` in this environment | Re-test with a key configured |
| OPEN-006 | MEDIUM | Architecture | Admin API (39 endpoints, `SUPER_ADMIN` role) exists although the spec says no admin role | Owner decision: keep, disable, or remove |
| OPEN-007 | LOW | Data | The demo student `student@btech.edu` / `Password123!` is seeded with a published password | Owner decision: keep for demos or gate behind env |
| OPEN-008 | MEDIUM | Persistence | Snapshot persistence is single-instance and rewrites ~7MB JSON after changes; not a substitute for Postgres | Plan a real database migration if the app will be deployed |
