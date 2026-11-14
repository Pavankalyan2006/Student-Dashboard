// src/features/gate/components/GateQuestionBank.tsx
import React, { useState } from 'react';
import { GateQuestion } from '../types/gateTypes';
import {
  Search,
  Filter,
  CheckCircle2,
  Bookmark,
  Award,
  Sparkles,
  ArrowRight,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface GateQuestionBankProps {
  questions: GateQuestion[];
  onOpenQuestionModal: (question: GateQuestion) => void;
  onToggleBookmark: (questionId: string) => Promise<void>;
  bookmarkedIds?: Set<string>;
}

export const GateQuestionBank: React.FC<GateQuestionBankProps> = ({
  questions,
  onOpenQuestionModal,
  onToggleBookmark,
  bookmarkedIds = new Set(),
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [onlyPyq, setOnlyPyq] = useState(false);

  // Extract unique subjects
  const subjects = Array.from(new Set(questions.map((q) => q.subject))).sort();

  // Filter questions
  const filtered = questions.filter((q) => {
    const matchSearch =
      q.question_statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.source_attribution.toLowerCase().includes(searchQuery.toLowerCase());

    const matchSubject = selectedSubject === 'ALL' || q.subject === selectedSubject;
    const matchType = selectedType === 'ALL' || q.question_type === selectedType;
    const matchDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    const matchPyq = !onlyPyq || q.is_pyq;

    return matchSearch && matchSubject && matchType && matchDiff && matchPyq;
  });

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search previous year questions, keywords, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto text-xs">
            <button
              onClick={() => setOnlyPyq(!onlyPyq)}
              className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                onlyPyq
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              Verified PYQs Only
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Subjects ({questions.length})</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Question Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Types (MCQ, MSQ, NAT)</option>
              <option value="MCQ">MCQ (Multiple Choice with Negative Marking)</option>
              <option value="MSQ">MSQ (Multiple Select, No Negative Marking)</option>
              <option value="NAT">NAT (Numerical Answer Type)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
            >
              <option value="ALL">All Difficulties</option>
              <option value="EASY">Easy (Direct Formula & Concepts)</option>
              <option value="MEDIUM">Medium (Multi-step Standard GATE)</option>
              <option value="HARD">Hard (Advanced Proofs & Lengthy Calcs)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        <div className="text-xs text-slate-500 font-semibold px-1">
          Showing {filtered.length} of {questions.length} questions
        </div>

        {filtered.map((q) => {
          const isBookmarked = bookmarkedIds.has(q.id);

          return (
            <div
              key={q.id}
              className="p-5 bg-white border border-slate-200 hover:border-slate-200 rounded-2xl transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {q.subject}
                  </span>

                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-50 text-slate-800">
                    {q.question_type}
                  </span>

                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700">
                    +{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                  </span>

                  {q.negative_marks > 0 && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700">
                      -{q.negative_marks} Neg
                    </span>
                  )}

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      q.difficulty === 'HARD'
                        ? 'bg-rose-50 text-rose-700'
                        : q.difficulty === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    {q.source_attribution}
                  </span>

                  <button
                    onClick={() => onToggleBookmark(q.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Statement Snippet */}
              <p className="text-xs text-slate-800 leading-relaxed font-sans line-clamp-3 whitespace-pre-line">
                {q.question_statement}
              </p>

              {/* Footer actions */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">ID: {q.id}</span>

                <Button
                  onClick={() => onOpenQuestionModal(q)}
                  size="sm"
                  className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 font-semibold flex items-center gap-1.5"
                >
                  <span>Solve Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-700 font-semibold">No questions found matching your filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing some of your search tags or selecting 'All Subjects'.</p>
          </div>
        )}
      </div>
    </div>
  );
};
