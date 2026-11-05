# Phase 2 Test Cases

All test data is synthetic. Probes register new students with addresses like `p2jA.<timestamp>@example.test`. No real
student data was used.

## Test suites and results (run 2026-11-05 on this branch)

| Suite | How to run | Result |
|---|---|---|
| Type check | `npx tsc --noEmit -p .` | 0 errors |
| Unit and HTTP tests | `npx vitest run` | 53 files, **854 / 854 passed** (baseline on `main`: 818) |
| Journey probes J1 to J3 | `BASE=http://localhost:3300 node scripts/audit/phase2-batch1.cjs create`, restart, `... verify` | 12 / 12, then 8 / 8 after restart |
| Journey probe J4 | `scripts/audit/phase2-batch2.cjs create` then `verify` | 19 / 19, then 6 / 6 after restart |
| Journey probes J5 to J10, integration, security | `scripts/audit/phase2-batch5.cjs create` then `verify` | 44 / 44, then 11 / 11 after restart |
| Code sandbox attacks | `node scripts/audit/phase2-code-sandbox.cjs` | 27 cases, all contained (table below) |
| Responsive and accessibility sweep | `BASE=http://localhost:3300 node scripts/audit/phase2-responsive.cjs out.json` | 66 page loads, 0 overflow, 0 page errors, 0 unlabelled controls |
| Browser journeys | `/tmp/p2/ui-*.cjs` (Playwright, not committed) | ML upload/train/predict, lab dashboard, viva label, exam plan, GATE dashboard, Exam Prep → Study Planner sync: all as expected, no page errors |

The probe outputs are committed in `docs/phase-2-audit/evidence/`. Failed tests: **none** in the final run. Earlier
failures during development, and their causes, are in `PHASE_2_ENGINEERING_LOG.md` and the bug tracker.

## New automated tests

| File | Cases |
|---|---|
| `src/tests/phase2_labs.test.ts` | 9: SQL challenges sent without the reference query; sandbox isolation level and no invented memory; production refuses unisolated runs; namespace wrapper hides /tmp and drops privileges; DSA hidden tests never returned; run and tutor need sign-in; language availability; DSA submission saved per student; SQL create/insert/select/save isolated per student |
| `src/tests/phase2_ml_lab.test.ts` | 4: seeded split is reproducible and hyperparameters matter; unsupported algorithm refused; preprocessing fitted on training rows with one-hot; CSV upload → train → predict → history with isolation |
| `src/tests/phase2_batch3.test.ts` | 6: lab ownership; viva keyword check and empty answer; AI 503 without a model; AI with a stubbed model saves results; report never invents output; interview privacy, scoring and AI honesty |
| `src/tests/phase2_batch4.test.ts` | 7: quiz answers and explanations hidden until submit, and owner checks; AI quiz 503 and no answers; GATE key hidden (bank and bookmarks), unanswered not penalised, negative marking; raw mock marks; server time limit; no invented profile or score; exam date, syllabus and readiness |
| Updated | `dsa.test.ts` (tutor returns model output, or 503 without a model), `coding.test.ts`, `sql_ml_labs_e2e.test.ts`, `system_design_master.test.ts`, `lab_assistant_master.test.ts`, `practice_labs_e2e.test.ts`, `gate_preparation_master.test.ts` were changed to expect the honest behaviour (for example 503 instead of template AI text, no estimated GATE score) |

## Probe test cases

`create` runs against a fresh snapshot. The server is then killed and restarted on the same snapshot, and `verify` reads the data back.

