// src/features/gate/components/GateTestResultView.tsx
import React, { useState } from 'react';
import { GateTestResult } from '../types/gateTypes';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Filter,
  Check
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface GateTestResultViewProps {
  result: GateTestResult;
  onBackToTests: () => void;
  onPracticeMistakes?: (topicIds: string[]) => void;
}

export const GateTestResultView: React.FC<GateTestResultViewProps> = ({
  result,
  onBackToTests,
  onPracticeMistakes,
}) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'INCORRECT' | 'CORRECT'>('ALL');

  const filteredReviews = result.question_reviews.filter((r) => {
    if (filterMode === 'INCORRECT') return !r.is_correct && r.user_answer !== undefined && r.user_answer !== null && r.user_answer !== '';
    if (filterMode === 'CORRECT') return r.is_correct;
    return true;
  });

  const wrongTopicIds = Array.from(new Set(
    result.question_reviews.filter((r) => !r.is_correct).map((r) => r.topic_id)
  ));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToTests}
          className="border-slate-800 text-slate-300 hover:text-white text-xs h-8"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Test Series
        </Button>

        <span className="text-xs text-slate-400">
          Submitted on {new Date(result.completed_at).toLocaleString()}
        </span>
      </div>

      {/* Scorecard Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              GATE Official Scorecard
            </span>
            <h2 className="text-2xl font-black text-white mt-2">{result.test_title}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Paper: [{result.paper_code}] • Duration Spent: {Math.round(result.time_taken_seconds / 60)} minutes
            </p>
          </div>

          {/* Scores Pills */}
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-2xl text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Raw Score</span>
              <span className="text-3xl font-black text-indigo-400">{result.total_marks_obtained}</span>
              <span className="text-[11px] text-slate-500 block">/ {result.max_marks} Marks</span>
            </div>

            <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Negative marks</span>
              <span className="text-3xl font-black text-rose-400">-{result.negative_marks_lost ?? 0}</span>
              <span className="text-[11px] text-slate-500 block max-w-[160px] mx-auto">
                No GATE score is estimated: official scores are normalised across all candidates.
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Correct Answers</span>
            <span className="text-lg font-extrabold text-emerald-400">{result.correct_count}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Incorrect Answers</span>
            <span className="text-lg font-extrabold text-rose-400">{result.incorrect_count}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Negative Marks Lost</span>
            <span className="text-lg font-extrabold text-rose-400">-{result.negative_marks_lost}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">Accuracy Rate</span>
            <span className="text-lg font-extrabold text-indigo-400">{result.accuracy_percentage}%</span>
          </div>
        </div>
      </div>

      {/* Subject-Wise Breakdown */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-400" />
          Subject-Wise Performance Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(result.subject_breakdown).map(([subject, stats]) => {
            const pct = stats.total > 0 ? Math.max(0, Math.round((stats.scored / stats.total) * 100)) : 0;
            return (
              <div key={subject} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{subject}</span>
                  <span className="text-indigo-300 font-mono">
                    {stats.scored}/{stats.total} Marks ({pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="text-emerald-400">{stats.correct} Correct</span>
                  <span className="text-rose-400">{stats.incorrect} Incorrect</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question-By-Question Detailed Solutions Review */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Detailed Question Solutions & Answers ({filteredReviews.length})
          </h3>

          <div className="flex items-center gap-1.5 text-xs bg-slate-950 p-1 border border-slate-800 rounded-lg">
            {(['ALL', 'INCORRECT', 'CORRECT'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  filterMode === m ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {filteredReviews.map((rev, idx) => (
            <div
              key={rev.question_id}
              className={`p-4 rounded-xl border space-y-3 ${
                rev.is_correct
                  ? 'bg-slate-950/80 border-slate-800'
                  : rev.user_answer !== undefined && rev.user_answer !== null && rev.user_answer !== ''
                  ? 'bg-rose-950/10 border-rose-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">Q.{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 font-mono text-slate-300">
                    {rev.question_type}
                  </span>
                  <span className="text-indigo-400 font-semibold">{rev.subject}</span>
                </div>

                <div className="flex items-center gap-2">
                  {rev.is_correct ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      +{rev.marks_awarded} Marks (Correct)
                    </span>
                  ) : rev.user_answer ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300">
                      {rev.marks_awarded} Marks (Incorrect)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-400">
                      Unattempted
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {rev.statement}
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Your Response:</span>
                  <span className={rev.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {rev.user_answer === undefined || rev.user_answer === null || rev.user_answer === ''
                      ? 'None (Unattempted)'
                      : Array.isArray(rev.user_answer)
                      ? rev.user_answer.join(', ')
                      : String(rev.user_answer)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Official Correct Key:</span>
                  <span className="text-emerald-400 font-bold">
                    {typeof rev.correct_answer === 'object' && 'min' in rev.correct_answer
                      ? `[${rev.correct_answer.min} to ${rev.correct_answer.max}]`
                      : Array.isArray(rev.correct_answer)
                      ? rev.correct_answer.join(', ')
                      : String(rev.correct_answer)}
                  </span>
                </div>
              </div>

              {/* Detailed Explanation */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg text-xs space-y-1 text-slate-300">
                <span className="font-bold text-slate-200 block text-[11px]">Explanation:</span>
                <p className="whitespace-pre-line leading-relaxed">{rev.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
