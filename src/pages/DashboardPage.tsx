import * as React from 'react';
import { PageContainer } from '../components/layout/PageComponents';
import { ErrorState } from '../components/layout/PageComponents';
import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import { DashboardWelcome } from '../features/dashboard/components/DashboardWelcome';
import { DashboardAIHero } from '../features/dashboard/components/DashboardAIHero';
import { ContinueLearning } from '../features/dashboard/components/ContinueLearning';
import { CourseProgress } from '../features/dashboard/components/CourseProgress';
import { OverallProgress } from '../features/dashboard/components/OverallProgress';
import { LearningStreak } from '../features/dashboard/components/LearningStreak';
import { TodaysPlan } from '../features/dashboard/components/TodaysPlan';
import { RecommendedLearning } from '../features/dashboard/components/RecommendedLearning';
import { WeakAreas } from '../features/dashboard/components/WeakAreas';
import { Strengths } from '../features/dashboard/components/Strengths';
import { RecentActivity } from '../features/dashboard/components/RecentActivity';
import { ActiveProjects } from '../features/dashboard/components/ActiveProjects';
import { LearningAnalytics } from '../features/dashboard/components/LearningAnalytics';
import { QuickActions } from '../features/dashboard/components/QuickActions';
import { UpcomingItems } from '../features/dashboard/components/UpcomingItems';
import { RecentBookmarks } from '../features/dashboard/components/RecentBookmarks';
import { RecentDocuments } from '../features/dashboard/components/RecentDocuments';
import { RecentCodingWidget } from '../features/dashboard/components/RecentCodingWidget';
import { DashboardSkeleton } from '../features/dashboard/components/DashboardSkeleton';
import { DashboardOnboarding } from '../features/dashboard/components/DashboardOnboarding';
import { DSAProgressWidget } from '../features/dashboard/components/DSAProgressWidget';
import { QuizProgressWidget } from '../features/dashboard/components/QuizProgressWidget';
import { PlacementProgressWidget } from '../features/dashboard/components/PlacementProgressWidget';
import { CareerResumeWidget } from '../features/dashboard/components/CareerResumeWidget';
import { ResearchGitHubWidget } from '../features/dashboard/components/ResearchGitHubWidget';
import { LearningModulesSummaryWidget } from '../features/dashboard/components/LearningModulesSummaryWidget';
import { ExternalActivityWidget } from '../features/dashboard/components/ExternalActivityWidget';
import { onboardingApi } from '../api/onboardingApi';
import { DashboardProfileSummary } from '../features/dashboard/components/DashboardProfileSummary';
import { Sparkles, ArrowRight } from 'lucide-react';

