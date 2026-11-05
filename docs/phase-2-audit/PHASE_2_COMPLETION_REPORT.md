# Phase 2 Completion Report

Branch `claude/project-thread-7zxxwt`, started from `main` at 7124ecb. Work done 2026-11-05. Nothing was deployed.
All tests used synthetic students. Evidence is in `docs/phase-2-audit/evidence/` and the documents linked below.

## 1. Overall status

**Complete, with documented limits.**
- All 12 pages were inspected.
- 60 bugs were found and fixed: 2 P0, 15 P1, 22 P2, 19 P3 and 2 P4.
- All ten required journeys run end to end against a real server and survive a restart. J7 (Viva) and J10 (GATE) are PARTIAL:
  - Viva feedback without an AI key is a labelled keyword check.
  - The GATE question bank is small.
- The main external gap is the AI provider. No key was available, so every AI feature was verified only for its "unavailable" path and with a stubbed model.

## 2. Pages inspected

| # | Page | Status |
|---|---|---|
| 1 | Coding Lab | PASS |
| 2 | DSA Lab | PASS |
| 3 | SQL Lab | PASS |
| 4 | Sandbox | PASS (alias of Coding Lab) |
| 5 | AI/ML Lab | PASS |
| 6 | Machine Learning | No separate page exists; covered by AI/ML Lab |
| 7 | System Design Lab | PASS |
| 8 | Lab Assistant | PASS |
| 9 | Viva | PARTIAL (AI key) |
| 10 | Quiz | PASS |
| 11 | Exam Preparation | PASS |
| 12 | GATE Exam Preparation | PARTIAL (small seed bank) |

Details: `PHASE_2_REPOSITORY_INVENTORY.md`.

## 3. Components per page

| Page | Components | Main ones |
|---|---|---|
| Coding Lab / Sandbox | 13 | editor, toolbar, language selector, output panel, AI chat, saved programs, history, diff |
| DSA Lab | 28 | 8 pages, 15 visualisers, tutor, hints |
| SQL Lab | 1 | single page component |
| AI/ML Lab / Machine Learning | 1 | single page component |
| System Design | 14 | designer, evaluator, simulator, workspaces, catalog, interview, AI drawer |
| Lab Assistant / Viva | 7 | dashboard, workspace, report, upload |
| Quiz | 15 | — |
| Exam Preparation | 1 | single page component |
| GATE | 12 | — |

Every component's status is in `PHASE_2_COMPONENT_AUDIT.md`.

## 4. Features working (verified)

- **Coding.** Write, run, save, reopen and history. Real compile, runtime, timeout and memory statuses.
- **DSA.** Hidden-test grading and progress.
- **SQL.** Real SQLite with saved queries, history and CSV export.
- **ML.**
  - CSV upload and validation.
  - Preprocessing fitted on training rows.
  - Six real algorithms with held-out metrics.
  - Validated predictions with history.
- **System Design.** Challenge, diagram save, reload and continue; checklist interview practice.
- **Lab Assistant.** Experiments, sandboxed code runs, observations, and reports built from real data.
- **Viva.** Answers and feedback history.
- **Quiz.** Create, attempt, server scoring, review after submit, and notifications.
- **Exam Prep.** Real exam data, readiness from confidence, a data-driven revision plan, and Study Planner sync.
- **GATE.** Paper and topic selection, practice with negative marking, mock tests with raw marks and a server timer, and a dashboard from real attempts.

## 5. Features repaired

These were present but broken or fake. Bug ids are in `PHASE_2_BUG_TRACKER.md`.

- **Code execution isolation** (P2-001).
- **SQL engine** (P2-004).
- **ML algorithms and preprocessing** (P2-013).
- **Interview scoring** (P2-020).
- **Lab ownership and demo-data leak** (P2-022, 023).
- **Viva generate route** (P2-025).
- **Lab report content** (P2-026, 029).
- **Answer leaks** (P2-003, 033, 039, 043, 057, 058, 059).
- **GATE.** Fabricated score (P2-034), invented profile (P2-038), unanswered penalties and inflated attempts (P2-040, 050), client-only timer (P2-042).
- **Exam Prep.** Hardcoded plan and insight (P2-035), invented defaults (P2-036).
- **Notification text and links** (P2-048, 049).
- **AI features that returned templates instead of 503** (P2-006, 021, 027, 041, 056).

## 6. Features implemented (new)

- SQL Lab saved queries and CSV export.
- ML dataset removal, prediction history and k-NN option.
- Exam topic confidence and status updates (`PATCH /exams/:id/topics/:topicId`), and exam deletion.
- **Exam Prep → Study Planner sync** ("Add to Study Planner").
- Server-side GATE timer enforcement.
- Plain-text editor fallback when the Monaco CDN is unreachable.

