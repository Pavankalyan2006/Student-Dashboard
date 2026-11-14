import * as React from 'react';
import {
  ArrowLeft,
  Target,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  CheckSquare,
  Square,
  BookOpen,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import {
  LearningGoal,
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
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadGoal();
  }, [goalId]);

  const loadGoal = async () => {
    try {
      setLoading(true);
      setGoal(await communityProfileApi.getGoal(goalId));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/goals')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                {goal.category}
              </span>
              <span className="text-xs text-slate-500">
                Target: {new Date(goal.target_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{goal.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={goal.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white cursor-pointer"
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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="text-slate-500 text-xs">Current Completion: </span>
            <span className="font-bold text-slate-900">
              {goal.current_value} / {goal.target_value} {goal.unit}
            </span>
          </div>
          <span className="text-lg font-bold text-blue-600 tabular-nums">{pct}%</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {goal.description && (
          <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
            {goal.description}
          </p>
        )}
      </div>

      {/* Milestones Checklist */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Target Milestones Checklist</h2>

        <div className="space-y-2">
          {goal.milestones.map((ms) => (
            <div
              key={ms.id || ms.title}
              onClick={() => handleToggleMilestone(ms.id || '')}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              {ms.is_completed ? (
                <CheckSquare className="h-4 w-4 text-blue-600 shrink-0" />
              ) : (
                <Square className="h-4 w-4 text-slate-400 shrink-0" />
              )}
              <span
                className={`text-xs font-medium ${
                  ms.is_completed ? 'line-through text-slate-400' : 'text-slate-900'
                }`}
              >
                {ms.title}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
