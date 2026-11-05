# Cross-Module Integration

Batch 2 checkpoint, 2026-11-05, branch `claude/project-thread-g85yyh`.

Method: a local API server (`PORT=3100 DATA_PERSISTENCE=off npx tsx server.ts`) with two
freshly registered synthetic students, A and B. Each workflow was driven through the
real HTTP API as A, the downstream module was read back as A, and the same read was
repeated as B to check isolation. No production data, no demo account data was changed.
AI provider has no key in this environment, so every AI step runs on the provider's
"AI unavailable" path (BLOCKED for real model output).

| # | Workflow | Steps exercised | Result before | Fix | Status |
|---|----------|-----------------|---------------|-----|--------|
| 1 | Profile → Dashboard | `PATCH /profile` branch, semester, college → `GET /dashboard` | Dashboard kept onboarding values; dashboard numbers were hardcoded | BUG-024, BUG-021 | PASS |
| 2 | Semester → Courses | Save syllabus, enroll subject → `/courses` enrolled list; B lists subjects | B saw A's private subject as enrolled | BUG-023, BUG-035 | PASS |
| 3 | Courses → Notes | Manual note with `course_id`, generated note from course → notes filtered by course; B reads → 403/empty | `course_id` ignored on manual notes; generation saved a template note with AI off | BUG-034, BUG-033 | PASS |
| 4 | Courses → AI Tutor | Enroll → `GET /ai/tutor/context-options` | Only catalog courses, enrollment not shown | BUG-034 | PASS (AI answer BLOCKED) |
| 5 | Documents → Knowledge Base | Upload text document (data URL) → KB search returns its chunk; B search empty | Worked | — | PASS |
| 6 | Knowledge Base → RAG answer | KB ask / document chat | Reported 88% confidence and stock concepts with AI off | BUG-033 | PASS (extractive passage, AI BLOCKED) |
| 7 | Notes → Flashcards | Deck from note → cards created | Worked (fallback card builder) | — | PASS (AI BLOCKED, fallback cards) |
| 8 | Flashcards → Spaced Revision | Review cards → due list, stats | GOOD counted as HARD in stats | BUG-036 | PASS |
| 9 | Study Planner → Goals | Planner task and goal APIs inspected | No link between the two modules in code or UI | — | NOT IMPLEMENTED |
| 10 | Quiz → Unified Progress | Quiz attempt → `/progress` quiz subsystem | Subsystem showed constants (4 quizzes, 88%) | BUG-022, BUG-026 | PASS (code path; no seeded quiz is attemptable by a new student) |
| 11 | Coding Lab → Submission History | Run code → executions history and progress | Worked | — | PASS |
| 12 | DSA → Progress | Submit solution → `/progress/dsa`, agent tool | Topic counts hardcoded in agent tool | BUG-038 | PASS |
| 13 | SQL Lab → Query History | Run queries incl. invalid ones → history; B empty | `SELECT 1` fake row, UPDATE/DELETE fake success | BUG-032 | PASS |
| 14 | AI/ML Lab → Experiment History | Train → experiment persisted, predict; B empty | No model was fitted; metrics invented | BUG-027 | PASS |
| 15 | Projects → Resume | Create project with milestones → import into resume twice | Invented resume defaults; import duplicated, bullets generic | BUG-029 | PASS |
| 16 | GitHub → Projects | Connect, import repos, link to project | Invalid token still "connected" with demo repos | BUG-031 | BLOCKED live (no network to api.github.com); code path PASS against mocked GitHub API in tests |
| 17 | Connected Platforms → Sync | Connect LeetCode username → sync | Reported success, logged invented solves | BUG-030 | PASS (honest error: live sync not available, status ERROR); live sync NOT IMPLEMENTED |
| 18 | Career → Placement | Placement readiness after coding/DSA activity | Coding readiness fixed at 75% / "12 solved" | BUG-037 | PARTIAL (other readiness dimensions not exercised end to end) |
| 19 | Jobs → Applications | Track job → `/applications`; B empty | Worked | — | PASS |
| 20 | Mock Interviews → Career Progress | Complete session → placement progress | Empty session scored 60 | BUG-037, BUG-022 | PASS |
| 21 | Notifications → Relevant page | Goal reminder notification → `/goals/:id` route exists; B empty | Worked | — | PASS |

Totals: 18 PASS (WF4, 6, 7 on the AI-unavailable path; WF17 passes as an honest
"not available" error, live third-party sync is NOT IMPLEMENTED), 1 PARTIAL (WF18),
1 BLOCKED (WF16 live GitHub), 1 NOT IMPLEMENTED (WF9).
