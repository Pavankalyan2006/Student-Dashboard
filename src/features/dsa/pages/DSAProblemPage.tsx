import * as React from 'react';
import { DSAProblem } from '../types/dsa';
import { dsaApi } from '../api/dsaApi';
import { CodingLanguage } from '../../coding/types/coding';
import { DSAHints } from '../components/DSAHints';
import { DSAAITutor } from '../components/DSAAITutor';
import Editor from '@monaco-editor/react';
import {
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  Terminal,
  ExternalLink,
  Bot,
  Bookmark,
  BookmarkCheck,
  Save,
  RotateCcw,
  AlertTriangle,
  Building2,
  Tag,
  Check,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

interface DSAProblemPageProps {
  problemId: string;
  onNavigate?: (path: string) => void;
}

export const DSAProblemPage: React.FC<DSAProblemPageProps> = ({ problemId, onNavigate }) => {
  const [problem, setProblem] = React.useState<DSAProblem | null>(null);
  const [language, setLanguage] = React.useState<CodingLanguage>('python');
  const [code, setCode] = React.useState<string>('');
  const [isRunning, setIsRunning] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isTutorOpen, setIsTutorOpen] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<'description' | 'solution'>('description');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [isBookmarked, setIsBookmarked] = React.useState<boolean>(false);
  const [isDraftSaved, setIsDraftSaved] = React.useState<boolean>(false);

  // Results State
  const [runResult, setRunResult] = React.useState<{
    status: string;
    passed_count: number;
    total_tests: number;
    execution_time_ms: number;
    test_results: Array<{
      test_index: number;
      passed: boolean;
      input: string;
      expected_output: string;
      actual_output: string;
      error?: string;
      execution_time_ms: number;
    }>;
  } | null>(null);

  const [submissionResult, setSubmissionResult] = React.useState<{
    id?: string;
    status: string;
    passed_tests: number;
    total_tests: number;
    execution_time_ms: number;
    test_results?: Array<{
      test_index: number;
      passed: boolean;
      is_hidden: boolean;
      input?: string;
      expected_output?: string;
      actual_output?: string;
      error?: string;
      execution_time_ms: number;
    }>;
  } | null>(null);

  const [activeCaseTab, setActiveCaseTab] = React.useState<number>(0);
  const [consoleMode, setConsoleMode] = React.useState<'run' | 'submit'>('run');

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      dsaApi.getProblem(problemId),
      dsaApi.getBookmarks().catch(() => []),
      dsaApi.getDraft(problemId).catch(() => null),
    ])
      .then(([prob, bookmarks, draft]) => {
        setProblem(prob);
        setIsBookmarked(bookmarks.includes(prob.id));

        const initialLang = (draft?.language as CodingLanguage) ||
          (prob.supported_languages?.[0] as CodingLanguage) ||
          'python';
        setLanguage(initialLang);

        if (draft && draft.code) {
          setCode(draft.code);
          setIsDraftSaved(true);
        } else {
          setCode(prob.starter_code?.[initialLang] || prob.starter_code?.['python'] || '# Write your solution here');
        }
      })
      .catch((err) => {
        console.error('Failed to load problem:', err);
        toast.error('Failed to load problem details.');
      })
      .finally(() => setLoading(false));
  }, [problemId]);

  const handleLanguageChange = (newLang: CodingLanguage) => {
    setLanguage(newLang);
    if (problem?.starter_code?.[newLang]) {
      setCode(problem.starter_code[newLang]);
    }
  };

  const handleResetCode = () => {
    if (problem?.starter_code?.[language]) {
      setCode(problem.starter_code[language]);
      toast.info(`Reset code to original ${language} template.`);
    }
  };

  const handleSaveDraft = async () => {
    if (!code.trim()) return;
    try {
      await dsaApi.saveDraft(problemId, { code, language });
      setIsDraftSaved(true);
      toast.success('Solution draft saved to cloud.');
    } catch {
      toast.error('Could not save draft.');
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await dsaApi.toggleBookmark(problemId);
      setIsBookmarked(res.bookmarked);
      if (res.bookmarked) {
        toast.success('Problem bookmarked for revision.');
      } else {
        toast.info('Removed from bookmarks.');
      }
    } catch {
      toast.error('Bookmark toggle failed.');
    }
  };

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleRun = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    setConsoleMode('run');
    setRunResult(null);

    try {
      const result: any = await dsaApi.runCode(problemId, {
        language,
        source_code: code,
      });
      setRunResult(result);
      setActiveCaseTab(0);

      if (result.status === 'ACCEPTED') {
        toast.success(`Sample test cases passed (${result.passed_count}/${result.total_tests}) in ${result.execution_time_ms}ms!`);
      } else if (result.status === 'WRONG_ANSWER') {
        toast.error(`Wrong Answer: ${result.passed_count}/${result.total_tests} sample test cases passed.`);
      } else if (result.status === 'COMPILATION_ERROR') {
        toast.error('Compilation Error encountered.');
      } else if (result.status === 'TIME_LIMIT') {
        toast.error('Time Limit Exceeded.');
      } else {
        toast.error(`Execution: ${result.status}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setConsoleMode('submit');
    setSubmissionResult(null);

    try {
      const res: any = await dsaApi.submitProblemSolution(problemId, {
        language,
        source_code: code,
      });
      setSubmissionResult(res);
      setActiveCaseTab(0);

      if (res.status === 'ACCEPTED') {
        toast.success(`Accepted! All ${res.passed_tests}/${res.total_tests} test cases passed (${res.execution_time_ms}ms).`);
      } else if (res.status === 'WRONG_ANSWER') {
        toast.error(`Verdict: WRONG ANSWER (${res.passed_tests}/${res.total_tests} tests passed).`);
      } else if (res.status === 'COMPILATION_ERROR') {
        toast.error('Verdict: COMPILATION ERROR.');
      } else if (res.status === 'TIME_LIMIT') {
        toast.error('Verdict: TIME LIMIT EXCEEDED.');
      } else {
        toast.error(`Verdict: ${res.status}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'HARD':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-[600px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Problem Not Found</h2>
        <p className="text-sm text-slate-500">The requested DSA practice question could not be located in the 150 master catalog.</p>
        <Button onClick={() => navigate('/dsa')}>Return to DSA Lab</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-5 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dsa')}
            className="h-9 w-9 p-0 rounded-xl"
            title="Back to All 150 Problems"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                #{problem.number || problem.id.replace('dsa_top150_', '')}
              </span>
              <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {problem.title}
              </h1>
            </div>

            {/* Subtitle meta */}
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
              {problem.subtopic && (
                <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                  <Layers className="w-3 h-3" />
                  {problem.subtopic}
                </span>
              )}
              {problem.roadmap_stage && (
                <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
                  {problem.roadmap_stage}
                </span>
              )}
              {problem.companies && problem.companies.length > 0 && (
                <span className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  {problem.companies.slice(0, 3).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bookmark Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleBookmark}
            className={`h-9 px-3 gap-1.5 text-xs font-semibold ${
              isBookmarked
                ? 'border-amber-400 text-amber-500 bg-amber-500/10'
                : 'text-slate-600 dark:text-slate-400'
            }`}
            title="Bookmark for quick revision"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </Button>

          {/* AI DSA Tutor Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTutorOpen(true)}
            className="text-xs h-9 gap-1.5 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 font-semibold"
            title="Ask AI DSA Tutor for hints or algorithm guidance"
          >
            <Bot className="w-3.5 h-3.5 text-violet-500" />
            <span>AI Tutor</span>
          </Button>

          {/* Run Code Button (Sample Test Cases Only) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="text-xs h-9 gap-1.5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold"
            title="Run solution against sample test cases (does not mark solved)"
          >
            <Play className="w-3.5 h-3.5 fill-current text-blue-600 dark:text-blue-400" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>

          {/* Submit Solution Button (Full Test Suite) */}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 gap-1.5 shadow-sm"
            title="Submit solution for full test case evaluation"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Problem Statement vs Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column: Problem Details & Hints */}
        <div className="lg:col-span-5 space-y-4 flex flex-col">
          {/* Tab selector */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('description')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'description'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Problem Description
              </button>
              {(problem.solution_explanation || problem.editorial_url) && (
                <button
                  type="button"
                  onClick={() => setActiveTab('solution')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === 'solution'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Editorial & Optimal
                </button>
              )}
            </div>

            {problem.editorial_url && (
              <a
                href={problem.editorial_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline"
              >
                <span>LeetCode Article</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 overflow-y-auto max-h-[580px] shadow-xs text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {activeTab === 'description' ? (
              <>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    Description
                  </h3>
                  <p className="whitespace-pre-line">{problem.description}</p>
                </div>

                {/* Examples */}
                {problem.examples && problem.examples.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Examples</h3>
                    {problem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-[11px]"
                      >
                        <div className="text-slate-500 font-semibold mb-1">Example {idx + 1}:</div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-200">Input:</strong>{' '}
                          <span className="text-slate-800 dark:text-slate-100">{ex.input}</span>
                        </div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-200">Output:</strong>{' '}
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="text-slate-500 pt-1 font-sans">
                            <em>Explanation:</em> {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && problem.constraints.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                      Constraints
                    </h3>
                    <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                      {problem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Company Tags */}
                {problem.companies && problem.companies.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> Frequently Asked In
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {problem.companies.map((comp) => (
                        <span
                          key={comp}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Official Algorithmic Solution
                  </h3>
                  {problem.editorial_url && (
                    <a
                      href={problem.editorial_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <span>LeetCode Editorial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {problem.solution_explanation ? (
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {problem.solution_explanation}
                  </p>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                    <p className="font-semibold">Full breakdown available in the official editorial:</p>
                    {problem.editorial_url && (
                      <a
                        href={problem.editorial_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open LeetCode Editorial Article
                      </a>
                    )}
                  </div>
                )}

                {problem.optimal_complexity && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Optimal Complexity</span>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span>Time: <strong className="text-blue-600 dark:text-blue-400">{problem.optimal_complexity.time}</strong></span>
                      <span>Space: <strong className="text-emerald-600 dark:text-emerald-400">{problem.optimal_complexity.space}</strong></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Progressive 3-Tier AI Hints */}
          <DSAHints problemId={problem.id} totalHints={problem.hints?.length || 3} />
        </div>

        {/* Right Column: Code Editor & Execution Terminal */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          {/* Language selector & Editor Toolbar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Language:</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as CodingLanguage)}
                className="text-xs h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="python">Python 3 (Sandbox Ready)</option>
                <option value="javascript">JavaScript (Node.js 20)</option>
                <option value="java">Java 21 (OpenJDK)</option>
                <option value="cpp">C++ (GCC / Clang)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetCode}
                className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-1"
                title="Reset to starter template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveDraft}
                className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 gap-1 font-medium"
                title="Save draft to cloud"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save Draft</span>
              </Button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[360px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
            <Editor
              height="360px"
              language={language === 'cpp' ? 'cpp' : language}
              value={code}
              onChange={(val) => {
                setCode(val || '');
                setIsDraftSaved(false);
              }}
              theme="vs-dark"
              options={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, Menlo, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Interactive Execution & Test Cases Terminal */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 text-xs font-mono text-slate-200">
            {/* Header: Mode & Verdict status */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">
                  {consoleMode === 'submit' ? 'Submission Verdict' : 'Sample Test Run'}
                </span>
              </div>

              {consoleMode === 'run' && runResult && (
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {runResult.execution_time_ms}ms
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      runResult.status === 'ACCEPTED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {runResult.status} ({runResult.passed_count}/{runResult.total_tests} passed)
                  </span>
                </div>
              )}

              {consoleMode === 'submit' && submissionResult && (
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {submissionResult.execution_time_ms}ms
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      submissionResult.status === 'ACCEPTED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {submissionResult.status} ({submissionResult.passed_tests}/{submissionResult.total_tests} passed)
                  </span>
                </div>
              )}
            </div>

            {/* Test Case Tabs */}
            {consoleMode === 'run' && runResult?.test_results && runResult.test_results.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
                  {runResult.test_results.map((tr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCaseTab(idx)}
                      className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1.5 transition-all ${
                        activeCaseTab === idx
                          ? 'bg-slate-800 text-white font-bold border border-slate-700'
                          : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${tr.passed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {runResult.test_results[activeCaseTab] && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 font-semibold block mb-0.5">Input:</span>
                      <pre className="text-slate-200 whitespace-pre-wrap bg-slate-900 p-2 rounded border border-slate-800">
                        {runResult.test_results[activeCaseTab].input || '<empty>'}
                      </pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-500 font-semibold block mb-0.5">Your Output:</span>
                        <pre className={`p-2 rounded border whitespace-pre-wrap ${
                          runResult.test_results[activeCaseTab].passed
                            ? 'bg-emerald-950/20 text-emerald-300 border-emerald-900/40'
                            : 'bg-rose-950/20 text-rose-300 border-rose-900/40'
                        }`}>
                          {runResult.test_results[activeCaseTab].actual_output || '<no output>'}
                        </pre>
                      </div>

                      <div>
                        <span className="text-slate-500 font-semibold block mb-0.5">Expected Output:</span>
                        <pre className="text-slate-300 whitespace-pre-wrap bg-slate-900 p-2 rounded border border-slate-800">
                          {runResult.test_results[activeCaseTab].expected_output}
                        </pre>
                      </div>
                    </div>

                    {runResult.test_results[activeCaseTab].error && (
                      <div>
                        <span className="text-rose-400 font-semibold block mb-0.5">Diagnostic / Stderr:</span>
                        <pre className="text-rose-300 whitespace-pre-wrap bg-rose-950/30 p-2 rounded border border-rose-900/50">
                          {runResult.test_results[activeCaseTab].error}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submission Verdict Tabs */}
            {consoleMode === 'submit' && submissionResult?.test_results && submissionResult.test_results.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
                  {submissionResult.test_results.map((tr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCaseTab(idx)}
                      className={`px-2.5 py-1 text-xs rounded-lg flex items-center gap-1.5 transition-all ${
                        activeCaseTab === idx
                          ? 'bg-slate-800 text-white font-bold border border-slate-700'
                          : 'text-slate-400 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${tr.passed ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      Test {idx + 1} {tr.is_hidden && <span className="text-[10px] text-slate-500">(Hidden)</span>}
                    </button>
                  ))}
                </div>

                {submissionResult.test_results[activeCaseTab] && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-2 text-[11px]">
                    {submissionResult.test_results[activeCaseTab].is_hidden ? (
                      <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-400 italic">
                        {submissionResult.test_results[activeCaseTab].passed ? (
                          <div className="text-emerald-400 flex items-center gap-1.5 not-italic font-semibold">
                            <Check className="w-4 h-4" /> Passed hidden evaluation test case.
                          </div>
                        ) : (
                          <div className="text-rose-400 flex items-center gap-1.5 not-italic font-semibold">
                            <AlertTriangle className="w-4 h-4" /> Failed on hidden evaluation test case.
                          </div>
                        )}
                        <p className="mt-1 text-[10px] text-slate-500 not-italic">
                          Hidden inputs and outputs are protected to verify algorithmic generalization.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <span className="text-slate-500 font-semibold block mb-0.5">Input:</span>
                          <pre className="text-slate-200 whitespace-pre-wrap bg-slate-900 p-2 rounded border border-slate-800">
                            {submissionResult.test_results[activeCaseTab].input || '<empty>'}
                          </pre>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="text-slate-500 font-semibold block mb-0.5">Your Output:</span>
                            <pre className={`p-2 rounded border whitespace-pre-wrap ${
                              submissionResult.test_results[activeCaseTab].passed
                                ? 'bg-emerald-950/20 text-emerald-300 border-emerald-900/40'
                                : 'bg-rose-950/20 text-rose-300 border-rose-900/40'
                            }`}>
                              {submissionResult.test_results[activeCaseTab].actual_output || '<no output>'}
                            </pre>
                          </div>

                          <div>
                            <span className="text-slate-500 font-semibold block mb-0.5">Expected Output:</span>
                            <pre className="text-slate-300 whitespace-pre-wrap bg-slate-900 p-2 rounded border border-slate-800">
                              {submissionResult.test_results[activeCaseTab].expected_output}
                            </pre>
                          </div>
                        </div>
                      </>
                    )}

                    {submissionResult.test_results[activeCaseTab].error && (
                      <div>
                        <span className="text-rose-400 font-semibold block mb-0.5">Error:</span>
                        <pre className="text-rose-300 whitespace-pre-wrap bg-rose-950/30 p-2 rounded border border-rose-900/50">
                          {submissionResult.test_results[activeCaseTab].error}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Default Placeholder when neither run nor submitted yet */}
            {((consoleMode === 'run' && !runResult) || (consoleMode === 'submit' && !submissionResult)) && (
              <div className="py-6 text-center text-slate-500 text-xs">
                {isRunning ? (
                  <span className="text-blue-400 italic">Executing your solution in isolated process sandbox...</span>
                ) : isSubmitting ? (
                  <span className="text-emerald-400 italic">Evaluating against full public and hidden test cases...</span>
                ) : (
                  <span>
                    Click <strong className="text-blue-400">Run Code</strong> to test sample cases, or <strong className="text-emerald-400">Submit Solution</strong> to run all test cases.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI DSA Tutor Drawer */}
      <DSAAITutor
        problem={problem}
        currentCode={code}
        language={language}
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        onNavigateToFullPage={() => navigate(`/dsa/tutor/${problem.id}`)}
      />
    </div>
  );
};
