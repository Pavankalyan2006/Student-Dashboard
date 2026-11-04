// src/features/gate/components/GateStudyPlannerView.tsx
import React, { useState } from 'react';
import { GateStudyTask } from '../types/gateTypes';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
  Award,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

interface GateStudyPlannerViewProps {
  tasks: GateStudyTask[];
  onToggleTask: (taskId: string) => Promise<void>;
  onAddTask: (task: Omit<GateStudyTask, 'id' | 'student_id' | 'is_completed'>) => Promise<void>;
}

export const GateStudyPlannerView: React.FC<GateStudyPlannerViewProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('Operating Systems');
  const [taskType, setTaskType] = useState<'CONCEPT' | 'PRACTICE' | 'REVISION' | 'MOCK_TEST'>('PRACTICE');
  const [taskDuration, setTaskDuration] = useState(45);
  const [taskNotes, setTaskNotes] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }
    await onAddTask({
      paper_code: 'CS',
      title: taskTitle.trim(),
      subject: taskSubject,
      type: taskType,
      duration_minutes: Number(taskDuration),
      date: taskDate,
      notes: taskNotes.trim() || undefined,
    });
    setTaskTitle('');
    setTaskNotes('');
    setShowAddModal(false);
    toast.success('Study task added to schedule');
  };

  // Group tasks by date
  const groupedTasks: Record<string, GateStudyTask[]> = {};
  for (const t of tasks) {
    if (!groupedTasks[t.date]) groupedTasks[t.date] = [];
    groupedTasks[t.date].push(t);
  }

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" />
            GATE Preparation Study Planner
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Custom schedule balancing concept reading, topic-wise PYQ practice, and weekend mock tests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-400 block font-semibold">Weekly Milestone:</span>
            <span className="font-bold text-emerald-400">
              {completedCount} of {tasks.length} Completed ({progressPct}%)
            </span>
          </div>

          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Study Task</span>
          </Button>
        </div>
      </div>

      {/* Timeline of Tasks */}
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([date, dateTasks]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300 font-mono uppercase">{date}</span>
              <span className="text-[10px] text-slate-500">({dateTasks.length} tasks scheduled)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dateTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onToggleTask(t.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    t.is_completed
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-400'
                      : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="pt-0.5">
                    <div
                      className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                        t.is_completed
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {t.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-semibold ${
                        t.is_completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {t.title}
                    </div>
                    {t.notes && <p className="text-[11px] text-slate-400 mt-0.5">{t.notes}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                      <span className="text-indigo-400 font-mono font-bold uppercase">{t.subject}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t.duration_minutes} mins
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded-sm bg-slate-800 text-slate-300 font-mono">
                        {t.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-semibold">No study tasks created yet.</p>
            <p className="text-xs text-slate-500 mt-1">Click 'Add Study Task' to organize your preparation.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Add GATE Study Task</h3>
              <button onClick={() => setShowAddModal(false)} type="button" className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Task Title</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Solve 10 PYQs on Pipelining & Branch Hazards"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Subject</label>
                <select
                  value={taskSubject}
                  onChange={(e) => setTaskSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Algorithms">Algorithms</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Databases (DBMS)">Databases (DBMS)</option>
                  <option value="Theory of Computation">Theory of Computation</option>
                  <option value="Compiler Design">Compiler Design</option>
                  <option value="Digital Logic">Digital Logic</option>
                  <option value="Engineering Mathematics">Engineering Mathematics</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="PRACTICE">Practice Questions</option>
                  <option value="CONCEPT">Concept Learning</option>
                  <option value="REVISION">Revision</option>
                  <option value="MOCK_TEST">Mock Test</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Date</label>
                <input
                  type="date"
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  min="15"
                  max="240"
                  value={taskDuration}
                  onChange={(e) => setTaskDuration(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Notes / Target</label>
              <textarea
                rows={2}
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Optional notes or formula checklist..."
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="border-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
                Save Task
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
