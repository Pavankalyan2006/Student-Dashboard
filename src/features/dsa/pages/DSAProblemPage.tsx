import * as React from 'react';
import { DSAProblem } from '../types/dsa';
import { dsaApi } from '../api/dsaApi';
import { codingApi } from '../../coding/api/codingApi';
import { CodingLanguage, ExecutionResult } from '../../coding/types/coding';
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
  const [executionResult, setExecutionResult] = React.useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = React.useState<'description' | 'solution'>('description');
  const [loading, setLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    dsaApi
      .getProblem(problemId)
      .then((prob) => {
        setProblem(prob);
        const initialLang = (prob.supported_languages?.[0] as CodingLanguage) || 'python';
        setLanguage(initialLang);
        setCode(prob.starter_code?.[initialLang] || prob.starter_code?.['python'] || '# Write your solution here');
      })
      .catch((err) => {
        console.error('Failed to load problem:', err);
      })
      .finally(() => setLoading(false));
  }, [problemId]);

  const handleLanguageChange = (newLang: CodingLanguage) => {
    setLanguage(newLang);
    if (problem?.starter_code?.[newLang]) {
      setCode(problem.starter_code[newLang]);
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
    setExecutionResult(null);

    try {
      const firstExample = problem?.examples?.[0];
      const stdin = firstExample?.input || '';
      const result = await codingApi.runCode({
        language,
        source_code: code,
        stdin,
        problem_id: problemId,
      });
      setExecutionResult(result);

      if (result.status === 'SUCCESS') {
        toast.success(`Executed in ${result.execution_time_ms}ms`);
      } else {
        toast.error(`Execution error: ${result.status}`);
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

    try {
      const res: any = await dsaApi.submitProblemSolution(problemId, {
        language,
        source_code: code,
      });

      if (res.status === 'ACCEPTED' || res.status === 'success') {
        toast.success('Congratulations! Problem solved successfully.');
      } else {
        toast.info(res.feedback || 'Submission evaluated.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-[500px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold">Problem Not Found</h2>
        <Button onClick={() => navigate('/dsa/practice')}>Return to Problem Bank</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dsa/practice')}
            className="h-9 w-9 p-0 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {problem.difficulty}
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {problem.title}
              </h1>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {problem.editorial_url && (
            <a
              href={problem.editorial_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors shadow-xs h-9"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>LeetCode Editorial</span>
            </a>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dsa/visualize/${problem.algorithm_id || problem.id}`)}
            className="text-xs h-9 gap-1.5 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-semibold"
            title="Launch interactive step visualizer for this question"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Launch Visualizer</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTutorOpen(true)}
            className="text-xs h-9 gap-1.5 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 font-semibold"
            title="Ask AI DSA Tutor for guidance"
          >
            <Bot className="w-3.5 h-3.5 text-violet-500" />
            <span>Ask AI Tutor</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={isRunning}
            className="text-xs h-9 gap-1.5"
          >
            <Play className="w-3.5 h-3.5 text-blue-600 fill-current" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-4 gap-1.5 shadow-xs"
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
                  Editorial / Solution
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
                <span>Editorial</span>
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
                  <p>{problem.description}</p>
                </div>

                {/* Examples */}
                {problem.examples && problem.examples.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Examples</h3>
                    {problem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]"
                      >
                        <div className="text-slate-500 font-semibold mb-1">Example {idx + 1}:</div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-200">Input:</strong>{' '}
                          {ex.input}
                        </div>
                        <div>
                          <strong className="text-slate-700 dark:text-slate-200">Output:</strong>{' '}
                          {ex.output}
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

          {/* Progressive AI Hints */}
          <DSAHints problemId={problem.id} totalHints={problem.hints?.length || 3} />
        </div>

        {/* Right Column: Code Editor & Execution Terminal */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Language selector & Editor Toolbar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Language:</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as CodingLanguage)}
                className="text-xs h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="c">C</option>
                <option value="java">Java 21</option>
              </select>
            </div>

            <span className="text-[11px] font-mono text-slate-400">
              Ctrl+Enter to Run
            </span>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 min-h-[380px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
            <Editor
              height="380px"
              language={language === 'cpp' || language === 'c' ? 'cpp' : language}
              value={code}
              onChange={(val) => setCode(val || '')}
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

          {/* Execution Output Console */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-2 text-xs font-mono text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-3.5 h-3.5" />
                <span className="font-bold text-[11px] uppercase tracking-wider">Console Output</span>
              </div>

              {executionResult && (
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3 h-3" />
                    {executionResult.execution_time_ms}ms
                  </span>
                  <span
                    className={`font-bold ${
                      executionResult.status === 'SUCCESS'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {executionResult.status.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="min-h-[80px] max-h-[140px] overflow-y-auto whitespace-pre-wrap text-slate-300">
              {isRunning ? (
                <span className="text-slate-500 italic">Running program in isolated sandbox...</span>
              ) : executionResult ? (
                executionResult.stderr ? (
                  <span className="text-rose-400">{executionResult.stderr}</span>
                ) : (
                  executionResult.stdout || <span className="text-slate-500">Program executed with no stdout.</span>
                )
              ) : (
                <span className="text-slate-500">
                  Click 'Run Code' to execute against sample test input.
                </span>
              )}
            </div>
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
