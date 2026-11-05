# Phase 2 Component Audit

Status values follow Phase 1: PASS (tested and working), PARTIAL (works with a documented limit), BLOCKED (needs an
external dependency that was not available), NOT IMPLEMENTED. "Tested by" names the evidence. The probe outputs are in
`docs/phase-2-audit/evidence/`. Tests are in `src/tests/`.

## 1. Coding Lab (`src/features/coding`, 13 components) and 4. Sandbox (same components)

| Component | What it does | Status | Phase 2 change | Tested by |
|---|---|---|---|---|
| `CodingLabPage` | Lab home: sessions, languages, recent runs | PASS | aria-labels | responsive sweep |
| `CodingEditorPage` / `CodeEditor` | Editor, run, save, stdin | PASS | Falls back to a plain textarea when the Monaco CDN cannot load (`ResilientCodeEditor.tsx`) | `phase2-batch1` J1, browser `/tmp/p2/ui-editor.cjs` |
| `EditorToolbar` | Run, save, format, share | PASS | Format works for JavaScript and says so for other languages, instead of claiming success; share copies a link only for a saved session or problem | browser |
| `LanguageSelector` | Language list | PASS | Languages the server cannot run are shown as unavailable | `phase2_labs.test.ts` "languages report whether the server can actually run them" |
| `CodeOutputPanel` | stdout, stderr, status, time | PASS | No invented memory figure; shows the isolation level | `phase2_labs.test.ts` |
| `CodeAIChat` | Explain, debug, optimise | BLOCKED (no AI key) | Returns 503 instead of template answers | `coding.test.ts` |
| `CodingSavedPage` / `SavedCodeList` | Saved programs | PASS | none | J1 save → restart → retrieve |
| `CodingHistoryPage` / `CodingHistory` / `CodeDiffViewer` | Run history and diff | PASS | none | J1 "execution history recorded" |
| `CodingProblemPanel` | Problem statement | PASS | none | browser |

## 2. DSA Lab (`src/features/dsa`, 28 components)

| Component | Status | Phase 2 change | Tested by |
|---|---|---|---|
| `DSALabPage`, `DSATopicsPage`, `DSATopicDetailPage` | PASS | aria-label on search | responsive sweep |
| `DSAPracticePage`, `DSAProblemPage` | PASS | Hidden test cases are no longer sent; sign-in required for run | `phase2_labs.test.ts`, batch1 J2 |
| `DSAProgressPage` | PASS | none | J2 progress, INT "DSA solved status survives restart" |
| `DSAVisualizePage` + 15 visualiser components (Array, Tree, Graph, Heap, Stack, Queue, LinkedList, Recursion, DPTable, Canvas, Controls, Timeline, Legend, Complexity, Pseudocode) | PASS (rendered; animation correctness was not checked step by step) | none | responsive sweep (page loads, no errors) |
| `DSAAiTutorPage` / `DSAAITutor` | BLOCKED (no AI key) | Sign-in required; template replies removed, so the tutor returns 503 and the UI shows the real error (P2-056) | `phase2_labs.test.ts`, `dsa.test.ts` |
| `DSAHints` | PASS | none: the problem's own progressive hints, no AI | browser |
| `CustomInputModal`, `AlgorithmComparisonModal` | PASS | none | browser |

## 3. SQL Lab (`SqlLabPage.tsx`, one large component)

| Area | Status | Phase 2 change | Tested by |
|---|---|---|---|
| Query editor and run | PASS | Real SQLite (sql.js) in a worker, instead of a regex emulator that gave wrong results | J3, `phase2_labs.test.ts` |
| Workspaces and schema browser | PASS | No fake fallback workspace when the API fails | J3 |
| Saved queries, history, CSV export | PASS | Saved queries are new; export is new | J3 save → restart → retrieve |
| Challenges | PASS | Reference answer query no longer sent (P2-059) | `phase2_labs.test.ts` |

