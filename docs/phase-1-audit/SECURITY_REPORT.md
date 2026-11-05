# Phase 1 Security Report

Two synthetic students, A and B, were used throughout. No real student data was read or changed, no secrets were printed, and nothing was deployed.

## Authentication
- Unauthenticated GET returns 401 on `/notes`, `/semester/overview`, `/documents`, `/flashcards/decks`, `/study-planner/plans`, `/doubts`, `/ai/conversations`, `/dashboard` and `/languages/enrollments/my`.
- A forged `x-student-id` header returns 401, and so does a malformed bearer token.
- `POST /languages/translate` was open to anonymous callers, who could spend AI quota through it. It now requires sign-in (P1-041).
- The public catalog routes stay open by design and return no student data: language catalog, language paths, course catalog and categories.

## Student identity
- Every Phase 1 route takes the student from the verified token (`req.user.userId`).
- A search of the Phase 1 route files for `req.body|query|params.student_id/studentId/userId` found nothing.

## Isolation: student B against A's records
| Page | Result |
|---|---|
| Semester Command Center | Per-student store. Before P1-001 (P0) one semester was shared by everyone. |
| Courses | B gets 403 enrolling in or tracking A's private course. Before P1-020 (P0) this was allowed. |
| Notes | 403 on read, edit, delete, favourite, versions and AI actions. |
| Documents | 403 on get, download, file and delete. B's list is empty. |
| AI Tutor conversations | 403. |
| Flashcard decks and cards | 404. |
| Study plans, doubts | Not listed for B. |
| Language conversations | 404 when B posts to A's session. Language writing is not listed for B. |
| After restart and re-login | B still sees none of A's records (`scripts/audit/phase1-persistence.cjs`). |

## Input handling
Uploads:
- Extension allowlist, with .exe and .html rejected.
- Files must be between 1 byte and 50 MB, measured on the actual bytes.
- Only the base name of a file is kept.
- The same checks apply to a new version of an existing document (P1-024..027).

Validation now returns 400 for:
- flashcard ratings and vocabulary ratings;
- study-plan dates and durations;
- quiz answers;
- language lesson ids, which must be in the curriculum.

No `dangerouslySetInnerHTML` is used in the Phase 1 feature folders.

## Open items
- None at P0 or P1.
- P1-O06 (drawer focus) is accessibility, not security.
