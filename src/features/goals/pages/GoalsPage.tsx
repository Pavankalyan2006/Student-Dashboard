import * as React from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Sparkles,
  BookOpen,
  Filter,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { LearningGoal } from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function GoalsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [goals, setGoals] = React.useState<LearningGoal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedStatus, setSelectedStatus] = React.useState('ALL');
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  // Form state
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [newCategory, setNewCategory] = React.useState('COURSES');
  const [newTargetVal, setNewTargetVal] = React.useState(10);
  const [newUnit, setNewUnit] = React.useState('lessons');
  const [newTargetDate, setNewTargetDate] = React.useState('2026-11-30');
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    loadGoals();
  }, [selectedStatus]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getGoals(
        selectedStatus === 'ALL' ? undefined : selectedStatus
      );
      setGoals(data);
    } catch {
      toast.error('Failed to load learning goals');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Goal title is required');
      return;
    }

    try {
      setCreating(true);
      const created = await communityProfileApi.createGoal({
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory as any,
        target_value: Number(newTargetVal),
        unit: newUnit.trim(),
        target_date: newTargetDate,
        milestones: [
          { id: 'ms_1', title: 'Complete foundational overview', is_completed: false },
          { id: 'ms_2', title: 'Finish intermediate practice problems', is_completed: false },
        ],
      });
      setGoals((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      toast.success('Learning goal created successfully!');
    } catch {
      toast.error('Failed to create learning goal');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#101828]">Student Learning Goals</h1>
          <p className="text-xs text-[#667085]">
            Define clear, measurable targets across courses, DSA problems, research papers, and technical projects.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Set New Learning Goal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedStatus === st
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-white border border-[#E4E7EC] text-[#475467] hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' ? 'All Goals' : st}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#667085] bg-white rounded-2xl border border-[#E4E7EC] space-y-2">
          <Target className="h-8 w-8 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700">No learning goals found</p>
          <p className="text-[11px] text-slate-500">
            Click "Set New Learning Goal" above to create your first milestone-driven goal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const pct = Math.min(
              100,
              Math.round(((goal.current_value || 0) / (goal.target_value || 1)) * 100)
            );
            return (
              <div
                key={goal.id}
                onClick={() => onNavigate(`/goals/${goal.id}`)}
                className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-2xs hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-200">
                      {goal.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        goal.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : goal.status === 'ACTIVE'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors">
                    {goal.title}
                  </h3>

                  {goal.description && (
                    <p className="text-xs text-[#475467] leading-relaxed line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#667085]">
                      Progress: <span className="font-semibold text-slate-900">{goal.current_value}</span> / {goal.target_value} {goal.unit}
                    </span>
                    <span className="font-bold text-[#2563EB] tabular-nums">{pct}%</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-[#667085]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>Target: {new Date(goal.target_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <span className="text-[#2563EB] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View milestones</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#101828]">Create Learning Goal</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Goal Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Tree Invariants in DSA Lab"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Explain why this goal is important and how you plan to complete it..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="COURSES">Courses</option>
                    <option value="DSA">DSA Lab</option>
                    <option value="CODING">Coding Lab</option>
                    <option value="PROJECTS">Projects</option>
                    <option value="RESEARCH">Research</option>
                    <option value="CAREER">Career & Placement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Target Quantity</label>
                  <input
                    type="number"
                    value={newTargetVal}
                    onChange={(e) => setNewTargetVal(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Unit</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="problems, papers, hours"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#475467] hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
