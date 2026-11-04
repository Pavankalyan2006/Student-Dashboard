# Application Feature Inventory & System Manifest
**B.Tech Student AI Learning Platform**
*Last Updated: 2026-10-16*

---

## 1. System Overview & Technology Stack

| Layer | Technology | Details / Versions |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 / Vite 5 / TypeScript | Clean component architecture, TailwindCSS, Lucide Icons, Sonner |
| **Backend Framework** | Node.js / Express 4 / TypeScript | REST API router, centralized error handling, event bus architecture |
| **Database & Persistence** | In-Memory DatabaseStore with Seed Engine | Typed collections, relational maps, audit logging, JSON schema validation |
| **Authentication** | JWT (JSON Web Tokens) & Bcrypt | Access + Refresh token flow, HTTP-only cookie support, strict password hashing |
| **Multi-Agent AI Engine** | StudentContextEngine & AgentRegistry | 38 domain-specific agents, tool execution registry, Gemini AI providers |
| **Execution Sandboxes** | Isolated Worker Process Sandboxes | Python, JavaScript/Node.js, C, C++, Java with timeouts & memory caps |
| **Testing Framework** | Vitest 1.3+ | 27 suites, 412 automated tests covering lifecycle, auth, labs, and security |

---

## 2. Page-by-Page Manifest & Feature Inventory

### 1. Public Website & Discovery
- **Route**: `/`, `/about`, `/how-it-works`
- **Page Component**: `HomePage.tsx`, `AboutPage.tsx`, `HowItWorksPage.tsx`
- **Purpose**: Public-facing platform introduction, curriculum overview, feature tour, and portal entry.
- **Shared Layout**: `PublicLayout.tsx` (unauthenticated header, footer, navigation).
- **Components**: Hero banner, curriculum highlights, feature showcase, interactive CTA cards.
- **Controls**: "Enter Student Portal", "Get Started", "Explore Curriculum" buttons.
- **API Dependencies**: None (static public presentation).
- **Security**: Publicly accessible.
- **Test Cases**: `src/tests/public_website.test.ts`
- **Status**: **PASSED (Production Ready)**

---

### 2. Authentication & 5-Step Student Onboarding
- **Route**: `/login`, `/register`, `/onboarding`
- **Page Component**: `LoginPage.tsx`, `OnboardingPage.tsx`
- **Purpose**: Account creation, authentication, and 5-page student academic personalization.
- **Shared Layout**: Standalone onboarding container with progress stepper.
- **Components**: 5-step stepper, input fields, branch select, skill tags, level pickers, review cards, consent checkbox.
- **5-Page Structure**:
  1. **Page 1 (Account & Identity)**: Full name, display name, email, phone, country, language.
  2. **Page 2 (Academic Profile)**: Degree (B.Tech), branch, institution, year, semester (1–8), CGPA, current subjects.
  3. **Page 3 (Skills & Career Goals)**: Technical skills with levels (Not started, Beginner, Intermediate, Advanced), career directions, target job role, target companies, GitHub/LinkedIn.
  4. **Page 4 (Preferences & Study Hours)**: Learning style (Hands-on, Deep dive), programming languages, daily study hours (e.g. 2 hrs/day), time windows.
  5. **Page 5 (Review, Consent & Completion)**: Summary cards with edit links, terms & consent checkbox, "Complete Setup & Launch Dashboard" button.
