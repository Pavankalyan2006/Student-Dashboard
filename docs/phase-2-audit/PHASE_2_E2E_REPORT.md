# Phase 2 End-to-End Journey Report

Each journey was driven over HTTP against a real server (`PORT=3300 DATA_SNAPSHOT_PATH=/tmp/p2/snapF.json npx tsx server.ts`)
with two synthetic students, A and B. After `create`, the server process was killed and restarted on the same snapshot,
and `verify` read the data back. Several journeys were also driven in Chromium with Playwright.

Raw output: `docs/phase-2-audit/evidence/`. TC ids refer to `PHASE_2_TEST_CASES.md`.

| Journey | Spec steps | Result | Evidence |
|---|---|---|---|
| J1 Coding | write, run, save, refresh, retrieve | **PASS** | Run prints `144` (SUCCESS, namespace isolation). Saved with 201. History recorded. After restart the saved program is returned, and student B gets 403. TC-001..003, TC-013..014 |
| J2 DSA | select problem, submit, see evaluation, progress saved | **PASS** | Hidden tests not in the problem. A wrong solution gives WRONG_ANSWER 2/5; a correct one gives ACCEPTED 5/5 without echoing hidden I/O. Progress shows the problem solved, and still does after restart. B's progress is separate. TC-004..008, TC-015..016 |
| J3 SQL | create table, insert, SELECT, save query, refresh | **PASS** | CREATE 201; INSERT + SELECT returns the 2 rows; query saved. B gets "no such table". After restart: rows, saved query and 3 history entries are back, and B still sees nothing. TC-009..012, TC-017..020 |
| J4 AI/ML | upload, preview, preprocess, train, evaluate, predict, save | **PASS** | CSV validation (5 rejections, 1 valid upload with a quoted comma kept). Four classifiers trained with real metrics from a 24-row held-out set (accuracy 0.92 to 0.96). Unsupported model refused. Predictions validated and saved. After restart, dataset, experiment and model still predict, and history has 3 entries. Preview and preprocessing controls were checked in the browser (`ui-b2`); preprocessing fitted on training rows only is checked in `phase2_ml_lab.test.ts`. TC-021..045 |
| J5 System Design | open challenge, build architecture, save, reload, continue | **PASS** | Challenge `sd_chal_01` starts a project with starter components. A 2-component diagram with 1 connection is saved and reloaded identically, then a 3rd component is added. B gets 404. After restart the project has 3 components. Interview practice: steps in order, checklist score, no hire verdict, private. AI tutor returns 503 without a model. TC-046..054, TC-090..091 |
| J6 Lab Assistant | create experiment, enter observations, generate report, save, reopen | **PASS** | Lab and experiment created. Code runs in the sandbox (output 17). A 3-row observation table is saved. The report contains the real output, the expected output and the observations. GET reopens the same report. B gets 404. After restart: output, observations and report are back. TC-055..060, TC-092..093 |
| J7 Viva | select topic, answer, submit, view feedback, retrieve history | **PARTIAL** | Answer evaluated; feedback is a labelled `KEYWORD_MATCH` check because no model is configured. AI question generation returns 503. The answer and feedback are stored on the experiment and survive restart. With a model, feedback and generated questions were tested with a stubbed model only (`phase2_batch3.test.ts`). TC-061..063, TC-094 |
| J8 Quiz | start, answer, submit, view score, review explanations, retrieve attempt | **PASS** | Questions are delivered without answers. Review is refused before submit. The server scores 1/2 = 50% and ignores a client `score: 100`. The notification says "You answered 1 of 2 correctly (50%)" and links to the result. After restart, the review returns the attempt. TC-064..067, TC-095 |
| J9 Exam Preparation | select exam, review topics, generate tasks, sync with Study Planner | **PASS** | Exam created with a real date and syllabus at 0% readiness. Marking one topic STRONG gives 25%. Revision tasks are synced as a Study Planner plan with 3 tasks and listed by the planner. After restart, readiness and the plan are back. In the browser, "Add to Study Planner" created a 10-task plan, and the Study Planner page showed it (`evidence/ui-exam-planner-sync.txt`). TC-068..071, TC-096..097 |
| J10 GATE | select paper, select topic, attempt, submit, view evaluation, check progress | **PARTIAL** | Paper CS saved with no invented goals. The topic filter returns only that topic. The bank has no answer keys. A practice attempt reveals the key after answering. A mock test gives raw marks and no estimated score. The dashboard counts the real attempt, and still does after restart. PARTIAL only because the seeded bank is small (7 CS questions). TC-072..077, TC-098 |

## Cross-module and security checks run in the same probe

| Check | Result |
|---|---|
| DSA accepted → notification without invented points, link to the problem | PASS |
| `GET /labs` returns experiments and counts for the dashboard widget | PASS |
| Student B sees none of A's notifications | PASS |
| 9 page APIs return 401 without a token; a forged unsigned token is rejected | PASS |
| `student_id` in the body is ignored | PASS |
| SQL `ATTACH` blocked; oversized and wrong-type lab uploads refused; 26 MB body → 413; path-like ids → 404 | PASS |
| B still isolated after restart | PASS |

## Browser runs (Playwright, Chromium 1366 × 900)

| Script | What it did | Outcome |
|---|---|---|
| `/tmp/p2/ui-editor.cjs` | Coding editor with the Monaco CDN blocked | Textarea fallback; run works |
| `/tmp/p2/ui-b2.cjs` | ML: upload CSV, preview, train k-NN, predict, blank input error, history | As expected, no page errors |
| `/tmp/p2/ui-b3.cjs` | New student sees no demo labs; lab card 0/1; viva shows the keyword-check label | As expected |
| `/tmp/p2/ui-b4.cjs` | Exam overview, topic confidence, revision plan; GATE dashboard without an estimated score | As expected |
| `/tmp/p2/ui-sync.cjs` | Exam Prep "Add to Study Planner", then open `/study-planner` | Plan with 10 tasks created and shown; no page errors |

The browser scripts were run from `/tmp` and are not committed. They use the same synthetic-student approach as the probes.