export function DashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { data, isLoading, isError, error, refetch, toggleTodayTask } = useDashboard();
  const [onboardingStatus, setOnboardingStatus] = React.useState<any>(null);

  React.useEffect(() => {
    onboardingApi.getStatus().then(setOnboardingStatus).catch(() => {});
  }, []);

  if (isLoading) {
    return (
      <PageContainer>
        <DashboardSkeleton />
      </PageContainer>
    );
  }

  if (isError || !data) {
    return (
      <PageContainer>
        <ErrorState
          title="Unable to load learning dashboard"
          message={(error as any)?.message || 'Failed to retrieve your personalized student data from the server.'}
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  // If newly registered student without activity
  if (data.is_new_student) {
    return (
      <PageContainer className="space-y-6">
        <DashboardWelcome student={data.student} streakDays={1} />
        {data.student_profile && <DashboardProfileSummary profile={data.student_profile} onNavigate={onNavigate} />}
        <DashboardAIHero onNavigate={onNavigate} />
        <LearningModulesSummaryWidget onNavigate={onNavigate} />
        <DashboardOnboarding studentName={data.student.name} onNavigate={onNavigate} />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="space-y-6">
      {/* 0. Onboarding Personalization Action Banner */}
      {onboardingStatus && !onboardingStatus.is_complete && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Profile Setup & Personalization</span>
            </div>
            <h3 className="text-lg font-bold">Personalize your B.Tech AI Learning Platform</h3>
            <p className="text-xs text-blue-100 max-w-xl">
              Configure your curriculum syllabus, internal exam dates, learning modality, self-assessed skills, and career targets to personalize every AI Tutor and lab.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/onboarding')}
            className="px-5 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-all shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <span>Complete Onboarding Setup</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 1. Personalized Welcome Header */}
      <DashboardWelcome
        student={data.student}
        streakDays={data.summary.streak_days}
      />

      {/* 1b. Academic profile from the central student profile (Phase 5) */}
      {data.student_profile && <DashboardProfileSummary profile={data.student_profile} onNavigate={onNavigate} />}

      {/* 2. Compact Quick Actions Bar */}
      <QuickActions onNavigate={onNavigate} />

      {/* 3. 10 AI Learning Modules Live Summary Grid */}
      <LearningModulesSummaryWidget onNavigate={onNavigate} />

      {/* 4. Personalized AI Learning Hero */}
      <DashboardAIHero onNavigate={onNavigate} />

      {/* 5. Continue Active Learning */}
      <ContinueLearning item={data.continue_learning} onNavigate={onNavigate} />

      {/* 5. Main 2-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Primary Work Area (2 Cols on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks Checklist */}
          <TodaysPlan
            tasks={data.today_plan}
            onToggleTask={toggleTodayTask}
            onNavigate={onNavigate}
          />

          {/* Active Courses Progress */}
          <CourseProgress
            courses={data.course_progress}
            onNavigate={onNavigate}
          />

          {/* Contextual Recommendations */}
          <RecommendedLearning
            recommendations={data.recommendations}
            onNavigate={onNavigate}
          />

          {/* Active Engineering Projects */}
          <ActiveProjects
            projects={data.projects}
            onNavigate={onNavigate}
          />

          {/* Learning Analytics Chart */}
          <LearningAnalytics analytics={data.analytics} />
        </div>

        {/* Right Rail (1 Col on desktop) */}
        <div className="space-y-6">
          {/* Overall Academic Competency */}
          <OverallProgress summary={data.summary} />

          {/* Habit & Streak */}
          <LearningStreak
            streakDays={data.summary.streak_days}
            longestStreak={data.summary.longest_streak}
          />

          {/* Target Improvement Areas */}
          <WeakAreas areas={data.weak_areas} onNavigate={onNavigate} />

          {/* Strengths */}
          <Strengths strengths={data.strengths} />

          {/* Upcoming Deadlines & Exams */}
          <UpcomingItems items={data.upcoming_items} onNavigate={onNavigate} />

          {/* Recent Activity Timeline */}
          <RecentActivity activities={data.recent_activity} onNavigate={onNavigate} />

          {/* Recent Coding Activity & Sandbox Widget */}
          <RecentCodingWidget onNavigate={onNavigate} />

          {/* DSA & Algorithm Visualizer Widget */}
          <DSAProgressWidget onNavigate={onNavigate} />

          {/* AI Quiz & Adaptive Assessment Widget */}
          <QuizProgressWidget onNavigate={onNavigate} />

          {/* Placement Prep & AI Mock Interview Widget */}
          <PlacementProgressWidget onNavigate={onNavigate} />

          {/* Resume, Career Roadmap & Skill Assessment Widget */}
          <CareerResumeWidget onNavigate={onNavigate} />

          {/* Research Assistant & GitHub Code Intelligence Widget */}
          <ResearchGitHubWidget onNavigate={onNavigate} />

          {/* External Platform & Social Activity Telemetry (Section 33) */}
          <ExternalActivityWidget onNavigate={onNavigate} />

          {/* Recent Uploaded / Read Documents */}
          <RecentDocuments documents={data.recent_documents} onNavigate={onNavigate} />

          {/* Pinned Bookmarks */}
          <RecentBookmarks bookmarks={data.bookmarks} onNavigate={onNavigate} />
        </div>
      </div>
    </PageContainer>
  );
}
