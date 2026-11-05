# Phase 1 Fix Implementation Log

Every fix is listed with its root cause in `BUG_TRACKER.md` (P1-001..P1-047). This log maps commits to fixes. All commits are on branch `claude/project-thread-g85yyh` (PR #3).

| Commit | Batch | Fixes | Main files |
|---|---|---|---|
| 87c8499 | 1–2 | P1-001..011: per-student semester, honest semester client, wizard saves, dashboard widgets without invented values, persistence of onboarding/career/ML/SQL stores | `semesterCommandCenterService.ts`, `semesterCommandCenterApi.ts`, `onboardingService.ts`, `server.ts`, dashboard widgets |
| e545d7c | 3 | P1-012..019: quiz and tutor flashcards 503, attach uploads, demo-only sample decks, agents report real tool data only, failed plan steps, AI status endpoint | `quizGeneration.ts`, `server/ai/*`, `orchestration/*`, `features/ai-agent/*` |
| c2efc0b, e729552 | 4 | P1-020..023: private course access checks, archive without enrollment, honest note AI actions, aria-pressed | `database.ts`, `notes.ts`, `features/courses/*` |
| 38079e3 | 5 | P1-024..030: upload validation for new docs and versions, extractive summaries, study material 503, doubts saved OPEN | `documents.ts`, `documentSummary.ts`, `provider.ts`, `knowledgeBaseService.ts`, `learningModulesService.ts`, `DoubtSolverPage.tsx` |
| a1124f0 | 6 | P1-031..033: due-queue reviews saved, rating validation, flashcard generator 503 | `FlashcardStudyModal.tsx`, flashcard routes, `learningModulesService.ts` |
| f9daf7d | 7 | P1-034..045: Study Planner seed, add-task, hours, dates; Language writing, partner and translate 503, status codes, translate auth, lesson and rating validation, toasts | `learningModulesService.ts`, `languageLearningService.ts`, `languages.ts`, `StudyPlannerPage.tsx`, `features/languages/*` |
| (batch 8 commit) | 8 | P1-046..047: accessible names and heading levels; audit scripts for responsive and persistence checks; reports | 12 component files, `scripts/audit/phase1-*.cjs`, `docs/phase-1-audit/*` |

**Test changes.** Tests were changed only where they asserted the old wrong behaviour:
- template AI output, now stubbed model plus an AI-off case;
- a free-text review date, now expected to be rejected.

No test was skipped, disabled or deleted.
