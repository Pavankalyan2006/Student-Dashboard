import * as React from 'react';
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  Code2,
  Binary,
  Hammer,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { SubsystemProgressOverview } from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function SubsystemProgressPage({
  subsystem,
  onNavigate,
}: {
  subsystem: string;
  onNavigate: (path: string) => void;
}) {
  const [data, setData] = React.useState<SubsystemProgressOverview | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadSubsystem();
  }, [subsystem]);

  const loadSubsystem = async () => {
    try {
      setLoading(true);
      const res = await communityProfileApi.getSubsystemProgress(subsystem);
      setData(res);
    } catch {
      toast.error(`Failed to load ${subsystem} progress overview`);
    } finally {
      setLoading(false);
    }
  };

  const getSubsystemTitle = () => {
    switch (subsystem.toLowerCase()) {
      case 'courses': return 'Coursework Learning Progress';
      case 'skills': return 'Technical Skills & Evidence Matrix';
      case 'quiz': return 'Quiz Retries & Topic Mastery';
      case 'coding': return 'Coding Lab Sessions & Analysis';
      case 'dsa': return 'DSA Algorithm Challenges & Visualizations';
      case 'projects': return 'Project Builder Milestones & Git';
      case 'placement': return 'Placement & Mock Interview Readiness';
      case 'research': return 'Academic Literature & Citations';
      default: return `${subsystem.toUpperCase()} Progress`;
    }
  };

  const getSubsystemIcon = () => {
    switch (subsystem.toLowerCase()) {
      case 'courses': return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'skills': return <Award className="h-5 w-5 text-emerald-600" />;
      case 'quiz': return <HelpCircle className="h-5 w-5 text-amber-600" />;
      case 'coding': return <Code2 className="h-5 w-5 text-cyan-600" />;
      case 'dsa': return <Binary className="h-5 w-5 text-indigo-600" />;
      case 'projects': return <Hammer className="h-5 w-5 text-violet-600" />;
      case 'placement': return <Briefcase className="h-5 w-5 text-pink-600" />;
      case 'research': return <GraduationCap className="h-5 w-5 text-purple-600" />;
      default: return <BookOpen className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-56 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button
          onClick={() => onNavigate('/progress')}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="p-2.5 rounded-xl bg-slate-100">
          {getSubsystemIcon()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{getSubsystemTitle()}</h1>
          <p className="text-xs text-slate-500">
            Granular breakdown of your completed modules, recorded evidence, and performance trends.
          </p>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(data.summary_metrics).map(([key, value]) => (
          <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {key.replace(/_/g, ' ')}
            </span>
            <div className="text-xl font-bold text-slate-900 tabular-nums">{String(value)}</div>
          </div>
        ))}
      </div>

      {/* Activity Trend Chart */}
      {data.activity_trend.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Activity Trend</h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.activity_trend}>
                <XAxis dataKey="label" stroke="#9AA3B5" fontSize={11} />
                <YAxis stroke="#9AA3B5" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E3E6EE',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="value" name="Metric" fill="#6957E8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detailed Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Tracked Records & Items</h2>

        <div className="divide-y divide-slate-100">
          {data.detailed_items.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No detailed items recorded yet.</p>
          ) : (
            data.detailed_items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {item.title || item.skill_name || item.name || item.topic || `Item #${idx + 1}`}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {item.domain || item.description || item.category || 'Platform Tracked Activity'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.level && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.level}
                    </span>
                  )}
                  {item.score !== undefined && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      Score: {item.score}%
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
