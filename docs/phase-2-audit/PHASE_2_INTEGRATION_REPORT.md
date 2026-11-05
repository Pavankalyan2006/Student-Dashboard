# Phase 2 Integration Report

How the 12 pages connect to each other and to the rest of the app, and what was verified. Evidence ids refer to
`PHASE_2_TEST_CASES.md`.

## Integrations verified

| From | To | Mechanism | Result | Evidence |
|---|---|---|---|---|
| Exam Preparation | Study Planner | "Add to Study Planner" calls `POST /study-planner/plans` with one task per revision day (title, subject, topic, date, minutes, HIGH priority) | **PASS (new in Phase 2)** | TC-070, 071, 097; browser `evidence/ui-exam-planner-sync.txt` (10 tasks, shown on `/study-planner`) |
| Exam Preparation | Quiz | "Practice" opens `/quiz/create?topic=<topic>`; Quiz create pre-fills the topic | PASS (fixed P2-047) | browser `ui-b4` |
| Quiz | Notifications | `eventBus` `QUIZ_RESULT_UPDATED` → "You answered X of Y correctly (P%)", link `/quiz/:id/result` | PASS (fixed P2-048) | TC-067 |
| DSA Lab | Notifications | `eventBus` `DSA_PROBLEM_COMPLETED` → no invented points, link `/dsa/problem/:id` | PASS (fixed P2-049) | TC-079 |
| DSA Lab | DSA progress, Dashboard | Accepted submission updates `dsaProgress` | PASS | TC-008, 078, 099 |
| Lab Assistant | Code sandbox | Experiment code runs through the same isolated `SandboxService` as Coding Lab | PASS | TC-056 |
| Lab Assistant | Dashboard lab widget | `GET /labs` returns experiments and counts | PASS (fixed P2-031) | TC-080 |
| Lab Assistant | Viva | Viva questions live on the experiment; answers and feedback persist there | PASS | TC-061..063, 094 |
| Lab Assistant | AI agent tools | Legacy `LearningModulesService.getLabs / getLabById / evaluateVivaAnswer` delegate to the owner-scoped `LabAssistantService` | PASS | `phase2_batch3.test.ts` |
| Coding Lab | Sandbox page | `/sandbox` renders Coding Lab | PASS | responsive sweep (page loads, no errors) |
| AI/ML Lab | Machine Learning | Same page (`/ml-lab`) | PASS (no separate page exists) | inventory |
| GATE | GATE dashboard and progress | Practice and mock attempts feed `gateQuestionAttempts`; dashboard counts only real attempts | PASS (fixed P2-050) | TC-077, 098 |
| All pages | Auth | JWT `userId` is the only identity source | PASS | TC-081..084, 099..100 |
| All AI features | `AIService` | One provider path. Without a key, every AI feature returns 503 `AI_UNAVAILABLE`. Bad model output returns 502 `AI_BAD_OUTPUT` | PASS for the 503 path; with-model paths stub-tested only | `coding.test.ts`, `phase2_batch3.test.ts`, `phase2_batch4.test.ts` |

## AI integrations

| Feature | Behaviour without a key (tested) | With a key |
|---|---|---|
| Coding AI (explain, debug, hints, review, refactor, generate, test cases) | 503 | Not tested live |
| DSA tutor | 503 (and sign-in required); the UI shows the error and points to the problem's hints | Stub-tested: returns the model text with problem metadata |
| System Design AI tutor | 503 | Stub-tested: sends the student's diagram, parses JSON |
| Lab manual extraction, viva generation, doubts | 503; nothing saved | Stub-tested: saves parsed questions and both chat messages |
| Viva feedback | Labelled `KEYWORD_MATCH` check | Stub-tested: model feedback |
| Quiz generation | 503 | Stub-tested: invalid questions dropped; zero valid → 502 |
| GATE AI tutor | 503 | Stub-tested through AIService |

No AI output is shown as an official grade. The interview checklist and the viva keyword check are labelled as coverage checks, not assessments.

## Not integrated

| Gap | Note |
|---|---|
| GATE tasks and the general Study Planner | GATE has its own planner view and store (`gateStudyTasks`). It was not merged with Study Planner in Phase 2 |
| Quiz results and Exam Prep readiness | Readiness comes only from the student's topic confidence. Quiz scores are not fed in automatically |
| Lab Assistant and Coding Lab saved programs | Lab code drafts are stored per experiment and are not listed in Coding Lab's saved programs |

These were left as they are, to avoid inventing a link the product has not specified. They are candidates for the next phase.
