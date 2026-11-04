# End-to-End Tests

## Automated scripts (in `scripts/audit/`)
Start the server (`npm run dev`, or `PORT=3100 DATA_PERSISTENCE=off npx tsx server.ts` for a throwaway run), then:

- `BASE=http://localhost:3000 node scripts/audit/api-checks.cjs` — 59 API checks with two synthetic students (A and B).
- `BASE=… ROUTES=/dashboard,/notes node scripts/audit/crawl-routes.cjs` — opens each route in Chromium as a fresh student; records console errors, failing `/api` calls, 404/crash markers and a screenshot.
- `BASE=… ROUTES=… node scripts/audit/mobile-check.cjs` — 390×844 viewport: horizontal overflow, `<h1>` count, unlabeled buttons, images without alt.

## Journeys executed
| Journey | Steps | Result |
|---------|-------|--------|
| Registration → onboarding → dashboard | register via API, complete onboarding, open `/dashboard` | PASS |
| Auth edge cases | duplicate email, invalid email, short password, wrong password, no token, garbage token, expired token, logout | PASS |
| Notes lifecycle | create → list → edit title → content preserved → search → delete → 404 | PASS (after BUG-006) |
| Course learning | list catalog → enroll → duplicate enroll → open course → complete lesson → progress 8% | PASS |
| Flashcards | create deck → add card → review → reopen | PASS |
| Data isolation (A vs B) | notes, decks, cards, goals, course progress, course resources, custom courses, demo conversation | PASS (after BUG-007/008/012) |
| Restart persistence | register, create note and deck, SIGTERM, restart, log in, read both | PASS (after BUG-010) |
| AI Tutor without key | send message over `/ai/chat` SSE → conversation created and listed | PASS for plumbing; AI answer BLOCKED (no key), now labelled as unavailable |

Not yet executed: document upload/download, code execution, SQL sandbox, quiz attempt, GitHub OAuth, research provider search, community posting.