## 5. AI/ML Lab and 6. Machine Learning (`MlLabPage.tsx`)

| Area | Status | Phase 2 change | Tested by |
|---|---|---|---|
| Dataset list, CSV upload, preview, remove | PASS | RFC 4180 parser; 5 MB, 20,000-row and 100-column limits; remove for uploaded sets | `phase2-batch2` 19/19, `phase2_ml_lab.test.ts` |
| Preprocessing (impute, scale, one-hot, split) | PASS | Previously ignored. Now fitted on training rows only, with a seeded split | `phase2_ml_lab.test.ts` |
| Models: decision tree, random forest, logistic regression, k-NN, linear regression, k-means | PASS | Previously random forest, tree and logistic were silently replaced by k-NN or linear regression | `phase2_ml_lab.test.ts` |
| Evaluation metrics and confusion matrix | PASS | Computed from the held-out rows | batch2 probe |
| Prediction form and history | PASS | Input validation, category dropdowns, training ranges, saved history | batch2 probe, browser `/tmp/p2/ui-b2.cjs` |
| Experiment save and reload | PASS | Owner check (404 for other students) | batch2 verify after restart 6/6 |

## 7. System Design Lab (`src/features/system-design`, 14 components)

| Component | Status | Phase 2 change | Tested by |
|---|---|---|---|
| `ChallengeCatalogView` | PASS | none | J5 "open challenge creates a project" |
| `ArchitectureDesigner`, `SavedProjectsView` | PASS | none | J5 save → reload → continue, and survives restart |
| `RequirementsWorkspace`, `ApiDesignWorkspace`, `DatabaseDesignWorkspace` | PASS | none | saved through the same project PATCH |
| `ArchitectureEvaluator` | PASS | Consistency and cost feedback now reflect the diagram | `system_design_master.test.ts` |
| `ScalabilitySimulator` | PASS (rule-based, labelled as a simulation) | none | browser |
| `InterviewPracticeModal` | PARTIAL | Score was `Math.random()*15+80` with a fixed STRONG_HIRE verdict. Now a keyword checklist score of the student's notes, labelled as coverage and "not an interviewer's hiring decision". Steps must be answered in order | J5, `phase2_batch3.test.ts` |
| `AITutorDrawer` | BLOCKED (no AI key) | Returned six fixed texts; now 503 | J5 "AI tutor without a model answers 503" |
| `LearningRoadmapView`, `LessonDetailModal`, `AnalyticsView` | PASS | none | responsive sweep |

## 8. Lab Assistant and 9. Viva (`src/features/labs`, 7 components)

| Component | Status | Phase 2 change | Tested by |
|---|---|---|---|
| `LabAssistantPage`, `LabDashboard`, `CreateLabModal` | PASS | A new student no longer sees the demo student's labs; progress counts are real; 1 px overflow fixed | J6, `phase2_batch3.test.ts` |
| `ManualUploadModal`, `ManualEntryModal` | PARTIAL | Upload limited to PDF, DOCX, TXT and MD up to 10 MB. AI extraction returns 503 without a key; manual entry works | SEC checks in batch5 |
| `ExperimentWorkspace`: code run | PASS | Status comes from the sandbox result, not from stderr | J6 "run code in the sandbox" |
| `ExperimentWorkspace`: observations | PASS | none | J6 "enter observations", survives restart |
| `ExperimentWorkspace`: viva | PARTIAL | Uses the AI model when configured; otherwise a labelled keyword check. AI question generation returns 503 without a key | J7 |
| `ExperimentReportView` | PASS | No longer shows the expected output as the actual output or a default conclusion; no fallback to another experiment's report | J6 "report uses the real program output and observations", "reopen the saved report" |

## 10. Quiz (`src/features/quiz`, 15 components)

