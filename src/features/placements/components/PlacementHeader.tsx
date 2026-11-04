import React, { useState } from 'react';
import { useStudentContext } from '../../../context/StudentContext';
import {
  GraduationCap,
  Search,
  Sparkles,
  PlayCircle,
  Calendar,
  BookOpen,
  ArrowRight,
  Bot,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
  onOpenAICoach: () => void;
  onOpenAssessment: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const PlacementHeader: React.FC<Props> = ({
  onNavigate,
  onOpenAICoach,
  onOpenAssessment,
  searchQuery,
  onSearchChange,
}) => {
  const { student, education } = useStudentContext();

  const degree = education?.degree || 'B.Tech';
  const branch = education?.branch || 'Computer Science & Engineering';
  const semester = education?.current_semester ? `Semester ${education.current_semester}` : 'Semester 6';
  const gradYear = education?.expected_graduation_year ? `Batch of ${education.expected_graduation_year}` : 'Batch of 2026';

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden border border-indigo-900/40">
      {/* Decorative background glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          {/* Top Pill / Badge with Academic Profile */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-xs font-semibold tracking-wide backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              AI Placement Engine
            </span>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-slate-200 border border-white/10 rounded-full text-xs font-medium backdrop-blur-sm">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-300" />
              <span>{degree}</span>
              <span className="text-white/40">•</span>
              <span>{branch}</span>
              <span className="text-white/40">•</span>
              <span>{semester}</span>
              <span className="text-white/40">•</span>
              <span className="text-emerald-300 font-semibold">{gradYear}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Placement Preparation
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Prepare for aptitude tests, coding rounds, technical interviews, and HR rounds.
            Master technical concepts, practice real timed assessments, and defend projects with AI coaching.
          </p>

          {/* Global Search Bar */}
          <div className="pt-2">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search topics, companies (Google, Amazon, TCS), or questions..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-md transition-all"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
          <button
            onClick={() => onNavigate('/placements/topics?cat=APTITUDE')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <PlayCircle className="h-4 w-4" />
            Continue Preparation
          </button>

          <button
            onClick={() => onNavigate('/placements/plans')}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur-md"
          >
            <Calendar className="h-4 w-4 text-blue-300" />
            Create Study Plan
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onOpenAssessment}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 rounded-xl text-xs font-medium transition-all"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Timed Test
            </button>
            <button
              onClick={onOpenAICoach}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/30 rounded-xl text-xs font-medium transition-all"
            >
              <Bot className="h-3.5 w-3.5" />
              AI Coach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
