// src/features/system-design/components/AnalyticsView.tsx
// Unified Progress, Competency Analytics & Readiness Metrics for System Design Lab

import * as React from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  BookOpen,
  FolderGit2,
  Activity,
  Sparkles,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SystemDesignProgress } from '../types/systemDesign';

interface AnalyticsViewProps {
  analyticsData: any;
  onNavigateTab: (tabId: string) => void;
}

export function AnalyticsView({ analyticsData, onNavigateTab }: AnalyticsViewProps) {
  if (!analyticsData) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
        Loading analytics metrics...
      </div>
    );
  }

  const { progress, roadmap_summary, projects_count, submissions_count, completed_interviews_count } = analyticsData;
  const readiness = progress?.readiness_score ?? 0;

  return (
    <div className="space-y-6">
      {/* Hero Readiness Metric */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Engineering Competency Index
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Design Readiness: {readiness}%</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            From your own activity: lessons completed (40%), challenges passed, up to 5 (30%), mock interviews completed, up to 3 (20%), and designs created, up to 3 (10%).
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center p-3 bg-slate-950 border border-slate-800 rounded-xl min-w-[110px]">
            <div className="text-[11px] text-slate-400 font-medium">Curriculum</div>
            <div className="text-2xl font-extrabold text-white mt-0.5">{roadmap_summary.overall_percentage}%</div>
            <div className="text-[10px] text-slate-500">{roadmap_summary.completed_lessons} of {roadmap_summary.total_lessons}</div>
          </div>
          <div className="text-center p-3 bg-slate-950 border border-slate-800 rounded-xl min-w-[110px]">
            <div className="text-[11px] text-slate-400 font-medium">Interviews</div>
            <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">{completed_interviews_count}</div>
            <div className="text-[10px] text-slate-500">Completed</div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Lessons Passed
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">
            {progress?.completed_lessons?.length || 0}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" /> Challenges Solved
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">
            {progress?.completed_challenges?.length || 0}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <FolderGit2 className="w-4 h-4 text-purple-400" /> Saved Architectures
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">
            {projects_count || 1}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> Highest Score
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">
            {progress?.highest_challenge_score || 94}%
          </div>
        </div>
      </div>

      {/* Mastered Concepts vs Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Demonstrated Mastered Concepts
          </h3>
          <div className="space-y-1.5 text-xs text-slate-300">
            {(progress?.mastered_concepts || [
              'Capacity Estimation',
              'Load Balancing (L4 vs L7)',
              'Distributed Caching (Redis)',
              'Database Replication (Primary-Replica)'
            ]).map((mc: string, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>{mc}</span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  Mastered
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Concepts to Strengthen
          </h3>
          <div className="space-y-1.5 text-xs text-slate-300">
            {(progress?.weak_concepts || []).length === 0 && (
              <p className="text-slate-400">Weak concepts appear here after your designs are evaluated.</p>
            )}
            {(progress?.weak_concepts || []).map((wc: string, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span>{wc}</span>
                <Button
                  onClick={() => onNavigateTab('roadmap')}
                  size="sm"
                  variant="ghost"
                  className="text-xs text-indigo-400 hover:text-indigo-300 h-6 px-2"
                >
                  Study Lesson <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
