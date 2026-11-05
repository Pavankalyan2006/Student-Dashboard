# Phase 2 API Audit

All paths are under `/api/v1`. "Verified" means a probe or test called the endpoint against a running server (or the
in-process HTTP harness) and checked the response body, not only the status. Probe output: `docs/phase-2-audit/evidence/`.

## Authentication and identity (all 12 pages)

- Every page API needs a signed token. A GET without one returns 401 for `/coding/sessions`, `/dsa/progress`,
  `/sql-lab/workspaces`, `/ml-lab/experiments`, `/system-design/projects`, `/labs`, `/quiz/attempts`, `/exams` and
  `/gate/dashboard` (batch5 "SEC every page API needs sign-in").
- An unsigned token (`alg: none`) is rejected with 401 (batch5 "SEC forged unsigned token rejected").
- A `student_id` in the body is ignored. The record is created for the token's student (batch5 "SEC student_id in the body is ignored").
- Routes in `systemDesign.ts` and `gate.ts` resolve the student with `req.user!.userId`. Phase 2 removed the
  unauthenticated DSA endpoints `POST /dsa/problems/:id/run` and `POST /dsa/tutor/chat` (now 401).

## Endpoints verified per page

| Page | Endpoint | Check | Evidence |
|---|---|---|---|
| Coding Lab / Sandbox | `POST /coding/run` | Runs in namespaces; returns status, stdout, stderr and isolation level | `code-sandbox.txt` (27 cases), batch1 J1 |
| | `POST /coding/saved`, `GET /coding/saved/:id` | Save, then retrieve after restart; another student gets 403 | batch1 J1 create and verify |
| | `GET /coding/executions` | History recorded | batch1 J1 |
| | `GET /coding/languages` | `available` reflects the toolchains installed on the server | `phase2_labs.test.ts` |
| | `POST /coding/ai/explain`, `/debug`, `/hints`, `/review`, `/refactor`, `/generate`, `/test-cases` | 503 `AI_UNAVAILABLE` without a model | `coding.test.ts` |
| DSA Lab | `GET /dsa/problems`, `GET /dsa/problems/:id` | No `hidden_test_cases` | batch1, `phase2_labs.test.ts` |
| | `POST /dsa/problems/:id/run` | 401 without a token | `phase2_labs.test.ts` |
| | `POST /dsa/tutor/chat` | 401 without a token; 503 without a model instead of a template answer | `phase2_labs.test.ts`, `dsa.test.ts` |
| | `POST /dsa/problems/:id/submit` | Wrong answer → WRONG_ANSWER; correct → ACCEPTED; hidden test I/O is not echoed | batch1 J2, batch5 INT |
| | `GET /dsa/progress` | Solved problem saved per student, survives restart | batch1 J2 verify, batch5 INT verify |
| SQL Lab | `POST /sql-lab/execute` | CREATE, INSERT, SELECT on SQLite; ATTACH blocked | batch1 J3, batch5 SEC |
| | `POST/GET /sql-lab/saved-queries`, `GET /sql-lab/history` | Saved and listed per student, survive restart | batch1 J3 verify |
| | `GET /sql-lab/challenges` | No `expected_query` in the response | `phase2_labs.test.ts` |
| AI/ML Lab | `POST /ml-lab/datasets/upload` | Empty, ragged, duplicate-header and over-5-MB CSVs rejected; a quoted comma kept | batch2 |
| | `DELETE /ml-lab/datasets/:id` (new) | Owner only; built-in sets cannot be deleted | batch2 verify |
| | `POST /ml-lab/experiments` | Unsupported model → 400 instead of a silent substitute | batch2, `phase2_ml_lab.test.ts` |
| | `GET /ml-lab/experiments/:id` | 404 for another student | batch2 |
| | `POST /ml-lab/experiments/:id/predict` | Body `{inputs}`, validated; result saved | batch2 |
| | `GET /ml-lab/predictions` (new) | History per student | batch2 |
| System Design | `POST /system-design/challenges/:id/start` | Creates a project with the starter components | batch5 J5 |
| | `PATCH /system-design/projects/:id`, `GET /system-design/projects/:id` | Save, reload, continue; 404 for another student; survives restart | batch5 J5 |
| | `POST /system-design/interviews`, `POST .../responses` | Steps in order; checklist score; no hire verdict | batch5 J5, `phase2_batch3.test.ts` |
| | `POST /system-design/ai-tutor` | 503 without a model | batch5 J5 |
| Lab Assistant | `POST /labs`, `POST /labs/:id/experiments` | Created for the token's student | batch5 J6 |
| | `POST /labs/:id/experiments/:expId/code/run` | Uses the sandbox; status from the result | batch5 J6 |
| | `POST /labs/:id/experiments/:expId/observations` | Saved, and appear in the report | batch5 J6 |
| | `POST` and `GET /labs/:id/experiments/:expId/report` | Built from real output and observations; reopened by GET; no fallback to another report | batch5 J6, verify after restart |
| | `POST /labs/:id/upload` | PDF, DOCX, TXT or MD only, up to 10 MB | batch5 SEC |
| Viva | `POST /labs/:id/experiments/:expId/viva/:qId/evaluate` | Labelled `KEYWORD_MATCH` without a model; empty answer → 400 | batch5 J7, `phase2_batch3.test.ts` |
| | `POST .../viva/generate` | Was always 404 (route order). Now 503 without a model; saves parsed questions with a model (stub) | batch5 J7, `phase2_batch3.test.ts` |
| Quiz | `POST /quiz`, `POST /quiz/:id/start`, `GET /quiz/:id/questions` | Questions without answers; another student gets 404 | batch5 J8, `phase2_batch4.test.ts` |
| | `GET /quiz/attempts/:id/review` | 400 until submitted, then full review; survives restart | batch5 J8 |
| | `POST /quiz/attempts/:id/submit` | Server score; a client-sent `score: 100` is ignored | batch5 J8 |
| | `POST /quiz/generate` | 503 without a model; response never includes answers | `phase2_batch4.test.ts` |
| | `POST /quiz/explain-answer` | 400 before the student has submitted an attempt; 404 for another student's question; 200 with the explanation after submit | `phase2_batch4.test.ts` |
| Exam Preparation | `POST /exams` | Date and syllabus required; readiness 0 | batch5 J9 |
| | `PATCH /exams/:id/topics/:topicId` (new) | Readiness follows confidence | batch5 J9 |
| | `DELETE /exams/:id` (new) | Owner only | `phase2_batch4.test.ts` |
| | `POST /study-planner/plans`, `GET /study-planner/plans` | Revision tasks synced and listed; survive restart | batch5 J9, `ui-exam-planner-sync.txt` |
| GATE | `POST /gate/profile` | Paper saved; no invented goals | batch5 J10 |
| | `GET /gate/questions?topic_id=` | Topic filter works; no answer keys | batch5 J10 |
| | `POST /gate/questions/:id/attempt` | Key revealed after answering; empty answer → 400 | batch5 J10, `phase2_batch4.test.ts` |
| | `POST /gate/tests/:id/start`, `POST /gate/sessions/:id/submit` | Raw marks; no estimated score; late answers refused | batch5 J10, `phase2_batch4.test.ts` |
| | `GET /gate/dashboard` | Counts real attempts only | batch5 J10 |
| | `GET /gate/bookmarks` | Bookmarked questions without answer keys | `phase2_batch4.test.ts` |
| | `GET /gate/tests`, `/gate/tests/:id`, `POST .../start`, `GET /gate/sessions/:id` | Checked by hand on a running server: no `correct_answer` or `explanation` before submission | manual curl, 2026-11-05 |
| | `POST /gate/ai-tutor` | 503 without a model | `phase2_batch4.test.ts` |
| Cross-cutting | any `POST` with a body over 25 MB | 413 instead of 500 | batch5 SEC |
| | any `POST` with malformed JSON | 400 instead of 500 | `errorHandler.ts` |
| | `GET /notifications` | Quiz and DSA notifications have correct text and working links; other students see none | batch5 J8, INT |

## Routes removed or changed

| Change | Reason |
|---|---|
| Legacy `/labs` routes in `learningModules.ts` removed | They were registered first, shadowed `labAssistant.ts`, returned the demo student's labs to new students, and scored viva answers by length |
| `/viva/:qId` now calls `next()` for `generate` | `/viva/generate` was declared later and could never be reached |
| `GET /labs/:id/experiments/:expId/report` no longer falls back to `reports[0]` | It returned a different experiment's report |
| `GET /quiz/attempts/:id/review` requires a submitted attempt (COMPLETED or EXPIRED) | It returned answers mid-attempt |
| `POST /quiz/explain-answer` requires the student's own submitted attempt | It returned the answer for any question at any time |
| `GET /sql-lab/challenges` drops `expected_query`; `GET /gate/bookmarks` drops answer keys | Both sent answers to students |

## Not verified

- Live AI responses. No `GEMINI_API_KEY` was available. AI endpoints were tested for the 503 path and with stubbed
  `AIService.generate` for parsing and saving. Prompt quality and real model output are untested.
- Endpoints outside the 12 pages were only exercised where a journey touched them (Study Planner, notifications).