| ID | Run | Case | Result | Detail |
|---|---|---|---|---|
| TC-001 | b1 create | J1 run program | PASS | SUCCESS "144\n" |
| TC-002 | b1 create | J1 save program | PASS | status 201 id saved_1793901354913_i7ki |
| TC-003 | b1 create | J1 execution history recorded | PASS |  |
| TC-004 | b1 create | DSA hidden tests not exposed | PASS | hidden count 3 |
| TC-005 | b1 create | J2 wrong solution rejected | PASS | WRONG_ANSWER 2/5 |
| TC-006 | b1 create | J2 correct solution accepted | PASS | ACCEPTED 5/5 |
| TC-007 | b1 create | J2 hidden test I/O not in submit response | PASS |  |
| TC-008 | b1 create | J2 progress shows solved | PASS |  |
| TC-009 | b1 create | J3 create table | PASS | 201 |
| TC-010 | b1 create | J3 insert + select | PASS | [{"lab_id":1,"title":"DBMS Lab"},{"lab_id":2,"title":"OS Lab"}] |
| TC-011 | b1 create | J3 save query | PASS |  |
| TC-012 | b1 create | SQL student B cannot see A table | PASS | no such table: labs_p2. Check the table name in the schema browser. |
| TC-013 | b1 verify | J1 saved program after restart | PASS |  |
| TC-014 | b1 verify | J1 student B cannot open A program | PASS | status 403 |
| TC-015 | b1 verify | J2 solved status after restart | PASS |  |
| TC-016 | b1 verify | J2 student B progress separate | PASS |  |
| TC-017 | b1 verify | J3 table rows after restart | PASS | [{"title":"DBMS Lab"},{"title":"OS Lab"}] |
| TC-018 | b1 verify | J3 saved query after restart | PASS |  |
| TC-019 | b1 verify | J3 student B cannot see saved query | PASS |  |
| TC-020 | b1 verify | J3 query history after restart | PASS | 3 entries |
| TC-021 | b2 create | Unauthenticated dataset list is rejected | PASS | status 401 |
| TC-022 | b2 create | Empty CSV rejected with 400 | PASS | The CSV is empty. |
| TC-023 | b2 create | Row with wrong column count rejected | PASS | "Rows with the wrong number of columns (expected 2): line 2." |
| TC-024 | b2 create | Duplicate header rejected | PASS |  |
| TC-025 | b2 create | CSV over 5 MB rejected | PASS | status 400 |
| TC-026 | b2 create | Valid CSV uploaded (quoted comma field kept intact) | PASS | samples=120 notes0="row 0, synthetic" |
| TC-027 | b2 create | Student B cannot see student A dataset | PASS |  |
| TC-028 | b2 create | Train Random Forest: real metrics from confusion matrix | PASS | algorithm=Random Forest (bagged CART trees) acc=0.9167 test_rows=24 |
| TC-029 | b2 create | Train Decision Tree: real metrics from confusion matrix | PASS | algorithm=Decision Tree (CART, Gini) acc=0.9167 test_rows=24 |
| TC-030 | b2 create | Train Logistic Regression: real metrics from confusion matrix | PASS | algorithm=Logistic Regression (softmax, gradient descent) acc=0.9583 test_rows=24 |
| TC-031 | b2 create | Train KNN: real metrics from confusion matrix | PASS | algorithm=k-Nearest Neighbours acc=0.9167 test_rows=24 |
| TC-032 | b2 create | Unsupported model refused instead of silently substituted | PASS | Model 'XGBoost' is not available for classification. Supported: Random Forest, Decision Tr |
| TC-033 | b2 create | Student B cannot read student A experiment | PASS | status 404 |
| TC-034 | b2 create | Student B cannot predict with student A model | PASS | status 404 |
| TC-035 | b2 create | Prediction for strong student is pass | PASS | pass conf=0.96 |
| TC-036 | b2 create | Prediction for weak student is fail (logistic) | PASS | fail conf=1 |
| TC-037 | b2 create | Invalid prediction input rejected | PASS | Invalid prediction input: hours_studied must be a number; section must be one of: A, B, C. |
| TC-038 | b2 create | Prediction history saved | PASS | count=1 |
| TC-039 | b2 create | Student B prediction history is empty | PASS |  |
| TC-040 | b2 verify | Uploaded dataset survives restart | PASS |  |
| TC-041 | b2 verify | Experiment survives restart | PASS |  |
| TC-042 | b2 verify | Trained model still predicts after restart | PASS | pass |
| TC-043 | b2 verify | Prediction history survives restart | PASS | count=3 |
| TC-044 | b2 verify | Student B cannot delete student A dataset | PASS | status 404 |
| TC-045 | b2 verify | Built-in dataset cannot be deleted | PASS | status 400 |
| TC-046 | b5 create | J5 open challenge creates a project | PASS | 201 |
| TC-047 | b5 create | J5 save architecture | PASS | 200 |
| TC-048 | b5 create | J5 reload returns the saved diagram | PASS |  |
| TC-049 | b5 create | J5 continue editing after reload | PASS |  |
| TC-050 | b5 create | J5 student B cannot open the project | PASS |  |
| TC-051 | b5 create | J5 start interview | PASS | 201 |
| TC-052 | b5 create | J5 interview completed with checklist score (no hire verdict) | PASS | score=85 |
| TC-053 | b5 create | J5 student B cannot read the interview | PASS |  |
| TC-054 | b5 create | J5 AI tutor without a model answers 503 (no canned text) | PASS | 503 |
| TC-055 | b5 create | J6 create lab and experiment | PASS |  |
| TC-056 | b5 create | J6 run code in the sandbox | PASS | 17.0 |
| TC-057 | b5 create | J6 enter observations | PASS | 200 |
| TC-058 | b5 create | J6 report uses the real program output and observations | PASS | "17.0\n" |
| TC-059 | b5 create | J6 reopen the saved report | PASS | 200 |
| TC-060 | b5 create | J6 student B cannot open the lab | PASS |  |
| TC-061 | b5 create | J7 viva feedback is a labelled keyword check (no model configured) | PASS | 9 |
| TC-062 | b5 create | J7 AI viva question generation without a model answers 503 | PASS | 503 |
| TC-063 | b5 create | J7 viva history: answer and feedback stored on the experiment | PASS |  |
| TC-064 | b5 create | J8 questions delivered without answers | PASS |  |
| TC-065 | b5 create | J8 review refused before submit | PASS |  |
| TC-066 | b5 create | J8 server-side score ignores client score | PASS | 1/2 = 50% |
| TC-067 | b5 create | J8 notification states correct answers and links to the quiz | PASS | You answered 1 of 2 correctly (50%). Review the explanations for the questions you missed. |
| TC-068 | b5 create | J9 create exam (0% readiness, all topics WEAK) | PASS | 0 |
| TC-069 | b5 create | J9 readiness follows confidence | PASS | 25 |
| TC-070 | b5 create | J9 sync revision tasks to the Study Planner | PASS | 201 |
| TC-071 | b5 create | J9 planner lists the synced plan | PASS |  |
| TC-072 | b5 create | J10 select paper (profile saved, no invented goals) | PASS | 200 |
| TC-073 | b5 create | J10 select topic filters the question bank | PASS | 1 |
| TC-074 | b5 create | J10 question bank hides answer keys | PASS |  |
| TC-075 | b5 create | J10 practice attempt scored with key revealed after answering | PASS | correct=false |
| TC-076 | b5 create | J10 mock test gives raw marks, no estimated GATE score | PASS | marks=0 |
| TC-077 | b5 create | J10 dashboard counts the real practice attempt | PASS | 1 |
| TC-078 | b5 create | INT DSA accepted | PASS | ACCEPTED |
| TC-079 | b5 create | INT DSA notification has no invented points and a working link | PASS | All tests passed for this easy problem. / /dsa/problem/dsa_top150_001 |
| TC-080 | b5 create | INT dashboard lab widget data: experiments embedded with counts | PASS |  |
| TC-081 | b5 create | INT student B sees none of A's notifications | PASS |  |
| TC-082 | b5 create | SEC every page API needs sign-in (401 without a token) | PASS | 401,401,401,401,401,401,401,401,401 |
| TC-083 | b5 create | SEC forged unsigned token rejected | PASS | 401 |
| TC-084 | b5 create | SEC student_id in the body is ignored | PASS |  |
| TC-085 | b5 create | SEC SQL Lab blocks ATTACH | PASS | ATTACH statements are disabled in the SQL Lab sandbox. |
| TC-086 | b5 create | SEC lab manual over 10 MB refused | PASS | The lab manual is larger than 10 MB. Upload a smaller file or paste the text instead. |
| TC-087 | b5 create | SEC lab manual with unsupported type refused | PASS | Upload a PDF, DOCX, TXT or MD lab manual. |
| TC-088 | b5 create | SEC request body over 25 MB refused | PASS | 413 |
| TC-089 | b5 create | SEC path-like ids are just unknown ids | PASS | 404 |
| TC-090 | b5 verify | J5 system design project survives restart (3 components) | PASS |  |
| TC-091 | b5 verify | J5 interview and score survive restart | PASS |  |
| TC-092 | b5 verify | J6 experiment output and observations survive restart | PASS |  |
| TC-093 | b5 verify | J6 report reopens after restart | PASS |  |
| TC-094 | b5 verify | J7 viva history survives restart | PASS |  |
| TC-095 | b5 verify | J8 quiz review survives restart | PASS |  |
| TC-096 | b5 verify | J9 exam readiness survives restart | PASS |  |
| TC-097 | b5 verify | J9 synced study plan survives restart | PASS |  |
| TC-098 | b5 verify | J10 GATE attempts survive restart | PASS |  |
| TC-099 | b5 verify | INT DSA solved status survives restart | PASS |  |
| TC-100 | b5 verify | INT student B still isolated after restart | PASS |  |

