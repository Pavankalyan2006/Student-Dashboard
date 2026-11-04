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
  Search,
  CheckSquare,
  Square,
  Trash2,
  Pause,
  Play,
  AlertCircle,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { LearningGoal } from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function GoalsPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [goals, setGoals] = React.useState<LearningGoal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedStatus, setSelectedStatus] = React.useState('ALL');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [selectedPriority, setSelectedPriority] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  // Form state
  const [newTitle, setNewTitle] = React.useState('');
  const [newDesc, setNewDesc] = React.useState('');
  const [newCategory, setNewCategory] = React.useState('COURSES');
  const [newPriority, setNewPriority] = React.useState('MEDIUM');
  const [newTargetVal, setNewTargetVal] = React.useState(10);
  const [newUnit, setNewUnit] = React.useState('lessons');
  const [newTargetDate, setNewTargetDate] = React.useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [milestoneInputs, setMilestoneInputs] = React.useState<string[]>([
    'Complete foundational concepts',
    'Finish intermediate exercises',
  ]);
  const [reminderPref, setReminderPref] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    loadGoals();
  }, [selectedStatus, selectedCategory, selectedPriority]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getGoals({
        status: selectedStatus,
        category: selectedCategory,
        priority: selectedPriority,
        search: searchQuery,
      });
      setGoals(data);
    } catch {
      toast.error('Failed to load learning goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGoals();
  };

  const handleAddMilestoneInput = () => {
    setMilestoneInputs((prev) => [...prev, '']);
  };

  const handleMilestoneInputChange = (index: number, val: string) => {
    setMilestoneInputs((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveMilestoneInput = (index: number) => {
    setMilestoneInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('Goal title is required');
      return;
    }

    try {
      setCreating(true);
      const validMilestones = milestoneInputs
        .filter((m) => m.trim().length > 0)
        .map((m, idx) => ({
          id: `ms_${Date.now()}_${idx + 1}`,
          title: m.trim(),
          is_completed: false,
          completed: false,
        }));

      const created = await communityProfileApi.createGoal({
        title: newTitle.trim(),
        description: newDesc.trim(),
        category: newCategory as any,
        target_value: Number(newTargetVal),
        unit: newUnit.trim() || 'units',
        target_date: newTargetDate,
        milestones: validMilestones.length > 0 ? validMilestones : [
          { id: `ms_1`, title: 'Complete initial module', is_completed: false, completed: false },
        ],
        ...({ priority: newPriority, reminder_enabled: reminderPref } as any),
      });

      setGoals((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setMilestoneInputs(['Complete foundational concepts', 'Finish intermediate exercises']);
      toast.success('Learning goal created successfully!');
    } catch {
      toast.error('Failed to create learning goal');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await communityProfileApi.toggleMilestone(goalId, milestoneId);
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      toast.success('Milestone updated');
    } catch {
      toast.error('Failed to update milestone');
    }
  };

  const handleStatusChange = async (goalId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await communityProfileApi.updateGoal(goalId, { status: newStatus as any });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      toast.success(`Goal marked as ${newStatus}`);
    } catch {
      toast.error('Failed to update goal status');
    }
  };

  const handleDeleteGoal = async (goalId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this learning goal?')) return;
    try {
      await communityProfileApi.deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      toast.success('Goal deleted');
    } catch {
      toast.error('Failed to delete goal');
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q));
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* 18. Page Header */}
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

      {/* Filter and Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search goals by title or description..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="COURSES">Courses</option>
            <option value="DSA">DSA Lab</option>
            <option value="CODING">Coding Lab</option>
            <option value="PROJECTS">Projects</option>
            <option value="RESEARCH">Research</option>
            <option value="CAREER">Career</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Status Filter Tabs */}
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
      ) : filteredGoals.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#667085] bg-white rounded-2xl border border-[#E4E7EC] space-y-2">
          <Target className="h-8 w-8 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700">No learning goals found</p>
          <p className="text-[11px] text-slate-500">
            Click "Set New Learning Goal" above to create your first milestone-driven goal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGoals.map((goal) => {
            const completedMilestones = (goal.milestones || []).filter((m) => m.is_completed || m.completed).length;
            const totalMilestones = (goal.milestones || []).length;
            const pct = totalMilestones > 0
              ? Math.round((completedMilestones / totalMilestones) * 100)
              : Math.min(100, Math.round(((goal.current_value || 0) / (goal.target_value || 1)) * 100));

            const priority = (goal as any).priority || 'MEDIUM';

            return (
              <div
                key={goal.id}
                onClick={() => onNavigate(`/goals/${goal.id}`)}
                className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-2xs hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2563EB] border border-blue-200">
                        {goal.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          priority === 'HIGH'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : priority === 'LOW'
                            ? 'bg-slate-50 text-slate-700 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          goal.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : goal.status === 'ACTIVE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {goal.status}
                      </span>
                      {goal.status === 'ACTIVE' ? (
                        <button
                          onClick={(e) => handleStatusChange(goal.id, 'PAUSED', e)}
                          title="Pause goal"
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <Pause className="h-3 w-3" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleStatusChange(goal.id, 'ACTIVE', e)}
                          title="Activate goal"
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 cursor-pointer"
                        >
                          <Play className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDeleteGoal(goal.id, e)}
                        title="Delete goal"
                        className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors">
                    {goal.title}
                  </h3>

                  {goal.description && (
                    <p className="text-xs text-[#475467] leading-relaxed line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* 20. Milestones Quick Checklist */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-700">Milestones:</div>
                      {goal.milestones.slice(0, 3).map((m, idx) => {
                        const isDone = m.is_completed || m.completed;
                        return (
                          <div
                            key={m.id || idx}
                            onClick={(e) => handleToggleMilestone(goal.id, m.id || `ms_${idx + 1}`, e)}
                            className="flex items-center gap-2 text-xs text-slate-700 hover:text-blue-600 transition-colors"
                          >
                            {isDone ? (
                              <CheckSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                            )}
                            <span className={isDone ? 'line-through text-slate-400' : ''}>
                              {m.title}
                            </span>
                          </div>
                        );
                      })}
                      {goal.milestones.length > 3 && (
                        <div className="text-[10px] text-slate-400 italic">
                          +{goal.milestones.length - 3} more milestones
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#667085]">
                      {totalMilestones > 0 ? (
                        <>Milestones: <span className="font-semibold text-slate-900">{completedMilestones}</span> / {totalMilestones}</>
                      ) : (
                        <>Progress: <span className="font-semibold text-slate-900">{goal.current_value}</span> / {goal.target_value} {goal.unit}</>
                      )}
                    </span>
                    <span className="font-bold text-[#2563EB] tabular-nums">{pct}%</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#667085]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>Target: {new Date(goal.target_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <span className="text-[#2563EB] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View details</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 19. Goal Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 max-w-lg w-full space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
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
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Goal Title <span className="text-red-500">*</span>
                </label>
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
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-xs font-semibold text-[#344054] mb-1">Target Qty</label>
                    <input
                      type="number"
                      value={newTargetVal}
                      onChange={(e) => setNewTargetVal(Number(e.target.value))}
                      min={1}
                      required
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#344054] mb-1">Unit</label>
                    <input
                      type="text"
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      placeholder="problems"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Milestones Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#344054]">Milestones Checklist</label>
                  <button
                    type="button"
                    onClick={handleAddMilestoneInput}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add Milestone
                  </button>
                </div>
                <div className="space-y-2">
                  {milestoneInputs.map((ms, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={ms}
                        onChange={(e) => handleMilestoneInputChange(idx, e.target.value)}
                        placeholder={`Milestone ${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                      {milestoneInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestoneInput(idx)}
                          className="text-slate-400 hover:text-red-500 text-xs px-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminder preference checkbox */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="reminderPref"
                  checked={reminderPref}
                  onChange={(e) => setReminderPref(e.target.checked)}
                  className="h-3.5 w-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="reminderPref" className="text-xs text-slate-600 cursor-pointer">
                  Send in-app reminder when target date is approaching (within 5 days)
                </label>
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
