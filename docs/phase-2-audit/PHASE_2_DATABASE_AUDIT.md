# Phase 2 Database and Persistence Audit

## How storage works

The app has no SQL database. Each service keeps data in in-memory `Map`s. `server.ts` registers them with
`registerPersistentSource` (`server/db/persistence.ts`), and a JSON snapshot is written to `DATA_SNAPSHOT_PATH` after
every non-GET request that returns a status below 400. The snapshot is reloaded at startup. Phase 2 kept this design,
as the coordinator asked.

"Survives restart" below means a probe wrote the data, the server process was killed and started again on the same
snapshot, and a second probe read the data back. Evidence: `evidence/*-verify-after-restart.txt`, run on 2026-11-05
against `/tmp/p2/snapF.json`.

## Stores used by the 12 pages

| Page | Store (owner object → key) | Owner key | Survives restart | Evidence |
|---|---|---|---|---|
| Coding Lab / Sandbox | `db.codingSessions`, `db.savedCodeSnippets`, `db.codeExecutions`, `db.codeSubmissions` | `student_id` | Yes | batch1 verify "J1 saved program after restart" |
| DSA Lab | `db.dsaProgress` (problems in `db.dsaProblems`, seeded) | student id | Yes | batch1 verify J2; batch5 verify INT |
| SQL Lab | `SqlLabSandboxService.studentDbImages` (new), `queryHistories`, `savedQueries` (new) | student id | Yes | batch1 verify J3 (table rows, saved query, history) |
| AI/ML Lab | `MlLabService.workspaces`, `customDatasets`, `experiments`, `fittedModels`, `predictions` (new) | `student_id` | Yes | batch2 verify (dataset, experiment, trained model still predicts, prediction history) |
| System Design | `db.systemDesignProjects`, `db.systemDesignInterviews`, `db.systemDesignSubmissions`, `db.systemDesignProgress` | `student_id` | Yes | batch5 verify J5 (3 components after restart; interview score) |
| Lab Assistant | `db.labCourses`, `db.labExperiments`, `db.labReports`, `db.labCodeDrafts`, `db.labDoubtHistories`, `db.labManuals` | `student_id` | Yes | batch5 verify J6 (output, observations, report) |
| Viva | Answers and feedback are stored on the experiment (`viva_questions[].student_answer`, `ai_evaluation`) | experiment owner | Yes | batch5 verify J7 |
| Quiz | `db.quizzes`, `db.quizQuestions`, `db.quizAttempts`, `db.quizProgress` | `student_id` | Yes | batch5 verify J8 |
| Exam Preparation | `LearningModulesService.exams` | `student_id` | Yes | batch5 verify J9 |
| Study Planner (sync target) | `LearningModulesService.studyPlans` | `student_id` | Yes | batch5 verify J9 "synced study plan survives restart" |
| GATE | `db.gateStudentProfiles`, `db.gateTopicProgress`, `db.gateQuestionAttempts`, `db.gateTestSessions`, `db.gateBookmarks`, `db.gateStudyTasks` (papers, syllabus, questions and mock tests are seeded) | student id | Yes | batch5 verify J10 |
| Notifications | `db.notifications` | `student_id` | Yes (`db` maps are all registered) | batch5 INT |

## Isolation between students

Each journey creates two synthetic students, A and B, and checks that B cannot read A's data:

- Coding: B gets 403 on A's saved program (batch1).
- SQL: B's database has none of A's tables or saved queries (batch1).
- ML: B gets 404 on A's experiment and cannot predict with or delete A's dataset (batch2).
- System Design: B gets 404 on A's project and interview (batch5 J5).
- Lab: B gets 404 on A's lab (batch5 J6). A client-supplied experiment id can no longer overwrite another student's experiment (`safeExperimentId`, `phase2_batch3.test.ts`).
- Quiz: B gets 404 on A's quiz (`phase2_batch4.test.ts`).
- Exams: B's list contains only B's exam, even when B sends A's `student_id` (batch5 SEC).
- Notifications: B sees none of A's (batch5 INT).
- After the restart, B is still isolated (batch5 verify INT).

## Data integrity fixes

| Fix | Bug |
|---|---|
| SQL Lab runs on SQLite with foreign keys enforced, instead of a regex emulator | P2-004 |
| GATE mock submit no longer records unanswered questions as attempts, which had inflated counts and lowered accuracy | P2-050 |
| GATE time taken uses the server clock; answers after the limit + 120 s are refused | P2-042 |
| Lab reports store real output and observations; GET returns only the requested experiment's report | P2-026, P2-029 |
| Quiz submit sends `score: correct_count` to the event bus (it sent a percentage as a score) | P2-048 |
| Exam topics start WEAK and readiness is computed from confidence, not set to 50 | P2-036 |
| ML preprocessing is fitted on training rows only (no test-set leakage) | P2-013 |

## Limitations

- **Old SQL Lab data is not migrated.** The emulator stored tables under `studentDatabases`; the SQLite images are stored under `studentDbImages`. A student's SQL Lab tables created before Phase 2 do not carry over. Saved queries and history are new.
- **One snapshot file, written whole.** Data written between the last save and a crash is lost, and a large ML dataset makes every save bigger. This is the existing design and was not changed.
- **SQL transactions** must complete within one run. The worker does not keep an open transaction between requests.
- **No schema migrations** exist for the snapshot. Removed fields (for example `estimated_gate_score`) can still appear in old snapshots and are ignored by the new UI.
