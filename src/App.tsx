import * as React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/queryClient';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AiAgentPage } from './pages/AiAgentPage';
import { DocumentsPage } from './features/documents/pages/DocumentsPage';
import { DocumentWorkspacePage } from './features/documents/pages/DocumentWorkspacePage';
import { DocumentUploadPage } from './features/documents/pages/DocumentUploadPage';
import { CodingLabPage } from './features/coding/pages/CodingLabPage';
import { CodingEditorPage } from './features/coding/pages/CodingEditorPage';
import { CodingSavedPage } from './features/coding/pages/CodingSavedPage';
import { CodingHistoryPage } from './features/coding/pages/CodingHistoryPage';
import { CoursesPage } from './features/courses/pages/CoursesPage';
import { CourseDetailPage } from './features/courses/pages/CourseDetailPage';
import { CourseLearningPage } from './features/courses/pages/CourseLearningPage';
import { NotesPage } from './features/notes/pages/NotesPage';
import { NoteDetailPage } from './features/notes/pages/NoteDetailPage';
import { DSALabPage } from './features/dsa/pages/DSALabPage';
import { DSATopicsPage } from './features/dsa/pages/DSATopicsPage';
import { DSATopicDetailPage } from './features/dsa/pages/DSATopicDetailPage';
import { DSAVisualizePage } from './features/dsa/pages/DSAVisualizePage';
import { DSAPracticePage } from './features/dsa/pages/DSAPracticePage';
import { DSAProblemPage } from './features/dsa/pages/DSAProblemPage';
import { DSAProgressPage } from './features/dsa/pages/DSAProgressPage';
import { DSAAiTutorPage } from './features/dsa/pages/DSAAiTutorPage';
import { QuizPage } from './features/quiz/pages/QuizPage';
import { PilotFeedbackPage } from './features/feedback/pages/PilotFeedbackPage';
import { QuizCreatePage } from './features/quiz/pages/QuizCreatePage';
import { QuizPlayerPage } from './features/quiz/pages/QuizPlayerPage';
import { QuizResultPage } from './features/quiz/pages/QuizResultPage';
import { QuizReviewPage } from './features/quiz/pages/QuizReviewPage';
import { QuizHistoryPage } from './features/quiz/pages/QuizHistoryPage';
import { QuizProgressPage } from './features/quiz/pages/QuizProgressPage';
import { ProjectsPage } from './features/projects/pages/ProjectsPage';
import { ProjectCreatePage } from './features/projects/pages/ProjectCreatePage';
import { ProjectWorkspacePage } from './features/projects/pages/ProjectWorkspacePage';
import { PlacementDashboardPage } from './features/placements/pages/PlacementDashboardPage';
import { PlacementTopicsPage } from './features/placements/pages/PlacementTopicsPage';
import { PlacementTopicDetailPage } from './features/placements/pages/PlacementTopicDetailPage';
import { PlacementCompaniesPage } from './features/placements/pages/PlacementCompaniesPage';
import { PlacementPlanPage } from './features/placements/pages/PlacementPlanPage';
import { TechnicalPreparationPage } from './features/placements/pages/TechnicalPreparationPage';
import { RolePreparationPage } from './features/placements/pages/RolePreparationPage';
import { PlacementProgressPage } from './features/placements/pages/PlacementProgressPage';
import { MockInterviewsPage } from './features/mock-interviews/pages/MockInterviewsPage';
// Phase 12: Resume Builder, Career Assistant & Skill Assessment Pages
import { ResumePage } from './features/resume/pages/ResumePage';
import { ResumeEditorPage } from './features/resume/pages/ResumeEditorPage';
import { ResumeCreatePage } from './features/resume/pages/ResumeCreatePage';
import { ResumePreviewPage } from './features/resume/pages/ResumePreviewPage';
import { ResumeTailorPage } from './features/resume/pages/ResumeTailorPage';
import { ResumeTemplatesPage } from './features/resume/pages/ResumeTemplatesPage';
import { CareerDashboardPage } from './features/career/pages/CareerDashboardPage';
import { CareerExplorePage } from './features/career/pages/CareerExplorePage';
import { CareerRoleDetailPage } from './features/career/pages/CareerRoleDetailPage';
import { CareerRoadmapPage } from './features/career/pages/CareerRoadmapPage';
import { SkillGapPage } from './features/career/pages/SkillGapPage';
import { SkillProfilePage } from './features/skills/pages/SkillProfilePage';
import { SkillAssessmentPage } from './features/skills/pages/SkillAssessmentPage';
// Phase 13: Research Assistant & GitHub Integration Pages
import { ResearchDashboardPage } from './pages/ResearchDashboardPage';
import { CreateResearchProjectPage } from './pages/CreateResearchProjectPage';
import { ResearchWorkspacePage } from './pages/ResearchWorkspacePage';
import { GitHubDashboardPage } from './pages/GitHubDashboardPage';
import { GitHubConnectPage } from './pages/GitHubConnectPage';
import { RepositoryListPage } from './pages/RepositoryListPage';
import { RepositoryDetailPage } from './pages/RepositoryDetailPage';
// Phase 14: Community, Student Profile, Progress & Student Utilities
import { ProfilePage } from './features/profile/pages/ProfilePage';
import { ProfileEditPage } from './features/profile/pages/ProfileEditPage';
import { ProfileRecommendationsPanel } from './features/profile/components/ProfileManager';

