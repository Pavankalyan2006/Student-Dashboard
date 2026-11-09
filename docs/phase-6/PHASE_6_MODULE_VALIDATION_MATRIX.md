# Phase 6 Module Validation Matrix

Two kinds of evidence, both synthetic (Stage 1):

- **API**: `scripts/pilot/phase6-synthetic-journeys.cjs`, run on 2026-11-09 against a production build. 70 checks:
  **64 PASS, 6 BLOCKED, 0 FAIL** (`evidence/stage1-api-journeys.json`).
- **UI**: `scripts/pilot/phase6-ui-walkthrough.cjs`. Every sidebar page plus Settings, Sandbox and Pilot Feedback
  (46 pages) at 390×844 and 1366×900 for a freshly registered student. **92 of 92 page loads had no uncaught page error,
  API 5xx, error screen or horizontal overflow** (`evidence/stage1-ui-walkthrough.json`).

"Awaiting students" means real-student use is needed to judge it. A page that loads cleanly is not proof that it is easy to use.

| Area | Module | API workflow check | UI load (390 / 1366) | Profile-consistent | Status | Awaiting students |
|---|---|---|---|---|---|---|
| A | Dashboard | profile block matches the profile | ✓ / ✓ | PASS | PASS | Yes |
| A | Semester Command Center | semester change reflected | ✓ / ✓ | PASS | PASS | Yes |
| A | Courses | recommendations (11 items), open, enroll | ✓ / ✓ | PASS | PASS | Yes |
| A | Notes | create, read, isolation | ✓ / ✓ | n/a | PASS | Yes |
| A | Documents | upload a text file | ✓ / ✓ | n/a | PASS | Yes |
| A | Study Planner | not exercised by API in Phase 6 | ✓ / ✓ | n/a | NOT TESTED (workflow) | Yes |
| A | Learning Goals | create, milestone → 50%, B cannot read | ✓ / ✓ | n/a | PASS | Yes |
| B | AI Tutor / AI Agent | streams an honest "AI unavailable" message | ✓ / ✓ | context PASS | BLOCKED (no Gemini key) | Yes |
| B | Doubt Solver | – | ✓ / ✓ | – | BLOCKED (AI) | Yes |
| B | AI Flashcards | generation 503 AI_UNAVAILABLE | – | – | BLOCKED (AI) | Yes |
| B | Flashcards (manual) / spaced revision | deck, card, review | ✓ / ✓ | n/a | PASS | Yes |
| B | Language Learning | – | ✓ / ✓ | – | NOT TESTED (workflow); AI parts BLOCKED | Yes |
| B | Knowledge Base / RAG | ask over own document → extractive passages with 1 citation; B gets 403 | ✓ / ✓ | not personalised (Phase 5) | PASS (retrieval) / BLOCKED (AI answer) | Yes |
| C | Coding Lab | Python run → `45`, 116 ms, namespace isolation; save; isolation | ✓ / ✓ | – | PASS | Yes |
| C | DSA Lab, Sandbox, System Design, Lab Assistant | – | ✓ / ✓ | – | UI PASS; workflows covered by Phase 2 suites | Yes |
| C | SQL Lab | – | ✓ / ✓ | – | UI PASS; isolation in Phase 2 suite | Yes |
| C | AI/ML Lab | CSV upload, Decision Tree trained, accuracy 0.92 on synthetic data, B cannot see dataset | ✓ / ✓ | – | PASS | Yes |
| D | Quiz | a new student has no quiz without AI; API-created quiz scored server-side (1/2), progress updated | ✓ / ✓ | – | PASS (scoring) / BLOCKED (creation without AI, P6-007) | Yes |
| D | Viva, Exam Preparation, GATE | – | ✓ / ✓ | – | UI PASS; workflows in Phase 2 suites | Yes |
| D | Mock Interviews / Placement | – | ✓ / ✓ | context PASS | UI PASS; AI feedback BLOCKED | Yes |
| E | Projects | – | ✓ / ✓ | – | UI PASS (Phase 3 suites) | Yes |
| E | GitHub / Git Lab | – | ✓ / ✓ | – | GitHub live BLOCKED (no OAuth app, no network); Git Lab UI PASS | Yes |
| E | Research | project created; paper search 0 results (CURATED fallback, live providers unreachable) | ✓ / ✓ | – | PASS (create) / BLOCKED (live search) | Yes |
| E | Career | recommendations use profile skills (after P6-002) | ✓ / ✓ | PASS | PASS | Yes |
| E | Resume | created with profile skills pre-filled | ✓ / ✓ | PASS | PASS | Yes |
| E | Jobs Discovery | 0 listings; none are invented | ✓ / ✓ | – | BLOCKED (no live feed reachable) | Yes |
| E | Applications Tracker | save, isolation | ✓ / ✓ | – | PASS | Yes |
| E | Connected Platforms / External Profiles / Sync | – | ✓ / ✓ | – | UI PASS; live verification BLOCKED (network) | Yes |
| F | Community Hub / Q&A | post, view, answer, B cannot edit A's question (403), no private fields | ✓ / ✓ | PASS | PASS | Yes |
| F | Discussions / Shared Resources | – | ✓ / ✓ | – | UI PASS | Yes |
| F | Notifications | A notified of B's answer; preferences saved | ✓ / ✓ | – | PASS | Yes |
| G | Student Profile | see PHASE_6_PROFILE_VALIDATION.md | ✓ / ✓ | – | PASS | Yes |
| G | Unified Progress | – | ✓ / ✓ | – | UI PASS | Yes |
| G | Settings | visibility PRIVATE persists after login | ✓ / ✓ | – | PASS | Yes |
| G | Pilot Feedback (new) | submit, isolation, withdraw | ✓ / ✓ | – | PASS | Yes |

## Page load times (Stage 1 synthetic, local server, headless Chromium, network idle)

| Width | Pages | Median | p90 | Max |
|---|---|---|---|---|
| 390×844 | 46 | 1.06 s | 1.31 s | 2.05 s (`/languages`) |
| 1366×900 | 46 | 0.96 s | 1.09 s | 1.80 s (`/courses`) |

These are single-run timings on one machine with no real network latency. See PHASE_6_PILOT_PERFORMANCE_REPORT.md.
