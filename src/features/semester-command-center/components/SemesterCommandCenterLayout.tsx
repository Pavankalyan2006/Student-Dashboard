// src/features/semester-command-center/components/SemesterCommandCenterLayout.tsx
// Sub-navigation bar and common header for the Academic Semester Command Center

import * as React from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  GitBranch,
  BookOpen,
  Calendar,
  FileCheck,
  Award,
  RotateCcw,
  Sparkles,
  Settings,
  Clock,
  Target,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { AcademicSemesterConfig, AcademicPhase } from '../../../types/semesterCommandCenter';

interface SemesterCommandCenterLayoutProps {
  currentTab: string;
  config?: AcademicSemesterConfig;
  currentPhase?: AcademicPhase;
  onNavigate?: (path: string) => void;
  children: React.ReactNode;
}

export function SemesterCommandCenterLayout({
  currentTab,
  config,
  currentPhase,
  onNavigate,
  children,
}: SemesterCommandCenterLayoutProps) {
  const navTabs = [
    { id: 'overview', label: 'Overview', path: '/semester-command-center', icon: LayoutDashboard },
    { id: 'stream', label: 'Study Stream', path: '/semester-command-center/study-stream', icon: GitBranch, badge: 'Live' },
    { id: 'subjects', label: 'Subjects & Syllabus', path: '/semester-command-center/subjects', icon: BookOpen },
    { id: 'calendar', label: 'Academic Calendar', path: '/semester-command-center/calendar', icon: Calendar },
    { id: 'slip-tests', label: 'Slip Tests & Minors', path: '/semester-command-center/slip-tests', icon: FileCheck },
    { id: 'end-sem', label: 'End-Sem Readiness', path: '/semester-command-center/end-semester', icon: Award },
    { id: 'recovery', label: 'Recovery & Daily Focus', path: '/semester-command-center/daily-plan', icon: RotateCcw, badge: 'Smart' },
    { id: 'setup', label: 'Semester Setup', path: '/semester-command-center/setup', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Top Semester Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Academic Semester Command Center</h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                  {config ? `Semester ${config.semester_number} • ${config.branch}` : 'Semester not set up'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Semester-long academic intelligence orchestrating syllabus, slip tests, minor examinations, and end-sem strategy.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Week:</span>
              <span className="font-bold text-white">
                {config ? `${config.current_week} of ${config.total_teaching_weeks}` : '—'}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Target SGPA:</span>
              <span className="font-bold text-emerald-400">{config?.target_gpa ?? '—'}</span>
            </div>

            <Button
              size="sm"
              onClick={() => onNavigate && onNavigate('/semester-command-center/setup')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Plan Strategy
            </Button>
          </div>
        </div>

        {/* Current Active Phase Indicator */}
        {currentPhase && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">Current Phase:</span>
              <span className="font-semibold text-white">{currentPhase.name}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{currentPhase.description}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
              Focus Mode: {currentPhase.focus_mode}
            </span>
          </div>
        )}
      </div>

      {/* Secondary Horizontal Nav Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate && onNavigate(tab.path)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-indigo-400 border border-indigo-500/20'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div>{children}</div>
    </div>
  );
}