/** Module landing routes that show profile-based recommendations, mapped to the recommendation module. */
const PROFILE_RECOMMENDATION_ROUTES: Record<string, string> = {
  '/courses': 'courses',
  '/coding': 'coding',
  '/coding-lab': 'coding',
  '/dsa': 'dsa',
  '/dsa-lab': 'dsa',
  '/sql-lab': 'sql',
  '/ml-lab': 'ml',
  '/system-design': 'system_design',
  '/gate': 'gate',
  '/mock-interviews': 'interview',
  '/career': 'career',
  '/jobs': 'jobs',
  '/placements': 'placement',
  '/study-planner': 'planner',
};
import { ProfileActivityPage } from './features/profile/pages/ProfileActivityPage';
import { ProfileAchievementsPage } from './features/profile/pages/ProfileAchievementsPage';
import { ProfileCertificatesPage } from './features/profile/pages/ProfileCertificatesPage';
import { CertificateVerificationPage } from './features/profile/pages/CertificateVerificationPage';
import { ProfileBookmarksPage } from './features/profile/pages/ProfileBookmarksPage';
import { ProfileSettingsPage } from './features/profile/pages/ProfileSettingsPage';
import { OnboardingPage } from './features/onboarding/pages/OnboardingPage';
import { ProgressDashboardPage } from './features/progress/pages/ProgressDashboardPage';
import { SubsystemProgressPage } from './features/progress/pages/SubsystemProgressPage';
import { GoalsPage } from './features/goals/pages/GoalsPage';
import { GoalDetailPage } from './features/goals/pages/GoalDetailPage';
import { CommunityDashboardPage } from './features/community/pages/CommunityDashboardPage';
import { CommunityQuestionsPage } from './features/community/pages/CommunityQuestionsPage';
import { CommunityQuestionDetailPage } from './features/community/pages/CommunityQuestionDetailPage';
import { CommunityDiscussionsPage } from './features/community/pages/CommunityDiscussionsPage';
import { CommunityProjectsPage } from './features/community/pages/CommunityProjectsPage';
import { CommunityResourcesPage } from './features/community/pages/CommunityResourcesPage';
import { CommunityTopicDetailPage } from './features/community/pages/CommunityTopicDetailPage';
import { NotificationsPage } from './features/notifications/pages/NotificationsPage';
import { ModulePlaceholderPage, MODULE_REGISTRY } from './pages/ModulePlaceholderPage';
import { NotFoundPage, ForbiddenPage } from './pages/ErrorPages';
// 10 New AI Learning Modules
import { StudyPlannerPage } from './features/study-planner/pages/StudyPlannerPage';
import { ExamPreparationPage } from './features/exams/pages/ExamPreparationPage';
import { DoubtSolverPage } from './features/doubts/pages/DoubtSolverPage';
import { FlashcardsPage } from './features/flashcards/pages/FlashcardsPage';
import { LabAssistantPage } from './features/labs/pages/LabAssistantPage';
import { SqlLabPage } from './features/sql-lab/pages/SqlLabPage';
import { GitLabPage } from './features/git-lab/pages/GitLabPage';
import { MlLabPage } from './features/ml-lab/pages/MlLabPage';
import { SystemDesignLabPage } from './features/system-design/pages/SystemDesignLabPage';
import { KnowledgeBasePage } from './features/knowledge/pages/KnowledgeBasePage';
import { ApplicationTrackerPage } from './features/applications/pages/ApplicationTrackerPage';
import { IntegrationsCenterPage } from './features/integrations/pages/IntegrationsCenterPage';
import { ExternalProfileHubPage } from './features/profile/pages/ExternalProfileHubPage';
import { JobsDiscoveryPage } from './features/jobs/pages/JobsDiscoveryPage';
// Academic Semester Command Center
import { SemesterOverviewPage } from './features/semester-command-center/pages/SemesterOverviewPage';
import { SemesterSetupWizardPage } from './features/semester-command-center/pages/SemesterSetupWizardPage';
import { SemesterStudyStreamPage } from './features/semester-command-center/pages/SemesterStudyStreamPage';
import { SemesterSubjectsSyllabusPage } from './features/semester-command-center/pages/SemesterSubjectsSyllabusPage';
import { SemesterCalendarEventsPage } from './features/semester-command-center/pages/SemesterCalendarEventsPage';
import { SemesterExamsSlipTestsPage } from './features/semester-command-center/pages/SemesterExamsSlipTestsPage';
import { SemesterRecoveryGuidancePage } from './features/semester-command-center/pages/SemesterRecoveryGuidancePage';
// Public Website Pages
import { HomePage } from './features/public/pages/HomePage';
import { AboutPage } from './features/public/pages/AboutPage';
import { HowItWorksPage } from './features/public/pages/HowItWorksPage';
import { GateExamPreparationPage } from './features/gate/pages/GateExamPreparationPage';
import { LanguageLearningPage } from './features/languages/pages/LanguageLearningPage';
import { useAuth } from './hooks/useAuth';
import { StudentContextProvider } from './context/StudentContext';
import { RefreshCw } from 'lucide-react';