| Component | Status | Phase 2 change | Tested by |
|---|---|---|---|
| `QuizPage`, `QuizCard`, `QuizHistoryPage`, `QuizProgressPage` | PASS | aria-labels | responsive sweep |
| `QuizCreatePage` (manual) | PASS | Accepts `?topic=` from Exam Prep | J8 |
| `QuizCreatePage` (AI generate) | BLOCKED (no AI key) | 503; the response no longer contains answers | `phase2_batch4.test.ts` |
| `QuizPlayerPage`, `QuizQuestionCard`, `QuestionNavigator`, `QuizTimer` | PASS | Questions are delivered without answers | J8 "questions delivered without answers" |
| `QuizResultPage`, `QuizReviewPage` | PASS | Review and "explain this answer" are refused until the attempt is submitted, and are owner-only (P2-033, P2-057) | J8 "review refused before submit", "quiz review survives restart"; `phase2_batch4.test.ts` |
| `WeakAreaCard`, `TopicPerformanceCard`, `AdaptiveDifficultyBadge`, `QuizSourceBadge` | PASS | none | browser |

## 11. Exam Preparation (`ExamPreparationPage.tsx`)

| Area | Status | Phase 2 change | Tested by |
|---|---|---|---|
| Create exam | PASS | Date and syllabus required; no placeholder units; topics start WEAK; readiness starts at 0 | J9 |
| Topic list with confidence and status | PASS | New selectors and `PATCH /exams/:id/topics/:topicId` | J9 "readiness follows confidence" |
| Overview insight | PASS | Was fixed DBMS text for every exam; now names the weakest topic | browser `/tmp/p2/ui-b4.cjs` |
| Revision Plan | PASS | Was a hardcoded "AI-Synthesized" DBMS plan; now built from the exam date, prep hours and confidence | browser |
| Add to Study Planner | PASS (new) | Creates an EXAM study plan with one task per revision day | J9, browser `evidence/ui-exam-planner-sync.txt` |
| Practice button | PASS | Pointed to a route that does not exist; now opens Quiz create with the topic | browser |
| Delete exam | PASS (new) | `DELETE /exams/:id` | API |

## 12. GATE Exam Preparation (`src/features/gate`, 12 components)

| Component | Status | Phase 2 change | Tested by |
|---|---|---|---|
| `GatePaperSelectorModal` | PASS | none | J10 "select paper" |
| `GateDashboardView` | PASS | Removed the invented estimated GATE score (480 for a new student); no invented exam date or goals | J10, `phase2_batch4.test.ts` |
| `GateSyllabusExplorer` | PASS | none | J10 "select topic filters the question bank" |
| `GateQuestionBank`, `GateQuestionPracticeModal` | PASS | Answer keys are sent only after answering; an empty answer returns 400 instead of a penalty | J10 |
| `GateMockTestsView`, `GateTestEngineModal`, `GateTestResultView` | PARTIAL | Raw marks only; the timer is enforced on the server; unanswered questions are not recorded as attempts. The seed bank is small | J10, `phase2_batch4.test.ts` |
| `GateRevisionView` | PASS | Flagged topics show "Flagged by you" instead of a made-up 40% accuracy; bookmarked questions arrive without answer keys (P2-058) | browser, `phase2_batch4.test.ts` |
| `GateStudyPlannerView` | PASS | none | responsive sweep |
| `GateAiTutorDrawer` | BLOCKED (no AI key) | Called Gemini directly with a canned fallback; now goes through AIService and returns 503 | `phase2_batch4.test.ts` |

## Accessibility and layout (all pages)

`scripts/audit/phase2-responsive.cjs` loaded the 11 routes at 360, 390, 768, 1024, 1366 and 1440 px (66 loads). Results:
0 horizontal overflow, 0 page errors, 0 unlabelled buttons or inputs, 0 images without alt text, and exactly one h1
on every page. Raw output: `phase2-responsive.json`. This is an automated check. It does not replace a screen-reader
pass or a contrast audit.
