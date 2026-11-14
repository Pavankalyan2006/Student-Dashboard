// src/features/semester-command-center/pages/SemesterOverviewPage.tsx
// Academic Semester Command Center Overview & Dynamic Progress Dashboard

import * as React from 'react';
import {
  BookOpen,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Flame,
  ChevronRight,
  Target,
  FlaskConical,
  GraduationCap,
} from 'lucide-react';
import { PageContainer, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { SemesterCommandCenterLayout } from '../components/SemesterCommandCenterLayout';
import { semesterCommandCenterApi } from '../../../api/semesterCommandCenterApi';
import { SemesterOverviewDashboardData } from '../../../types/semesterCommandCenter';
import { toast } from 'sonner';

interface SemesterOverviewPageProps {
  onNavigate?: (path: string) => void;
}

export function SemesterOverviewPage({ onNavigate }: SemesterOverviewPageProps) {
  const [data, setData] = React.useState<SemesterOverviewDashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const overview = await semesterCommandCenterApi.getOverview();
      setData(overview);
    } catch (err: any) {
      toast.error('Failed to load semester overview: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResolveRecovery = async (planId: string) => {
    try {
      await semesterCommandCenterApi.resolveRecoveryPlan(planId);
      toast.success('Recovery plan resolved! Study schedule updated.');
      loadData();
    } catch (err: any) {
      toast.error('Failed to resolve recovery plan: ' + err.message);
    }
  };

  if (loading || !data) {
    return (
      <PageContainer>
        <LoadingState message="Synthesizing academic semester intelligence & calendar..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SemesterCommandCenterLayout
        currentTab="overview"
        config={data.config}
        currentPhase={data.current_phase}
        onNavigate={onNavigate}
      >
        <div className="space-y-6">
          {/* Phase 5: academic context from the central student profile */}
          {(data as any).academic_context && (() => {
            const ac = (data as any).academic_context as { degree?: string | null; branch?: string | null; specialization?: string | null; academic_year?: number | null; semester?: number | null; college?: string | null; academic_status?: string | null; subjects?: string[] };
            const line = [ac.degree, ac.branch, ac.specialization, ac.academic_year ? `Year ${ac.academic_year}` : null, ac.semester ? `Semester ${ac.semester}` : null].filter(Boolean).join(' · ');
            return (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-2" aria-label="Academic context">
                <span className="text-slate-800">{line || 'Academic details not set yet'}{ac.college ? ` — ${ac.college}` : ''}</span>
                <button onClick={() => onNavigate?.('/profile/edit')} className="text-xs font-semibold text-indigo-700 hover:underline">
                  {line ? 'Edit academic details' : 'Add academic details'}
                </button>
              </div>
            );
          })()}
          {/* 1. Six Macro Semester Health Metrics Cards (Section 22) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <MetricCard
              title="Overall Semester"
              value={`${data.overall_progress_percent}%`}
              subtitle="Progress index"
              icon={<GraduationCap className="w-4 h-4 text-indigo-600" />}
              progress={data.overall_progress_percent}
              color="indigo"
            />
            <MetricCard
              title="Syllabus"
              value={`${data.syllabus_progress_percent}%`}
              subtitle="Completed"
              icon={<BookOpen className="w-4 h-4 text-emerald-600" />}
              progress={data.syllabus_progress_percent}
              color="emerald"
            />
            <MetricCard
              title="Revision"
              value={`${data.revision_progress_percent}%`}
              subtitle="Spaced cycles"
              icon={<RotateCcw className="w-4 h-4 text-purple-600" />}
              progress={data.revision_progress_percent}
              color="purple"
            />
            <MetricCard
              title="Assessments"
              value={`${data.assessment_progress_percent}%`}
              subtitle="Quizzes & Tests"
              icon={<CheckCircle2 className="w-4 h-4 text-sky-600" />}
              progress={data.assessment_progress_percent}
              color="sky"
            />
            <MetricCard
              title="Labs & Vivas"
              value={`${data.lab_progress_percent}%`}
              subtitle="Practical manual"
              icon={<FlaskConical className="w-4 h-4 text-teal-600" />}
              progress={data.lab_progress_percent}
              color="teal"
            />
            <MetricCard
              title="Exam Prep"
              value={`${data.exam_prep_progress_percent}%`}
              subtitle="Mid & End Sem"
              icon={<Award className="w-4 h-4 text-amber-600" />}
              progress={data.exam_prep_progress_percent}
              color="amber"
            />
          </div>

          {/* 2. Active Academic Recovery Alert (Section 18) */}
          {data.active_recovery_plans.length > 0 && (
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">Academic Recovery Engine Active</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 font-mono">
                      {data.active_recovery_plans[0].urgency} Priority
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">
                    {data.active_recovery_plans[0].missed_item_title}. Automated recovery schedule distributed over 4 days without overloading study hours.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate && onNavigate('/semester-command-center/daily-plan')}
                  className="text-xs border-amber-200 hover:bg-slate-50 text-amber-700"
                >
                  View Plan
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleResolveRecovery(data.active_recovery_plans[0].id)}
                  className="text-xs bg-amber-600 hover:bg-amber-500 text-white"
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          )}

          {/* 3. Main Workspace Grid: Today's Focus & Subject Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Subject Progress Status (Section 22) & Weekly Review */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subject Status Cards */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-600" />
                      Semester Subject Intelligence
                    </h3>
                    <p className="text-xs text-slate-500">
                      Syllabus progress, exam countdown, and difficulty rating per subject
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate && onNavigate('/semester-command-center/subjects')}
                    className="text-xs border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    Manage Syllabus <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {data.subjects.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onNavigate && onNavigate(`/semester-command-center/subjects/${sub.id}`)}
                      className="p-4 bg-white border border-slate-200 hover:border-slate-200 rounded-xl cursor-pointer transition-colors group space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                            {sub.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">{sub.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-50 text-slate-500">
                            {sub.credits} Credits
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              sub.priority === 'CRITICAL'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : sub.priority === 'HIGH'
                                ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {sub.priority} Priority
                          </span>
                          <span className="text-xs font-bold text-slate-900 font-mono">{sub.progress_percent}%</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${sub.progress_percent}%` }}
                        />
                      </div>

                      {/* Subject Metadata */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-3">
                          <span>
                            Completed Units:{' '}
                            <strong className="text-slate-800">
                              {sub.units.filter((u) => u.status === 'COMPLETED').length}/{sub.units.length}
                            </strong>
                          </span>
                          <span>•</span>
                          <span>
                            Difficulty: <strong className="text-slate-800">{sub.difficulty}</strong>
                          </span>
                        </div>
                        {sub.exam_proximity_days !== undefined && (
                          <span className="text-amber-600 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Next Assessment in {sub.exam_proximity_days} days
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Academic Review (Section 20) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Weekly Academic Review (Week {data.latest_weekly_review.week_number})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Calculated progress deltas, verified topic mastery, and next week focus
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                    {data.latest_weekly_review.study_hours_completed} hrs studied
                  </span>
                </div>

                {/* Progress Deltas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {data.latest_weekly_review.subject_deltas.map((delta, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="text-xs text-slate-500 font-medium truncate">{delta.subject_name}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-emerald-600">+{delta.progress_delta_percent}%</span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                            delta.status === 'AHEAD'
                              ? 'bg-emerald-50 text-emerald-600'
                              : delta.status === 'ON_TRACK'
                              ? 'bg-indigo-50 text-indigo-600'
                              : 'bg-amber-50 text-amber-600'
                          }`}
                        >
                          {delta.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Next Week Priorities */}
                <div className="p-3.5 bg-white rounded-lg border border-indigo-200 space-y-1.5">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    Next Week Academic Priorities:
                  </h4>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                    {data.latest_weekly_review.next_week_priorities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Today's Academic Focus (Section 19) & Upcoming Calendar */}
            <div className="space-y-6">
              {/* Today's Focus Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-slate-900">Today's Academic Focus</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{data.today_guidance.date}</span>
                </div>

                {/* Primary Focus */}
                <div className="p-3.5 bg-white rounded-xl border border-indigo-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-indigo-600 font-bold uppercase tracking-wide">Primary Target</span>
                    <span className="text-slate-500 text-[11px] font-mono">
                      {data.today_guidance.primary_focus.estimated_minutes} mins
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {data.today_guidance.primary_focus.subject_name}
                  </h4>
                  <p className="text-xs text-slate-700">{data.today_guidance.primary_focus.unit_name}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {data.today_guidance.primary_focus.target_topics.map((top, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded">
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Secondary Focus */}
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-xs">
                  <div className="text-slate-500 font-medium">Secondary Topic:</div>
                  <div className="font-semibold text-slate-800">{data.today_guidance.secondary_focus.subject_name}</div>
                  <p className="text-slate-500 text-[11px]">{data.today_guidance.secondary_focus.task_description}</p>
                </div>

                {/* Quick Practice Link */}
                <div
                  onClick={() => onNavigate && onNavigate(data.today_guidance.quick_practice.action_url)}
                  className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <div className="text-xs space-y-0.5">
                    <span className="text-[10px] text-indigo-600 font-semibold uppercase">Quick Practice</span>
                    <p className="text-slate-900 font-medium">{data.today_guidance.quick_practice.title}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-indigo-600 shrink-0" />
                </div>

                {/* Upcoming Tests */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Upcoming Slip Tests:
                  </span>
                  {data.today_guidance.upcoming_slip_tests.map((st, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200">
                      <span className="text-slate-700 font-medium">{st.subject_name}</span>
                      <span className="text-amber-600 font-mono text-[11px]">in {st.days_left} days ({st.date})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Academic Events */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Academic Timeline
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate && onNavigate('/semester-command-center/calendar')}
                    className="text-xs border-slate-200 text-slate-700 h-7"
                  >
                    View Calendar
                  </Button>
                </div>

                <div className="space-y-2">
                  {data.upcoming_events.slice(0, 4).map((ev) => (
                    <div key={ev.id} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 truncate mr-2">{ev.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-50 text-indigo-600 shrink-0">
                          {(ev.event_type || 'ACADEMIC_EVENT').replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>{ev.date} {ev.start_time && `• ${ev.start_time}`}</span>
                        {ev.priority === 'CRITICAL' && <span className="text-red-600 font-bold">Critical</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SemesterCommandCenterLayout>
    </PageContainer>
  );
}

// Reusable Metric Card
function MetricCard({
  title,
  value,
  subtitle,
  icon,
  progress,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  progress: number;
  color: string;
}) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">{title}</span>
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold text-slate-900">{value}</div>
        <div className="text-[11px] text-slate-500">{subtitle}</div>
      </div>
      <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            color === 'indigo'
              ? 'bg-indigo-500'
              : color === 'emerald'
              ? 'bg-emerald-500'
              : color === 'purple'
              ? 'bg-purple-500'
              : color === 'sky'
              ? 'bg-sky-500'
              : color === 'teal'
              ? 'bg-teal-500'
              : 'bg-amber-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