## 7. APIs verified

More than 50 endpoints across the 12 pages were called by probes or HTTP tests, with body checks. Coverage includes 401 without a token, owner checks, and restart persistence. Per-endpoint table: `PHASE_2_API_AUDIT.md`.

## 8. Database tables and persistence verified

Storage is in-memory Maps saved to a JSON snapshot. Phase 2 kept this design. Every store used by the 12 pages was written, the server was restarted, and the data was read back. Results:
- batch1 8/8.
- batch2 6/6.
- batch5 11/11.
- Student B stayed isolated after the restart.

Details and limits (no SQL Lab migration of old data, whole-file snapshot): `PHASE_2_DATABASE_AUDIT.md`.

## 9. AI integrations verified

| Verified | How |
|---|---|
| Every AI feature on the 12 pages returns 503 `AI_UNAVAILABLE` without a key, and saves nothing | HTTP and unit tests |
| Success paths parse and save model output | Stubbed `AIService.generate` |
| Invalid model output gives 502 | Stubbed `AIService.generate` |

**Not verified:** real model output, prompt quality, latency and prompt injection. No AI result is presented as an official grade. The interview checklist and the viva keyword check are labelled as coverage checks. Table: `PHASE_2_INTEGRATION_REPORT.md`.

## 10. Code and SQL sandbox security results

**Code sandbox.** 27 attack and behaviour cases, all at namespace isolation:
- The app directory is hidden and `/etc/shadow` is denied.
- There is no network.
- Memory, time and output limits work.
- A fork bomb is contained, and signals reach only the student's own namespace.
- The environment carries no secrets.
- Production refuses unisolated runs. Docker's default seccomp profile blocks namespaces, so production needs a suitable profile or an explicit override.

**SQL sandbox.**
- Each student has their own SQLite image in a worker.
- `ATTACH`, `DETACH`, `VACUUM`, `REINDEX` and non-introspection `PRAGMA`s are blocked.
- 3 s timeout with worker restart; 500-row cap.

Report: `PHASE_2_SECURITY_REPORT.md`.

## 11. Cross-module integration results

| Integration | Result |
|---|---|
| Exam Prep → Study Planner (new) | PASS |
| Exam Prep → Quiz | PASS |
| Quiz → Notifications | PASS |
| DSA → Notifications | PASS |
| DSA → progress | PASS |
| Lab Assistant → code sandbox | PASS |
| Lab Assistant → dashboard widget | PASS |
| Lab Assistant → Viva | PASS |
| Legacy lab methods (AI agent tools) → owner-scoped service | PASS |
| GATE attempts → GATE dashboard | PASS |

Not linked yet: GATE tasks with Study Planner, quiz scores with exam readiness, and lab code with Coding Lab saved programs. Details: `PHASE_2_INTEGRATION_REPORT.md`.

## 12. Responsive and accessibility results

The sweep loaded 11 routes at 360, 390, 768, 1024, 1366 and 1440 px, for 66 page loads:
- 0 horizontal overflow.
- 0 page errors.
- 0 unlabelled buttons or inputs (49 labels were added).
- 0 images without alt text.
- One h1 per page.

Not done: a screen-reader pass and a contrast audit.

## 13. Tests passed and failed (final run)

