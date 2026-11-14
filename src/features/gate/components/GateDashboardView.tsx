// src/features/gate/components/GateDashboardView.tsx
import React from 'react';
import { GateDashboardData } from '../types/gateTypes';
import {
  BookOpen,
  Award,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface GateDashboardViewProps {
  data: GateDashboardData;
  onNavigateTab: (tab: string) => void;
  onOpenPaperSelector: () => void;
  onToggleTask: (taskId: string) => Promise<void>;
  onPracticeTopic?: (topicId: string) => void;
}

export const GateDashboardView: React.FC<GateDashboardViewProps> = ({
  data,
  onNavigateTab,
  onOpenPaperSelector,
  onToggleTask,
  onPracticeTopic,
}) => {
  const { profile, paper_info, metrics, weak_topics, upcoming_tasks, recent_attempts } = data;

  // Calculate days remaining until target exam date
  // Only the date the student entered is used; no official exam date is assumed.
  const targetDateObj = profile.target_date ? new Date(profile.target_date) : null;
  const daysRemaining =
    targetDateObj && !isNaN(targetDateObj.getTime())
      ? Math.max(0, Math.ceil((targetDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl surface-hero border border-slate-200 p-6 shadow-xs">

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Target Paper: [{paper_info.code}] {paper_info.name}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {profile.exam_cycle || 'Exam cycle not set'}
              </span>
              <button
                onClick={onOpenPaperSelector}
                className="text-xs text-indigo-600 hover:text-indigo-700 underline font-medium cursor-pointer ml-1"
              >
                Change Paper / Goal
              </button>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              GATE {(profile.exam_cycle || '').replace('GATE ', '')} Command Center
            </h2>
            <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
              Your target marks: <strong className="text-emerald-600">{profile.target_score ? `${profile.target_score}/100` : 'not set'}</strong> • Your
              rank goal: <strong className="text-purple-600">{profile.air_goal || 'not set'}</strong> (your own goal, not a prediction) • Planned{' '}
              {profile.weekly_study_hours || 0} hrs/week.
            </p>
          </div>

          {/* Countdown & Goal Pill */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white border border-indigo-200 rounded-xl text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Exam Countdown</span>
              <span className="text-2xl font-black text-indigo-600">{daysRemaining ?? '--'}</span>
              <span className="text-[10px] text-slate-500 block">{daysRemaining === null ? 'Set your exam date' : 'Days Left'}</span>
            </div>

            <div className="p-3 bg-white border border-emerald-200 rounded-xl text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">Best Mock Marks</span>
              <span className="text-2xl font-black text-emerald-600">{metrics.total_mock_tests_taken > 0 ? metrics.highest_mock_test_score : '--'}</span>
              <span className="text-[10px] text-slate-500 block">{metrics.total_mock_tests_taken > 0 ? 'raw marks' : 'no mock test yet'}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Syllabus Completion
            </span>
            <span className="text-indigo-700 font-bold">
              {metrics.completed_topics} of {metrics.total_topics} Topics ({metrics.syllabus_completion_percentage}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, metrics.syllabus_completion_percentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Questions Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.total_questions_practiced}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {metrics.total_correct} correct answers
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Overall Accuracy</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">{metrics.overall_accuracy_percentage}%</div>
          <p className="text-[11px] text-slate-500 mt-0.5">across PYQs & Practice</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Mock Tests Taken</span>
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{metrics.total_mock_tests_taken}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Highest: {metrics.highest_mock_test_score}/100
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Bookmarked PYQs</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{metrics.saved_questions_count}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Saved for revision</p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={() => onNavigateTab('syllabus')}
          className="p-4 bg-white border border-slate-200 hover:border-indigo-200 rounded-xl text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="font-bold text-sm text-slate-900 mt-3">Syllabus Explorer</div>
          <p className="text-xs text-slate-500 mt-1">Track subjects, mark confidence, and add notes.</p>
        </button>

        <button
          onClick={() => onNavigateTab('questions')}
          className="p-4 bg-white border border-slate-200 hover:border-emerald-200 rounded-xl text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="font-bold text-sm text-slate-900 mt-3">Question Bank (PYQs)</div>
          <p className="text-xs text-slate-500 mt-1">Solve authentic 2024-2020 GATE questions with timer.</p>
        </button>

        <button
          onClick={() => onNavigateTab('tests')}
          className="p-4 bg-white border border-slate-200 hover:border-purple-200 rounded-xl text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="font-bold text-sm text-slate-900 mt-3">Full Mock Tests</div>
          <p className="text-xs text-slate-500 mt-1">180-min official 65-question simulator with virtual calc.</p>
        </button>

        <button
          onClick={() => onNavigateTab('revision')}
          className="p-4 bg-white border border-slate-200 hover:border-amber-200 rounded-xl text-left transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </div>
          <div className="font-bold text-sm text-slate-900 mt-3">Weak Topics & Revision</div>
          <p className="text-xs text-slate-500 mt-1">Target low accuracy topics and spaced repetition.</p>
        </button>
      </div>

      {/* Weak Topics Diagnostic Warning */}
      {weak_topics && weak_topics.length > 0 && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-amber-700">Weak Topics Detected</h3>
              <p className="text-xs text-slate-500">
                Based on your actual practice test errors and low self-reported confidence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {weak_topics.map((wt) => (
              <div key={wt.topic_id} className="p-3 bg-white border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[170px]">{wt.topic_name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700">
                    {wt.accuracy === null || wt.accuracy === undefined ? 'Flagged by you' : `${wt.accuracy}% Accuracy`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">{wt.recommendation}</p>
                <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{wt.subject}</span>
                  <button
                    onClick={() => onPracticeTopic ? onPracticeTopic(wt.topic_id) : onNavigateTab('questions')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                  >
                    Practice Now &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Upcoming Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Study Schedule */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Scheduled Study Tasks
            </h3>
            <button
              onClick={() => onNavigateTab('planner')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Full Study Plan &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {upcoming_tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  task.is_completed
                    ? 'border-emerald-200 bg-emerald-50 text-slate-500'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-200'
                }`}
              >
                <div className="pt-0.5">
                  <div
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                      task.is_completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-600 bg-slate-50'
                    }`}
                  >
                    {task.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-semibold ${task.is_completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {task.title}
                  </div>
                  {task.notes && <p className="text-[11px] text-slate-500 mt-0.5">{task.notes}</p>}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.duration_minutes} mins
                    </span>
                    <span className="px-1.5 py-0.5 rounded-sm bg-slate-50 text-slate-700 font-mono">
                      {task.type}
                    </span>
                    <span>{task.date}</span>
                  </div>
                </div>
              </div>
            ))}

            {upcoming_tasks.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No tasks scheduled for today.</p>
            )}
          </div>
        </div>

        {/* Recent Question Practice */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Recent Practice History
            </h3>
            <button
              onClick={() => onNavigateTab('questions')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Open Question Bank &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {recent_attempts.map((att) => (
              <div
                key={att.id}
                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-indigo-600 font-mono uppercase">{att.subject}</div>
                  <div className="font-medium text-slate-800 mt-0.5 truncate">{att.statement}</div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                    <span>Spent: {att.time_spent_seconds}s</span>
                    <span>•</span>
                    <span>{new Date(att.attempted_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {att.is_correct ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      +{att.marks_awarded} Marks
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {att.negative_deducted > 0 ? `-${att.negative_deducted}` : '0'} Marks
                    </span>
                  )}
                </div>
              </div>
            ))}

            {recent_attempts.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No question attempts recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
