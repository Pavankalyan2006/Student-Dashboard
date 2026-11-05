# Phase 2 Bug Tracker

Severity:
- **P0**: security breach or data exposure.
- **P1**: a main function is broken or gives false results.
- **P2**: a function is partly broken or misleading.
- **P3**: a minor defect.
- **P4**: cosmetic or accessibility polish.

Status: FIXED (with evidence), OPEN, BLOCKED. All 60 bugs below are FIXED. Items that were observed but are outside the 12 pages are listed at the end and are OPEN.

Evidence abbreviations:
- **b1, b2, b5**: `scripts/audit/phase2-batch{1,2,5}.cjs` output in `evidence/`.
- **sb**: `evidence/code-sandbox.txt`.
- **T-labs, T-ml, T-b3, T-b4**: `src/tests/phase2_labs.test.ts`, `phase2_ml_lab.test.ts`, `phase2_batch3.test.ts`, `phase2_batch4.test.ts`.
- **resp**: `phase2-responsive.json`.

## Summary

| Severity | Count | IDs |
|---|---|---|
| P0 | 2 | P2-001, P2-002 |
| P1 | 15 | P2-003 to 006, 013, 014, 020 to 023, 033 to 035, 056, 057 |
| P2 | 22 | P2-007 to 009, 015, 016, 024 to 028, 036 to 042, 048, 050, 052, 055, 058 |
| P3 | 19 | P2-010 to 012, 017 to 019, 029 to 032, 043 to 047, 049, 051, 059, 060 |
| P4 | 2 | P2-053, P2-054 |

Total: 60 (2 P0, 15 P1, 22 P2, 19 P3, 2 P4).

## Bugs

