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
