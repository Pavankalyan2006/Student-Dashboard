// src/features/study-planner/pages/StudyPlannerPage.tsx
// Complete AI Study Planner with Today, Week, Calendar, and Custom Plan Creator

import * as React from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  MessageSquare,
  FastForward,
} from 'lucide-react';
import { PageContainer, PageHeader, PageSection, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { StudyPlan, StudyPlanTask } from '../../../types/learningModules';
import { toast } from 'sonner';

interface StudyPlannerPageProps {
  onNavigate?: (path: string) => void;
}

export function StudyPlannerPage({ onNavigate }: StudyPlannerPageProps) {
  const [activeTab, setActiveTab] = React.useState<'today' | 'week' | 'all' | 'create'>('today');
  const [plans, setPlans] = React.useState<StudyPlan[]>([]);
  const [todayTasks, setTodayTasks] = React.useState<StudyPlanTask[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreating, setIsCreating] = React.useState(false);

  // Form State
  const [newPlanTitle, setNewPlanTitle] = React.useState('');
  const [newPlanType, setNewPlanType] = React.useState<'DAILY' | 'WEEKLY' | 'SEMESTER' | 'EXAM' | 'PLACEMENT'>('SEMESTER');
  const [newPlanDescription, setNewPlanDescription] = React.useState('');
  const [newPlanTargetDate, setNewPlanTargetDate] = React.useState('');
  const [newPlanTargetHours, setNewPlanTargetHours] = React.useState(20);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedPlans, fetchedTasks] = await Promise.all([
        learningModulesApi.studyPlanner.getPlans(),
        learningModulesApi.studyPlanner.getTodayTasks(),
      ]);
      setPlans(fetchedPlans);
      setTodayTasks(fetchedTasks);
    } catch (err: any) {
      toast.error('Failed to load study plans: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateTask = async (planId: string, taskId: string, status: 'COMPLETED' | 'SKIPPED' | 'RESCHEDULED' | 'IN_PROGRESS') => {
    try {
      await learningModulesApi.studyPlanner.updateTaskStatus(planId, taskId, status);
      toast.success(`Task marked as ${status.toLowerCase()}`);
      loadData();
    } catch (err: any) {
      toast.error('Failed to update task: ' + err.message);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle.trim()) {
      toast.error('Please enter a plan title');
      return;
    }
    try {
      setIsCreating(true);
      await learningModulesApi.studyPlanner.createPlan({
        title: newPlanTitle,
        type: newPlanType,
        description: newPlanDescription,
        target_date: newPlanTargetDate || new Date(Date.now() + 30 * 24 * 3600000).toISOString().split('T')[0],
        total_hours_target: Number(newPlanTargetHours) || 20,
        tasks: [
          {
            id: `task_${Date.now()}_1`,
            plan_id: '',
            student_id: '',
            title: `Kickoff: Core Review for ${newPlanTitle}`,
            subject: 'Engineering Core',
            topic: 'Foundations',
            start_time: '09:00 AM',
            duration_minutes: 60,
            priority: 'HIGH',
            status: 'PENDING',
            date: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
          },
        ],
      });
      toast.success('AI Study Plan generated successfully!');
      setNewPlanTitle('');
      setNewPlanDescription('');
      setActiveTab('today');
      loadData();
    } catch (err: any) {
      toast.error('Failed to create plan: ' + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="AI Study Planner" description="Loading adaptive schedules and daily milestones..." />
        <LoadingState message="Connecting to StudyPlannerAgent & CourseProgress..." />
      </PageContainer>
    );
  }

  const activePlan = plans[0];
  const completedTasksCount = todayTasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPercent = todayTasks.length > 0 ? Math.round((completedTasksCount / todayTasks.length) * 100) : 0;

  return (
    <PageContainer>
      <PageHeader
        title="AI Study Planner"
        description="Personalized adaptive study schedules grounded in your branch syllabus, semester exams, and weak topics."
        badge={
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            StudyPlannerAgent Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate?.('/study-planner/calendar')}
              className="gap-1.5"
            >
              <CalendarIcon className="w-4 h-4 text-[#475467]" />
              Calendar View
            </Button>
            <Button
              size="sm"
              onClick={() => setActiveTab(activeTab === 'create' ? 'today' : 'create')}
              className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              <Plus className="w-4 h-4" />
              {activeTab === 'create' ? 'View Tasks' : 'New Plan'}
            </Button>
          </div>
        }
      />

      {/* Progress & Quick Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Today's Progress</p>
            <h3 className="text-2xl font-bold text-[#101828] mt-1">{progressPercent}%</h3>
            <p className="text-xs text-[#027A48] mt-0.5">{completedTasksCount} of {todayTasks.length} tasks completed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Active Plan</p>
            <h3 className="text-sm font-bold text-[#101828] mt-1 line-clamp-1">
              {activePlan?.title || 'Semester 6 Routine'}
            </h3>
            <p className="text-xs text-[#475467] mt-0.5">
              {activePlan ? `${activePlan.completed_hours}h / ${activePlan.total_hours_target}h logged` : 'No active plan'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">Remaining Today</p>
            <h3 className="text-2xl font-bold text-[#101828] mt-1">
              {todayTasks.filter((t) => t.status === 'PENDING').length}
            </h3>
            <p className="text-xs text-amber-600 mt-0.5">Tasks scheduled</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#475467]">AI Recommendation</p>
            <h3 className="text-xs font-bold text-[#101828] mt-1 line-clamp-2">
              Focus on Normalization & B+ Trees
            </h3>
            <p className="text-xs text-purple-600 mt-0.5">Weakness recovery</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'today' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Today's Plan
        </button>
        <button
          onClick={() => setActiveTab('week')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'week' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Weekly Overview
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'all' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          All Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'create' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          + Plan Generator
        </button>
      </div>

      {/* Create Plan Form */}
      {activeTab === 'create' && (
        <div className="p-6 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Generate Adaptive AI Study Schedule
          </h2>
          <p className="text-xs text-[#475467]">
            StudyPlannerAgent balances course completion deadlines, pending quiz reviews, weak concepts, and university exam dates.
          </p>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Plan Title</label>
              <input
                type="text"
                placeholder="e.g. DBMS Midterm & LeetCode Sprint"
                value={newPlanTitle}
                onChange={(e) => setNewPlanTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Plan Scope</label>
                <select
                  value={newPlanType}
                  onChange={(e) => setNewPlanType(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DAILY">Daily Intensive</option>
                  <option value="WEEKLY">Weekly Sprint</option>
                  <option value="SEMESTER">Full Semester</option>
                  <option value="EXAM">Exam Revision</option>
                  <option value="PLACEMENT">Placement Prep</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Target Hours</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={newPlanTargetHours}
                  onChange={(e) => setNewPlanTargetHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Target Completion Date</label>
              <input
                type="date"
                value={newPlanTargetDate}
                onChange={(e) => setNewPlanTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Target Goals / Notes</label>
              <textarea
                placeholder="Specific weak topics, exam chapters, or priority goals..."
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab('today')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="bg-[#2563EB] text-white">
                {isCreating ? 'Synthesizing Plan...' : 'Generate Plan'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Today's Tasks Timeline */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#101828] flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              TODAY'S SCHEDULE
            </h2>
            <span className="text-xs text-[#475467]">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <EmptyState
              title="No Tasks Scheduled for Today"
              description="Your schedule is clear! Create a new plan or let StudyPlannerAgent generate daily active recall tasks."
              action={
                <Button onClick={() => setActiveTab('create')} size="sm">
                  Generate Today's Tasks
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all duration-150 ${
                    task.status === 'COMPLETED'
                      ? 'bg-gray-50/80 border-gray-200 opacity-75'
                      : 'bg-white border-[#E4E7EC] hover:border-blue-300 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50">
                          {task.start_time || 'Flexible'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            task.priority === 'CRITICAL'
                              ? 'bg-rose-50 text-rose-700'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-xs text-[#475467] font-medium">{task.subject}</span>
                      </div>
                      <h3
                        className={`text-sm font-semibold ${
                          task.status === 'COMPLETED' ? 'line-through text-gray-500' : 'text-[#101828]'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.notes && <p className="text-xs text-[#475467]">{task.notes}</p>}
                      {task.ai_recommendation && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md mt-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{task.ai_recommendation}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {task.status !== 'COMPLETED' ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTask(task.plan_id || 'plan_sem6_primary', task.id, 'IN_PROGRESS')}
                            className="gap-1 text-xs"
                          >
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                            Start
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateTask(task.plan_id || 'plan_sem6_primary', task.id, 'COMPLETED')}
                            className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateTask(task.plan_id || 'plan_sem6_primary', task.id, 'SKIPPED')}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Skip
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateTask(task.plan_id || 'plan_sem6_primary', task.id, 'RESCHEDULED')}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Reschedule
                          </Button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Weekly Overview */}
      {activeTab === 'week' && (
        <div className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4">
          <h2 className="text-base font-bold text-[#101828]">Weekly Planned Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div key={day} className="p-3 border rounded-lg bg-gray-50/50 space-y-2">
                <span className="text-xs font-bold text-[#344054] block">{day}</span>
                <div className="text-[11px] p-2 bg-white rounded border border-gray-200">
                  <p className="font-semibold text-blue-600">{idx % 2 === 0 ? 'DBMS / SQL' : 'DSA Trees'}</p>
                  <p className="text-gray-500">{idx % 2 === 0 ? '2h revision' : '1.5h drill'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Plans */}
      {activeTab === 'all' && (
        <div className="space-y-3">
          {plans.map((p) => (
            <div key={p.id} className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {p.type}
                  </span>
                  <h3 className="text-sm font-bold text-[#101828]">{p.title}</h3>
                </div>
                <p className="text-xs text-[#475467] mt-1">{p.description}</p>
                <p className="text-xs text-[#344054] font-medium mt-1">
                  Target: {p.target_date} • {p.completed_hours}h completed of {p.total_hours_target}h target
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => onNavigate?.(`/study-planner/plan/${p.id}`)}>
                View Tasks
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
