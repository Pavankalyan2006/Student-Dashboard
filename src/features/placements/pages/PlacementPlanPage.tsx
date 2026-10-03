import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  Target,
  Briefcase,
  Building2,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Code,
  HelpCircle,
  Brain,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { placementsApi } from '../api/placementsApi';
import type {
  PlacementPlan,
  PlacementPlanTask,
  PlacementRole,
  PlacementCompany,
  PlacementReadiness,
  WeakPlacementTopic,
} from '../types/placement';
import { WeakAreaCard } from '../components/WeakAreaCard';
import { PlacementReadinessCard } from '../components/PlacementReadinessCard';

interface Props {
  onNavigate?: (path: string) => void;
}

export const PlacementPlanPage: React.FC<Props> = ({ onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const [plans, setPlans] = useState<PlacementPlan[]>([]);
  const [activePlan, setActivePlan] = useState<PlacementPlan | null>(null);
  const [roles, setRoles] = useState<PlacementRole[]>([]);
  const [companies, setCompanies] = useState<PlacementCompany[]>([]);
  const [readiness, setReadiness] = useState<PlacementReadiness | null>(null);
  const [weakAreas, setWeakAreas] = useState<WeakPlacementTopic[]>([]);
  const [loading, setLoading] = useState(true);

  // New Plan Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [targetRoleId, setTargetRoleId] = useState('');
  const [targetCompanyId, setTargetCompanyId] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [dailyHours, setDailyHours] = useState(2);
  const [creating, setCreating] = useState(false);

  // Expanded weeks state
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, rolesData, companiesData, readinessData, weakData] = await Promise.all([
        placementsApi.getPlans(),
        placementsApi.getRoles(),
        placementsApi.getCompanies(),
        placementsApi.getReadiness().catch(() => null),
        placementsApi.getWeakTopics().catch(() => []),
      ]);

      setPlans(plansData);
      if (plansData.length > 0) {
        setActivePlan(plansData[0]);
      }
      setRoles(rolesData);
      setCompanies(companiesData);
      setReadiness(readinessData);
      setWeakAreas(weakData);

      if (rolesData.length > 0 && !targetRoleId) {
        setTargetRoleId(rolesData[0].id);
      }
    } catch (err) {
      console.error('Failed to load placement plan data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleTask = async (task: PlacementPlanTask) => {
    if (!activePlan) return;
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    try {
      const updated = await placementsApi.updatePlanTask(activePlan.id, task.id, { status: newStatus });
      // Update local state
      setActivePlan((prev: PlacementPlan | null) => {
        if (!prev) return prev;
        const newTasks = (prev.tasks || []).map((t: PlacementPlanTask) => (t.id === task.id ? updated : t));
        return { ...prev, tasks: newTasks };
      });
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoleId) return;

    try {
      setCreating(true);
      const res = await placementsApi.createPlan({
        target_role_id: targetRoleId,
        target_company_id: targetCompanyId || undefined,
        duration_weeks: durationWeeks,
        daily_hours: dailyHours,
      });

      const fullPlan: PlacementPlan = {
        ...res.plan,
        tasks: res.tasks,
      };

      setPlans((prev: PlacementPlan[]) => [fullPlan, ...prev]);
      setActivePlan(fullPlan);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create placement plan', err);
      alert('Could not generate placement plan. Please check inputs and try again.');
    } finally {
      setCreating(false);
    }
  };

  // Group tasks by week
  const tasks = activePlan?.tasks || [];
  const completedTasks = tasks.filter((t: PlacementPlanTask) => t.status === 'COMPLETED').length;
  const progressPct = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Group tasks into weeks (approximating 4 tasks per week)
  const tasksByWeek: Record<number, PlacementPlanTask[]> = {};
  tasks.forEach((task: PlacementPlanTask, idx: number) => {
    const weekNum = Math.floor(idx / 4) + 1;
    if (!tasksByWeek[weekNum]) {
      tasksByWeek[weekNum] = [];
    }
    tasksByWeek[weekNum].push(task);
  });

  const getSourceLink = (task: PlacementPlanTask): string => {
    if (task.source_type === 'quiz') return `/quiz`;
    if (task.source_type === 'dsa') return `/dsa`;
    if (task.source_type === 'coding') return `/coding`;
    if (task.source_type === 'course') return `/courses`;
    if (task.source_type === 'notes') return `/notes`;
    if (task.source_type === 'mock_interview') return `/placements/mock-interview/setup`;
    return `/placements/topics`;
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate('/placements')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Placement Prep
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#0B1530] tracking-tight">
                Personalized Placement Roadmap
              </h1>
              <p className="text-gray-600 mt-1">
                AI-curated structured weekly milestones targeting your desired engineering role, target company, and detected weak areas.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Generate New Roadmap
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-500">Loading your placement roadmap...</div>
        ) : !activePlan ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-600 shadow-sm max-w-2xl mx-auto">
            <Target className="w-14 h-14 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">No Active Placement Plan</h2>
            <p className="text-sm text-gray-500 mt-2">
              Generate a personalized week-by-week study plan calibrated to your role, available study hours, and weak topics.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Build Personalized Plan
            </button>
          </div>
        ) : (
          /* Main Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Plan Overview & Tasks */}
            <div className="lg:col-span-8 space-y-6">
              {/* Plan Header Card */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {activePlan.status} Plan
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-gray-400" />
                      <span>{activePlan.role?.name || 'Software Engineering'} Track</span>
                      {activePlan.company && (
                        <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {activePlan.company.name}
                        </span>
                      )}
                    </h2>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-600">{progressPct}%</div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {completedTasks} of {tasks.length} Completed
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Plan Meta */}
                <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-gray-500 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Started: {new Date(activePlan.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Target: {new Date(activePlan.target_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5 text-gray-400" />
                    <span>{tasks.length} Structured Milestones</span>
                  </div>
                </div>
              </div>

              {/* Weekly Task Breakdowns */}
              <div className="space-y-4">
                {Object.keys(tasksByWeek).map(weekStr => {
                  const weekNum = parseInt(weekStr, 10);
                  const weekTasks = tasksByWeek[weekNum];
                  const weekDone = weekTasks.filter(t => t.status === 'COMPLETED').length;
                  const isExpanded = expandedWeeks[weekNum] ?? true;

                  return (
                    <div
                      key={weekNum}
                      className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
                    >
                      {/* Week Header */}
                      <button
                        onClick={() =>
                          setExpandedWeeks(prev => ({
                            ...prev,
                            [weekNum]: !isExpanded,
                          }))
                        }
                        className="w-full p-4 flex items-center justify-between bg-gray-50/70 hover:bg-gray-50 transition border-b border-gray-100 text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                            W{weekNum}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">
                              Week {weekNum}: Strategic Focus
                            </h3>
                            <p className="text-xs text-gray-500">
                              {weekDone} / {weekTasks.length} milestones finished
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-semibold text-gray-500">
                            {Math.round((weekDone / weekTasks.length) * 100)}%
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Tasks List */}
                      {isExpanded && (
                        <div className="p-4 divide-y divide-gray-100">
                          {weekTasks.map(task => {
                            const isDone = task.status === 'COMPLETED';
                            return (
                              <div
                                key={task.id}
                                className={`py-3 flex items-start justify-between gap-3 group transition ${
                                  isDone ? 'opacity-60' : ''
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <button
                                    onClick={() => handleToggleTask(task)}
                                    className="mt-0.5 text-gray-400 hover:text-blue-600 transition shrink-0"
                                  >
                                    {isDone ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </button>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`font-semibold text-sm ${
                                          isDone ? 'line-through text-gray-500' : 'text-gray-900'
                                        }`}
                                      >
                                        {task.title}
                                      </span>
                                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                        {task.category}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed">{task.description}</p>
                                  </div>
                                </div>

                                <button
                                  onClick={() => navigate(getSourceLink(task))}
                                  className="shrink-0 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Open learning activity"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Readiness & Weak Areas */}
            <div className="lg:col-span-4 space-y-6">
              {readiness && <PlacementReadinessCard readiness={readiness} />}

              {weakAreas.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Identified Focus Areas
                  </h4>
                  <div className="space-y-3">
                    {weakAreas.map((item, idx) => (
                      <WeakAreaCard key={idx} weakArea={item} onNavigate={navigate} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Quick Practice Shortcuts
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/placements/mock-interview/setup')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition text-xs font-semibold text-gray-700 hover:text-blue-700 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      Take AI Mock Interview
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => navigate('/coding')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:border-emerald-200 border border-transparent transition text-xs font-semibold text-gray-700 hover:text-emerald-700 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-emerald-600" />
                      Practice Coding Lab
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => navigate('/dsa')}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border border-transparent transition text-xs font-semibold text-gray-700 hover:text-purple-700 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-600" />
                      DSA Visualizations
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Plan Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Build Placement Roadmap</h3>
                    <p className="text-xs text-gray-500">Configured with AI coaching logic</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4">
                {/* Target Role */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Role *
                  </label>
                  <select
                    value={targetRoleId}
                    onChange={e => setTargetRoleId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Company (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Company (Optional)
                  </label>
                  <select
                    value={targetCompanyId}
                    onChange={e => setTargetCompanyId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">General Placement Prep</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Duration (Weeks)
                    </label>
                    <select
                      value={durationWeeks}
                      onChange={e => setDurationWeeks(parseInt(e.target.value, 10))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value={2}>2 Weeks Sprint</option>
                      <option value={4}>4 Weeks Standard</option>
                      <option value={8}>8 Weeks Comprehensive</option>
                      <option value={12}>12 Weeks Semester</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Study Time (Hrs/Day)
                    </label>
                    <select
                      value={dailyHours}
                      onChange={e => setDailyHours(parseInt(e.target.value, 10))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value={1}>1 hour / day</option>
                      <option value={2}>2 hours / day</option>
                      <option value={3}>3 hours / day</option>
                      <option value={4}>4+ hours / day</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {creating ? 'Generating Plan...' : 'Generate Roadmap'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
