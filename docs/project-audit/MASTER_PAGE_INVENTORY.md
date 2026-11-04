# Master Page Inventory

Source of truth: `src/App.tsx` (custom pathname router inside `renderRoute()`) and
`src/components/navigation/Sidebar.tsx` (`NAV_SECTIONS`). There is no React Router;
every page is rendered inside `AppShell` (`src/components/layout/AppShell.tsx`) after
`StudentContextProvider` loads the student profile.

Auth: all pages below require a signed-in student (JWT in `localStorage.auth_token`,
also an httpOnly `access_token` cookie). Unauthenticated visitors get `LoginPage`.
Authorization is per-student ownership checks in `server/db/database.ts`.

Status legend (spec 3.3): PASS = tested and verified, PARTIAL = some behaviour verified,
FAIL, BLOCKED, NOT IMPLEMENTED. "Render" means the page was opened in Chromium as a
freshly registered student with no console errors and no failing `/api` calls.

Checkpoint: 2026-11-04, branch `claude/project-thread-g85yyh`.

| # | Spec page | Route(s) | Page component | Render | Deeper verification | Status |
|---|-----------|----------|----------------|--------|---------------------|--------|
| 1 | Dashboard | `/dashboard`, `/` | `src/pages/DashboardPage.tsx` (Onboarding until onboarding complete) | PASS | Global context calls fixed (BUG-001) | PARTIAL |
| 2 | Semester Command Center | `/semester-command-center` (+ `/semester/*` sub-routes) | `features/semester-command-center/pages/SemesterOverviewPage.tsx` | PASS | 16px horizontal overflow at 390px | PARTIAL |
| 3 | AI Tutor | `/ai-agent`, `/ai-tutor` | `src/pages/AiAgentPage.tsx` | PASS (after BUG-002/003) | Chat stream, conversation create/list, empty-message validation tested via API | PARTIAL (AI provider BLOCKED: no key) |
| 4 | AI Agent | same page as AI Tutor (`AiAgentPage`) | shared implementation | PASS | see #3 | PARTIAL |
| 5 | Courses | `/courses`, `/courses/:id`, `/courses/:id/learn[/:lessonId]` | `features/courses/pages/*` | PASS | Catalog (108 unique), enroll, duplicate enroll, lesson complete, progress, isolation, catalog write protection (BUG-007/008) | PASS for tested flows |
| 6 | Notes | `/notes`, `/notes/:id` | `features/notes/pages/*` | PASS | Create, empty validation, list, edit, search, delete, isolation; data-loss bug fixed (BUG-006) | PASS for tested flows |
| 7 | Documents | `/documents`, `/documents/upload`, `/documents/:id[/...]` | `features/documents/pages/*` | PASS | Upload/preview not yet exercised | PARTIAL |
| 8 | Doubt Solver | `/doubts`, `/doubt-solver` | `features/doubts/pages/DoubtSolverPage.tsx` | PASS | Not yet exercised | PARTIAL |
| 9 | AI Flashcards | `/flashcards` | `features/flashcards/pages/FlashcardsPage.tsx` | PASS | Deck create (title+subject required), card add, review, isolation; source pickers fixed (BUG-005) | PASS for tested flows |
| 10 | Spaced Revision | `/revision` | same `FlashcardsPage` | PASS | Review endpoint tested via #9 | PARTIAL |
| 11 | Study Planner | `/study-planner` | `features/study-planner/pages/StudyPlannerPage.tsx` | PASS | Not yet exercised | PARTIAL |
| 12 | Language Learning | `/languages`, `/language-learning` | `features/languages/pages/LanguageLearningPage.tsx` | PASS | Query filters were dropped (BUG-004, fixed); page renders two `<h1>` | PARTIAL |
| 13 | Coding Lab | `/coding`, `/coding-lab` | `features/coding/pages/CodingLabPage.tsx` | PASS | Execution not yet exercised | PARTIAL |
| 14 | DSA Lab | `/dsa`, `/dsa-lab`, `/dsa/*` | `features/dsa/pages/*` | PASS | 129 of 150 starter templates did not compile (BUG-011, fixed) | PARTIAL |
| 15 | SQL Lab | `/sql-lab` | `features/sql-lab/pages/SqlLabPage.tsx` | PASS | 320px horizontal overflow at 390px | PARTIAL |
| 16 | Sandbox | `/sandbox` | same `CodingLabPage` | PASS | — | PARTIAL |
| 17 | AI/ML Lab | `/ml-lab` | `features/ml-lab/pages/MlLabPage.tsx` | PASS | 307px overflow at 390px; one flaky test (random dataset) | PARTIAL |
| 18 | Machine Learning | no separate route (`/machine-learning`, `/ml` show 404) | — | — | Same feature as AI/ML Lab | NOT IMPLEMENTED as a separate page |
| 19 | System Design Lab | `/system-design` | `features/system-design/pages/SystemDesignLabPage.tsx` | PASS | — | PARTIAL |
| 20 | Lab Assistant | `/labs`, `/lab-assistant` | `features/labs/pages/LabAssistantPage.tsx` | PASS | AI calls used wrong signature and never reached the provider (BUG-009, fixed) | PARTIAL |
| 21 | Viva | `/viva` | same `LabAssistantPage` | PASS | — | PARTIAL |
| 22 | Quiz | `/quiz` (+ create/player/result/review/history/progress) | `features/quiz/pages/*` | PASS | 30px overflow at 390px | PARTIAL |
| 23 | Exam Preparation | `/exams`, `/exam-preparation` | `features/exams/pages/ExamPreparationPage.tsx` | PASS | 43px overflow at 390px | PARTIAL |
| 24 | Mock Interviews | `/interviews` and `/mock-interviews` (both nav entries) | `features/mock-interviews/pages/MockInterviewsPage.tsx` (one shared implementation) | PASS (both links) | Question filters were dropped (BUG-004, fixed) | PARTIAL |
| 25 | GATE Exam Preparation | `/assessment/gate-preparation`, `/gate` | `features/gate/pages/GateExamPreparationPage.tsx` | PASS | — | PARTIAL |
| 26 | Projects | `/projects`, `/projects/:id[/tab]` | `features/projects/pages/*` | PASS | — | PARTIAL |
| 27 | GitHub | `/github` (+ connect, repos, repo detail) | `src/pages/GitHubDashboardPage.tsx` | PASS | Resume-bullet AI call fixed (BUG-009); OAuth BLOCKED (no client id) | PARTIAL |
| 28 | Git | `/git` | same `GitHubDashboardPage` | PASS | — | PARTIAL |
| 29 | Research | `/research`, `/research/:id` | `src/pages/ResearchDashboardPage.tsx` | PASS | External providers not exercised | PARTIAL |
| 30 | AI Knowledge Base | `/knowledge`, `/knowledge-base` | `features/knowledge/pages/KnowledgeBasePage.tsx` | PASS | Filters (documentId, collectionId, limit) were dropped (BUG-004, fixed) | PARTIAL |
| 31 | RAG | `/rag` | same `KnowledgeBasePage` | PASS | — | PARTIAL |
| 32 | Career | `/career` (+ explore, roadmap, skill-gap, role) | `features/career/pages/*` | PASS | — | PARTIAL |
| 33 | Resume | `/resume` (+ create, templates, edit, preview, tailor) | `features/resume/pages/*` | PASS | — | PARTIAL |
| 34 | Internships / Applications | `/applications`, `/internships`, … | `features/applications/pages/ApplicationTrackerPage.tsx` | PASS | 127px overflow at 390px | PARTIAL |
| 35 | Placement Preparation | `/placement`, `/placements`, `/placement-preparation` | `features/placements/pages/PlacementDashboardPage.tsx` | PASS | — | PARTIAL |
| 36 | Connected Platforms | `/integrations` | `features/integrations/pages/IntegrationsCenterPage.tsx` | PASS | — | PARTIAL |
| 37 | Sync | `/sync`, `/integrations/activity` | same `IntegrationsCenterPage` (not in sidebar) | PASS | — | PARTIAL |
| 38 | External Profiles | `/profile/external` | `features/profile/pages/ExternalProfileHubPage.tsx` | PASS | 79px overflow at 390px | PARTIAL |
| 39 | Jobs Discovery | `/career/jobs`, `/jobs` | `features/jobs/pages/JobsDiscoveryPage.tsx` | PASS | 39px overflow at 390px | PARTIAL |
| 40 | Community Hub | `/community` | `features/community/pages/CommunityDashboardPage.tsx` | PASS | 61px overflow at 390px | PARTIAL |
| 41 | Q&A Forum | `/community/questions` | `features/community/pages/CommunityQuestionsPage.tsx` | PASS | — | PARTIAL |
| 42 | Discussions | `/community/discussions` | `features/community/pages/CommunityDiscussionsPage.tsx` | PASS | — | PARTIAL |
| 43 | Shared Resources | `/community/resources` | `features/community/pages/CommunityResourcesPage.tsx` | PASS | — | PARTIAL |
| 44 | Unified Progress | `/progress`, `/progress/:subsystem` | `features/progress/pages/*` | PASS | — | PARTIAL |
| 45 | Learning Goals | `/goals`, `/goals/:id` | `features/goals/pages/*` | PASS | Create; cross-student read/delete returned 500 (BUG-012, fixed to 403) | PARTIAL |
| 46 | Student Profile | `/profile` (+ edit, activity, achievements, certificates, bookmarks) | `features/profile/pages/*` | PASS | `/profile/export` crashed (BUG-003, fixed) | PARTIAL |
| 47 | Notifications | `/notifications` | `features/notifications/pages/NotificationsPage.tsx` | PASS | List endpoint | PARTIAL |
| 48 | Settings | `/profile/settings`, `/settings` | `features/profile/pages/ProfileSettingsPage.tsx` | PASS | — | PARTIAL |

Additional pages found that are not in the spec list: public site (`/`, `/about`,
`/how-it-works`), onboarding (`/onboarding`, `/register`), certificate verification
(`/verify/certificate/:id`), bookmarks, achievements, skills (`/skills`), placement
sub-pages, and an admin API (`/api/v1/admin/*`, 39 endpoints) with no student-facing page.
`/admin*` URLs redirect to the dashboard in the SPA.
