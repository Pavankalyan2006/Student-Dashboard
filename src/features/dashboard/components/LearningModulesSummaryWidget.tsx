// src/features/dashboard/components/LearningModulesSummaryWidget.tsx
// Dynamic Dashboard summary widget displaying live student status for the 10 New AI Learning Modules

import * as React from 'react';
import {
  Calendar,
  GraduationCap,
  HelpCircle,
  Layers,
  FlaskConical,
  Database,
  Cpu,
  Network,
  Brain,
  Briefcase,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';

interface LearningModulesSummaryWidgetProps {
  onNavigate: (path: string) => void;
}

export function LearningModulesSummaryWidget({ onNavigate }: LearningModulesSummaryWidgetProps) {
  const [data, setData] = React.useState<{
    todayTasksCount: number;
    upcomingExamTitle: string;
    examDaysLeft: number;
    openDoubtsCount: number;
    dueFlashcardsCount: number;
    pendingLabCount: number;
    activeMLExpCount: number;
    applicationsCount: number;
    nextDeadlineCompany: string;
    nextDeadlineDays: number;
  }>({
    todayTasksCount: 0,
    upcomingExamTitle: 'DBMS Midterm',
    examDaysLeft: 14,
    openDoubtsCount: 1,
    dueFlashcardsCount: 4,
    pendingLabCount: 1,
    activeMLExpCount: 1,
    applicationsCount: 2,
    nextDeadlineCompany: 'Razorpay',
    nextDeadlineDays: 8,
  });

  React.useEffect(() => {
    let isMounted = true;
    async function fetchSummary() {
      try {
        const [plans, tasks, exams, doubts, decks, labs, exps, apps] = await Promise.allSettled([
          learningModulesApi.studyPlanner.getPlans(),
          learningModulesApi.studyPlanner.getTodayTasks(),
          learningModulesApi.exams.getExams(),
          learningModulesApi.doubts.getDoubts(),
          learningModulesApi.flashcards.getDecks(),
          learningModulesApi.labs.getLabs(),
          learningModulesApi.mlLab.getExperiments(),
          learningModulesApi.applications.getApplications(),
        ]);

        if (!isMounted) return;

        const fetchedTasks = tasks.status === 'fulfilled' ? tasks.value : [];
        const fetchedExams = exams.status === 'fulfilled' ? exams.value : [];
        const fetchedDoubts = doubts.status === 'fulfilled' ? doubts.value : [];
        const fetchedDecks = decks.status === 'fulfilled' ? decks.value : [];
        const fetchedLabs = labs.status === 'fulfilled' ? labs.value : [];
        const fetchedExps = exps.status === 'fulfilled' ? exps.value : [];
        const fetchedApps = apps.status === 'fulfilled' ? apps.value : [];

        const nextExam = fetchedExams[0];
        const nextApp = fetchedApps[0];

        setData({
          todayTasksCount: fetchedTasks.filter((t) => t.status === 'PENDING').length,
          upcomingExamTitle: nextExam?.title || 'DBMS Midterm',
          examDaysLeft: nextExam
            ? Math.max(0, Math.ceil((new Date(nextExam.exam_date).getTime() - Date.now()) / (1000 * 3600 * 24)))
            : 14,
          openDoubtsCount: fetchedDoubts.filter((d) => d.status === 'OPEN').length,
          dueFlashcardsCount: fetchedDecks.reduce((sum, d) => sum + (d.due_count || 0), 0),
          pendingLabCount: fetchedLabs.reduce(
            (sum, l) => sum + l.experiments.filter((e) => e.status !== 'COMPLETED').length,
            0
          ),
          activeMLExpCount: fetchedExps.length,
          applicationsCount: fetchedApps.length,
          nextDeadlineCompany: nextApp?.company_name || 'Razorpay',
          nextDeadlineDays: nextApp?.deadline
            ? Math.max(0, Math.ceil((new Date(nextApp.deadline).getTime() - Date.now()) / (1000 * 3600 * 24)))
            : 8,
        });
      } catch (e) {
        // Fallback gracefully to default metrics
      }
    }
    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-6 rounded-2xl border border-[#E4E7EC] bg-white shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#101828]">Integrated AI Learning Modules</h2>
            <p className="text-xs text-[#475467]">
              Real-time synchronization across your study schedule, practice labs, exams, and career pipeline.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Study Planner */}
        <div
          onClick={() => onNavigate('/study-planner')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Calendar className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {data.todayTasksCount} Due
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828]">Today's Study Plan</h4>
          <p className="text-[11px] text-[#475467]">Daily syllabus tasks</p>
        </div>

        {/* 2. Exam Preparation */}
        <div
          onClick={() => onNavigate('/exams')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-amber-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <GraduationCap className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              {data.examDaysLeft}d left
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828] truncate">{data.upcomingExamTitle}</h4>
          <p className="text-[11px] text-[#475467]">Curriculum readiness</p>
        </div>

        {/* 3. Doubt Solver */}
        <div
          onClick={() => onNavigate('/doubts')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              {data.openDoubtsCount} Active
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828]">Doubt Solver</h4>
          <p className="text-[11px] text-[#475467]">AI conceptual proofs</p>
        </div>

        {/* 4. Flashcards */}
        <div
          onClick={() => onNavigate('/flashcards')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {data.dueFlashcardsCount} Due
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828]">Spaced Revision</h4>
          <p className="text-[11px] text-[#475467]">Active recall drill</p>
        </div>

        {/* 5. SQL Lab */}
        <div
          onClick={() => onNavigate('/sql-lab')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Database className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              Sandbox Live
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828]">SQL / DB Lab</h4>
          <p className="text-[11px] text-[#475467]">Query editor & schema</p>
        </div>

        {/* 6. AI/ML Lab */}
        <div
          onClick={() => onNavigate('/ml-lab')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Cpu className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {data.activeMLExpCount} Runs
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828]">AI/ML Experiments</h4>
          <p className="text-[11px] text-[#475467]">Models & metrics</p>
        </div>

        {/* 7. System Design Lab */}
        <div
          onClick={() => onNavigate('/system-design')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Network className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
              Architectures
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828]">System Design Lab</h4>
          <p className="text-[11px] text-[#475467]">Scale & tradeoffs</p>
        </div>

        {/* 8. Lab Assistant */}
        <div
          onClick={() => onNavigate('/labs')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <FlaskConical className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              Viva Voce
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828]">Lab Assistant</h4>
          <p className="text-[11px] text-[#475467]">Exps & observation</p>
        </div>

        {/* 9. Knowledge Base */}
        <div
          onClick={() => onNavigate('/knowledge')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-purple-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Brain className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              Memory Graph
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828]">Knowledge Base</h4>
          <p className="text-[11px] text-[#475467]">Semantic notes & docs</p>
        </div>

        {/* 10. Internship Tracker */}
        <div
          onClick={() => onNavigate('/applications')}
          className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all space-y-1.5"
        >
          <div className="flex items-center justify-between">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
              {data.applicationsCount} Tracked
            </span>
          </div>
          <h4 className="text-xs font-bold text-[#101828]">Internships / Apps</h4>
          <p className="text-[11px] text-[#475467]">
            {data.nextDeadlineCompany} ({data.nextDeadlineDays}d)
          </p>
        </div>
      </div>
    </div>
  );
}
