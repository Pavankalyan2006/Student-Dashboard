# Phase 3 End-to-End Report

The twelve scenarios from the Phase 3 brief were driven over HTTP against a real server
(`PORT=3400 DATA_SNAPSHOT_PATH=/tmp/p3/snap.json npx tsx server.ts`) with two synthetic students, A and B. After `create`,
the server process was stopped and started again on the same snapshot, and `verify` read the data back. Resume preview and
export, the Git lab, the resume editor and the Batch 4 pages were also driven in Chromium with Playwright.

Status values: **PASS** (every step works and was checked), **PARTIAL** (the flow works but a step depends on something
not available here and was only tested with a stub or mock), **BLOCKED** (the step needs credentials or a network
service that this environment does not have; it was not claimed as passing).

Environment limits that apply to several rows:

- **No AI provider is configured.** Every AI step answers 503 `AI_UNAVAILABLE` and saves nothing; the model path is
  tested with a stubbed model only.
- **No outbound access to GitHub, Codeforces, OpenAlex or Remotive.** Live OAuth, token checks, profile verification,
  paper search and job sync were not run; their failure paths were.
- **No GitHub OAuth app credentials** (`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`) and no authorised test account.

Raw output: `docs/phase-3-audit/evidence/`. TC ids refer to `PHASE_3_TEST_CASES.md`.

