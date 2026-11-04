import * as React from 'react';
import {
  TrendingUp,
  BookOpen,
  HelpCircle,
  Code2,
  Binary,
  Hammer,
  Briefcase,
  GraduationCap,
  Award,
  Flame,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Lightbulb,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Target,
  FileText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { communityProfileApi } from '../../../api/communityProfileApi';
import {
  LearningInsight,
  ResourceRecommendation,
} from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

const PIE_COLORS = ['#2563EB', '#0891B2', '#16A34A', '#7C3AED', '#F59E0B'];

const DATE_FILTERS = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'semester', label: 'Current Semester' },
  { id: 'all', label: 'All Time' },
];

export function ProgressDashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [progress, setProgress] = React.useState<any | null>(null);
  const [insights, setInsights] = React.useState<LearningInsight[]>([]);
  const [insightsSummary, setInsightsSummary] = React.useState('');
  const [recs, setRecs] = React.useState<ResourceRecommendation[]>([]);
  const [timeRange, setTimeRange] = React.useState<string>('all');
  const [lastRefreshed, setLastRefreshed] = React.useState<string>('Just now');
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    loadData(timeRange);
  }, [timeRange]);

  const loadData = async (selectedRange: string) => {
    try {
      if (!progress) setLoading(true);
      else setRefreshing(true);

      const [progData, insightData, recData] = await Promise.all([
        communityProfileApi.getProgress({ timeRange: selectedRange }),
        communityProfileApi.getInsights('weekly'),
        communityProfileApi.getRecommendations(),
      ]);
      setProgress(progData);
      setInsights(insightData?.insights || []);
      setInsightsSummary(insightData?.summary || '');
      setRecs(recData || []);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch {
      toast.error('Failed to load learning progress data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const data = await communityProfileApi.exportProgress();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-unified-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Progress report exported successfully');
    } catch {
      toast.error('Failed to export progress data');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-14 w-80 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!progress) return null;

  const hasSufficientData = progress.has_sufficient_data;
  const student = progress.student_info || {};
  const overview = progress.overview_cards || {};
  const subsystems = progress.subsystems || {};
  const streak = progress.streak || { current_streak: 0, longest_streak: 0 };
  const academic = progress.academic_progress || {};
  const timeline = progress.activity_timeline || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* 6.1 Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#101828]">Unified Progress</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {student.name || 'Engineering Student'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              {student.degree || 'B.Tech'} • {student.branch || 'CSE'} • Sem {student.semester || 7}
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            Comprehensive learning, assessments, labs, and career development analytics grounded strictly in verified activity.
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Last refreshed indicator */}
          <div className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>Refreshed: {lastRefreshed}</span>
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => loadData(timeRange)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Export Action */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Export your progress report (JSON)"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" />
            <span>{exporting ? 'Exporting...' : 'Export Progress'}</span>
          </button>

          {/* Streak pill */}
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-xl">
            <Flame className="h-4 w-4 text-orange-600" />
            <span className="text-xs font-bold text-orange-950">
              {streak.current_streak}-Day Streak
            </span>
          </div>
        </div>
      </div>

      {/* Date Range Filter Pill Row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" /> Filter by:
        </span>
        {DATE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setTimeRange(f.id)}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              timeRange === f.id
                ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 6.2 Overview Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          {
            title: 'Learning Activity',
            val: `${overview.learning_activity?.completed_count || 0}`,
            sub: 'Activities recorded',
            icon: TrendingUp,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            title: 'Courses',
            val: `${subsystems.courses?.completion_rate || 0}%`,
            sub: `${overview.courses?.lesson_progress || 0} Lessons done`,
            icon: BookOpen,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            href: '/courses',
          },
          {
            title: 'Assessments',
            val: overview.assessments?.average_score || '0%',
            sub: `${overview.assessments?.completed_quizzes || 0} Quizzes taken`,
            icon: HelpCircle,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            href: '/quiz',
          },
          {
            title: 'Coding & DSA',
            val: `${overview.coding?.solved_count || 0}`,
            sub: 'Problems solved',
            icon: Code2,
            color: 'text-cyan-600',
            bg: 'bg-cyan-50',
            href: '/coding-lab',
          },
          {
            title: 'Revision',
            val: `${overview.revision?.sessions_completed || 0}`,
            sub: `${overview.revision?.items_due || 0} Items due`,
            icon: Sparkles,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: '/spaced-revision',
          },
          {
            title: 'Projects',
            val: `${overview.projects?.total_projects || 0}`,
            sub: `${overview.projects?.completed || 0} Completed`,
            icon: Hammer,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            href: '/projects',
          },
          {
            title: 'Career Prep',
            val: `${overview.career_prep?.mock_interviews || 0}`,
            sub: 'Mock interviews',
            icon: Briefcase,
            color: 'text-pink-600',
            bg: 'bg-pink-50',
            href: '/mock-interviews',
          },
          {
            title: 'Learning Goals',
            val: `${overview.learning_goals?.active_goals || 0}`,
            sub: `${overview.learning_goals?.completed_goals || 0} Completed`,
            icon: Target,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            href: '/goals',
          },
        ].map((card) => (
          <div
            key={card.title}
            onClick={() => card.href && onNavigate(card.href)}
            className={`p-3.5 bg-white rounded-xl border border-[#E4E7EC] hover:border-blue-300 shadow-2xs transition-all flex flex-col justify-between ${
              card.href ? 'cursor-pointer group' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-lg ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              {card.href && <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-blue-600" />}
            </div>
            <div>
              <div className="text-base font-bold text-[#101828] tabular-nums">{card.val}</div>
              <div className="text-[11px] font-semibold text-slate-700 truncate">{card.title}</div>
              <div className="text-[10px] text-[#667085] truncate">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 7. Academic Progress & Semester Command Center Link */}
      <div className="p-4 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-700" />
            <h3 className="text-xs font-bold text-blue-950">Academic Semester Context</h3>
          </div>
          <p className="text-xs text-blue-900/80">
            Enrolled in {student.degree || 'B.Tech'} {student.branch || 'AIML'} • Semester {student.semester || 7} at {student.institution || 'NIT'}.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/semester')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
        >
          <span>Open Semester Command Center</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Area/Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#101828]">Weekly Learning Activity Distribution</h2>
              <p className="text-xs text-[#667085]">
                Lessons, coding problems, quizzes, and research actions performed by day.
              </p>
            </div>
            <span className="text-[11px] font-medium text-slate-500 uppercase px-2 py-0.5 bg-slate-100 rounded">
              {timeRange}
            </span>
          </div>

          {!hasSufficientData ? (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-[#667085] bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6 text-center space-y-2">
              <TrendingUp className="h-8 w-8 text-slate-300" />
              <p className="font-medium text-slate-700">No activity yet in this time window.</p>
              <p className="text-[11px] text-slate-500 max-w-sm">
                Complete a lesson, solve a coding exercise, or take a quiz to visualize your learning activity.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progress.weekly_activity}>
                  <XAxis dataKey="day" stroke="#98A2B3" fontSize={11} />
                  <YAxis stroke="#98A2B3" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E4E7EC',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="lessons" name="Lessons" fill="#2563EB" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="coding" name="Coding & DSA" fill="#0891B2" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="quizzes" name="Quizzes" fill="#F59E0B" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="research" name="Research" fill="#7C3AED" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#101828]">Category Distribution</h2>
            <p className="text-xs text-[#667085]">Proportion of completed activities across domains.</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {progress.category_breakdown && progress.category_breakdown.some((c: any) => c.completed > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progress.category_breakdown}
                    dataKey="completed"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {progress.category_breakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E4E7EC',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400">
                <span>No activities recorded yet</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            {(progress.category_breakdown || []).map((cat: any, idx: number) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-[#344054] truncate max-w-[140px]">{cat.category}</span>
                </div>
                <span className="font-semibold text-[#101828] tabular-nums">
                  {cat.completed} completed
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 14. Chronological Activity Timeline */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#101828]">Verified Activity Timeline</h2>
            <p className="text-xs text-[#667085]">
              Real-time audit log of your verified platform actions and milestones.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">{timeline.length} recent events</span>
        </div>

        {timeline.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            No activities recorded in this time range yet. Start learning to record milestones!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
            {timeline.map((act: any) => (
              <div
                key={act.id}
                onClick={() => act.link && onNavigate(act.link)}
                className="py-2.5 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#101828] group-hover:text-blue-600 transition-colors">
                      {act.title}
                    </h4>
                    <span className="text-[10px] text-slate-500">
                      Module: <span className="font-medium">{act.source_module}</span> • {new Date(act.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {act.status}
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 15. AI Learning Insights & Grounded Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insights */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-50 text-[#4F46E5]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#101828]">Factual Learning Observations</h2>
              <p className="text-xs text-[#667085]">
                Descriptive analytics derived strictly from your verified platform actions.
              </p>
            </div>
          </div>

          {insightsSummary && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#344054] leading-relaxed italic">
              "{insightsSummary}"
            </div>
          )}

          <div className="space-y-2.5">
            {insights.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No automated observations yet.</p>
            ) : (
              insights.map((ins, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start gap-2.5"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-[#4F46E5] shrink-0 mt-1.5" />
                  <div className="text-xs text-[#344054] leading-relaxed">
                    <span className="font-semibold text-[#101828]">{ins.title}: </span>
                    {ins.observation}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#101828]">Targeted Resource Recommendations</h2>
              <p className="text-xs text-[#667085]">
                Anchored in actual platform courses, quizzes, and papers with explicit reasons.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recommendations available yet.</p>
            ) : (
              recs.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onNavigate(rec.link)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/60 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors">
                      {rec.title}
                    </h4>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 text-[#475467]">
                      {rec.resource_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#475467] leading-relaxed">{rec.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
