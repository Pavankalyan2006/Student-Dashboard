// src/features/flashcards/components/FlashcardOverviewStats.tsx
import * as React from 'react';
import { Layers, RotateCw, CheckCircle2, Flame, Award, BookCheck } from 'lucide-react';
import { FlashcardStats } from '../../../types/learningModules';

interface FlashcardOverviewStatsProps {
  stats: FlashcardStats | null;
  loading?: boolean;
}

export const FlashcardOverviewStats: React.FC<FlashcardOverviewStatsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Decks */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Total Decks</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.total_decks}</h3>
            <p className="text-[11px] text-slate-500">Curriculum tracks</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Total Cards */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Total Cards</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.total_cards}</h3>
            <p className="text-[11px] text-slate-500">{stats.new_cards} unreviewed</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BookCheck className="w-4 h-4" />
          </div>
        </div>

        {/* Due Today */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Due Today</p>
            <h3 className={`text-xl font-extrabold mt-0.5 ${stats.due_today > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {stats.due_today}
            </h3>
            <p className="text-[11px] text-slate-500">Active recall queue</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <RotateCw className="w-4 h-4" />
          </div>
        </div>

        {/* Reviewed Today */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Reviewed Today</p>
            <h3 className="text-xl font-extrabold text-blue-600 mt-0.5">{stats.reviewed_today}</h3>
            <p className="text-[11px] text-slate-500">Cards rated today</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Mastered Cards */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Mastered</p>
            <h3 className="text-xl font-extrabold text-emerald-600 mt-0.5">{stats.mastered_cards}</h3>
            <p className="text-[11px] text-slate-500">{stats.mastery_pct}% long-term</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Award className="w-4 h-4" />
          </div>
        </div>

        {/* Review Streak */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-600 uppercase tracking-wider">Study Streak</p>
            <h3 className="text-xl font-extrabold text-orange-600 mt-0.5">
              {stats.streak_days} {stats.streak_days === 1 ? 'Day' : 'Days'}
            </h3>
            <p className="text-[11px] text-slate-500">Consecutive recall</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <Flame className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Progress Bars Row */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>Overall Card Coverage ({stats.total_cards - stats.new_cards} of {stats.total_cards} reviewed)</span>
            <span className="font-bold text-blue-600">{stats.overall_coverage_pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, stats.overall_coverage_pct))}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
            <span>Concept Mastery Rate ({stats.mastered_cards} of {stats.total_cards} mastered)</span>
            <span className="font-bold text-emerald-600">{stats.mastery_pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, stats.mastery_pct))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