| # | Scenario (brief's steps) | Result | What was checked |
|---|---|---|---|
| 1 | Mock Interview: configure, start, answer, complete, feedback, history | **PARTIAL** | Session configured as CODING; DSA type now asks a coding question. Answers scored by a labelled keyword check: junk scores 0, an answer naming the reference concepts gets full coverage, re-answering is refused, no question repeats. Report before completion is 409. Report has no canned observations and takes duration from answer timings. After restart the session is in history as COMPLETED with the same score and B still cannot read it. PARTIAL because AI-scored feedback needs a model (stub-tested in `mock_interviews_master`). `batch1-*.txt` |
| 2 | Project: create, add tasks, link GitHub repository, save, refresh, retrieve | **PASS** | Created with a repository URL and start date; invalid repository URL refused; no invented description. Module and two tasks added; progress computed from tasks. PATCH ignores `student_id` and `progress`. B cannot read it. After restart, repository URL, status and tasks are kept. Linking a repository synced from a connected GitHub account was not run (see 3). `batch1-*.txt` |
| 3 | GitHub: connect, authorise, profile, repositories, sync, disconnect | **BLOCKED** | No OAuth app and no network to github.com. What was checked: OAuth start without an app answers 503 (no hard-coded client id); a callback with only a username no longer connects an account; an invalid or unreachable token connects nothing; sync without a connection is 404; tokens are stripped from every response (`github_workspace_master`). A demo account's invented OAuth connection and repositories were removed (P3-085). `batch1-create.txt`, `batch5-demo-account.txt` |
| 4 | Git: open practice, complete exercise, validate command, result, save progress | **PASS** | Simulated repository (no host commands). Chained and non-git commands refused. A merge produces a conflict; committing with the conflict unresolved is refused; the exercise is graded complete from the repository state. Hints and solution locking work. B has an untouched repository. After restart, completion, repository state and sandbox are kept. Browser check at 1366 and 390. `batch2-*.txt`, `gitlab-*.png` |
| 5 | Research: search, open source, save paper, notes, retrieve | **PARTIAL** | Live OpenAlex search is blocked, so results come from a curated list labelled `CURATED` with a note (never presented as live). Result has a source link. Saving uses a server id; duplicates are not created; notes and reading status saved; B cannot read or edit. After restart, paper, notes and search history are kept. AI analysis, gaps and literature review answer 503. `batch2-*.txt` |
| 6 | Knowledge Base: upload, extract, index, ask, cited answer, refresh, retrieve | **PASS** | Upload is QUEUED then READY; extracted text is the file text (was base64, P3-032); duplicate detected; executables rejected. Search finds the document by its text; collection-scoped search works; B sees nothing. A question without AI returns cited passages labelled extractive; an unrelated question gets no answer and no citations. After restart the document is still found and still cited. `batch2-*.txt` |
| 7 | RAG: select collection, ask, retrieve context, generate answer, verify citations | **PARTIAL** | Retrieval and citations PASS: the answer cites only the matching document, a second topic routes to its own document, an out-of-scope question gets `NO_SOURCES`, a document-scoped question cites nothing else, B gets nothing from A. Confidence is labelled retrieval similarity. PARTIAL because "generate answer" needs a model; the extractive answer is what runs here. Evaluation in `PHASE_3_RAG_EVALUATION.md`. `batch3-*.txt`, `rag-eval.json` |
| 8 | Career: open profile, select target role, analyse skills, generate roadmap, save | **PASS** | New student has no invented alignment or role. Profile rejects bad values and ignores fields it does not own. Roadmap generated from the role's learning path; a step marked complete; B cannot read it. After restart, target role, roadmap and the completed step are kept, and alignment is now measured. `batch3-*.txt` |
| 9 | Resume: create, education, skills, projects, save, preview, export, validate output | **PASS** | Created with no invented target role. Education and skills saved; the student's own project imported (not twice, not another student's). Preview in Chromium shows education, skills and project. Printed to PDF and read back with `pdftotext`: the content is there and the app navigation is not (fixed P3-093). Analysis is a labelled checklist, not an ATS score. After restart, resume, project, skills, version and the same score are kept. AI writing helpers answer 503. `batch3-*.txt`, `batch5-e2e-extra.txt`, `resume-ui.txt` |
| 10 | Application Tracker: save internship, update status, add deadline, dashboard, history | **PASS** | Saved with status SAVED; `javascript:` links and unknown statuses refused; no invented location, deadline or notes. A pasted job description is compared with the profile (declared skills are not counted as evidence, P3-082). Status change adds a timeline entry. B cannot read or change it. After restart, the application, its status and analysis are kept. Tracker page checked at 1366 and 390. Nothing is ever sent to a company. `batch4-*.txt`, `batch5-integration.txt` |
| 11 | Placement: select company/role, practice, complete questions, results, improvement plan | **PASS** | Bank of 36 questions. Empty or unknown answers refused. A wrong answer scores 0% and the time spent is recorded; history kept after restart. Recommendations name their basis. A plan is created for a real role; an unknown role is refused; B cannot read the plan. The AI coach and STAR helper answer 503. `batch4-*.txt`, `batch5-e2e-extra.txt` |
| 12 | Connected Platforms: connect, verify account, sync, disconnect | **PARTIAL** | Link saved as LINKED (a client "oauth_verified" claim is ignored). Verification challenge issued; the live check cannot reach Codeforces here, so the profile stays unverified and says why. Sync of an unverified GitHub link counts only imported repositories. Disconnect works; B cannot read or disconnect A's profile (P0 P3-067 fixed: every student used to share the demo student's profiles). Verification success is tested with mocked GitHub-bio and Codeforces API responses only. `batch4-*.txt`, `batch5-e2e-extra.txt`, `platforms_phase3` |

## Cross-module journey

`phase3-integration.cjs` (13/13): a skill declared on the profile, a project with that technology, the project imported into a
resume, a job description in the tracker and an imported job all see the same data; a document uploaded to the knowledge
base is cited in an answer; student B sees none of A's data. Details in `PHASE_3_INTEGRATION_REPORT.md`.

## Summary

| Result | Scenarios |
|---|---|
| PASS | 2, 4, 6, 8, 9, 10, 11 |
| PARTIAL | 1, 5, 7, 12 (AI provider or external service not available here) |
| BLOCKED | 3 (GitHub OAuth credentials and network) |
| FAIL | none |
