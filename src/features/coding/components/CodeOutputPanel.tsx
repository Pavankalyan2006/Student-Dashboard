import React from 'react';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import {
  Terminal,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Sparkles,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

interface CodeOutputPanelProps {
  onAskAiDebug?: (err: string) => void;
  submissionResults?: any;
}

export const CodeOutputPanel: React.FC<CodeOutputPanelProps> = ({
  onAskAiDebug,
  submissionResults,
}) => {
  const result = useCodingEditorStore((s) => s.executionResult);
  const isExecuting = useCodingEditorStore((s) => s.isExecuting);
  const outputTab = useCodingEditorStore((s) => s.outputTab);
  const setOutputTab = useCodingEditorStore((s) => s.setOutputTab);
  const stdin = useCodingEditorStore((s) => s.stdin);
  const setStdin = useCodingEditorStore((s) => s.setStdin);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const hasError = result && result.status !== 'SUCCESS';

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 border-t border-slate-800 font-mono text-xs">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1.5 bg-slate-900/90 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOutputTab('output')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              outputTab === 'output'
                ? 'bg-slate-800 text-blue-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Output</span>
            {result?.status === 'SUCCESS' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setOutputTab('errors')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              outputTab === 'errors'
                ? 'bg-slate-800 text-rose-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Errors</span>
            {hasError && (
              <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-400 text-[10px] rounded-full border border-rose-500/40">
                1
              </span>
            )}
          </button>

          <button
            onClick={() => setOutputTab('input')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              outputTab === 'input'
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Standard Input</span>
            {stdin.trim().length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>

          {submissionResults && (
            <button
              onClick={() => setOutputTab('tests')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                outputTab === 'tests'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Test Results</span>
              <span className="px-1.5 py-0.2 bg-slate-800 text-[10px] rounded-full">
                {submissionResults.passed_tests}/{submissionResults.total_tests}
              </span>
            </button>
          )}
        </div>

        {/* Execution Metadata Pills */}
        {result && (
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{result.execution_time_ms} ms</span>
            </div>
            {result.memory_kb && (
              <div className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-slate-500" />
                <span>{Math.round(result.memory_kb / 1024)} MB</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>Exit Code: {result.exit_code}</span>
            </div>
            {(result as any).isolation && (result as any).isolation !== 'namespace' && (
              <span
                className="px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300"
                title="This server could not isolate the program from the host. Do not run untrusted code here."
              >
                Not isolated
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-auto p-3">
        {isExecuting ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs" role="status">Running code...</p>
          </div>
        ) : outputTab === 'output' ? (
          <div>
            {result ? (
              <div className="space-y-2">
                {result.status === 'SUCCESS' ? (
                  <div className="flex items-center justify-between text-emerald-400 pb-2 border-b border-slate-800/80">
                    <span className="flex items-center gap-1.5 font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      Program completed successfully
                    </span>
                    {result.stdout && (
                      <button
                        onClick={() => handleCopy(result.stdout)}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-rose-400 pb-2 border-b border-slate-800/80 font-semibold text-xs">
                    <XCircle className="w-4 h-4" />
                    Execution failed: {result.status.replace(/_/g, ' ')}
                  </div>
                )}

                {result.stdout ? (
                  <pre className="whitespace-pre-wrap font-mono text-slate-200 leading-relaxed text-xs">
                    {result.stdout}
                  </pre>
                ) : (
                  <p className="text-slate-500 italic">No output produced.</p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 italic">
                Press <kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px]">Ctrl+Enter</kbd> or click <strong>Run</strong> to compile and execute your code.
              </p>
            )}
          </div>
        ) : outputTab === 'errors' ? (
          <div>
            {hasError ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-lg">
                  <div className="flex items-center gap-2 text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <div>
                      <h4 className="font-semibold text-xs">{result.status.replace(/_/g, ' ')}</h4>
                      <p className="text-[11px] text-rose-400/80">Exit code {result.exit_code}</p>
                    </div>
                  </div>

                  {onAskAiDebug && (
                    <button
                      onClick={() => onAskAiDebug(result.stderr || result.status)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Debug with AI</span>
                    </button>
                  )}
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                  <pre className="whitespace-pre-wrap font-mono text-rose-300 text-xs leading-relaxed">
                    {result.stderr || 'No diagnostic error text received.'}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 italic">No errors detected in the last execution.</p>
            )}
          </div>
        ) : outputTab === 'input' ? (
          <div className="h-full flex flex-col space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px]">Enter standard input data provided to program execution via stdin:</span>
              {stdin && (
                <button
                  onClick={() => setStdin('')}
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Paste or type test input tokens here..."
              rows={4}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        ) : outputTab === 'tests' && submissionResults ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  submissionResults.status === 'ACCEPTED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  {submissionResults.status}
                </span>
                <span className="text-slate-400">
                  {submissionResults.passed_tests} of {submissionResults.total_tests} test cases passed
                </span>
              </div>
              <span className="text-slate-400">{submissionResults.execution_time_ms} ms</span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {submissionResults.test_results?.map((tr: any) => (
                <div
                  key={tr.test_index}
                  className={`p-2.5 rounded-lg border text-xs font-mono ${
                    tr.passed
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">
                      Test Case #{tr.test_index} {tr.is_hidden && '(Hidden)'}
                    </span>
                    <span className="text-[11px] font-bold">
                      {tr.passed ? 'PASSED' : 'FAILED'} ({tr.execution_time_ms} ms)
                    </span>
                  </div>

                  {!tr.is_hidden && (
                    <div className="grid grid-cols-2 gap-2 mt-1.5 text-[11px]">
                      <div>
                        <span className="text-slate-500">Expected:</span>
                        <pre className="p-1 bg-slate-900 rounded mt-0.5 text-slate-300 overflow-x-auto">
                          {tr.expected_output}
                        </pre>
                      </div>
                      <div>
                        <span className="text-slate-500">Actual:</span>
                        <pre className="p-1 bg-slate-900 rounded mt-0.5 text-slate-300 overflow-x-auto">
                          {tr.actual_output || tr.error}
                        </pre>
                      </div>
                    </div>
                  )}

                  {tr.is_hidden && !tr.passed && (
                    <p className="text-[11px] text-slate-400 italic mt-1">
                      Hidden test case details are masked to preserve academic integrity.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
