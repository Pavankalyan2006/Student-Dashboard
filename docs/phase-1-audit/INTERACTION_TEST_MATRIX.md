# Phase 1 Interaction Test Matrix

Columns:
- **How**: B = browser (Playwright, synthetic student), H = HTTP with students A/B, U = unit or integration test.
- **Result** uses PASS / FAIL / PARTIAL / BLOCKED / NOT IMPLEMENTED / NOT APPLICABLE. A result is PASS only if the interaction was exercised and its effect was checked, either in stored data or in a follow-up read.

| Page | Interaction | How | Result |
|---|---|---|---|
| Dashboard | Load with a new student: every widget shows real or empty data (no invented values) | B, H | PASS |
| Dashboard | AI hero question box navigates to AI Tutor | B | PASS |
| Dashboard | Widget links (continue learning, flashcards, doubts, planner) | B | PASS |
| Semester | Setup wizard saves subjects and milestone dates | B, H | PASS |
| Semester | Add or edit subject, event, slip-test score, config | H, U | PASS |
| Semester | Refresh stream, recovery, readiness tabs | B | PASS |
| Semester | Failed request shows an error, not sample data | B | PASS |
| AI Tutor | New, rename, delete and search conversation | B, H | PASS |
| AI Tutor | Send message (no model: reply says AI unavailable) | B, H | PASS; the model path is BLOCKED |
| AI Tutor | Difficulty and mode selectors change state | B | PASS |
| AI Tutor | Attach file (uploads to Documents and grounds the chat) | B | PASS |
| AI Tutor | Generate quiz or flashcards (no model: 503 and toast) | H, U | PASS; the model path is stub-tested |
| AI Agent | Multi-step plan: real tool data, unrun steps failed with a reason | B, U | PASS; the model path is BLOCKED |
| Courses | Search, filter, grid/list toggle | B | PASS |
| Courses | Enroll, lesson complete, progress, bookmark, archive | H, U | PASS |
| Courses | Private course of another student (403) | H, U | PASS |
| Notes | Create, edit (version recorded), favourite, delete, search, tag filter | B, H | PASS |
| Notes | Summarize, flashcards, quiz, explain (no model: 503) | B, H, U | PASS; the model path is stub-tested |
| Documents | Upload (validation), list, search, filter, sort, download, delete | B, H, U | PASS |
| Documents | Summary (extractive, labelled) and chat (extractive passage with citation) | H, U | PASS; the model path is BLOCKED |
| Documents | New version upload validation | U | PASS |
| Doubt Solver | Submit doubt (empty 400; saved OPEN without a model), list, open | B, H, U | PASS; the model path is stub-tested |
| AI Flashcards | Create deck, add card, edit, delete, filters, sort, search | B, H | PASS |
| AI Flashcards | Generate from topic, course, note or document (no model: 503) | H, U | PASS; the model path is stub-tested |
| Spaced Revision | Start review of the due queue, rate cards, next review moves | B, H | PASS |
| Spaced Revision | Invalid or missing rating (400) | U | PASS |
| Study Planner | Create plan (no hardcoded task) | B | PASS |
| Study Planner | View tasks, add task (validation), mark done or undone, hours | B, H, U | PASS |
| Study Planner | Today view includes overdue; schedule review requires a date | U | PASS |
| Study Planner | Link plan to Goals | — | NOT IMPLEMENTED (WF9 in the earlier audit) |
| Language | Explore catalog (150), search, region filter | B, U | PASS |
| Language | Enroll, dashboard, lesson view, lesson complete (fake id 404) | B, H, U | PASS |
| Language | Vocabulary review (SM-2), bookmark, invalid rating 400 | H, U | PASS |
| Language | Writing Lab submit (no model: 503, text kept) | B, H, U | PASS; the model path is stub-tested |
| Language | AI Partner start and send (no model: 503, text kept, session unchanged) | B, H, U | PASS; the model path is stub-tested |
| Language | Translator (auth required, no model: 503) | H, U | PASS; the model path is stub-tested |
| Language | Quiz submit and scoring, bad answers 400 | H, U | PASS |
| Language | Speech playback and recognition | — | NOT TESTED (needs browser audio APIs and a microphone) |
| All | Layout at 360–1440px | B | PASS (`RESPONSIVE_TEST_REPORT.md`) |