| Suite | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npx vitest run` | 854 / 854 passed in 53 files (baseline 818). 4 new test files; 7 existing files updated to expect the honest behaviour |
| Probes | 100 / 100 checks passed: batch1 12 + 8, batch2 19 + 6, batch5 44 + 11 |
| Sandbox attack cases | 27 / 27 contained |
| Browser journeys | 5 Playwright scripts as expected, no page errors |

Failed: none in the final run. Test list: `PHASE_2_TEST_CASES.md`. Journey results: `PHASE_2_E2E_REPORT.md`.

## 14. Bugs fixed by severity

| Severity | Fixed |
|---|---|
| P0 | 2 |
| P1 | 15 |
| P2 | 22 |
| P3 | 19 |
| P4 | 2 |
| **Total** | **60** |

## 15. Remaining issues

**Blocked by external dependencies:**
1. **No AI key.** All AI features are unverified with a live model.
2. **Docker seccomp.** The production container must allow user namespaces before code execution will run there.
3. **Missing runtimes.** The production image lacks some language runtimes; those languages are reported as unavailable.

**Open limitations:**
4. **Small GATE bank.** The seeded bank has only 7 CS questions, and the "CS 2024 full" mock test has 7 questions.
5. **Coverage checks, not grading.** The viva keyword check and the interview checklist measure topic coverage, not answer quality.
6. **SQL Lab data and transactions.** Old SQL Lab data from the emulator is not migrated. A transaction must complete within one run.
7. **ML on the main thread.** Training runs on the server's main thread; large datasets will block requests briefly.
8. **Snapshot storage.** One JSON file, written whole, with no migrations.
9. **Monaco CDN.** The editor needs the CDN; there is a textarea fallback.

**Outside the 12 pages:**
10. Mock Interview and Writing Practice show fallback scores (`?? 82`, `|| 80`, `|| 70`, `|| 88`).

## 16. Files created or modified

`git diff --stat 7124ecb..HEAD` lists every file. Main groups:

- **Created, server.**
  - `server/execution/isolation.ts`, `sqlEngine.ts`, `sqlWorker.cjs`.
  - `server/ai/modelOutput.ts`.
  - `server/services/mlAlgorithms.ts`.
- **Created, frontend.** `src/components/code/ResilientCodeEditor.tsx`.
- **Created, tests.** `src/tests/helpers/httpApp.ts` and `src/tests/phase2_{labs,ml_lab,batch3,batch4}.test.ts`.
- **Created, scripts.** `scripts/audit/phase2-{batch1,batch2,batch5,code-sandbox,responsive}.cjs`.
- **Created, docs.** `docs/phase-2-audit/*` (10 reports, the engineering log, evidence and responsive JSON).
- **Modified, server.**
  - `server.ts`.
  - `server/execution/{sandbox,languages}.ts`.
  - Routes: `dsa`, `gate`, `labAssistant`, `learningModules`, `quiz`.
  - Services: `codeAi`, `dsaTutorService`, `gateService`, `labAssistantService`, `learningModulesService`, `mlLabService`, `quizAttempt`, `quizGeneration`, `sqlLabSandboxService`, `systemDesignService`.
  - Other: `server/db/database.ts`, `server/events/eventBus.ts`, `server/middleware/errorHandler.ts`, `server/models/{types,gateTypes,learningModulesTypes}.ts`.
- **Modified, frontend.** Pages and components in coding, dsa, sql-lab, ml-lab, system-design, labs, quiz, exams and gate. Also `src/api/learningModulesApi.ts` and `src/types/learningModules.ts`.
- **Dependency.** `sql.js` added to `package.json`.
- **Removed.** The legacy `/labs` routes in `learningModules.ts`, and a stray probe state file.

## 17. Local commands

```bash
npm install
npm run dev                      # API and app on PORT (default 3000)
npm run lint                     # tsc --noEmit
npm test                         # vitest run

# Journey probes against a running server, with a restart between create and verify
PORT=3300 DATA_SNAPSHOT_PATH=/tmp/p2/snap.json npx tsx server.ts &
BASE=http://localhost:3300 node scripts/audit/phase2-batch1.cjs create   # J1-J3
BASE=http://localhost:3300 node scripts/audit/phase2-batch2.cjs create   # J4
BASE=http://localhost:3300 node scripts/audit/phase2-batch5.cjs create   # J5-J10, integration, security
BASE=http://localhost:3300 node scripts/audit/phase2-code-sandbox.cjs
# stop the server, start it again with the same DATA_SNAPSHOT_PATH, then:
BASE=http://localhost:3300 node scripts/audit/phase2-batch1.cjs verify   # likewise batch2 and batch5
BASE=http://localhost:3300 node scripts/audit/phase2-responsive.cjs out.json
```

Optional settings:
- `GEMINI_API_KEY` enables the AI features.
- `CODE_SANDBOX_ALLOW_UNISOLATED=true` permits unisolated runs in production (not recommended).
- `CODE_SANDBOX_ISOLATION=none` disables isolation for local debugging.

## 18. Recommended next phase

1. **Configure an AI key in a staging environment.** Then run the AI paths live, especially Viva feedback, lab manual extraction, quiz generation and the tutors. Add prompt-injection tests.
2. **Prove the sandbox in the production image.** Build it with the language runtimes and a seccomp profile that allows user namespaces, then rerun `phase2-code-sandbox.cjs` inside it.
3. **Grow the GATE question bank** from licensed or original content, and validate the answer keys.
4. **Apply the same honesty pass** to Mock Interview and Writing Practice.
5. **Add the missing links:**
   - GATE tasks into Study Planner.
   - Quiz results into exam readiness, with the source shown.
6. **Move persistence to a real database** (for example SQLite or Postgres) with migrations. Move ML training to a worker thread.
7. **Run a manual accessibility pass** with a screen reader and a contrast audit.
