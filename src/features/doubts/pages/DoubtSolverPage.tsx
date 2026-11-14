// src/features/doubts/pages/DoubtSolverPage.tsx
// Complete AI Doubt Solver with Multi-tier explanations, code snippets, and diagnostic quizzes

import * as React from 'react';
import {
  HelpCircle,
  Sparkles,
  Send,
  Code2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Filter,
  Check,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { StudentDoubt, DoubtStatus } from '../../../types/learningModules';
import { toast } from 'sonner';
import { useProfileDefaults } from '../../profile/hooks/useProfileDefaults';

interface DoubtSolverPageProps {
  onNavigate?: (path: string) => void;
}

export function DoubtSolverPage({ onNavigate }: DoubtSolverPageProps) {
  const [doubts, setDoubts] = React.useState<StudentDoubt[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'ask' | 'history'>('ask');
  const [selectedDoubt, setSelectedDoubt] = React.useState<StudentDoubt | null>(null);

  // Form State
  const [title, setTitle] = React.useState('');
  const [questionText, setQuestionText] = React.useState('');
  const [subject, setSubject] = React.useState('Database Management Systems');
  // The subject list starts with the student's own subjects; the first one is preselected.
  const profileDefaults = useProfileDefaults();
  const subjectTouched = React.useRef(false);
  React.useEffect(() => {
    if (!subjectTouched.current && profileDefaults.subjects[0]) setSubject(profileDefaults.subjects[0]);
  }, [profileDefaults.subjects[0]]);
  const GENERAL_SUBJECTS = ['Database Management Systems', 'Data Structures & Algorithms', 'Operating Systems', 'Computer Networks', 'Machine Learning', 'Engineering Mathematics'];
  const subjectOptions = [...new Set([...profileDefaults.subjects, ...GENERAL_SUBJECTS])];
  const [codeSnippet, setCodeSnippet] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Status Filter for History
  const [statusFilter, setStatusFilter] = React.useState<string>('ALL');

  const loadDoubts = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await learningModulesApi.doubts.getDoubts();
      setDoubts(data);
      if (data.length > 0 && !selectedDoubt) {
        setSelectedDoubt(data[0]);
      }
    } catch (err: any) {
      toast.error('Failed to load doubts: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDoubt]);

  React.useEffect(() => {
    loadDoubts();
  }, [loadDoubts]);

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !questionText.trim()) {
      toast.error('Please enter a doubt question and detailed description');
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await learningModulesApi.doubts.createDoubt({
        title,
        question_text: questionText,
        course_name: subject,
        code_snippet: codeSnippet || undefined,
        topic: subject,
      });
      if (created.status === 'RESOLVED') {
        toast.success('Doubt answered');
      } else {
        toast.info('Doubt saved. The AI provider is not available, so it has no answer yet.');
      }
      setTitle('');
      setQuestionText('');
      setCodeSnippet('');
      setSelectedDoubt(created);
      loadDoubts();
    } catch (err: any) {
      toast.error('Failed to solve doubt: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDoubts = doubts.filter((d) => {
    if (statusFilter === 'ALL') return true;
    return d.status === statusFilter;
  });

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="AI Doubt Solver" description="Loading doubts and multi-tier educational explanations..." />
        <LoadingState message="Connecting to DoubtSolverAgent & LearningAgent..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Doubt Solver"
        description="Structured conceptual explanations, code debugging, counter-examples, and diagnostic concept checks."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            DoubtSolverAgent Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'ask' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('ask')}
              className={activeTab === 'ask' ? 'bg-blue-600 text-white' : ''}
            >
              Ask a Doubt
            </Button>
            <Button
              variant={activeTab === 'history' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className={activeTab === 'history' ? 'bg-blue-600 text-white' : ''}
            >
              Doubt History ({doubts.length})
            </Button>
          </div>
        }
      />

      {/* Main Grid: Ask / History on Left, Detailed Multi-Tier Solution on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeTab === 'ask' ? (
            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-600" />
                Submit New Doubt
              </h3>
              <form onSubmit={handleAskDoubt} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Area</label>
                  <select
                    aria-label="Subject"
                    value={subject}
                    onChange={(e) => {
                      subjectTouched.current = true;
                      setSubject(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {profileDefaults.subjects.length > 0 && (
                      <optgroup label="Your subjects">
                        {profileDefaults.subjects.map((s) => (
                          <option key={`p-${s}`} value={s}>{s}</option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label={profileDefaults.subjects.length > 0 ? 'Other subjects' : 'Subjects'}>
                      {subjectOptions.filter((s) => !profileDefaults.subjects.includes(s)).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Doubt Title / Question</label>
                  <input
                    type="text"
                    aria-label="Doubt question"
                    placeholder="e.g. Why does BCNF guarantee absence of redundancy?"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Explanation / Context</label>
                  <textarea
                    aria-label="Doubt details"
                    placeholder="Explain where you are stuck or what concept is conflicting..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-gray-500" />
                    Code / SQL / Expression (Optional)
                  </label>
                  <textarea
                    aria-label="Code, SQL or expression (optional)"
                    placeholder="Paste code or SQL snippet..."
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 font-medium"
                >
                  <Sparkles className="w-4 h-4" />
                  {isSubmitting ? 'Analyzing & Synthesizing Solution...' : 'Solve with AI Agent'}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              {/* History Filters */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
                {['ALL', 'OPEN', 'RESOLVED', 'NEEDS_REVIEW'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`flex-1 text-[11px] font-semibold py-1 rounded-md transition-colors ${
                      statusFilter === st ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {filteredDoubts.length === 0 ? (
                <EmptyState
                  title="No Doubts Found"
                  description="Ask your first doubt to receive structured pedagogical explanations."
                />
              ) : (
                <div className="space-y-2">
                  {filteredDoubts.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDoubt(d)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedDoubt?.id === d.id
                          ? 'border-purple-500 bg-purple-50/30 shadow-sm ring-1 ring-purple-400'
                          : 'border-slate-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                          {d.topic || d.course_name || 'Engineering'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            d.status === 'RESOLVED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mt-1.5 line-clamp-1">{d.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{d.question_text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: 8-Part Pedagogical Resolution (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDoubt?.resolution ? (
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-6">
              {/* Header */}
              <div className="border-b border-gray-100 pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
                    {selectedDoubt.topic || selectedDoubt.course_name || 'Engineering'}
                  </span>
                  <span className="text-xs text-slate-600">
                    Asked {new Date(selectedDoubt.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{selectedDoubt.title}</h2>
                <p className="text-xs text-slate-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                  "{selectedDoubt.question_text}"
                </p>
              </div>

              {/* 1. Direct Answer */}
              <div className="space-y-1.5 p-3.5 bg-blue-50/70 rounded-xl border border-blue-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  1. Direct Answer
                </h4>
                <p className="text-sm font-semibold text-blue-950 leading-relaxed">
                  {selectedDoubt.resolution.direct_answer}
                </p>
              </div>

              {/* 2. Simple Explanation */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  2. Simplified Intuition
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedDoubt.resolution.simple_explanation}
                </p>
              </div>

              {/* 3. Detailed Academic Explanation */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  3. In-Depth Technical Breakdown
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedDoubt.resolution.detailed_explanation}
                </p>
              </div>

              {/* 4. Example / Code */}
              {selectedDoubt.resolution.example && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-gray-700" />
                    4. Concrete Example / Proof
                  </h4>
                  <pre className="text-xs font-mono p-3 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
                    {selectedDoubt.resolution.example}
                  </pre>
                </div>
              )}

              {/* 5. Common Mistake */}
              <div className="space-y-1 p-3 bg-rose-50/70 rounded-xl border border-rose-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  5. Common Student Misconception
                </h4>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {selectedDoubt.resolution.common_mistake}
                </p>
              </div>

              {/* 6. Related Concepts */}
              {selectedDoubt.resolution.related_concepts?.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    6. Connected Curriculum Concepts
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDoubt.resolution.related_concepts.map((concept, idx) => (
                      <span key={idx} className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md">
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Suggested Practice */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  7. Suggested Practice Action
                </h4>
                <p className="text-xs text-blue-700 font-medium bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                  {selectedDoubt.resolution.suggested_practice}
                </p>
              </div>

              {/* 8. Concept Check Quiz */}
              {selectedDoubt.resolution.quiz_question && (
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    8. Quick Diagnostic Concept Check
                  </h4>
                  <p className="text-xs font-semibold text-slate-900">
                    {selectedDoubt.resolution.quiz_question.question}
                  </p>
                  <div className="space-y-1.5">
                    {selectedDoubt.resolution.quiz_question.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => {
                          if (oIdx === selectedDoubt.resolution!.quiz_question!.correct) {
                            toast.success('Correct! ' + selectedDoubt.resolution!.quiz_question!.explanation);
                          } else {
                            toast.error('Incorrect. ' + selectedDoubt.resolution!.quiz_question!.explanation);
                          }
                        }}
                        className="w-full text-left p-2 rounded-lg bg-white border border-gray-200 hover:border-purple-400 text-xs font-medium text-slate-700 transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : selectedDoubt ? (
            <div className="p-6 rounded-xl border border-slate-200 bg-white shadow-sm space-y-3">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">{selectedDoubt.status}</span>
              <h2 className="text-lg font-bold text-slate-900">{selectedDoubt.title}</h2>
              <p className="text-xs text-slate-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                "{selectedDoubt.question_text}"
              </p>
              <p className="text-sm text-slate-600">
                This doubt has no answer yet. It was saved while the AI provider was not available.
              </p>
            </div>
          ) : (
            <EmptyState
              title="Select a Doubt to View Full Resolution"
              description="Ask a new question on the left or select an item from history to review its multi-tier AI explanation."
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
