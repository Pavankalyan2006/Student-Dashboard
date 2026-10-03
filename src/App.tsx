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
import { AdminPage } from './pages/AdminPage';
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
import { MockInterviewSetupPage } from './features/placements/pages/MockInterviewSetupPage';
import { MockInterviewSessionPage } from './features/placements/pages/MockInterviewSessionPage';
import { MockInterviewResultPage } from './features/placements/pages/MockInterviewResultPage';
import { MockInterviewHistoryPage } from './features/placements/pages/MockInterviewHistoryPage';
// Phase 12: Resume Builder, Career Assistant & Skill Assessment Pages
import { ResumePage } from './features/resume/pages/ResumePage';
import { ResumeEditorPage } from './features/resume/pages/ResumeEditorPage';
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
import { ProfileActivityPage } from './features/profile/pages/ProfileActivityPage';
import { ProfileAchievementsPage } from './features/profile/pages/ProfileAchievementsPage';
import { ProfileCertificatesPage } from './features/profile/pages/ProfileCertificatesPage';
import { CertificateVerificationPage } from './features/profile/pages/CertificateVerificationPage';
import { ProfileBookmarksPage } from './features/profile/pages/ProfileBookmarksPage';
import { ProfileSettingsPage } from './features/profile/pages/ProfileSettingsPage';
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
import { MlLabPage } from './features/ml-lab/pages/MlLabPage';
import { SystemDesignLabPage } from './features/system-design/pages/SystemDesignLabPage';
import { KnowledgeBasePage } from './features/knowledge/pages/KnowledgeBasePage';
import { ApplicationTrackerPage } from './features/applications/pages/ApplicationTrackerPage';
import { IntegrationsCenterPage } from './features/integrations/pages/IntegrationsCenterPage';
import { ExternalProfileHubPage } from './features/profile/pages/ExternalProfileHubPage';
import { JobDiscoveryPage } from './features/career/pages/JobDiscoveryPage';
// Academic Semester Command Center
import { SemesterOverviewPage } from './features/semester-command-center/pages/SemesterOverviewPage';
import { SemesterStudyStreamPage } from './features/semester-command-center/pages/SemesterStudyStreamPage';
import { SemesterSubjectsSyllabusPage } from './features/semester-command-center/pages/SemesterSubjectsSyllabusPage';
import { SemesterCalendarEventsPage } from './features/semester-command-center/pages/SemesterCalendarEventsPage';
import { SemesterExamsSlipTestsPage } from './features/semester-command-center/pages/SemesterExamsSlipTestsPage';
import { SemesterRecoveryGuidancePage } from './features/semester-command-center/pages/SemesterRecoveryGuidancePage';
import { SemesterSetupWizardPage } from './features/semester-command-center/pages/SemesterSetupWizardPage';
// Phase 15: Super Admin Platform Management
import { AdminLayout } from './features/admin/AdminLayout';
import { AdminDashboardPage } from './features/admin/pages/AdminDashboardPage';
import { AdminStudentsPage } from './features/admin/pages/AdminStudentsPage';
import { AdminStudentDetailPage } from './features/admin/pages/AdminStudentDetailPage';
import { AdminContentPage } from './features/admin/pages/AdminContentPage';
import { AdminAiPage } from './features/admin/pages/AdminAiPage';
import { AdminIntegrationsPage } from './features/admin/pages/AdminIntegrationsPage';
import { AdminJobsPage } from './features/admin/pages/AdminJobsPage';
import { AdminSystemPage } from './features/admin/pages/AdminSystemPage';
import { AdminSecurityPage } from './features/admin/pages/AdminSecurityPage';
import { AdminCommunityPage } from './features/admin/pages/AdminCommunityPage';
import { AdminSettingsPage } from './features/admin/pages/AdminSettingsPage';
import { useAuthStore } from './store/authStore';
import { useAuth } from './hooks/useAuth';
import { RefreshCw } from 'lucide-react';

