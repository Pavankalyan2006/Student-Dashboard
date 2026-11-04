// src/features/semester-command-center/pages/SemesterRecoveryGuidancePage.tsx
// Academic Recovery Engine & Daily/Weekly Academic Guidance (Section 18, 19, 20)

import * as React from 'react';
import {
  RotateCcw,
  Flame,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  Check,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { PageContainer, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { SemesterCommandCenterLayout } from '../components/SemesterCommandCenterLayout';
import { semesterCommandCenterApi } from '../../../api/semesterCommandCenterApi';
import {
  AcademicRecoveryPlan,
  DailyAcademicGuidance,
  WeeklyAcademicReview,
  AcademicSemesterConfig,
} from '../../../types/semesterCommandCenter';
import { toast } from 'sonner';

interface SemesterRecoveryGuidancePageProps {
  initialTab?: 'recovery' | 'daily' | 'weekly';
  onNavigate?: (path: string) => void;
}

export function SemesterRecoveryGuidancePage({
  initialTab = 'recovery',
  onNavigate,
}: SemesterRecoveryGuidancePageProps) {
  const [activeTab, setActiveTab] = React.useState<'recovery' | 'daily' | 'weekly'>(initialTab);
  const [recoveryPlans, setRecoveryPlans] = React.useState<AcademicRecoveryPlan[]>([]);
  const [todayGuidance, setTodayGuidance] = React.useState<DailyAcademicGuidance | null>(null);
  const [weeklyReview, setWeeklyReview] = React.useState<WeeklyAcademicReview | null>(null);
  const [config, setConfig] = React.useState<AcademicSemesterConfig | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const overview = await semesterCommandCenterApi.getOverview();
      setConfig(overview.config);
      setRecoveryPlans(overview.active_recovery_plans);
      setTodayGuidance(overview.today_guidance);
      setWeeklyReview(overview.latest_weekly_review);
    } catch (err: any) {
      toast.error('Failed to load recovery & guidance data: ' + err.message);
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
      toast.success('Recovery plan resolved! Rescheduled sessions marked complete.');
      await loadData();
    } catch (err: any) {
      toast.error('Failed to resolve recovery plan: ' + err.message);
    }
  };

  if (loading || !todayGuidance || !weeklyReview) {
    return (
      <PageContainer>
        <LoadingState message="Synthesizing academic recovery schedules & daily focus..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SemesterCommandCenterLayout currentTab="recovery" config={config} onNavigate={onNavigate}>
        <div className="space-y-6">
          {/* Sub-Tabs Switcher */}
          <div className="flex border-b border-slate-800 gap-6">
            <button
              onClick={() => setActiveTab('recovery')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'recovery'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              Academic Recovery Engine ({recoveryPlans.length} Active)
            </button>

            <button
              onClick={() => setActiveTab('daily')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'daily'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-4 h-4" />
              Today's Academic Guidance
            </button>

            <button
              onClick={() => setActiveTab('weekly')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'weekly'
                  ? 'border-indigo-500 text-indigo-400 font-semibold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Weekly Academic Review
            </button>
          </div>

          {/* TAB 1: ACADEMIC RECOVERY ENGINE (Section 18) */}
          {activeTab === 'recovery' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    Intelligent Academic Recovery Engine
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    If you miss a study block or score low on a test, the engine safely redistributes recovery sessions over multiple days to prevent burnout.
                  </p>
                </div>
              </div>

              {recoveryPlans.length === 0 ? (
                <EmptyState
                  title="No active recovery plans"
                  description="Great job! Your academic schedule is completely on track with no missed study sessions or pending retakes."
                />
              ) : (
                recoveryPlans.map((plan) => (
                  <div key={plan.id} className="p-5 bg-slate-900 border border-amber-900/40 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{plan.missed_item_title}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                            {plan.urgency} Urgency
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Logged on {plan.missed_date} • Type: {(plan.missed_item_type || 'ACADEMIC').replace(/_/g, ' ')}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleResolveRecovery(plan.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs self-start sm:self-auto"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Mark Plan Resolved
                      </Button>
                    </div>

                    {/* AI Recommendations */}
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                        AI Recovery Rationale:
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                        {plan.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Schedule Adjustments Breakdown */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                        Distributed Recovery Timetable:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {plan.schedule_adjustments.map((adj, idx) => (
                          <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-400">{adj.day}</span>
                              <span className="text-[10px] font-mono text-slate-400">{adj.duration_minutes} mins</span>
                            </div>
                            <p className="text-slate-200 font-medium line-clamp-2">{adj.task}</p>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono inline-block">
                              {adj.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: DAILY GUIDANCE (Section 19) */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-400" />
                      Today's Daily Academic Guidance ({todayGuidance.date})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Synthesized priorities taking into account upcoming slip tests, topic dependencies, and spaced repetition.
                    </p>
                  </div>
                </div>

                {/* Primary & Secondary Focus */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-indigo-900/40 space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                      Primary Academic Target ({todayGuidance.primary_focus.estimated_minutes} mins)
                    </span>
                    <h4 className="text-base font-bold text-white">{todayGuidance.primary_focus.subject_name}</h4>
                    <p className="text-xs text-slate-300">{todayGuidance.primary_focus.unit_name}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {todayGuidance.primary_focus.target_topics.map((t, idx) => (
                        <span key={idx} className="text-xs bg-slate-900 border border-slate-800 text-slate-200 px-2 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                      Secondary Focus ({todayGuidance.secondary_focus.estimated_minutes} mins)
                    </span>
                    <h4 className="text-base font-bold text-white">{todayGuidance.secondary_focus.subject_name}</h4>
                    <p className="text-xs text-slate-300">{todayGuidance.secondary_focus.task_description}</p>
                  </div>
                </div>

                {/* Quick Practice & Revision Due */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onClick={() => onNavigate && onNavigate(todayGuidance.quick_practice.action_url)}
                    className="p-4 bg-indigo-950/20 border border-indigo-800/40 rounded-xl flex items-center justify-between cursor-pointer hover:bg-indigo-950/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">
                        Quick Practice Sandbox
                      </span>
                      <p className="text-sm font-bold text-white">{todayGuidance.quick_practice.title}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-400" />
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wide block">
                      Spaced Repetition Revision Due:
                    </span>
                    {todayGuidance.revision_due.map((rev, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-200 font-medium">
                          {rev.subject_name} - {rev.unit_name}
                        </span>
                        <span className="text-[10px] text-purple-400">{rev.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEEKLY REVIEW (Section 20) */}
          {activeTab === 'weekly' && (
            <div className="space-y-6">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      Weekly Academic Review (Week {weeklyReview.week_number})
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {weeklyReview.start_date} to {weeklyReview.end_date} • {weeklyReview.study_hours_completed} of{' '}
                      {weeklyReview.study_hours_target} hours completed
                    </p>
                  </div>
                </div>

                {/* Progress Deltas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {weeklyReview.subject_deltas.map((d, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs text-slate-400 font-medium">{d.subject_name}</span>
                      <div className="text-xl font-bold text-emerald-400">+{d.progress_delta_percent}%</div>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                          d.status === 'AHEAD'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : d.status === 'ON_TRACK'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Strong vs Attention Needed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/30 space-y-2">
                    <span className="font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Strong Topics Mastered This Week:
                    </span>
                    <ul className="text-slate-300 space-y-1 list-disc pl-4">
                      {weeklyReview.strong_topics.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-xl border border-amber-900/30 space-y-2">
                    <span className="font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> Topics Needing Attention Next Week:
                    </span>
                    <ul className="text-slate-300 space-y-1 list-disc pl-4">
                      {weeklyReview.needs_attention.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Next Week Priorities */}
                <div className="p-4 bg-slate-950 rounded-xl border border-indigo-900/40 space-y-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                    Next Week Academic Priorities:
                  </span>
                  <ul className="text-xs text-slate-200 space-y-1.5 list-disc pl-4">
                    {weeklyReview.next_week_priorities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </SemesterCommandCenterLayout>
    </PageContainer>
  );
}
