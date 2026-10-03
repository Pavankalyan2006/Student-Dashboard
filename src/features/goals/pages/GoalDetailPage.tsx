import * as React from 'react';
import {
  ArrowLeft,
  Target,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  Trash2,
  CheckSquare,
  Square,
  BookOpen,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import {
  LearningGoal,
  ResourceRecommendation,
} from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function GoalDetailPage({
  goalId,
  onNavigate,
}: {
  goalId: string;
  onNavigate: (path: string) => void;
}) {
  const [goal, setGoal] = React.useState<LearningGoal | null>(null);
  const [recs, setRecs] = React.useState<ResourceRecommendation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadGoal();
  }, [goalId]);

  const loadGoal = async () => {
    try {
      setLoading(true);
      const [gData, recData] = await Promise.all([
        communityProfileApi.getGoal(goalId),
        communityProfileApi.getGoalRecommendations(goalId),
      ]);
      setGoal(gData);
      setRecs(recData);
    } catch {
      toast.error('Failed to load goal details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    try {
      const updated = await communityProfileApi.toggleMilestone(goalId, milestoneId);
      setGoal(updated);
      toast.success('Milestone updated');
    } catch {
      toast.error('Failed to toggle milestone');
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      const updated = await communityProfileApi.updateGoal(goalId, { status: status as any });
      setGoal(updated);
      toast.success(`Goal status changed to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this learning goal?')) return;
    try {
      await communityProfileApi.deleteGoal(goalId);
      toast.success('Goal deleted');
      onNavigate('/goals');
    } catch {
      toast.error('Failed to delete goal');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!goal) return null;

  const pct = Math.min(
    100,
    Math.round(((goal.current_value || 0) / (goal.target_value || 1)) * 100)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/goals')}
            className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-200">
                {goal.category}
              </span>
              <span className="text-xs text-[#667085]">
                Target: {new Date(goal.target_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#101828] mt-1">{goal.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={goal.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D0D5DD] bg-white cursor-pointer"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="PAUSED">PAUSED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          <button
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Goal"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Overview Card */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-[#667085] text-xs">Current Completion: </span>
            <span className="font-bold text-[#101828]">
              {goal.current_value} / {goal.target_value} {goal.unit}
            </span>
          </div>
          <span className="text-lg font-bold text-[#2563EB] tabular-nums">{pct}%</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#2563EB] h-3 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {goal.description && (
          <p className="text-xs text-[#475467] leading-relaxed pt-2 border-t border-slate-100">
            {goal.description}
          </p>
        )}
      </div>

      {/* Milestones Checklist */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-[#101828]">Target Milestones Checklist</h2>

        <div className="space-y-2">
          {goal.milestones.map((ms) => (
            <div
              key={ms.id || ms.title}
              onClick={() => handleToggleMilestone(ms.id || '')}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              {ms.is_completed ? (
                <CheckSquare className="h-4 w-4 text-[#2563EB] shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-slate-400 shrink-0" />
              )}
              <span
                className={`text-xs font-medium ${
                  ms.is_completed ? 'line-through text-slate-400' : 'text-[#101828]'
                }`}
              >
                {ms.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Correlated Platform Recommendations */}
      {recs.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2563EB]" />
            <h2 className="text-sm font-bold text-[#101828]">
              Recommended Platform Resources for this Goal
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recs.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onNavigate(rec.link)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors">
                    {rec.title}
                  </h4>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-blue-600" />
                </div>
                <p className="text-[11px] text-[#475467] leading-relaxed">{rec.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
