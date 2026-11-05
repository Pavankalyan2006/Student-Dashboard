# Phase 2 Engineering Log

Branch `claude/project-thread-7zxxwt`, started 2026-11-05 from `main` at 7124ecb (PR #3 merged).
Baseline: `npx tsc --noEmit` 0 errors, `npx vitest run` 818/818.

Conventions carried from Phase 1: PASS / PARTIAL / BLOCKED / NOT IMPLEMENTED; bug ids `P2-NNN`;
no AI key, so AI paths return 503 AI_UNAVAILABLE and are stub-tested; persistence default is the JSON snapshot.

## Resume here
See the last entry. Probe scripts live in `scripts/audit/phase2-*.cjs` and need a running server (`BASE=http://localhost:PORT`).

## Entries
- 2026-11-05 12:00 Discovery. Sandbox route `/sandbox` is an alias of Coding Lab; there is no separate Machine Learning page (only `/ml-lab`). Viva lives inside Lab Assistant (`/viva` alias).
- 2026-11-05 12:45 Batch 1 done (Coding, DSA, SQL). Fixed P2-001..P2-012 (see bug tracker once written):
  sandbox isolation (`server/execution/isolation.ts`), honest language availability, DSA hidden tests stripped,
  unauthenticated `/dsa/problems/:id/run` and `/dsa/tutor/chat`, SQL Lab rewritten on SQLite (`sqlWorker.cjs`,
  `sqlEngine.ts`), saved queries + CSV export, Coding AI 503 instead of templates, Monaco CDN fallback editor.
  Evidence: `scripts/audit/phase2-code-sandbox.cjs` (27 cases), `phase2-batch1.cjs create|verify` (20/20 PASS across restart),
  `src/tests/phase2_labs.test.ts`. Old SQL Lab snapshot data (key `studentDatabases`) is not migrated; new key `studentDbImages`.
- 2026-11-05 13:40 Batch 2 done (Sandbox, AI/ML Lab, Machine Learning).
  Sandbox: `/sandbox` renders Coding Lab, so it is covered by the batch 1 isolation work; nothing duplicated.
  Machine Learning: no separate page or route exists; the ML features live in AI/ML Lab (`/ml-lab`). No new page was created.
  AI/ML Lab fixes: Random Forest, Decision Tree and Logistic Regression were silently replaced by k-NN or linear
  regression and the preprocessing controls were ignored. Now `server/services/mlAlgorithms.ts` implements CART trees,
  bagged forests and softmax logistic regression, with preprocessing (impute, scale, one-hot) fitted on training rows only
  and a seeded split. Unsupported models are refused with 400. Experiments and predictions are owner-checked (404 for other
  students). Prediction inputs are validated (required, numeric, known category) and saved to a persisted history.
  CSV upload uses an RFC 4180 parser with 5 MB, 20,000-row and 100-column limits, header and row-width checks, and a
  duplicate-row count. Uploaded datasets can be removed (built-in ones cannot).
  UI: k-NN option, only the hyperparameters each model uses, CSV file picker, remove-dataset button, category dropdowns
  and training ranges in the prediction form, prediction history table, and an "Algorithm trained" banner.
  Evidence: `scripts/audit/phase2-batch2.cjs create` 19/19 PASS, `verify` after restart 6/6 PASS; `src/tests/phase2_ml_lab.test.ts`
  8 tests; browser run of upload, train k-NN, predict, blank-input error and history (`/tmp/p2/ui-b2.cjs`, no page errors).
  Full suite 838/838 before the final UI tweak.
- 2026-11-05 14:40 Batch 3 done (System Design, Lab Assistant, Viva).
  System Design: the interview score was `Math.random()*15+80` with a fixed STRONG_HIRE debrief, step feedback was canned
  praise, and the AI tutor returned six fixed texts. Now: a transparent per-step checklist (regexes in
  `SystemDesignService.INTERVIEW_CHECKLIST`) scores coverage of the student's own notes, labelled "not an interviewer's
  hiring decision"; steps must be answered in order; the AI tutor calls the model with the student's diagram and returns
  503 AI_UNAVAILABLE without one. Evaluator consistency/cost feedback now reflects the diagram.
  Lab Assistant: legacy `/labs` routes in learningModules.ts shadowed labAssistant.ts and fell back to the demo student's
  labs (a new student saw `std_demo_1` data) and a length-based viva score; removed, and the legacy service methods now
  delegate to the owner-scoped service (also used by AI agent tools). `POST .../viva/generate` was swallowed by
  `.../viva/:qId` (always 404); fixed. A client-supplied experiment id let one student overwrite another's experiment;
  ids are now only reused for the same student and lab. Report GET fell back to another experiment's report; fixed.
  Reports no longer show the expected output as the actual output or a default "completed successfully" conclusion.
  AI extraction, viva generation and doubts return 503/502 instead of heuristic or template text, and save nothing on failure.
  Viva feedback uses the model when configured, otherwise a labelled keyword check (`method: KEYWORD_MATCH`).
  Evidence: `src/tests/phase2_batch3.test.ts` (6 HTTP tests), updated system design / lab assistant tests; full suite 846/846;
  browser: new student sees no demo labs, lab card shows 0/1 progress, viva shows the keyword-check label.
  Out of scope but observed: Mock Interview pages show fallback scores (`?? 82`, `|| 80`, `|| 70`) and Writing Practice `|| 88`.
- 2026-11-05 15:40 Batch 4 done (Quiz, Exam Preparation, GATE).
  Quiz: `GET /quiz/attempts/:id/review` returned correct answers while the attempt was IN_PROGRESS (answers readable
  mid-quiz); now only after submission. `GET /quiz/:id` and `/quiz/:id/questions` had no owner check; now 404 for other
  students. `/quiz/generate` sent answers and explanations with the new quiz; now delivery format. Empty validated
  output is 502. Scoring was already server-side and resubmission blocked (verified).
  GATE: `estimated_gate_score` was computed from invented constants (Mq 25, Mt 75) and the dashboard showed 480 for a
  student with no tests, with frontend fallbacks 500/520; removed, raw marks shown (negative allowed, as in GATE).
  Default profile invented exam date 2026-02-07, target 75 and AIR goal "< 500"; now empty until the student sets them.
  Flagged weak topics showed a made-up 40% accuracy; now "Flagged by you". Question bank delivered answer keys; now only
  after answering. Unanswered MCQ got negative marks in practice; now 400. Mock test timer enforced server-side
  (answers refused after limit + 2 min; time taken from server clock). AI tutor used Gemini directly with hardcoded
  formulas and a canned fallback; now AIService with 503.
  Exam Prep: create defaulted the date to +14 days and the syllabus to placeholder units, alternated confidence
  DEVELOPING/WEAK, added generic subtopics and readiness 50; now date and syllabus required, all topics start WEAK,
  readiness computed from the student's confidence (new PATCH topic endpoint + UI selectors). The overview insight
  ("Normalization carries ~25%") and the "AI-Synthesized" DBMS revision plan were hardcoded for every exam; replaced with
  a plan built from the exam date, prep hours and confidence. "Take Mock Exam" pointed to a non-existent route; now
  opens Quiz create with the subject.
  Evidence: `src/tests/phase2_batch4.test.ts` (7 HTTP tests); full suite 853/853; browser `/tmp/p2/ui-b4.cjs`.
  Limitation: the GATE seed bank is tiny (7 CS questions; "CS 2024 full" mock has 7 questions).
