# Phase 3 Engineering Log

Branch `claude/project-thread-c2c9aj`, started from `main` at dbca1b0 (PR #4, Phase 2, merged).
Baseline on 2026-11-07: `npx tsc --noEmit` 0 errors, `npx vitest run` 854/854 (53 files).

Conventions carried from Phases 1 and 2: status values PASS / PARTIAL / BLOCKED / NOT IMPLEMENTED; bug ids `P3-NNN`
(severity P0-P4); no AI key, so AI paths return 503 AI_UNAVAILABLE and are tested with a stubbed model
(`stubModel` in `src/tests/helpers/mockAIModel.ts`); persistence is the JSON snapshot; synthetic students only.

## Resume here
See the last entry. Probe scripts: `scripts/audit/phase3-*.cjs` (need a running server, `BASE=http://localhost:PORT`).
Restart between `create` and `verify` to prove persistence.

## Entries
- 2026-11-07 04:10 Discovery. Sidebar has "Git" only as a badge on GitHub and `/git` renders the GitHub dashboard; "RAG" is a
  badge on Knowledge Base and `/rag` renders the Knowledge Base page. Two mock interview engines share one table:
  `/mock-interviews/*` (MockInterviewEngineService, used by the UI) and `/placements/interviews/*` (MockInterviewService,
  used by the AI agent tools and unrouted placement pages). Container network: api.github.com answers 403 through the proxy,
  so live GitHub calls are BLOCKED here.
- 2026-11-07 04:25 Batch 1 done (Mock Interviews, Projects, GitHub). Fixed P3-001..P3-022 (see bug tracker).
  Evidence: `scripts/audit/phase3-batch1.cjs create` 40/40 PASS, `verify` after restart 5/5 PASS
  (`docs/phase-3-audit/evidence/batch1-*.txt`); updated unit tests in mock_interviews_master, placements, projects,
  github_workspace_master, research_github.
- 2026-11-07 04:40 Research done (P3-023..P3-029). Search tries live OpenAlex; in this container it fails (`fetch failed`,
  network policy), so results come from the curated list labelled CURATED with the live error shown. Analysis, summary,
  literature review, gaps and ideas need the model (503 without; tested with `stubModel`). Notes, reading status and
  paper removal added. research_github.test.ts rewritten for the honest behaviour (33/33).
- 2026-11-07 05:05 Git practice lab built (user chose "Build a compact Git practice lab"). Engine
  `server/services/gitLab/gitSimulator.ts` (pure state machine, no child_process/fs), content in `gitLabContent.ts`,
  service `gitLabService.ts` (persisted as snapshot source `gitLab`), routes `/api/v1/git-lab/*`, page
  `src/features/git-lab/pages/GitLabPage.tsx` at `/git`. Every exercise's reference solution is run in
  `src/tests/git_lab.test.ts` and must pass all checks; a wrong approach must not. Browser check
  (`scripts/audit/phase3-gitlab-ui.cjs`) found P3-031 (page crash after first command), fixed.
  Evidence: `scripts/audit/phase3-batch2.cjs create` 31/31, `verify` after restart 8/8 (`evidence/batch2-*.txt`),
  screenshots `evidence/gitlab-1366.png`, `gitlab-390.png`. Tests 883/883, tsc 0.
  Next: Knowledge Base (Batch 2 last module).
- 2026-11-07 05:25 Knowledge Base done (P3-032..P3-039). Root causes: bare-base64 uploads were parsed as text, and the
  vector store was not persisted. Answers are now grounded or say NO_SOURCES; extractive mode without AI. Batch 2 evidence:
  `phase3-batch2.cjs create` 49/49, `verify` after restart 12/12. Tests 888/888, tsc 0. Batch 2 complete.
  Next: Batch 3 (RAG, Career, Resume).
- 2026-11-07 05:45 RAG done (P3-039..P3-042). Embeddings are a local 128-bucket hashed bag of words, not semantic; UI
  labels now say so. Retrieval = vector + keyword path with a shared-content-word gate. Evaluation
  (`scripts/audit/phase3-rag-eval.ts`, `evidence/rag-eval.json`, 8 documents, 25 queries): lexical hit@1 16/16 (MRR 1.0),
  paraphrase hit@1 1/4 and hit@3 2/4 (a known limit of word matching), out-of-scope refused 4/5 ("quantum chromodynamics"
  matched "time quantum"), cross-student leaks 0/5. Answer generation not evaluated: no AI provider in this container.
- 2026-11-07 06:05 Career done (P3-043..P3-046). Invented default profile, broken course links, demo-record roadmaps,
  substring skill matching and invented dashboard numbers removed. Tests 898/898.
- 2026-11-07 06:40 Resume done (P3-047..P3-058). AI helpers are model-only suggestions (503 without a model); the analysis
  score is a checklist of counts (no baselines, no "ATS" claim); `/resume/create` and project import no longer use demo ids.
  Export is the browser print of the preview page (`/resume/:id/preview?print=true`); not separately changed.
  Evidence: `phase3-batch3.cjs create` 32/32, `verify` after restart 7/7 (`evidence/batch3-*.txt`);
  `phase3-resume-ui.cjs` at 1366 and 390 (no overflow, no page errors, `evidence/resume-ui.txt`, `resume-editor-*.png`).
  Tests 905/905, tsc 0. Batch 3 complete. Next: Batch 4 (Applications, Placement Prep, Connected Platforms).