function AppContent() {
  const { student, isAuthenticated, isLoading, checkAuth } = useAuth();
  const [currentPath, setCurrentPath] = React.useState<string>(
    typeof window !== 'undefined'
      ? (window.location.pathname + window.location.search)
      : '/'
  );

  // Sync with browser navigation
  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // On mount, verify auth token from storage (no auto-login)
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F9FC]">
        <RefreshCw className="h-8 w-8 animate-spin text-[#2563EB] mb-3" />
        <p className="text-xs font-medium text-[#475467]">Initializing B.Tech AI Learning Workspace...</p>
      </div>
    );
  }

  const [initialPathname] = currentPath.split('?');

  // Public Certificate Verification bypasses login requirement
  const publicCertMatch = initialPathname.match(/^\/verify\/certificate\/([^/]+)$/);
  if (publicCertMatch) {
    return <CertificateVerificationPage certificateId={publicCertMatch[1]} onNavigate={navigate} />;
  }

  // Public Website Pages accessible without login
  if (initialPathname === '/about') {
    return <AboutPage onNavigate={navigate} />;
  }

  if (initialPathname === '/how-it-works') {
    return <HowItWorksPage onNavigate={navigate} />;
  }

  // Handle Unauthenticated Visitors
  if (!isAuthenticated) {
    if (initialPathname === '/' || initialPathname === '/home') {
      return <HomePage onNavigate={navigate} />;
    }

    if (
      initialPathname === '/register' ||
      initialPathname === '/signup' ||
      initialPathname === '/onboarding'
    ) {
      return <OnboardingPage onNavigate={navigate} />;
    }

    // Default unauthenticated fallback (including /login and protected routes)
    return (
      <LoginPage
        initialMode="signin"
        onNavigate={navigate}
        onLoginSuccess={(role?: string) => {
          if (role === 'STUDENT_NEW') {
            navigate('/onboarding');
          } else {
            const searchParams = new URLSearchParams(window.location.search);
            const redirect = searchParams.get('redirect');
            if (redirect) {
              navigate(decodeURIComponent(redirect));
            } else if (
              currentPath &&
              currentPath !== '/login' &&
              currentPath !== '/signin' &&
              currentPath !== '/'
            ) {
              navigate(currentPath);
            } else {
              navigate('/dashboard');
            }
          }
        }}
      />
    );
  }

  // If authenticated user navigates to /login, /register, or /admin*, redirect to student workspace
  if (
    initialPathname === '/login' ||
    initialPathname === '/signin' ||
    initialPathname === '/register' ||
    initialPathname === '/signup' ||
    initialPathname.startsWith('/admin')
  ) {
    if (student && student.onboarding_completed === false) {
      navigate('/onboarding');
      return null;
    }
    navigate('/dashboard');
    return null;
  }

  // Render active route inside AppShell
  const renderRoute = () => {
    const [rawPathname, rawQuery = ''] = currentPath.split('?');
    const cleanPath = rawPathname.split('#')[0] || '/';
    const path = cleanPath === '/' ? '/dashboard' : cleanPath;
    const search = rawQuery ? `?${rawQuery}` : '';

    if (path === '/onboarding') {
      return <OnboardingPage onNavigate={navigate} />;
    }

    if (path === '/dashboard') {
      if (student && student.onboarding_completed === false) {
        return <OnboardingPage onNavigate={navigate} />;
      }
      return <DashboardPage onNavigate={navigate} />;
    }

    if (path === '/ai-agent' || path === '/ai-tutor') {
      return <AiAgentPage onNavigate={navigate} />;
    }

    // Document AI Workspace Routes (Phase 6)
    if (path === '/documents') {
      return <DocumentsPage onNavigate={navigate} />;
    }

    if (path === '/documents/upload') {
      return <DocumentUploadPage onNavigate={navigate} />;
    }

    const docPageMatch = path.match(/^\/documents\/([^/]+)\/page\/(\d+)$/);
    if (docPageMatch) {
      return (
        <DocumentWorkspacePage
          documentId={docPageMatch[1]}
          initialPage={Number(docPageMatch[2])}
          onNavigate={navigate}
        />
      );
    }

    const docChatMatch = path.match(/^\/documents\/([^/]+)\/chat$/);
    if (docChatMatch) {
      return (
        <DocumentWorkspacePage
          documentId={docChatMatch[1]}
          initialTab="chat"
          onNavigate={navigate}
        />
      );
    }

    const docSummaryMatch = path.match(/^\/documents\/([^/]+)\/summary$/);
    if (docSummaryMatch) {
      return (
        <DocumentWorkspacePage
          documentId={docSummaryMatch[1]}
          initialTab="summary"
          onNavigate={navigate}
        />
      );
    }

    const docNotesMatch = path.match(/^\/documents\/([^/]+)\/notes$/);
    if (docNotesMatch) {
      return (
        <DocumentWorkspacePage
          documentId={docNotesMatch[1]}
          initialTab="notes"
          onNavigate={navigate}
        />
      );
    }

    const docDetailMatch = path.match(/^\/documents\/([^/]+)$/);
    if (docDetailMatch) {
      return (
        <DocumentWorkspacePage
          documentId={docDetailMatch[1]}
          onNavigate={navigate}
        />
      );
    }

    // Coding Lab Routes (Phase 7)
    if (path === '/coding' || path === '/coding-lab' || path === '/sandbox') {
      return <CodingLabPage onNavigate={navigate} />;
    }

    if (path === '/coding/editor') {
      return <CodingEditorPage search={search} onNavigate={navigate} />;
    }

    if (path === '/coding/saved') {
      return <CodingSavedPage onNavigate={navigate} />;
    }

    if (path === '/coding/history') {
      return <CodingHistoryPage onNavigate={navigate} />;
    }

    const codingProblemMatch = path.match(/^\/coding\/problem\/([^/]+)$/);
    if (codingProblemMatch) {
      return (
        <CodingEditorPage
          problemId={codingProblemMatch[1]}
          search={search}
          onNavigate={navigate}
        />
      );
    }

    const codingSessionMatch = path.match(/^\/coding\/session\/([^/]+)$/);
    if (codingSessionMatch) {
      return (
        <CodingEditorPage
          sessionId={codingSessionMatch[1]}
          search={search}
          onNavigate={navigate}
        />
      );
    }


    // Courses & Learning Player Routes
    if (path === '/courses') {
      return <CoursesPage onNavigate={navigate} />;
    }

    const learnLessonMatch = path.match(/^\/courses\/([^/]+)\/learn\/([^/]+)$/);
    if (learnLessonMatch) {
      return (
        <CourseLearningPage
          courseId={learnLessonMatch[1]}
          lessonId={learnLessonMatch[2]}
          onNavigate={navigate}
        />
      );
    }

    const learnMatch = path.match(/^\/courses\/([^/]+)\/learn$/);
    if (learnMatch) {
      return <CourseLearningPage courseId={learnMatch[1]} onNavigate={navigate} />;
    }

    const courseDetailMatch = path.match(/^\/courses\/([^/]+)$/);
    if (courseDetailMatch) {
      return <CourseDetailPage courseId={courseDetailMatch[1]} onNavigate={navigate} />;
    }

    // Notes Routes (Phase 5)
    if (path === '/notes' || path === '/notes/create') {
      return <NotesPage onNavigate={navigate} />;
    }

    const noteDetailMatch = path.match(/^\/notes\/([^/]+)$/);
    if (noteDetailMatch) {
      return <NoteDetailPage noteId={noteDetailMatch[1]} onNavigate={navigate} />;
    }

    // DSA & Algorithm Visualization Routes (Phase 8)
    if (path === '/dsa' || path === '/dsa-lab') {
      return <DSALabPage onNavigate={navigate} />;
    }

    if (path === '/dsa/topics') {
      return <DSATopicsPage onNavigate={navigate} />;
    }

    const dsaTopicMatch = path.match(/^\/dsa\/topic\/([^/]+)$/);
    if (dsaTopicMatch) {
      return <DSATopicDetailPage topicId={dsaTopicMatch[1]} onNavigate={navigate} />;
    }

    const dsaVisualizeMatch = path.match(/^\/dsa\/visualize\/([^/]+)$/);
    if (dsaVisualizeMatch) {
      return <DSAVisualizePage algorithmId={dsaVisualizeMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/dsa/practice') {
      return <DSAPracticePage onNavigate={navigate} />;
    }

    const dsaProblemMatch = path.match(/^\/dsa\/(?:problem|editor)\/([^/]+)$/);
    if (dsaProblemMatch) {
      return <DSAProblemPage problemId={dsaProblemMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/dsa/progress') {
      return <DSAProgressPage onNavigate={navigate} />;
    }

    const dsaTutorMatch = path.match(/^\/dsa\/tutor(?:\/([^/]+))?$/);
    if (dsaTutorMatch) {
      return <DSAAiTutorPage problemId={dsaTutorMatch[1]} onNavigate={navigate} />;
    }

    // AI Quiz & Assessments Routes (Phase 9)
    if (path === '/quiz') {
      return <QuizPage onNavigate={navigate} />;
    }

    if (path === '/quiz/create') {
      return <QuizCreatePage search={search} onNavigate={navigate} />;
    }

    if (path === '/quiz/history') {
      return <QuizHistoryPage onNavigate={navigate} />;
    }

    if (path === '/quiz/progress') {
      return <QuizProgressPage onNavigate={navigate} />;
    }

    const quizResultMatch = path.match(/^\/quiz\/([^/]+)\/result$/);
    if (quizResultMatch) {
      return <QuizResultPage quizId={quizResultMatch[1]} onNavigate={navigate} />;
    }

    const quizReviewMatch = path.match(/^\/quiz\/([^/]+)\/review$/);
    if (quizReviewMatch) {
      return <QuizReviewPage quizId={quizReviewMatch[1]} onNavigate={navigate} />;
    }

    const quizPlayerMatch = path.match(/^\/quiz\/([^/]+)$/);
    if (quizPlayerMatch) {
      return <QuizPlayerPage quizId={quizPlayerMatch[1]} onNavigate={navigate} />;
    }

    // Project Builder & Project Documentation Routes (Phase 10)
    if (path === '/projects') {
      return <ProjectsPage onNavigate={navigate} />;
    }

    if (path === '/projects/create') {
      return <ProjectCreatePage search={search} onNavigate={navigate} />;
    }

    // There is no global documentation page: documentation lives inside each project (open a project,
    // then its Documentation tab). This used to open a fixed demo project id for every student.
    if (path === '/projects/documentation' || path === '/projects/docs') {
      return <ProjectsPage onNavigate={navigate} />;
    }

    const projectTabMatch = path.match(/^\/projects\/([^/]+)\/([a-z]+)$/);
    if (projectTabMatch) {
      return (
        <ProjectWorkspacePage
          projectId={projectTabMatch[1]}
          activeTab={projectTabMatch[2]}
          initialTab={projectTabMatch[2]}
          onNavigate={navigate}
        />
      );
    }

    const projectWorkspaceMatch = path.match(/^\/projects\/([^/]+)$/);
    if (projectWorkspaceMatch) {
      return <ProjectWorkspacePage projectId={projectWorkspaceMatch[1]} onNavigate={navigate} />;
    }

    // Placement Preparation & AI Mock Interview Routes (Phase 11)
    if (path === '/placements' || path === '/placements/prepare' || path === '/placement' || path === '/placement-preparation') {
      return <PlacementDashboardPage onNavigate={navigate} />;
    }

    if (path === '/placements/topics') {
      return <PlacementTopicsPage onNavigate={navigate} />;
    }

    if (path === '/placements/aptitude') {
      return <PlacementTopicsPage initialCategory="APTITUDE" onNavigate={navigate} />;
    }

    if (path === '/placements/reasoning') {
      return <PlacementTopicsPage initialCategory="LOGICAL_REASONING" onNavigate={navigate} />;
    }

    if (path === '/placements/verbal') {
      return <PlacementTopicsPage initialCategory="VERBAL" onNavigate={navigate} />;
    }

    if (path === '/placements/technical') {
      return <TechnicalPreparationPage onNavigate={navigate} />;
    }

    if (path === '/placements/coding') {
      return <CodingLabPage onNavigate={navigate} />;
    }

    if (path === '/placements/hr') {
      return <PlacementTopicsPage initialCategory="HR" onNavigate={navigate} />;
    }

    const placementTopicMatch = path.match(/^\/placements\/topic\/([^/]+)$/);
    if (placementTopicMatch) {
      return <PlacementTopicDetailPage topicId={placementTopicMatch[1]} onNavigate={navigate} />;
    }

    const placementCompanyMatch = path.match(/^\/placements\/company\/([^/]+)$/);
    if (placementCompanyMatch) {
      return <PlacementCompaniesPage companyId={placementCompanyMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/placements/company') {
      return <PlacementCompaniesPage onNavigate={navigate} />;
    }

    const placementRoleMatch = path.match(/^\/placements\/role\/([^/]+)$/);
    if (placementRoleMatch) {
      return <RolePreparationPage roleId={placementRoleMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/placements/role') {
      return <RolePreparationPage onNavigate={navigate} />;
    }

    // Mock Interview History Routes
    if (
      path === '/interviews/history' ||
      path === '/interview/history' ||
      path === '/mock-interviews/history' ||
      path === '/mock-interview/history' ||
      path === '/placements/history' ||
      path === '/placements/interviews/history' ||
      path === '/placements/mock-interview/history'
    ) {
      return <MockInterviewsPage onNavigate={navigate} />;
    }

    // Mock Interview Setup & Main Landing Routes
    if (
      path === '/interviews' ||
      path === '/interview' ||
      path === '/interviews/setup' ||
      path === '/interview/setup' ||
      path === '/mock-interviews' ||
      path === '/mock-interview' ||
      path === '/mock-interviews/setup' ||
      path === '/mock-interview/setup' ||
      path === '/career/interview' ||
      path === '/career/interviews' ||
      path === '/career/mock-interview' ||
      path === '/placements/mock-interview' ||
      path === '/placements/mock-interview/setup' ||
      path === '/placements/interview' ||
      path === '/placements/interview/setup' ||
      path === '/placements/interviews' ||
      path === '/placements/interviews/setup'
    ) {
      return <MockInterviewsPage onNavigate={navigate} />;
    }

    // Mock Interview Diagnostic Results Route
    const mockInterviewResultMatch = path.match(
      /^(?:\/placements\/mock-interview|\/placements\/interview|\/placements\/interviews|\/interviews|\/interview|\/mock-interviews|\/mock-interview)\/([^/]+)\/(?:result|report)$/
    );
    if (mockInterviewResultMatch) {
      return <MockInterviewsPage sessionId={mockInterviewResultMatch[1]} isReportView={true} onNavigate={navigate} />;
    }

    // Active Mock Interview Session Route
    const mockInterviewSessionMatch = path.match(
      /^(?:\/placements\/mock-interview|\/placements\/interview|\/placements\/interviews|\/interviews|\/interview|\/mock-interviews|\/mock-interview)\/([^/]+)$/
    );
    if (mockInterviewSessionMatch) {
      const sessionId = mockInterviewSessionMatch[1];
      if (sessionId === 'setup' || sessionId === 'new' || sessionId === 'history' || sessionId === 'analytics') {
        return <MockInterviewsPage onNavigate={navigate} />;
      }
      return <MockInterviewsPage sessionId={sessionId} onNavigate={navigate} />;
    }

    if (path === '/placements/progress') {
      return <PlacementProgressPage onNavigate={navigate} />;
    }

    if (path === '/placements/plans' || path === '/placements/roadmap') {
      return <PlacementPlanPage onNavigate={navigate} />;
    }

    // ==========================================
    // Phase 12: Resume Builder Routes
    // ==========================================
    if (path === '/resume' || path === '/resumes') {
      return <ResumePage onNavigate={navigate} />;
    }

    if (path === '/resume/create') {
      return <ResumeCreatePage onNavigate={navigate} />;
    }

    if (path === '/resume/templates') {
      return <ResumeTemplatesPage onNavigate={navigate} />;
    }

    const resumeTailorMatch = path.match(/^\/resume\/([^/]+)\/tailor$/);
    if (resumeTailorMatch) {
      return <ResumeTailorPage resumeId={resumeTailorMatch[1]} onNavigate={navigate} />;
    }

    const resumeEditMatch = path.match(/^\/resume\/([^/]+)\/edit$/);
    if (resumeEditMatch) {
      return <ResumeEditorPage resumeId={resumeEditMatch[1]} onNavigate={navigate} />;
    }

    const resumePreviewMatch = path.match(/^\/resume\/([^/]+)\/preview$/);
    if (resumePreviewMatch) {
      return <ResumePreviewPage resumeId={resumePreviewMatch[1]} onNavigate={navigate} />;
    }

    const resumeDetailMatch = path.match(/^\/resume\/([^/]+)$/);
    if (resumeDetailMatch) {
      return <ResumePreviewPage resumeId={resumeDetailMatch[1]} onNavigate={navigate} />;
    }

    // ==========================================
    // Phase 12: Career Assistant Routes
    // ==========================================
    if (path === '/career') {
      return <CareerDashboardPage onNavigate={navigate} />;
    }

    if (path === '/career/explore' || path === '/career/roles') {
      return <CareerExplorePage onNavigate={navigate} />;
    }

    if (path === '/career/roadmap') {
      return <CareerRoadmapPage onNavigate={navigate} />;
    }

    if (path === '/career/skill-gap') {
      const searchParams = new URLSearchParams(search);
      const roleId = searchParams.get('role_id') || undefined;
      return <SkillGapPage initialRoleId={roleId} onNavigate={navigate} />;
    }

    const careerRoleMatch = path.match(/^\/career\/role\/([^/]+)$/);
    if (careerRoleMatch) {
      return <CareerRoleDetailPage roleId={careerRoleMatch[1]} onNavigate={navigate} />;
    }

    if (
      path === '/career/jobs' ||
      path === '/jobs' ||
      path === '/career/jobs-discovery' ||
      path === '/jobs-discovery'
    ) {
      return <JobsDiscoveryPage onNavigate={navigate} />;
    }

    // ==========================================
    // Phase 12: Skill Assessment Routes
    // ==========================================
    if (path === '/skills' || path === '/skills/progress') {
      return <SkillProfilePage onNavigate={navigate} />;
    }

    const skillAssessmentMatch = path.match(/^\/skills\/assessment\/([^/]+)$/);
    if (skillAssessmentMatch) {
      return <SkillAssessmentPage initialSkillId={skillAssessmentMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/skills/assessment') {
      const searchParams = new URLSearchParams(search);
      const skillId = searchParams.get('skill_id') || searchParams.get('skill') || undefined;
      return <SkillAssessmentPage initialSkillId={skillId} onNavigate={navigate} />;
    }

    // ==========================================
    // Phase 13: Research Assistant Routes
    // ==========================================
    if (path === '/research') {
      return <ResearchDashboardPage />;
    }

    if (path === '/research/create') {
      return <CreateResearchProjectPage />;
    }

    const researchMatch = path.match(/^\/research\/([^/]+)(?:\/.*)?$/);
    if (researchMatch) {
      return <ResearchWorkspacePage />;
    }

    // ==========================================
    // Phase 13: GitHub Integration Routes
    // ==========================================
    if (path === '/git' || path.startsWith('/git/')) {
      return <GitLabPage onNavigate={navigate} />;
    }

    if (path === '/github') {
      return <GitHubDashboardPage onNavigate={navigate} />;
    }

    if (path === '/github/connect') {
      return <GitHubConnectPage onNavigate={navigate} />;
    }

    if (path === '/github/repos') {
      return <RepositoryListPage onNavigate={navigate} />;
    }

    const githubRepoMatch = path.match(/^\/github\/repo\/([^/]+)(?:\/.*)?$/);
    if (githubRepoMatch) {
      return <RepositoryDetailPage repoId={githubRepoMatch[1]} onNavigate={navigate} />;
    }

    // ==========================================
    // Phase 14: Student Profile & Utilities Routes
    // ==========================================
    if (path === '/profile') {
      return <ProfilePage onNavigate={navigate} />;
    }

    if (
      path === '/profile/external' ||
      path === '/profile/external-profiles' ||
      path === '/profile/platforms' ||
      path === '/external-profiles'
    ) {
      return <ExternalProfileHubPage onNavigate={navigate} />;
    }

    if (path === '/profile/edit') {
      return <ProfileEditPage onNavigate={navigate} />;
    }

    if (path === '/profile/activity') {
      return <ProfileActivityPage onNavigate={navigate} />;
    }

    if (path === '/profile/achievements') {
      return <ProfileAchievementsPage onNavigate={navigate} />;
    }

    if (path === '/profile/certificates' || path === '/certificates') {
      return <ProfileCertificatesPage onNavigate={navigate} />;
    }

    if (path === '/profile/bookmarks' || path === '/bookmarks') {
      return <ProfileBookmarksPage onNavigate={navigate} />;
    }

    if (path === '/pilot-feedback' || path === '/feedback') {
      return <PilotFeedbackPage onNavigate={navigate} />;
    }

    if (path === '/profile/settings' || path === '/settings') {
      return <ProfileSettingsPage onNavigate={navigate} />;
    }

    if (path === '/profile/settings/privacy') {
      return <ProfileSettingsPage initialTab="privacy" onNavigate={navigate} />;
    }

    if (path === '/profile/settings/notifications') {
      return <ProfileSettingsPage initialTab="notifications" onNavigate={navigate} />;
    }

    const certRouteMatch = path.match(/^\/verify\/certificate\/([^/]+)$/);
    if (certRouteMatch) {
      return <CertificateVerificationPage certificateId={certRouteMatch[1]} onNavigate={navigate} />;
    }

    // ==========================================
    // Phase 14: Learning Progress Routes
    // ==========================================
    if (path === '/progress') {
      return <ProgressDashboardPage onNavigate={navigate} />;
    }

    const progressSubsystemMatch = path.match(/^\/progress\/(courses|skills|quiz|coding|dsa|projects|placement|research)$/);
    if (progressSubsystemMatch) {
      return <SubsystemProgressPage subsystem={progressSubsystemMatch[1]} onNavigate={navigate} />;
    }

    // ==========================================
    // ==========================================
    // Phase 14: Learning Goals Routes
    // ==========================================
    if (path === '/goals' || path === '/goals/create' || path === '/learning-goals') {
      return <GoalsPage onNavigate={navigate} />;
    }

    const goalDetailMatch = path.match(/^\/goals\/([^/]+)$/);
    if (goalDetailMatch) {
      return <GoalDetailPage goalId={goalDetailMatch[1]} onNavigate={navigate} />;
    }

    // ==========================================
    // Phase 14: Community Hub Routes
    // ==========================================
    if (path === '/community') {
      return <CommunityDashboardPage onNavigate={navigate} />;
    }

    if (path === '/community/questions') {
      const isCreate = search.includes('create=true');
      const searchMatch = search.match(/search=([^&]+)/);
      const initialSearch = searchMatch ? decodeURIComponent(searchMatch[1]) : '';
      return <CommunityQuestionsPage autoOpenCreate={isCreate} initialSearch={initialSearch} onNavigate={navigate} />;
    }

    if (path === '/community/questions/create') {
      return <CommunityQuestionsPage autoOpenCreate={true} onNavigate={navigate} />;
    }

    const questionDetailMatch = path.match(/^\/community\/questions\/([^/]+)$/);
    if (questionDetailMatch) {
      return <CommunityQuestionDetailPage questionId={questionDetailMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/community/discussions') {
      const isCreate = search.includes('create=true');
      return <CommunityDiscussionsPage autoOpenCreate={isCreate} onNavigate={navigate} />;
    }

    if (path === '/community/discussions/create') {
      return <CommunityDiscussionsPage autoOpenCreate={true} onNavigate={navigate} />;
    }

    const discussionDetailMatch = path.match(/^\/community\/discussions\/([^/]+)$/);
    if (discussionDetailMatch) {
      return <CommunityDiscussionsPage initialDiscussionId={discussionDetailMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/community/projects') {
      return <CommunityProjectsPage onNavigate={navigate} />;
    }

    const communityProjectMatch = path.match(/^\/community\/projects\/([^/]+)$/);
    if (communityProjectMatch) {
      return <CommunityProjectsPage initialProjectId={communityProjectMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/community/resources') {
      return <CommunityResourcesPage onNavigate={navigate} />;
    }

    const topicDetailMatch = path.match(/^\/community\/topics\/([^/]+)$/);
    if (topicDetailMatch) {
      return <CommunityTopicDetailPage topicId={topicDetailMatch[1]} onNavigate={navigate} />;
    }

    // ==========================================
    // Phase 14: Notifications
    // ==========================================
    if (path === '/notifications') {
      return <NotificationsPage onNavigate={navigate} />;
    }

    // ==========================================
    // 10 New AI Learning Modules
    // ==========================================
    if (path.startsWith('/study-planner')) {
      return <StudyPlannerPage onNavigate={navigate} />;
    }

    // GATE Exam Preparation (Assessment Category)
    if (
      path === '/assessment/gate-preparation' ||
      path.startsWith('/assessment/gate-preparation') ||
      path === '/gate' ||
      path.startsWith('/gate/') ||
      path === '/gate-preparation' ||
      path.startsWith('/gate-preparation/') ||
      path === '/assessment/gate' ||
      path.startsWith('/assessment/gate/')
    ) {
      return <GateExamPreparationPage onNavigate={navigate} />;
    }

    if (path.startsWith('/exams') || path.startsWith('/exam-preparation')) {
      return <ExamPreparationPage onNavigate={navigate} />;
    }

    if (path.startsWith('/doubts') || path.startsWith('/doubt-solver')) {
      return <DoubtSolverPage onNavigate={navigate} />;
    }

    if (path.startsWith('/flashcards') || path.startsWith('/revision')) {
      return <FlashcardsPage onNavigate={navigate} />;
    }

    if (
      path.startsWith('/labs') ||
      path.startsWith('/viva') ||
      path.startsWith('/lab-assistant') ||
      path.startsWith('/lab')
    ) {
      return <LabAssistantPage onNavigate={navigate} />;
    }

    if (
      path === '/languages' ||
      path.startsWith('/languages/') ||
      path === '/language-learning' ||
      path.startsWith('/language-learning/') ||
      path === '/language' ||
      path.startsWith('/language/')
    ) {
      return <LanguageLearningPage />;
    }

    if (path.startsWith('/sql-lab')) {
      return <SqlLabPage onNavigate={navigate} />;
    }

    if (path.startsWith('/ml-lab')) {
      return <MlLabPage onNavigate={navigate} />;
    }

    if (path.startsWith('/system-design')) {
      return <SystemDesignLabPage onNavigate={navigate} />;
    }

    if (path.startsWith('/knowledge') || path.startsWith('/knowledge-base') || path.startsWith('/rag')) {
      return <KnowledgeBasePage onNavigate={navigate} />;
    }

    if (
      path.startsWith('/applications') ||
      path.startsWith('/application') ||
      path.startsWith('/internships') ||
      path.startsWith('/internship') ||
      path === '/application-tracker' ||
      path === '/applications-tracker' ||
      path === '/internship-tracker' ||
      path === '/internships-tracker' ||
      path.startsWith('/career/applications') ||
      path.startsWith('/career/application') ||
      path.startsWith('/career/internships') ||
      path.startsWith('/career/internship') ||
      path === '/career/application-tracker' ||
      path === '/career/applications-tracker'
    ) {
      return <ApplicationTrackerPage onNavigate={navigate} />;
    }

    // ==========================================
    // External Platform Integrations
    // ==========================================
    if (
      path === '/integrations' ||
      path === '/integrations/platforms' ||
      path === '/integrations/connected' ||
      path === '/connected-platforms'
    ) {
      return <IntegrationsCenterPage initialTab="platforms" onNavigate={navigate} />;
    }

    if (path === '/integrations/activity' || path === '/sync') {
      return <IntegrationsCenterPage initialTab="activity" onNavigate={navigate} />;
    }

    if (path === '/integrations/settings') {
      return <IntegrationsCenterPage initialTab="settings" onNavigate={navigate} />;
    }

    // ==========================================
    // Academic Semester Command Center Routes
    // ==========================================
    if (path === '/semester-command-center' || path === '/semester-command-center/overview' || path === '/semester' || path === '/semester/overview') {
      return <SemesterOverviewPage onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/setup' || path === '/semester-command-center/settings' || path === '/semester/setup' || path === '/semester/settings') {
      return <SemesterSetupWizardPage onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/study-stream' || path === '/semester/study-stream') {
      return <SemesterStudyStreamPage onNavigate={navigate} />;
    }

    const semesterSubjectDetailMatch = path.match(/^(?:\/semester-command-center|\/semester)\/subjects\/([^/]+)$/);
    if (semesterSubjectDetailMatch) {
      return <SemesterSubjectsSyllabusPage initialSubjectId={semesterSubjectDetailMatch[1]} onNavigate={navigate} />;
    }

    if (
      path === '/semester-command-center/subjects' ||
      path === '/semester-command-center/syllabus' ||
      path === '/semester/subjects' ||
      path === '/semester/syllabus'
    ) {
      return <SemesterSubjectsSyllabusPage onNavigate={navigate} />;
    }

    if (
      path === '/semester-command-center/calendar' ||
      path === '/semester-command-center/academic-events' ||
      path === '/semester/calendar' ||
      path === '/semester/events'
    ) {
      return <SemesterCalendarEventsPage onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/slip-tests' || path === '/semester/slip-tests') {
      return <SemesterExamsSlipTestsPage initialTab="slip-tests" onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/minors' || path === '/semester/minors') {
      return <SemesterExamsSlipTestsPage initialTab="minors" onNavigate={navigate} />;
    }

    if (
      path === '/semester-command-center/end-semester' ||
      path === '/semester-command-center/exams' ||
      path === '/semester/end-semester' ||
      path === '/semester/exams'
    ) {
      return <SemesterExamsSlipTestsPage initialTab="end-sem" onNavigate={navigate} />;
    }

    if (
      path === '/semester-command-center/daily-plan' ||
      path === '/semester-command-center/recovery' ||
      path === '/semester/daily-plan' ||
      path === '/semester/recovery'
    ) {
      return <SemesterRecoveryGuidancePage initialTab="daily" onNavigate={navigate} />;
    }

    if (
      path === '/semester-command-center/weekly-plan' ||
      path === '/semester-command-center/analytics' ||
      path === '/semester-command-center/revision' ||
      path === '/semester/weekly-plan' ||
      path === '/semester/analytics' ||
      path === '/semester/revision'
    ) {
      return <SemesterRecoveryGuidancePage initialTab="weekly" onNavigate={navigate} />;
    }

    if (path in MODULE_REGISTRY) {
      return <ModulePlaceholderPage path={path} onNavigate={navigate} />;
    }

    return <NotFoundPage onNavigate={navigate} />;
  };

  // Phase 5: module landing pages show recommendations driven by the central student profile.
  const routePath = currentPath.split('?')[0].split('#')[0];
  const recommendationModule = PROFILE_RECOMMENDATION_ROUTES[routePath];

  return (
    <AppShell currentPath={currentPath.split('?')[0]} onNavigate={navigate}>
      {recommendationModule && student && (
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <ProfileRecommendationsPanel module={recommendationModule} onNavigate={navigate} />
        </div>
      )}
      {renderRoute()}
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <StudentContextProvider>
          <AppContent />
        </StudentContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
