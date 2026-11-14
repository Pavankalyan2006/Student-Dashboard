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
    <PageContainer className="space-y-6 lg:space-y-8">
      {/* Onboarding reminder: compact, not a full-width hero */}
      {onboardingStatus && !onboardingStatus.is_complete && (
        <div className="flex flex-col gap-3 rounded-xl border border-blue-200/70 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 ring-1 ring-inset ring-blue-200">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">Finish setting up your workspace</p>
              <p className="text-[13px] text-slate-600">
                Add your syllabus, exam dates, skills and career goals so the AI tutor and labs are tuned to you.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/onboarding')}
            className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-blue-600 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-blue-700 sm:self-center"
          >
            Complete setup
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Welcome and academic summary */}
      <DashboardWelcome student={data.student} streakDays={data.summary.streak_days} />
      {data.student_profile && <DashboardProfileSummary profile={data.student_profile} onNavigate={onNavigate} />}

      {/* Pick up where you left off */}
      <ContinueLearning item={data.continue_learning} onNavigate={onNavigate} />

      <QuickActions onNavigate={onNavigate} />

      {/* Main workspace: today's work on the left, progress and schedule on the right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <TodaysPlan
            tasks={data.today_plan}
            onToggleTask={toggleTodayTask}
            onNavigate={onNavigate}
          />
          <CourseProgress courses={data.course_progress} onNavigate={onNavigate} />
          <LearningAnalytics analytics={data.analytics} />
        </div>
        <div className="min-w-0 space-y-6">
          <OverallProgress summary={data.summary} />
          <LearningStreak streakDays={data.summary.streak_days} longestStreak={data.summary.longest_streak} />
          <UpcomingItems items={data.upcoming_items} onNavigate={onNavigate} />
          <RecentActivity activities={data.recent_activity} onNavigate={onNavigate} />
        </div>
      </div>

      {/* AI tutor entry point */}
      <DashboardAIHero onNavigate={onNavigate} />

      {/* Recommendations, focus areas and projects */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <RecommendedLearning recommendations={data.recommendations} onNavigate={onNavigate} />
          <ActiveProjects projects={data.projects} onNavigate={onNavigate} />
        </div>
        <div className="min-w-0 space-y-6">
          <WeakAreas areas={data.weak_areas} onNavigate={onNavigate} />
          <Strengths strengths={data.strengths} />
        </div>
      </div>

      {/* Every learning module at a glance */}
      <LearningModulesSummaryWidget onNavigate={onNavigate} />

      {/* Module activity, in an even grid instead of one long rail */}
      <section className="space-y-4" aria-labelledby="module-activity-heading">
        <div>
          <h2 id="module-activity-heading" className="font-display text-[17px] font-semibold tracking-tight text-slate-900">
            Labs, career and research
          </h2>
          <p className="text-[13px] text-slate-500">Live numbers from each module you use.</p>
        </div>
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 xl:grid-cols-3 [&>*]:min-w-0">
          <RecentCodingWidget onNavigate={onNavigate} />
          <DSAProgressWidget onNavigate={onNavigate} />
          <QuizProgressWidget onNavigate={onNavigate} />
          <PlacementProgressWidget onNavigate={onNavigate} />
          <CareerResumeWidget onNavigate={onNavigate} />
          <ResearchGitHubWidget onNavigate={onNavigate} />
          <ExternalActivityWidget onNavigate={onNavigate} />
          <RecentDocuments documents={data.recent_documents} onNavigate={onNavigate} />
          <RecentBookmarks bookmarks={data.bookmarks} onNavigate={onNavigate} />
        </div>
      </section>
    </PageContainer>
  );
}