## Code sandbox cases (`evidence/code-sandbox.txt`)

| Case | HTTP | Execution status | Isolation |
|---|---|---|---|
| hello_python | 200 | SUCCESS | namespace |
| arithmetic | 200 | SUCCESS | namespace |
| conditional | 200 | SUCCESS | namespace |
| loop_function | 200 | SUCCESS | namespace |
| arrays_strings | 200 | SUCCESS | namespace |
| user_input | 200 | SUCCESS | namespace |
| syntax_error | 200 | COMPILATION_ERROR | namespace |
| runtime_error | 200 | RUNTIME_ERROR | namespace |
| infinite_loop | 200 | TIMEOUT | namespace |
| sleeping | 200 | TIMEOUT | namespace |
| excessive_output | 200 | OUTPUT_LIMIT_EXCEEDED | namespace |
| env_secrets | 200 | SUCCESS | namespace |
| app_dir | 200 | RUNTIME_ERROR | namespace |
| tmp_dir | 200 | SUCCESS | namespace |
| etc_shadow | 200 | RUNTIME_ERROR | namespace |
| network | 200 | RUNTIME_ERROR | namespace |
| memory_1gb | 200 | MEMORY_LIMIT | namespace |
| fork_bomb | 200 | TIMEOUT | namespace |
| host_kill | 200 | SUCCESS | namespace |
| js_hello | 200 | SUCCESS | namespace |
| js_heap | 200 | MEMORY_LIMIT | namespace |
| c_hello | 200 | SUCCESS | namespace |
| c_include_host | 200 | COMPILATION_ERROR | namespace |
| c_compile_error | 200 | COMPILATION_ERROR | namespace |
| c_segfault | 200 | RUNTIME_ERROR | namespace |
| cpp_hello | 200 | SUCCESS | namespace |
| java_hello | 200 | SUCCESS | namespace |

Expected statuses: the hello and arithmetic cases succeed; syntax, runtime and compile errors are reported as such;
`infinite_loop` and `sleeping` time out; `excessive_output` hits the output cap; `memory_1gb` and `js_heap` hit the
memory limit; `app_dir` cannot see the app; `etc_shadow` is denied; `network` is unreachable; `fork_bomb` is contained;
`host_kill` signals only the student's own PID 1. Every case ran at `iso=namespace`.

## Not tested

- Live AI output (no model key). AI paths were tested for 503 and with stubs.
- Screen-reader and colour-contrast checks. The sweep checks names, overflow and headings only.
- Load and concurrency tests of the sandbox.
- Browsers other than Chromium.
