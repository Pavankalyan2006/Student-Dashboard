// src/features/gate/components/GateMockTestsView.tsx
import React, { useState } from 'react';
import { GateMockTest, GateTestResult } from '../types/gateTypes';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Flame
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface GateMockTestsViewProps {
  tests: GateMockTest[];
  pastResults: GateTestResult[];
  onStartTest: (test: GateMockTest) => void;
  onViewResult: (result: GateTestResult) => void;
}

export const GateMockTestsView: React.FC<GateMockTestsViewProps> = ({
  tests,
  pastResults,
  onStartTest,
  onViewResult,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredTests = tests.filter((t) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            GATE All-India Mock Test Series
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Simulate real 180-minute official exam environments. Features realistic question palettes,
            official negative marking schemes, and normalized estimated GATE score calculation (0 - 1000 scale).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs bg-white p-1 border border-slate-200 rounded-xl">
          {[
            { id: 'ALL', label: 'All Tests' },
            { id: 'FULL_LENGTH', label: 'Full Length (180m)' },
            { id: 'SUBJECT_WISE', label: 'Subject Wise (45-60m)' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                filterType === f.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Available Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTests.map((t) => {
          const hasAttempted = pastResults.some((r) => r.test_id === t.id);
          const bestResult = pastResults
            .filter((r) => r.test_id === t.id)
            .sort((a, b) => b.total_marks_obtained - a.total_marks_obtained)[0];

          return (
            <div
              key={t.id}
              className="p-5 bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      [{t.paper_code}]
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-50 text-slate-700">
                      {t.type.replace('_', ' ')}
                    </span>
                    {t.is_official_pyq_paper && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700">
                        Official PYQ Simulation
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-emerald-600">{t.total_marks} Marks</span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900">{t.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      {t.duration_minutes} Minutes
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      {t.total_questions} Questions
                    </span>
                  </div>
                </div>

                {/* Instructions Snippet */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700">Key Guidelines:</div>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {t.instructions.slice(0, 2).map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                {hasAttempted && bestResult ? (
                  <div className="text-xs">
                    <span className="text-slate-500 block text-[10px]">Best Score:</span>
                    <span className="font-bold text-emerald-600">
                      {bestResult.total_marks_obtained}/{t.total_marks} marks
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-500">Not attempted yet</span>
                )}

                <div className="flex items-center gap-2">
                  {hasAttempted && bestResult && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewResult(bestResult)}
                      className="border-slate-200 text-slate-700 hover:text-slate-900 text-xs h-8"
                    >
                      View Analysis
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={() => onStartTest(t)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-3.5 flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{hasAttempted ? 'Retake Test' : 'Start Exam'}</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Past Scorecards History */}
      {pastResults.length > 0 && (
        <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Previous Mock Test Attempts & Score Progression
          </h3>

          <div className="space-y-2.5">
            {pastResults.map((res) => (
              <div
                key={res.id}
                className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800">{res.test_title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Submitted {new Date(res.completed_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Accuracy: {res.accuracy_percentage}%</span>
                    <span>•</span>
                    <span>Negative Lost: {res.negative_marks_lost} marks</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      {res.total_marks_obtained}/{res.max_marks}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Accuracy: {res.accuracy_percentage}%
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewResult(res)}
                    className="border-slate-200 text-indigo-700 hover:text-slate-900 text-xs h-7"
                  >
                    Scorecard &rarr;
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
