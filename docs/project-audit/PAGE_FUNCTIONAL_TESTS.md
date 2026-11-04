# Page Functional Tests

Render test = open in Chromium (1366×900) as a new student with onboarding complete;
record console errors and failing `/api` responses. Mobile test = 390×844.

## Render results (41 sidebar routes + 9 aliases)
- Before fixes: 41/41 pages had 3 failing API calls; AI Tutor also had a 500 and a 403; every page logged a CSP error for the KaTeX stylesheet.
- After fixes: 41/41 sidebar pages and aliases `/ai-tutor`, `/revision`, `/viva`, `/git`, `/rag`, `/sandbox`, `/sync`, `/internships`, `/placement-preparation` render with no page errors and no failing API calls.
- `/machine-learning` and `/ml` show the app's 404 page (no separate Machine Learning page exists).

## Functional results by page (API-level unless noted)
| Page | Tests | Result |
|------|-------|--------|
| Notes | create, empty validation, list, title-only edit keeps content, blank title rejected, search, delete, deleted→404, B cannot read/edit/delete | PASS |
| Courses | catalog (108), enroll, duplicate enroll (idempotent), open course with chapters, complete lesson, progress 8%, B sees 0%, attach/hide/delete resource, B cannot change catalog course, custom course create/edit/owner-only | PASS |
| Flashcards | create deck (title+subject required), add card, review, reopen, B cannot read deck / delete card, missing note_id → 400 | PASS |
| Goals | create, B read/delete → 403 | PASS |
| AI Tutor | context options, SSE chat creates and lists conversation, empty message → 400, demo conversation → 403 | PASS (AI answer BLOCKED: no key) |
| Profile | export | PASS |
| Notifications | list | PASS |
| All other pages | render only | PARTIAL |

## Mobile (390px) horizontal overflow
SQL Lab 320px · AI/ML Lab 307px · Applications 127px · External Profiles 79px · Community 61px · Exams 43px · Jobs 39px · Quiz 30px · Semester 16px. All others: none. (OPEN-002)
