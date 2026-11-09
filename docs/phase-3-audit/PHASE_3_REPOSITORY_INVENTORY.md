# Phase 3 Repository Inventory

Baseline: `main` at `dbca1b0`. Branch: `claude/project-thread-c2c9aj`.

## Stack

| Layer | What it is |
|---|---|
| Frontend | React and Vite. Custom router in `src/App.tsx`. Pages live in `src/features/<module>/` and `src/pages/`. Shell: `src/components/layout/AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`. |
| Backend | Express. `server.ts` starts it, and `server/api/router.ts` mounts every route file under `/api/v1`. |
| Auth | JWT. `requireAuth` sets `req.user.userId`, which is the only student id the Phase 3 routes use. |
| Data | An in-memory `db` (`server/db/database.ts`) and static Maps on some services. They are saved to a JSON snapshot by `server/db/persistence.ts`. See `PHASE_3_DATABASE_AUDIT.md`. |
| AI | `server/ai/modelOutput.ts` (`isModelAvailable`, `requireModelText`, `parseModelJson`). Without a provider every AI step answers 503 `AI_UNAVAILABLE`. |
| Tests | Vitest, in `src/tests/` (60 files). HTTP probes are in `scripts/audit/phase3-*.cjs`. |

## Modules

Under **Tests**, files marked new were added in Phase 3.

| # | Module | Frontend | Routes (`server/api/routes/`) | Services | Tests |
|---|---|---|---|---|---|
| 1 | Mock Interviews | `features/mock-interviews/` (setup modal, workspace, report view) | `mockInterviews.ts` | `mockInterviewService.ts`, `mockInterviewEngineService.ts` | `mock_interviews_master` |
| 2 | Projects | `features/projects/pages/ProjectWorkspacePage.tsx` and others | `projects.ts` | `projectService.ts`, `projectAIService.ts`, `projectPlanningService.ts`, `projectArchitectureService.ts`, `projectDocumentationService.ts` | `projects` |
| 3 | GitHub | `pages/GitHubConnectPage.tsx`, `pages/GitHubDashboardPage.tsx`, `features/github/` | `github.ts` | `githubService.ts`, `githubAnalysisService.ts` | `github_workspace_master`, `research_github` |
| 4 | Git | `features/git-lab/pages/GitLabPage.tsx` (new) | `gitLab.ts` (new) | `gitLabService.ts`, `gitLab/gitSimulator.ts`, `gitLab/gitLabContent.ts` (all new) | `git_lab` (new) |
| 5 | Research | `features/research/` (`PapersPanel` and others) | `research.ts` | `researchService.ts`, `researchProviderService.ts`, `paperAnalysisService.ts`, `literatureReviewService.ts`, `researchCitationService.ts` | `research_github` |
| 6 | Knowledge Base | `features/knowledge-base/`, `features/documents/` | `knowledgeBase.ts`, `documents.ts` | `knowledgeBaseService.ts`, `documents.ts`, `processing/processor.ts`, `storage/storage.ts` | `knowledge_base_master`, `documents_workspace_master` |
| 7 | RAG | Knowledge Base Q&A and semantic search components | `knowledgeBase.ts` | `rag/embeddings.ts`, `rag/vectorStore.ts`, `rag/retriever.ts` | `rag_retrieval` (new), `knowledge_base_master` |
| 8 | Career | `features/career/pages/CareerDashboardPage.tsx`, `JobDiscoveryPage.tsx` | `career.ts` | `careerService.ts`, `careerAIService.ts` | `career_phase3` (new), `career_integrated_system_master` |
| 9 | Resume | `features/resume/` (`ResumePage`, `ResumeEditorPage`, `ResumeCreatePage` (new), `ResumeAnalysisModal`) | `resumes.ts` | `resumeService.ts`, `resumeAnalysisService.ts`, `resumeTailoringService.ts` | `resume_phase3` (new), `resume_career_skills` |
| 10 | Applications Tracker | `features/applications/pages/ApplicationTrackerPage.tsx`, `features/jobs/` | `learningModules.ts` (applications), `jobsDiscovery.ts` | `learningModulesService.ts`, `jobAggregationService.ts`, `jobAiService.ts` | `applications_phase3` (new), `jobs_discovery_master` |
| 11 | Placement Prep | `features/placements/` | `placements.ts` | `placementService.ts`, `placementPlanService.ts`, `placementAIService.ts` | `placement_phase3` (new), `placements` |
| 12 | Connected Platforms | `features/integrations/pages/IntegrationsCenterPage.tsx`, `features/profile/pages/ExternalProfilesPage.tsx`, `ExternalProfileHubPage.tsx`, `ProfileSettingsPage.tsx` | `externalProfiles.ts`, `externalIntegrations.ts` | `externalProfilesService.ts`, `externalProfileAdapters.ts`, `externalProfilesCatalog.ts`, `externalIntegrationService.ts`, `externalIntegrationRegistry.ts`, `platformVerification.ts` (new) | `platforms_phase3` (new), `external_profiles_master` |

## Phase 3 file changes

`git diff --stat dbca1b0` reports 231 files changed. That count includes the audit docs, the evidence files and the
probe scripts.

- **New code:** the Git lab (`gitLab.ts`, `gitLabService.ts`, `gitLab/*`, `GitLabPage.tsx`, `gitLabApi.ts`),
  `platformVerification.ts` and `ResumeCreatePage.tsx`.
- **Deleted:** four unused, unrouted mock-interview pages under `features/placements/pages/` (Setup, Session, Result
  and History). They duplicated the routed Mock Interviews module and called endpoints that no longer exist.
- **Modified:** the routes, services, types and pages listed above, plus `server/db/database.ts`, `jobsCatalog.ts`,
  `seedPlacements.ts` and `seedCareerResume.ts`.

Modules from Phases 1 and 2 kept their routes and tests, and their probes still pass (`evidence/batch5-regression.txt`).

## Present before Phase 3, not changed

- `server/api/routes/admin.ts` existed on `main` before Phase 3. Phase 3 created no admin role or dashboard.
- The Skills module (`skillService.ts`) was changed only where Phase 3 modules read from it.
