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
  UnifiedLearningProgress,
  LearningInsight,
  ResourceRecommendation,
} from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

const PIE_COLORS = ['#2563EB', '#0891B2', '#16A34A', '#7C3AED', '#F59E0B'];

export function ProgressDashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [progress, setProgress] = React.useState<UnifiedLearningProgress | null>(null);
  const [insights, setInsights] = React.useState<LearningInsight[]>([]);
  const [insightsSummary, setInsightsSummary] = React.useState('');
  const [recs, setRecs] = React.useState<ResourceRecommendation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [progData, insightData, recData] = await Promise.all([
        communityProfileApi.getProgress(),
        communityProfileApi.getInsights('weekly'),
        communityProfileApi.getRecommendations(),
      ]);
      setProgress(progData);
      setInsights(insightData.insights);
      setInsightsSummary(insightData.summary);
      setRecs(recData);
    } catch {
      toast.error('Failed to load learning progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!progress) return null;

  const hasSufficientData = progress.has_sufficient_data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101828]">Unified Learning Progress</h1>
          <p className="text-xs text-[#667085]">
            Cross-platform academic analytics grounded strictly in verified student activity across all 8 modules.
          </p>
        </div>

        {/* Streak summary pill */}
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 px-3.5 py-1.5 rounded-xl self-start sm:self-auto">
          <Flame className="h-4 w-4 text-orange-600" />
          <span className="text-xs font-bold text-orange-950">
            {progress.streak.current_streak}-Day Active Streak
          </span>
          <span className="text-[11px] text-orange-700">
            (Best: {progress.streak.longest_streak}d)
          </span>
        </div>
      </div>

      {/* Subsystem Quick Links Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { name: 'Courses', href: '/progress/courses', icon: BookOpen, color: 'text-blue-600', val: `${progress.subsystems.courses.completion_rate}%` },
          { name: 'Skills', href: '/progress/skills', icon: Award, color: 'text-emerald-600', val: `${progress.subsystems.skills.strong_skills_count} Strong` },
          { name: 'Quizzes', href: '/progress/quiz', icon: HelpCircle, color: 'text-amber-600', val: `${progress.subsystems.quizzes.average_score}% Avg` },
          { name: 'Coding', href: '/progress/coding', icon: Code2, color: 'text-cyan-600', val: `${progress.subsystems.coding.problems_solved} Solved` },
          { name: 'DSA Lab', href: '/progress/dsa', icon: Binary, color: 'text-indigo-600', val: `${progress.subsystems.dsa.problems_solved} Solved` },
          { name: 'Projects', href: '/progress/projects', icon: Hammer, color: 'text-violet-600', val: `${progress.subsystems.projects.active_count} Active` },
          { name: 'Placement', href: '/progress/placement', icon: Briefcase, color: 'text-pink-600', val: `${progress.subsystems.placement.readiness_index}% Ready` },
          { name: 'Research', href: '/progress/research', icon: GraduationCap, color: 'text-purple-600', val: `${progress.subsystems.research.papers_analyzed} Papers` },
        ].map((sub) => (
          <div
            key={sub.name}
            onClick={() => onNavigate(sub.href)}
            className="p-3 bg-white rounded-xl border border-[#E4E7EC] hover:border-blue-300 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <sub.icon className={`h-4 w-4 ${sub.color}`} />
              <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#101828] truncate">{sub.val}</div>
              <div className="text-[10px] text-[#667085] truncate">{sub.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Area/Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#101828]">Weekly Learning Activity Distribution</h2>
              <p className="text-xs text-[#667085]">
                Lessons completed, coding problems, quiz attempts, and paper analysis by day.
              </p>
            </div>
          </div>

          {!hasSufficientData ? (
            <div className="h-64 flex items-center justify-center text-xs text-[#667085] bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Not enough activity yet. Complete a lesson or solve a problem to view trends.
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
            <p className="text-xs text-[#667085]">Proportion of effort across core domains.</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
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
                  {progress.category_breakdown.map((_, index) => (
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
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            {progress.category_breakdown.map((cat, idx) => (
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

      {/* AI Learning Insights & Grounded Recommendations Grid */}
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
            {insights.map((ins, idx) => (
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
            ))}
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
            {recs.map((rec) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