- **API Dependencies**: `/auth/login`, `/auth/register`, `/students/me/onboarding`, `/students/me/education`, `/students/me/preferences`, `/students/me/skills-assessment`, `/students/me/career-goals`, `/students/me/study-constraints`, `/students/me/onboarding/complete`.
- **Database Entities**: `db.students`, `db.education_profiles`, `db.career_goals`, `db.learning_preferences`, `db.study_constraints`.
- **Security**: Password hashing with Bcrypt, JWT issuance, identity scoping.
- **Test Cases**: `src/tests/auth.test.ts`, `src/tests/student_onboarding_intelligence.test.ts`, `src/tests/complete_student_lifecycle_e2e.test.ts`, `src/tests/synthetic_aarav_registration_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 3. Student Dashboard
- **Route**: `/dashboard`
- **Page Component**: `DashboardPage.tsx`
- **Purpose**: Central student workspace displaying personalized greeting, today's study plan, enrolled courses, upcoming deadlines, and focus milestones.
- **Shared Layout**: `AppShell.tsx` (sidebar, header, breadcrumbs, profile menu).
- **Components**: Welcome header, streak counter, study plan agenda, course progress cards, upcoming exam alerts.
- **Controls**: "Start Study Task", "Continue Learning", "View Syllabus", "Open Coding Lab" quick buttons.
- **Personalization**: Enrolled branch, semester, target career role, syllabus tasks, and academic events.
- **API Dependencies**: `/dashboard`, `/students/me/profile`.
- **Security**: Protected route, student authorization check.
- **Test Cases**: `src/tests/dashboard.test.ts`, `src/tests/complete_student_lifecycle_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 4. Academic Semester Command Center
- **Route**: `/semester`, `/semester-command-center/*`
- **Page Component**: `SemesterOverviewPage.tsx`, `SemesterSubjectsSyllabusPage.tsx`, `SemesterCalendarEventsPage.tsx`, `SemesterExamsSlipTestsPage.tsx`, `SemesterRecoveryGuidancePage.tsx`, `SemesterStudyStreamPage.tsx`.
- **Purpose**: Complete academic engine tracking branch syllabus units, topics, slip tests, internal exams, and automated recovery plans.
- **Components**: Subject syllabus accordion, topic completion toggles, exam countdowns, recovery plan cards.
- **Controls**: Add subject, toggle topic completed, record test score, resolve recovery plan.
- **API Dependencies**: `/semester/overview`, `/semester/subjects`, `/semester/slip-tests`, `/semester/recovery-plans`.
- **Database Entities**: `db.semesters`, `db.semester_subjects`, `db.syllabus_units`, `db.academic_events`.
- **Security**: Strict student data isolation.
- **Test Cases**: `src/tests/complete_student_lifecycle_e2e.test.ts`, `src/tests/synthetic_aarav_registration_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 5. AI Tutor & Multi-Agent Assistant
- **Route**: `/ai-tutor`, `/ai-agent`
- **Page Component**: `AiAgentPage.tsx`
- **Purpose**: Conversational AI tutor orchestrating 38 domain agents (Academic, Coding, DSA, System Design, Career, Placement) with student context injection.
- **Components**: Chat message stream, agent selector, code block renderer with copy button, markdown and LaTeX math renderer, feedback controls.
- **Controls**: Send message, stop generation, switch agent, retry question, copy answer.
- **Personalization**: `StudentContextEngine` injects student branch, current semester, college, target role, and preferred explanation depth into prompts.
- **API Dependencies**: `/ai/chat`, `/ai/agent/execute`, `/ai/tools`.
- **Security**: Enforces tool execution authorization, sandboxed side-effects.
- **Test Cases**: `src/tests/ai.test.ts`, `src/tests/agent.test.ts`, `src/tests/multi_agent_orchestration.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 6. Courses & Interactive Player
- **Route**: `/courses`, `/courses/:id`, `/courses/:id/learn/:lessonId`
- **Page Component**: `CoursesPage.tsx`, `CourseDetailPage.tsx`, `CourseLearningPage.tsx`.
- **Purpose**: Course catalog with curriculum chapters, rich lesson reader, video lectures, and bookmarking.
- **Components**: Course search, category filters, chapter sidebar, lesson content viewer, mark-complete toggle.
- **API Dependencies**: `/courses`, `/courses/:id`, `/courses/:id/lessons/:lessonId`.
- **Database Entities**: `db.courses`, `db.lessons`, `db.course_enrollments`.
- **Test Cases**: `src/tests/courses.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 7. AI Notes Generator & Knowledge Vault
- **Route**: `/notes`, `/notes/:id`, `/documents`
- **Page Component**: `NotesPage.tsx`, `NoteDetailPage.tsx`, `DocumentsPage.tsx`, `DocumentWorkspacePage.tsx`.
- **Purpose**: Generates structured, exam-oriented study notes from syllabus topics or course lessons; processes PDF/DOCX/PPTX documents with OCR and semantic summarization.
- **Components**: Notes grid, search & tag filter, markdown note viewer, PDF multi-page viewer, document summarizer tab.
- **API Dependencies**: `/notes`, `/notes/generate`, `/documents/upload`, `/documents/:id/summary`.
- **Database Entities**: `db.notes`, `db.documents`, `db.document_chunks`.
- **Security**: Documents and notes are strictly owned by authenticated student; cross-student access throws 403 Forbidden.
- **Test Cases**: `src/tests/notes.test.ts`, `src/tests/documents.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 8. Doubt Solver, Flashcards & Spaced Revision
- **Route**: `/doubts`, `/flashcards`, `/revision`
- **Page Component**: `DoubtSolverPage.tsx`, `FlashcardsPage.tsx`.
- **Purpose**: Instant doubt resolution with step-by-step mathematical breakdown; Leitner spaced repetition flashcards with confidence ratings.
- **Components**: Question input, subject selector, card flip animation, confidence rating buttons (Again, Hard, Good, Easy), review history table.
- **API Dependencies**: `/doubts/resolve`, `/flashcards/decks`, `/flashcards/review`.
- **Test Cases**: `src/tests/learning_modules_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 9. Study Planner & Daily Agenda
- **Route**: `/study-planner`
- **Page Component**: `StudyPlannerPage.tsx`
- **Purpose**: Generates and manages daily/weekly study tasks aligned with the student's enrolled branch subjects, semester exam calendar, and daily study hours budget.
- **Components**: Weekly calendar agenda, task checklist, duration chips, priority badges, complete/reschedule actions.
- **API Dependencies**: `/study-plans`, `/study-plans/:id/tasks/:taskId/status`.
- **Database Entities**: `db.study_plans`, `db.study_tasks`.
- **Test Cases**: `src/tests/learning_modules_e2e.test.ts`, `src/tests/complete_student_lifecycle_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 10. Coding Lab, DSA Lab & Execution Sandboxes
- **Route**: `/coding`, `/dsa`, `/dsa/visualize/:id`, `/sandbox`
- **Page Component**: `CodingLabPage.tsx`, `CodingEditorPage.tsx`, `DSALabPage.tsx`, `DSAVisualizePage.tsx`, `DSAProblemPage.tsx`.
- **Purpose**: Multi-language code execution environment (Python, JS, C, C++, Java) with live standard I/O console; algorithm visualizer with step controls for Trees, Graphs, Sorting, DP; problem submission with hidden test-case verification.
- **Components**: Monaco-style code editor, language selector, stdin input panel, stdout/stderr console, interactive SVG algorithm visualizer, test case pass/fail report.
- **API Dependencies**: `/execution/run`, `/dsa/problems`, `/dsa/submit`, `/dsa/visualize`.
- **Security**: Child-process worker sandboxes with 5-second timeout and memory limits; untrusted shell execution prevented.
- **Test Cases**: `src/tests/coding.test.ts`, `src/tests/dsa.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 11. SQL Lab, ML Lab & System Design Lab
- **Route**: `/sql-lab`, `/ml-lab`, `/system-design`
- **Page Component**: `SqlLabPage.tsx`, `MlLabPage.tsx`, `SystemDesignLabPage.tsx`.
- **Purpose**: SQL query editor with live university database schema and results grid; interactive machine learning experiment runner (Iris, California Housing, Random Forest, Regression); system design architecture workspace (TinyURL, Scalable Chat).
- **Components**: SQL syntax editor, tabular result viewer, dataset feature selectors, model hyperparameter sliders, metrics cards (Accuracy, F1, Loss), system design component topology cards.
- **API Dependencies**: `/sql/execute`, `/ml/train`, `/system-design/problems`.
- **Test Cases**: `src/tests/practice_labs_e2e.test.ts`, `src/tests/learning_modules_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 12. Lab Assistant & Viva Preparation
- **Route**: `/labs`, `/viva`
- **Page Component**: `LabAssistantPage.tsx`
- **Purpose**: University engineering lab manual companion with theory, step-by-step procedures, observation tables, code templates, and viva voce practice questions.
- **Components**: Experiment selector, procedure steps, observation input grid, expected vs actual outputs, viva question cards with revealable model answers.
- **API Dependencies**: `/labs/experiments`, `/labs/viva`.
- **Test Cases**: `src/tests/practice_labs_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 13. Quiz & Examination Center
- **Route**: `/quiz`, `/quiz/:id`, `/quiz/:id/result`, `/exams`
- **Page Component**: `QuizPage.tsx`, `QuizPlayerPage.tsx`, `QuizResultPage.tsx`, `ExamPreparationPage.tsx`.
- **Purpose**: Timed assessments with auto-scoring, explanation reviews, and academic exam readiness tracking.
- **Components**: Multiple-choice question player, timer, answer option cards, score breakdown with correct answer keys, exam syllabus checklists.
- **API Dependencies**: `/quizzes`, `/quizzes/:id/submit`, `/exams`.
- **Test Cases**: `src/tests/quiz.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 14. Placement Preparation & AI Mock Interviews
- **Route**: `/placements`, `/placements/mock-interview`, `/interviews/*`
- **Page Component**: `PlacementDashboardPage.tsx`, `TechnicalPreparationPage.tsx`, `MockInterviewSetupPage.tsx`, `MockInterviewSessionPage.tsx`, `MockInterviewResultPage.tsx`.
- **Purpose**: Quantitative aptitude, technical interview drills, and real-time AI mock interview sessions with speech-to-text evaluation and detailed rubric feedback.
- **Components**: Category topic selector, timer, audio/text answer recorder, score card, strength & improvement breakdown.
- **API Dependencies**: `/placements/readiness`, `/interviews/sessions`, `/interviews/evaluate`.
- **Test Cases**: `src/tests/placements.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 15. Projects Builder & GitHub Integration
- **Route**: `/projects`, `/projects/:id`, `/github`, `/git`
- **Page Component**: `ProjectsPage.tsx`, `ProjectCreatePage.tsx`, `ProjectWorkspacePage.tsx`, `GitHubDashboardPage.tsx`.
- **Purpose**: Manages B.Tech capstone and minor engineering projects, milestones, tech stacks, and GitHub repository integration.
- **Components**: Project card grid, milestone progress bars, technology badges, OAuth repository explorer, README generator.
- **API Dependencies**: `/projects`, `/projects/:id`, `/github/repositories`.
- **Security**: Project ownership enforced server-side.
- **Test Cases**: `src/tests/projects.test.ts`, `src/tests/research_github.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 16. Research Workspace, AI Knowledge Base & RAG
- **Route**: `/research`, `/knowledge`, `/rag`
- **Page Component**: `ResearchDashboardPage.tsx`, `ResearchWorkspacePage.tsx`, `KnowledgeBasePage.tsx`.
- **Purpose**: Literature review search over scholarly publications, paper notes, custom document knowledge collections, and semantic RAG question answering.
- **Components**: Research paper search bar, paper cards, citation generator, knowledge collection manager, RAG prompt interface with source citation links.
- **API Dependencies**: `/research/papers`, `/knowledge/collections`, `/knowledge/rag/query`.
- **Security**: Collections scoped to student ID; untrusted document prompt injection sanitized.
- **Test Cases**: `src/tests/research_github.test.ts`, `src/tests/learning_modules_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 17. Career Roadmap, Resume Builder & Job Discovery
- **Route**: `/career`, `/resume`, `/resume/edit`, `/applications`, `/jobs`
- **Page Component**: `CareerDashboardPage.tsx`, `CareerRoadmapPage.tsx`, `SkillGapPage.tsx`, `ResumePage.tsx`, `ResumeEditorPage.tsx`, `ApplicationTrackerPage.tsx`, `JobDiscoveryPage.tsx`.
- **Purpose**: Skill-gap analysis against target engineering roles, interactive resume builder with verified project imports, and internship application tracker.
- **Components**: Role roadmap timeline, skill gap comparison matrix, multi-section resume form (Education, Experience, Projects, Skills), live PDF preview, Kanban application status tracker.
- **API Dependencies**: `/career/roles`, `/career/skill-gap`, `/resumes`, `/applications`, `/jobs/search`.
- **Test Cases**: `src/tests/resume_career_skills.test.ts`, `src/tests/learning_modules_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 18. External Platforms & Synchronization
- **Route**: `/integrations`, `/sync`, `/profile/external`
- **Page Component**: `IntegrationsCenterPage.tsx`, `ExternalProfileHubPage.tsx`.
- **Purpose**: Connect external student accounts (LinkedIn, GitHub, LeetCode, HackerRank, CodeChef, Kaggle) to sync verified problem-solving and coding achievements.
- **Components**: Integration platform cards, connection status indicators, last synchronized timestamp, manual sync trigger.
- **API Dependencies**: `/integrations/providers`, `/integrations/sync`.
- **Test Cases**: `src/tests/resume_career_skills.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 19. Community Hub, Q&A Forum & Discussions
- **Route**: `/community`, `/community/questions`, `/community/discussions`, `/community/resources`
- **Page Component**: `CommunityDashboardPage.tsx`, `CommunityQuestionsPage.tsx`, `CommunityDiscussionsPage.tsx`, `CommunityResourcesPage.tsx`.
- **Purpose**: Student collaborative learning hub: ask and answer academic questions, participate in topic discussions, and share verified study resources.
- **Components**: Question feed, answer submission editor, upvote/accept answer controls, discussion threads, resource download cards.
- **API Dependencies**: `/community/questions`, `/community/discussions`, `/community/resources`.
- **Test Cases**: `src/tests/community_profile_progress.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 20. Unified Progress & Learning Goals
- **Route**: `/progress`, `/progress/:subsystem`, `/goals`
- **Page Component**: `ProgressDashboardPage.tsx`, `SubsystemProgressPage.tsx`, `GoalsPage.tsx`.
- **Purpose**: Aggregates real student activity across Courses, Labs, Quizzes, Coding, Projects, and Placements; enables SMART learning goal setting and tracking.
- **Components**: Overall progress donuts, subsystem activity charts, goal creation modal, milestone checklist.
- **API Dependencies**: `/progress/summary`, `/progress/:subsystem`, `/goals`.
- **Test Cases**: `src/tests/community_profile_progress.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 21. Student Profile & Settings
- **Route**: `/profile`, `/profile/edit`, `/profile/settings`, `/settings`
- **Page Component**: `ProfilePage.tsx`, `ProfileEditPage.tsx`, `ProfileSettingsPage.tsx`.
- **Purpose**: Unified student profile management, privacy settings, notification preferences, and account management.
- **Components**: Profile overview card, academic credentials, verified skills grid, privacy visibility toggles (Public/Private), password change dialog.
- **API Dependencies**: `/students/me/profile`, `/students/me/privacy`, `/students/me/preferences`.
- **Test Cases**: `src/tests/community_profile_progress.test.ts`, `src/tests/complete_student_lifecycle_e2e.test.ts`.
- **Status**: **PASSED (Production Ready)**

---

### 22. Notifications Hub
- **Route**: `/notifications`
- **Page Component**: `NotificationsPage.tsx`
- **Purpose**: Center for academic reminders, upcoming examination alerts, and system notifications.
- **Components**: Notification list, filter tabs (All, Unread, Exams, Tasks), mark as read action, destination jump links.
- **API Dependencies**: `/notifications`, `/notifications/read`.
- **Test Cases**: `src/tests/community_profile_progress.test.ts`.
- **Status**: **PASSED (Production Ready)**
