# API Verification

793 route handlers across 43 files in `server/api/routes/` (39 of them admin). Mounted at `/api/v1` by `server/api/router.ts`.
Response envelope: `{ success, data }` or `{ success: false, error: { code, message } }` (older route files return `{ success: false, message }`).

## Endpoints exercised (59 checks, `scripts/audit/api-checks.cjs`)
auth: register, login, me, logout · notes: create, list, get, patch, search, delete · flashcards: decks create/get, cards add/review/delete, generate/from-note, generate/from-document · goals: create, get, delete · courses: list, get, enroll, patch, delete, chapters, resources add/delete, custom create/patch · lessons: complete · ai: tutor/context-options, conversations/:id, chat (SSE) · notifications: list · profile: export.
All 59 pass after fixes. Plus the 3 context endpoints and the endpoints each of the 41 pages loads on open (0 failures in the crawl).

## Contract defects found
- Frontend called non-existent `/student/goals`, `/student/notifications`, `/student/progress/summary` (BUG-001).
- Frontend `{ params }` objects were sent as headers (BUG-004).
- Frontend read wrong response fields (`.notes`, `.documents`, `.data` on unwrapped payloads) (BUG-001, BUG-005).
- Error status codes collapsed to 500 in ~20 route files (BUG-012).

## Not yet tested
Documents upload/download, coding/DSA execution, SQL lab, quiz attempts, placements, resumes, research, GitHub, community, jobs, languages, semester command center writes, settings writes.
