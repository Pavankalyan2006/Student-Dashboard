import React from 'react';
import { PlacementDashboardStats } from '../types/placement';
import {
  CheckCircle2,
  HelpCircle,
  Percent,
  Binary,
  Video,
  AlertTriangle,
  Clock,
  Activity,
  ArrowRight,
  Compass,
  FileQuestion,
  Terminal,
} from 'lucide-react';

interface Props {
  stats: PlacementDashboardStats | undefined;
  isLoading: boolean;
  onNavigate: (path: string) => void;
  onOpenAssessment: () => void;
}

export const PlacementOverviewCards: React.FC<Props> = ({
  stats,
  isLoading,
  onNavigate,
  onOpenAssessment,
}) => {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 h-28" />
        ))}
      </div>
    );
  }

  const {
    tasks_completed,
    practice_questions_attempted,
    accuracy_percentage,
    coding_problems_solved,
    mock_interviews_completed,
    topics_needing_revision,
    upcoming_tasks_count,
    recent_activity,
    is_onboarding,
  } = stats;

  return (
    <div className="space-y-4">
      {/* 8 Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Tasks Completed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="p-1.5 bg-blue-50 rounded-lg">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{tasks_completed}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Tasks Done</div>
        </div>

        {/* 2. Questions Attempted */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="p-1.5 bg-indigo-50 rounded-lg">
              <HelpCircle className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MCQ</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{practice_questions_attempted}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Questions</div>
        </div>

        {/* 3. Accuracy % */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="p-1.5 bg-emerald-50 rounded-lg">
              <Percent className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rate</span>
          </div>
          <div className="text-xl font-bold text-slate-900">
            {accuracy_percentage !== null ? `${accuracy_percentage}%` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Accuracy</div>
        </div>

        {/* 4. Coding Solved */}
        <div
          onClick={() => onNavigate('/dsa')}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="p-1.5 bg-amber-50 rounded-lg">
              <Binary className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DSA</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{coding_problems_solved}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">DSA Solved</div>
        </div>

        {/* 5. Mock Interviews */}
        <div
          onClick={() => onNavigate('/placements/history')}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-purple-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="p-1.5 bg-purple-50 rounded-lg">
              <Video className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mocks</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{mock_interviews_completed}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Interviews</div>
        </div>

        {/* 6. Topics Needing Revision */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="p-1.5 bg-rose-50 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Review</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{topics_needing_revision}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Weak Areas</div>
        </div>

        {/* 7. Upcoming Tasks */}
        <div
          onClick={() => onNavigate('/placements/plans')}
          className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-cyan-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-cyan-600 mb-2">
            <span className="p-1.5 bg-cyan-50 rounded-lg">
              <Clock className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queue</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{upcoming_tasks_count}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Upcoming</div>
        </div>

        {/* 8. Recent Activity Count */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="p-1.5 bg-teal-50 rounded-lg">
              <Activity className="h-4 w-4" />
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Events</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{recent_activity.length}</div>
          <div className="text-[11px] text-slate-500 font-medium truncate">Study Logs</div>
        </div>
      </div>

      {/* Onboarding State Banner for Fresh Students */}
      {is_onboarding && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                <Compass className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">Welcome to your Placement Preparation Hub!</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                  You have not attempted any placement practice questions or mock tests yet.
                  Kickstart your journey with 3 foundational steps to establish your baseline skills:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenAssessment}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <FileQuestion className="h-3.5 w-3.5" />
                Take Aptitude Diagnostic
              </button>
              <button
                onClick={() => onNavigate('/dsa')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Terminal className="h-3.5 w-3.5" />
                Solve Starter DSA Problem
              </button>
              <button
                onClick={() => onNavigate('/placements/mock-interview/setup')}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Video className="h-3.5 w-3.5" />
                Try Mock Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