function AppContent() {
  const { student, isAuthenticated, isLoading, isSuperAdmin, checkAuth } = useAuth();
  const [currentPath, setCurrentPath] = React.useState<string>(
    typeof window !== 'undefined'
      ? (window.location.pathname + window.location.search)
      : '/dashboard'
  );

  // Sync with browser navigation
  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check auth and auto-seed demo student if first visit
  React.useEffect(() => {
    const init = async () => {
      await checkAuth();
      // If no token exists on first boot, auto-login with default student for seamless preview
      const token = useAuthStore.getState().token;
      if (!token) {
        try {
          await useAuthStore.getState().login('student@btech.edu', 'Password123!');
        } catch {
          // Fallback to login screen
        }
      }
    };
    init();
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

  // Public Certificate Verification bypasses login requirement
  const [initialPathname] = currentPath.split('?');
  const publicCertMatch = initialPathname.match(/^\/verify\/certificate\/([^/]+)$/);
  if (publicCertMatch) {
    return <CertificateVerificationPage certificateId={publicCertMatch[1]} onNavigate={navigate} />;
  }

  // If user is not authenticated and is on /login
  if (!isAuthenticated || currentPath === '/login') {
    if (isAuthenticated && currentPath === '/login') {
      navigate('/dashboard');
    } else {
      return <LoginPage onLoginSuccess={() => navigate('/dashboard')} />;
    }
  }

  // ==========================================
  // Super Admin Isolated Route Rendering (Phase 15)
  // ==========================================
  if (initialPathname.startsWith('/admin')) {
    const renderAdminRoute = () => {
      const studentDetailMatch = initialPathname.match(/^\/admin\/students\/([^/]+)$/);
      if (studentDetailMatch) {
        return <AdminStudentDetailPage studentId={studentDetailMatch[1]} onNavigate={navigate} />;
      }
      if (initialPathname === '/admin/students') {
        return <AdminStudentsPage onNavigate={navigate} />;
      }
      if (initialPathname.startsWith('/admin/content')) {
        return <AdminContentPage />;
      }
      if (initialPathname.startsWith('/admin/ai')) {
        return <AdminAiPage />;
      }
      if (initialPathname.startsWith('/admin/integrations')) {
        return <AdminIntegrationsPage />;
      }
      if (initialPathname.startsWith('/admin/jobs')) {
        return <AdminJobsPage />;
      }
      if (initialPathname.startsWith('/admin/system')) {
        return <AdminSystemPage />;
      }
      if (initialPathname.startsWith('/admin/security')) {
        return <AdminSecurityPage />;
      }
      if (initialPathname.startsWith('/admin/community')) {
        return <AdminCommunityPage />;
      }
      if (initialPathname.startsWith('/admin/settings')) {
        return <AdminSettingsPage />;
      }
      return <AdminDashboardPage onNavigate={navigate} />;
    };

    return (
      <AdminLayout currentPath={currentPath} onNavigate={navigate}>
        {renderAdminRoute()}
      </AdminLayout>
    );
  }

  // Render active route inside AppShell
  const renderRoute = () => {
    const [rawPathname, rawQuery = ''] = currentPath.split('?');
    const cleanPath = rawPathname.split('#')[0] || '/';
    const path = cleanPath === '/' ? '/dashboard' : cleanPath;
    const search = rawQuery ? `?${rawQuery}` : '';

    if (path === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }

    if (path === '/ai-agent') {
      return <AiAgentPage />;
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
    if (path === '/coding') {
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

    if (path === '/admin') {
      if (!isSuperAdmin) {
        return <ForbiddenPage onNavigate={navigate} />;
      }
      return <AdminPage />;
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
    if (path === '/dsa') {
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

    if (path === '/projects/documentation') {
      return (
        <ProjectWorkspacePage
          projectId="proj_seed_ai_health_01"
          activeTab="documentation"
          initialTab="documentation"
          onNavigate={navigate}
        />
      );
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
    if (path === '/placements' || path === '/placements/prepare' || path === '/placement') {
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

    if (path === '/placements/mock-interview' || path === '/placements/mock-interview/setup' || path === '/interviews' || path === '/interviews/setup') {
      return <MockInterviewSetupPage onNavigate={navigate} />;
    }

    const mockInterviewResultMatch = path.match(/^(?:\/placements\/mock-interview|\/interviews)\/([^/]+)\/result$/);
    if (mockInterviewResultMatch) {
      return <MockInterviewResultPage sessionId={mockInterviewResultMatch[1]} onNavigate={navigate} />;
    }

    const mockInterviewSessionMatch = path.match(/^(?:\/placements\/mock-interview|\/interviews)\/([^/]+)$/);
    if (mockInterviewSessionMatch) {
      return <MockInterviewSessionPage sessionId={mockInterviewSessionMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/placements/history' || path === '/interviews/history') {
      return <MockInterviewHistoryPage onNavigate={navigate} />;
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
      return <ResumeEditorPage resumeId="res_seed_01" onNavigate={navigate} />;
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

    if (path === '/career/jobs' || path === '/jobs') {
      return <JobDiscoveryPage onNavigate={navigate} />;
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

    if (path === '/profile/external') {
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

    if (path === '/profile/certificates') {
      return <ProfileCertificatesPage onNavigate={navigate} />;
    }

    if (path === '/profile/bookmarks' || path === '/bookmarks') {
      return <ProfileBookmarksPage onNavigate={navigate} />;
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
    // Phase 14: Learning Goals Routes
    // ==========================================
    if (path === '/goals') {
      return <GoalsPage onNavigate={navigate} />;
    }

    if (path === '/goals/create') {
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

    if (path.startsWith('/exams')) {
      return <ExamPreparationPage onNavigate={navigate} />;
    }

    if (path.startsWith('/doubts')) {
      return <DoubtSolverPage onNavigate={navigate} />;
    }

    if (path.startsWith('/flashcards')) {
      return <FlashcardsPage onNavigate={navigate} />;
    }

    if (path.startsWith('/labs')) {
      return <LabAssistantPage onNavigate={navigate} />;
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

    if (path.startsWith('/knowledge')) {
      return <KnowledgeBasePage onNavigate={navigate} />;
    }

    if (path.startsWith('/applications')) {
      return <ApplicationTrackerPage onNavigate={navigate} />;
    }

    // ==========================================
    // External Platform Integrations
    // ==========================================
    if (path === '/integrations' || path === '/integrations/platforms' || path === '/integrations/connected') {
      return <IntegrationsCenterPage initialTab="platforms" onNavigate={navigate} />;
    }

    if (path === '/integrations/activity') {
      return <IntegrationsCenterPage initialTab="activity" onNavigate={navigate} />;
    }

    if (path === '/integrations/settings') {
      return <IntegrationsCenterPage initialTab="settings" onNavigate={navigate} />;
    }

    // ==========================================
    // Academic Semester Command Center Routes
    // ==========================================
    if (path === '/semester-command-center' || path === '/semester-command-center/overview' || path === '/semester') {
      return <SemesterOverviewPage onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/setup' || path === '/semester-command-center/settings') {
      return <SemesterSetupWizardPage onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/study-stream') {
      return <SemesterStudyStreamPage onNavigate={navigate} />;
    }

    const semesterSubjectDetailMatch = path.match(/^\/semester-command-center\/subjects\/([^/]+)$/);
    if (semesterSubjectDetailMatch) {
      return <SemesterSubjectsSyllabusPage initialSubjectId={semesterSubjectDetailMatch[1]} onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/subjects' || path === '/semester-command-center/syllabus') {
      return <SemesterSubjectsSyllabusPage onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/calendar' || path === '/semester-command-center/academic-events') {
      return <SemesterCalendarEventsPage onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/slip-tests') {
      return <SemesterExamsSlipTestsPage initialTab="slip-tests" onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/minors') {
      return <SemesterExamsSlipTestsPage initialTab="minors" onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/end-semester' || path === '/semester-command-center/exams') {
      return <SemesterExamsSlipTestsPage initialTab="end-sem" onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/daily-plan' || path === '/semester-command-center/recovery') {
      return <SemesterRecoveryGuidancePage initialTab="daily" onNavigate={navigate} />;
    }

    if (path === '/semester-command-center/weekly-plan' || path === '/semester-command-center/analytics' || path === '/semester-command-center/revision') {
      return <SemesterRecoveryGuidancePage initialTab="weekly" onNavigate={navigate} />;
    }

    if (path in MODULE_REGISTRY) {
      return <ModulePlaceholderPage path={path} onNavigate={navigate} />;
    }

    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <AppShell currentPath={currentPath.split('?')[0]} onNavigate={navigate}>
      {renderRoute()}
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
