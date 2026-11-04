# Frontend ↔ Backend Mapping

| Page | Frontend API module | Backend route file | Service | Store |
|------|--------------------|--------------------|---------|-------|
| (all pages) | `src/context/StudentContext.tsx`, `src/api/onboardingApi.ts` | `onboarding.ts`, `students.ts`, `goals.ts`, `notifications.ts`, `progress.ts` | `onboardingService`, `goalService`, `progressService` | `DatabaseStore` |
| Dashboard | `features/dashboard/api/dashboardApi.ts` | `dashboard.ts` | `services/dashboard.ts` | `DatabaseStore` |
| Semester Command Center | `src/api/semesterCommandCenterApi.ts` | `semesterCommandCenter.ts` | `semesterCommandCenterService` | `DatabaseStore` |
| AI Tutor / Agent | `features/ai-agent/hooks/useAIChat.ts` (SSE `/ai/chat`), `useConversations.ts` | `ai.ts` | `server/ai/*`, `orchestration/*` | `DatabaseStore` (conversations) |
| Courses | `features/courses/api/coursesApi.ts` | `courses.ts` | `services/courses.ts` | `DatabaseStore` |
| Notes | `features/notes/api/notesApi.ts` | `notes.ts` | `services/notes.ts` | `DatabaseStore` |
| Documents | `features/documents/api/documentsApi.ts` | `documents.ts`, `storage.ts` | `services/documents.ts`, `documentAi.ts`, `documentSummary.ts` | `DatabaseStore` + files under `data/vault` |
| Doubts, Flashcards, Study Planner, Exams, SQL Lab, ML Lab, Applications | `src/api/learningModulesApi.ts` | `learningModules.ts` | `learningModulesService`, `sqlLabSandboxService`, `mlLabService` | static Maps in `LearningModulesService` + `DatabaseStore` |
| Languages | `features/languages/api/languageApi.ts` | `languages.ts` | `languageLearningService` | `DatabaseStore` |
| Coding Lab / Sandbox | `features/coding/api/codingApi.ts` | `coding.ts` | `services/coding.ts`, `codeAi.ts`, `server/execution/sandbox.ts` | `DatabaseStore` |
| DSA Lab | `features/dsa/api/dsaApi.ts` | `dsa.ts` | `services/dsa.ts`, `dsaTutorService.ts`, `dsaStepGenerators.ts` | `DatabaseStore` |
| System Design | `features/system-design/api/systemDesignApi.ts` | `systemDesign.ts` | `systemDesignService` | `DatabaseStore` |
| Lab Assistant / Viva | `features/labs/api/labAssistantApi.ts` | `labAssistant.ts` | `labAssistantService` | `DatabaseStore` |
| Quiz | `features/quiz/api/quizApi.ts` | `quiz.ts` | `quizGeneration.ts`, `quizAttempt.ts`, `quizProgress.ts`, `adaptiveQuiz.ts` | `DatabaseStore` |
| Mock Interviews | `features/mock-interviews/api/mockInterviewApi.ts` | `mockInterviews.ts` | `mockInterviewService.ts`, `mockInterviewEngineService.ts` | `DatabaseStore` |
| GATE | `features/gate/api/gateApi.ts` | `gate.ts` | `gateService` | `DatabaseStore` |
| Projects | `features/projects/api/projectsApi.ts` | `projects.ts` | `projectService.ts` and `project*Service.ts` | `DatabaseStore` |
| GitHub / Git | calls inside `src/pages/GitHub*.tsx`, `Repository*.tsx` | `github.ts` | `githubService.ts`, `githubAnalysisService.ts` | `DatabaseStore` |
| Research | calls inside `src/pages/Research*.tsx` | `research.ts` | `researchService.ts`, `researchProviderService.ts`, `literatureReviewService.ts`, `paperAnalysisService.ts` | `DatabaseStore` |
| Knowledge Base / RAG | `features/knowledge-base/api/knowledgeBaseApi.ts` | `knowledgeBase.ts` | `knowledgeBaseService` | `DatabaseStore` |
| Career, Resume, Skills | `features/career/api/careerApi.ts`, `features/resume/api/resumeApi.ts`, `features/skills/api/skillsApi.ts` | `career.ts`, `resumes.ts`, `skills.ts` | `careerService.ts`, `resumeService.ts`, `skillService.ts`, … | `DatabaseStore` |
| Placements | `features/placements/api/placementsApi.ts` | `placements.ts` | `placementService.ts` and `placement*Service.ts` | `DatabaseStore` |
| Connected Platforms / Sync | `src/api/externalIntegrationsApi.ts` | `externalIntegrations.ts` | `externalIntegrationService` | static Maps |
| External Profiles | `features/profile/api/externalProfilesApi.ts` | `externalProfiles.ts` | `externalProfilesService.ts`, `externalProfileAdapters.ts` | `DatabaseStore` |
| Jobs Discovery | `features/jobs/api/jobsApi.ts` | `jobsDiscovery.ts` | `jobAggregationService` | `DatabaseStore` |
| Community (hub, Q&A, discussions, resources) | `src/api/communityProfileApi.ts` | `community.ts` | `communityService.ts`, `moderationService.ts` | `DatabaseStore` |
| Progress, Goals, Profile, Notifications, Settings | `src/api/communityProfileApi.ts`, `src/api/notifications.ts` | `progress.ts`, `goals.ts`, `profile.ts`, `notifications.ts` | profile/goal/progress services | `DatabaseStore` |

The shared HTTP client is `src/api/client.ts` (`apiClient`), which unwraps `{ success, data }` envelopes and redirects to `/login` on 401.