| ID | Sev | Page | Component | Description | Reproduction | Root cause | Fix | Test evidence |
|---|---|---|---|---|---|---|---|---|
| P2-001 | P0 | Coding Lab, Sandbox, DSA, Lab Assistant | `server/execution/sandbox.ts` | Student code ran as the server user with full access to the app directory, environment secrets, the network and other processes | Run `import os; print(os.listdir('/home/claude/Student-Dashboard'))` or read `.env` | `child_process.spawn` with no isolation | New `isolation.ts`: Linux user, mount, PID and network namespaces; app, home and /tmp hidden; `nobody` uid when root; ulimits on CPU, memory, files and processes; whole-tree kill on timeout. Production refuses unisolated runs unless `CODE_SANDBOX_ALLOW_UNISOLATED=true` | sb: app dir not found, /etc/shadow denied, network unreachable, 1 GB → MEMORY_LIMIT, infinite loop → TIMEOUT, fork bomb contained, `kill(1)` hits own namespace; T-labs |
| P2-002 | P0 | DSA Lab | `routes/dsa.ts` | `POST /dsa/problems/:id/run` and `POST /dsa/tutor/chat` worked without signing in, so anyone could run code on the server | `curl -X POST /api/v1/dsa/problems/x/run` with no token | `requireAuth` missing on two routes | Added `requireAuth` | T-labs "running code and the DSA tutor require sign-in" |
| P2-003 | P1 | DSA Lab | `routes/dsa.ts` | Problem responses included hidden test cases with expected outputs | `GET /dsa/problems/dsa_top150_001` → `hidden_test_cases` | The whole problem object was returned | Strip hidden tests from list and detail; submit results do not echo hidden I/O | b1 "DSA hidden tests not exposed", "J2 hidden test I/O not in submit response"; T-labs |
| P2-004 | P1 | SQL Lab | `sqlLabSandboxService.ts` | The SQL "engine" was regex-based and gave wrong results for joins, aggregates, constraints and many valid statements | Run a JOIN with GROUP BY, or insert a row that violates a foreign key | A hand-written emulator | Replaced with SQLite (`sql.js`) in a worker (`sqlWorker.cjs`, `sqlEngine.ts`): per-student databases, foreign keys on, 3 s limit with worker restart, 500-row cap | b1 J3; T-labs |
| P2-005 | P1 | Coding Lab | `sandbox.ts`, `CodeOutputPanel` | Every run showed a random `memory_kb` value | Run any program twice and compare memory | `Math.random()` | Field removed; the isolation level is shown instead | T-labs "no invented memory figure" |
| P2-006 | P1 | Coding Lab | `services/codeAi.ts` | AI explain, debug, hints and review returned fixed template text when no model was configured | Use any AI action with no `GEMINI_API_KEY` | Template fallbacks | 503 `AI_UNAVAILABLE` via `requireModelText` / `parseModelJson` | `coding.test.ts` "returns 503 AI_UNAVAILABLE instead of template output" |
| P2-007 | P2 | SQL Lab | `SqlLabPage.tsx` | When the API failed, the page showed a fake `university_db` with 4 tables | Stop the server and open `/sql-lab` | `.catch(() => [{ name: 'university_db', table_count: 4 }])` | Shows the error instead | browser |
| P2-008 | P2 | Coding Lab | `languages.ts`, `LanguageSelector` | Languages were offered even when the server had no compiler or runtime for them | Pick a language whose toolchain is missing | Static list | Availability probed per language; unavailable ones are marked and refused | T-labs "languages report whether the server can actually run them"; sb "languages ..." |
| P2-009 | P2 | Coding Lab | `CodeEditor` | The editor stayed blank when the Monaco CDN could not be reached | Block `cdn.jsdelivr.net` | Monaco loader only | `ResilientCodeEditor.tsx` falls back to a textarea | browser `/tmp/p2/ui-editor.cjs` |
| P2-010 | P3 | Coding Lab | `EditorToolbar` | "Format" reported success for languages it cannot format | Click Format on Python | Toast without a check | Formats JavaScript; says formatting is not available otherwise | browser |
| P2-011 | P3 | Coding Lab | `EditorToolbar` | "Share" copied a link that opened a blank editor | Share an unsaved program | Copied `location.href` regardless | Only saved sessions and problems can be shared | browser |
| P2-012 | P3 | Coding Lab | `CodingLabPage` | A new student was shown "Python, C++" as languages used | Open `/coding` as a new student | `|| ['python', 'cpp']` fallback | Shows only real languages | browser |
| P2-013 | P1 | AI/ML Lab | `mlLabService.ts` | Random forest, decision tree and logistic regression were silently replaced by k-NN or linear regression, and the preprocessing settings were ignored | Train a random forest and compare with k-NN: identical | No real implementations | `mlAlgorithms.ts`: CART, bagged forest, softmax logistic regression; impute, scale and one-hot fitted on training rows only; seeded split; unsupported models → 400 | T-ml (4 tests); b2 |
| P2-014 | P1 | AI/ML Lab | `mlLabService.ts` | Any student could read another student's experiment and predict with their model | Student B: `GET /ml-lab/experiments/<A's id>` | No owner check | Owner checks → 404 | b2 "Student B cannot read / predict" |
| P2-015 | P2 | AI/ML Lab | `mlLabService.parseCsv` | Quoted commas split fields; no size, row or column limits; ragged rows accepted | Upload `"a,b",1` or a 50 MB CSV | `split(',')` | RFC 4180 parser; 5 MB, 20,000 rows, 100 columns; header and width checks | b2 (5 checks) |
| P2-016 | P2 | AI/ML Lab | predict | Blank or non-numeric inputs produced a prediction | Predict with an empty field | No validation | Required, numeric and known-category checks → 400 | b2 "Invalid prediction input rejected" |
| P2-017 | P3 | AI/ML Lab | `MlLabPage` | Uploaded datasets could not be removed, and predictions were not kept | Upload a CSV and try to remove it | Not implemented | `DELETE /ml-lab/datasets/:id`, `GET /ml-lab/predictions`, UI | b2 |
| P2-018 | P3 | AI/ML Lab | `MlLabPage` | The experiment name stayed on the first dataset and model after the student changed them | Change the dataset and look at the name | Name set once | Name follows the selection until edited | browser `/tmp/p2/ui-b2.cjs` |
| P2-019 | P3 | AI/ML Lab | `getDatasetById` | An unknown dataset returned 400 | `GET /ml-lab/datasets/nope` | Generic error | `NotFoundError` → 404 | T-ml |
| P2-020 | P1 | System Design | `systemDesignService`, `InterviewPracticeModal` | Interview score was `Math.random()*15+80` with a fixed "STRONG_HIRE" debrief | Finish an interview with empty notes | Random score | Per-step keyword checklist of the student's notes, shown as coverage and "not an interviewer's hiring decision" | b5 J5; T-b3 |
| P2-021 | P1 | System Design | AI tutor | The AI tutor returned one of six fixed texts | Ask anything with no key | Canned responses | AIService with the student's diagram; 503 without a model | b5 J5; T-b3 |
| P2-022 | P1 | Lab Assistant, Viva | `routes/learningModules.ts` | A new student saw the demo student's labs, and viva answers were scored by length | Register and open `/labs` | Legacy `/labs` routes registered first, falling back to `std_demo_1` | Legacy routes removed; legacy service methods delegate to the owner-scoped service | T-b3 "a new student sees no labs"; b5 J6 |
| P2-023 | P1 | Lab Assistant | `labAssistant.ts` | A client-supplied experiment id let one student overwrite another's experiment | Student B posts an experiment with A's id | The id was trusted | `safeExperimentId` reuses an id only for the same student and lab | T-b3 |
| P2-024 | P2 | System Design | interview | Steps could be answered in any order or skipped | Post FINAL_SUMMARY first | No order check | Steps must follow the current step | T-b3 |
| P2-025 | P2 | Viva | `labAssistant.ts` | "Generate viva questions" always returned 404 | `POST .../viva/generate` | `/viva/:qId` matched first | `next()` when `qId === 'generate'` | b5 J7 (now 503 without a model); T-b3 |
| P2-026 | P2 | Lab Assistant | report | The report showed the expected output as the actual output and a default "completed successfully" conclusion | Generate a report without running code | Fallback values | Only real output; empty conclusion stays empty | b5 J6; T-b3 |
| P2-027 | P2 | Lab Assistant | `labAssistantService` | Manual extraction, viva question generation and doubts returned heuristic text when the model was missing | Upload a manual with no key | Silent fallbacks | 503 or 502; nothing is saved on failure | T-b3 |
| P2-028 | P2 | Viva | `evaluateVivaAnswer` | A keyword heuristic was presented as AI feedback | Answer a viva question with no key | No labelling | Model feedback when configured; otherwise `method: KEYWORD_MATCH`, labelled in the UI | b5 J7; T-b3 |
| P2-029 | P3 | Lab Assistant | report GET | Opening a report for an experiment with none returned another experiment's report | GET the report of a new experiment | `|| reports[0]` | 404 | b5 J6 "reopen the saved report"; T-b3 |
| P2-030 | P3 | System Design | `ArchitectureEvaluator` | Consistency and cost feedback were the same for every diagram | Evaluate two different diagrams | Fixed strings | Conditional on the components present | `system_design_master.test.ts` |
| P2-031 | P3 | Lab Assistant | `getLabs` / `LabDashboard` | Lab progress always showed 0 | Complete an experiment | Experiments not returned with labs | Experiments and counts returned | b5 INT "experiments embedded with counts" |
| P2-032 | P3 | Lab Assistant | code run | A run was marked failed whenever stderr had text, such as warnings | Print to stderr in a passing program | Status from stderr | Status from `result.status` | T-b3 |
| P2-033 | P1 | Quiz | `quizAttempt.getAttemptReview` | Correct answers could be read in the middle of an attempt | Start a quiz, then GET the review | No status check | Review only after COMPLETED (400 before) | b5 J8; T-b4 |
| P2-034 | P1 | GATE | `database.ts`, dashboard | An "estimated GATE score" (480 for a new student) was computed from invented constants | Open GATE as a new student | Made-up formula and frontend fallbacks 500/520 | Removed; raw marks only | b5 J10; T-b4 |
| P2-035 | P1 | Exam Preparation | `ExamPreparationPage` | Every exam showed the same "AI-Synthesized" DBMS revision plan and a "Normalization carries ~25%" insight | Create an OS exam | Hardcoded content | Plan built from the exam date, prep hours and topic confidence; insight names the weakest topic | browser `/tmp/p2/ui-b4.cjs` |
| P2-036 | P2 | Exam Preparation | `createExam` | Missing date and syllabus were filled with +14 days and placeholder units; confidence alternated; readiness started at 50 | Create an exam with only a title | Defaults | Date and syllabus required; topics WEAK; readiness computed | b5 J9; T-b4 |
| P2-037 | P2 | Quiz | `routes/quiz.ts` | Any student could open another student's quiz | Student B: `GET /quiz/<A's id>` | No owner check | `getVisibleQuiz` → 404 | T-b4 |
| P2-038 | P2 | GATE | default profile | A new profile had exam date 2026-02-07, target 75 and AIR goal "< 500" | Open GATE as a new student | Seeded defaults | Empty until the student sets them | b5 J10 "no invented goals"; T-b4 |
| P2-039 | P2 | GATE | `routes/gate.ts` | The question bank sent answer keys and explanations | `GET /gate/questions` | Raw objects returned | `deliverQuestion` strips them; key returned after answering | b5 J10; T-b4 |
| P2-040 | P2 | GATE | practice | Submitting an empty MCQ answer gave negative marks | Attempt with no option | No validation | 400 | T-b4 |
| P2-041 | P2 | GATE | AI tutor | Called Gemini directly with hardcoded formulas and a canned fallback | Ask the tutor with no key | Separate client | AIService; 503 without a model | T-b4 |
| P2-042 | P2 | GATE | mock test | The time limit existed only in the browser; time taken came from the client | Send answers after the limit | No server check | Server enforces limit + 120 s; server clock | T-b4 "answers sent after the time limit are refused" |
| P2-043 | P3 | Quiz | `/quiz/generate` | The new quiz was returned with answers | Inspect the generate response | Full objects | Delivery format | T-b4 |
| P2-044 | P3 | Quiz | `quizGeneration` | An AI quiz with zero valid questions was saved | Model returns only invalid questions (stub) | No check | 502 | T-b4 |
| P2-045 | P3 | GATE | revision | Flagged weak topics showed a made-up 40% accuracy | Flag a topic | Default value | `accuracy: null`, shown as "Flagged by you" | browser |
| P2-046 | P3 | GATE | results | Marks were clamped at 0 although GATE allows negative totals | Answer every MCQ wrong | `Math.max(0, …)` | Raw marks | T-b4 |
| P2-047 | P3 | Exam Preparation | practice button | "Take Mock Exam" went to a route that does not exist | Click it | Dead link | Opens Quiz create with the topic | browser |
| P2-048 | P2 | Quiz, Notifications | `eventBus.ts` | Notification read "You scored 50/3", mentioned a revision queue that does not exist, and linked to a missing route | Submit a quiz and open notifications | Percentage passed as score; wrong link | "You answered X of Y correctly (P%)", link `/quiz/:id/result`; submit sends `score: correct_count` | b5 J8 |
| P2-049 | P3 | DSA, Notifications | `eventBus.ts` | "+20 skill points" (there is no points system); link to `/dsa` | Solve a problem | Fixed text | No points; link `/dsa/problem/:id` | b5 INT |
| P2-050 | P2 | GATE | mock submit | Unanswered questions were recorded as wrong practice attempts, inflating counts and lowering accuracy | Submit a mock with nothing answered; open the dashboard | All questions recorded | Only answered questions recorded | b5 J10; T-b4 |
| P2-051 | P3 | All | `errorHandler.ts` | A body over 25 MB or malformed JSON returned 500 | POST 26 MB to `/exams` | Parser errors not mapped | 413 and 400 | b5 SEC |
| P2-052 | P2 | Lab Assistant | manual upload | Any file type and size was accepted | Upload a 15 MB `.exe` | No checks | PDF, DOCX, TXT, MD; 10 MB | b5 SEC (2 checks) |
| P2-053 | P4 | Lab Assistant | `LabDashboard` | 1 px horizontal overflow at 360 px | Open `/labs` at 360 px | Fixed-width element | Layout fix | resp: 0 overflow |
| P2-054 | P4 | ML, SQL, DSA, Quiz, Coding | form controls | 49 inputs and buttons had no accessible name | Run the sweep | Missing labels | aria-labels added | resp: 0 unlabelled |
| P2-055 | P2 | Exam Preparation | revision plan | The plan could not be sent to the Study Planner (J9 "Sync with Study Planner") | Look for a sync action | Not implemented | "Add to Study Planner" creates an EXAM plan with one task per revision day | b5 J9 (create and restart); `evidence/ui-exam-planner-sync.txt` |
| P2-056 | P1 | DSA Lab | `dsaTutorService.ts`, `DSAAITutor`, `DSAAiTutorPage` | With no model, the AI tutor answered with a long template ("High-fidelity deterministic pedagogical response") presented as tutoring; on any error the UI added another canned reply | Ask the tutor anything with no `GEMINI_API_KEY` | Service fallback plus a frontend `catch` that invented an answer | Service returns 503 `AI_UNAVAILABLE` (502 on empty output); the UI shows the real error and points to the problem's hints | `dsa.test.ts` "returns 503 AI_UNAVAILABLE instead of a template answer" and "answers with the model output" |
| P2-057 | P1 | Quiz | `quizAttempt.explainAnswer` | `POST /quiz/explain-answer` returned the correct answer for any question id, in the middle of an attempt and for other students' quizzes | Start a quiz, then POST `{question_id}` to `/quiz/explain-answer` | No owner or status check | 404 for another student's quiz; 400 until the student has a submitted attempt | T-b4 (the test fails without the fix: "expected 200 to be 400") |
| P2-058 | P2 | GATE | `GET /gate/bookmarks` | Bookmarking a question before answering returned its answer key and explanation | Bookmark a question, then GET bookmarks | Bookmarks returned the raw question | Question passed through `deliverQuestion` | T-b4 "Bookmarking before answering must not reveal the key" |
| P2-059 | P3 | SQL Lab | `GET /sql-lab/challenges` | Each challenge was sent with its reference answer (`expected_query`), which the UI never uses | GET `/sql-lab/challenges` | Whole object returned | Field stripped from the response | T-labs "SQL challenges are listed without their reference answer query" |
| P2-060 | P3 | Quiz | `getAttemptReview` | After the P2-033 fix, an attempt submitted after the time limit (EXPIRED) could not be reviewed | Submit after the limit, then open the review | Check allowed only COMPLETED | COMPLETED and EXPIRED are both treated as submitted | code review; T-b4 covers the COMPLETED path |

## Observed outside the 12 pages (OPEN, not fixed)

| Page | Observation |
|---|---|
| Mock Interview | Fallback scores `?? 82`, `|| 80`, `|| 70` are shown when a score is missing |
| Writing Practice | Fallback score `|| 88` |

| DSA Lab (in scope, by design) | `solution_explanation` is sent with every problem and shown behind the Solution tab. This is an editorial the student chooses to open, not a hidden test, so it was kept |

The Mock Interview and Writing Practice pages were not in scope. They should be handled in the next phase with the same approach.
