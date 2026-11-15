import * as React from 'react';
import { useState, useEffect } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import { codingApi } from '../api/codingApi';
import { CodeEditor } from '../components/CodeEditor';
import { EditorToolbar } from '../components/EditorToolbar';
import { CodeOutputPanel } from '../components/CodeOutputPanel';
import { CodeAIChat } from '../components/CodeAIChat';
import { CodeDiffViewer } from '../components/CodeDiffViewer';
import { SavedCodeList } from '../components/SavedCodeList';
import { CodingHistory } from '../components/CodingHistory';
import { CodingProblemPanel } from '../components/CodingProblemPanel';
import { CodingProblem, CodingLanguage, ExecutionResult } from '../types/coding';
import { toast } from 'sonner';
import { runInBrowser } from '../../../lib/browserSandbox';
import { loadLanguageAvailability } from '../hooks/useLanguageAvailability';
import { ArrowLeft, Save } from 'lucide-react';

export const DEFAULT_LANGUAGE_BOILERPLATES: Record<CodingLanguage, string> = {
  python: `# Python 3 Solution
import sys

def solve():
    # Read standard input
    input_data = sys.stdin.read().split()
    if not input_data:
        print("Hello, B.Tech Coding Lab!")
        return
    print(f"Processed: {input_data}")

if __name__ == "__main__":
    solve()
`,
  javascript: `// JavaScript (Node.js) Solution
function solve() {
    console.log("Hello, B.Tech Coding Lab!");
}

solve();
`,
  cpp: `// C++ (G++ 17) Solution
#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    cout << "Hello, B.Tech Coding Lab!" << "\\n";
    return 0;
}
`,
  c: `/* C (GCC 11) Solution */
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Hello, B.Tech Coding Lab!\\n");
    return 0;
}
`,
  java: `// Java (OpenJDK) Solution
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, B.Tech Coding Lab!");
    }
}
`,
};

interface CodingEditorPageProps {
  problemId?: string;
  sessionId?: string;
  search?: string;
  onNavigate?: (path: string) => void;
}

export const CodingEditorPage: React.FC<CodingEditorPageProps> = ({
  problemId,
  sessionId,
  search,
  onNavigate,
}) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const queryStr =
    search !== undefined
      ? search
      : typeof window !== 'undefined'
      ? window.location.search
      : '';
  const searchParams = new URLSearchParams(queryStr);

  const problemIdParam = problemId || searchParams.get('problemId') || searchParams.get('problem');
  const sessionIdParam = sessionId || searchParams.get('sessionId') || searchParams.get('session');
  const savedIdParam = searchParams.get('savedId') || searchParams.get('saved');
  const languageParam = searchParams.get('language') || searchParams.get('lang');

  const sourceCode = useCodingEditorStore((s) => s.sourceCode);
  const setSourceCode = useCodingEditorStore((s) => s.setSourceCode);
  const language = useCodingEditorStore((s) => s.language);
  const setLanguage = useCodingEditorStore((s) => s.setLanguage);
  const stdin = useCodingEditorStore((s) => s.stdin);
  const setIsExecuting = useCodingEditorStore((s) => s.setIsExecuting);
  const setRunStatus = useCodingEditorStore((s) => s.setRunNote);
  const setExecutionResult = useCodingEditorStore((s) => s.setExecutionResult);
  const aiPanelOpen = useCodingEditorStore((s) => s.aiPanelOpen);
  const setActiveProblemId = useCodingEditorStore((s) => s.setActiveProblemId);
  const setActiveSessionId = useCodingEditorStore((s) => s.setActiveSessionId);
  const openDiffModal = useCodingEditorStore((s) => s.openDiffModal);

  const [activeProblem, setActiveProblem] = useState<CodingProblem | null>(null);
  const [submissionResults, setSubmissionResults] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveTags, setSaveTags] = useState('');

  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Initialize from URL query parameters
  useEffect(() => {
    if (languageParam) {
      const validLang = languageParam.toLowerCase() as CodingLanguage;
      if (['python', 'javascript', 'cpp', 'c', 'java'].includes(validLang)) {
        setLanguage(validLang);
        if (!problemIdParam && !sessionIdParam && !savedIdParam) {
          setSourceCode(DEFAULT_LANGUAGE_BOILERPLATES[validLang] || DEFAULT_LANGUAGE_BOILERPLATES.python);
        }
      }
    }

    if (problemIdParam) {
      setActiveProblemId(problemIdParam);
      codingApi
        .getProblem(problemIdParam)
        .then((prob) => {
          setActiveProblem(prob);
          // Set starter code if editor is default
          if (prob.starter_code && prob.starter_code[language]) {
            setSourceCode(prob.starter_code[language]);
          }
        })
        .catch(() => {
          toast.error('Problem not found');
        });
    }

    if (sessionIdParam) {
      setActiveSessionId(sessionIdParam);
      codingApi
        .getSession(sessionIdParam)
        .then((sess) => {
          setLanguage(sess.language);
          setSourceCode(sess.source_code);
          if (sess.problem_id) {
            setActiveProblemId(sess.problem_id);
            codingApi.getProblem(sess.problem_id).then(setActiveProblem).catch(() => {});
          }
        })
        .catch(() => {
          toast.error('Could not load session');
        });
    }

    if (savedIdParam) {
      codingApi
        .getSavedCode(savedIdParam)
        .then((saved) => {
          setLanguage(saved.language);
          setSourceCode(saved.source_code);
          toast.success(`Loaded saved code: ${saved.title}`);
        })
        .catch(() => {
          toast.error('Could not load saved code snippet');
        });
    }
  }, [problemIdParam, sessionIdParam, savedIdParam, languageParam]);

  // Run Code Action
  const handleRunCode = async () => {
    setIsExecuting(true);
    try {
      // Without a server sandbox (as on Vercel), Python and JavaScript run in an isolated worker in this browser.
      const where = (await loadLanguageAvailability())[language]?.runs;
      if (where === 'browser') {
        const res = await runInBrowser(
          { language: language as 'python' | 'javascript', source: sourceCode, stdin },
          { onStatus: (text) => setRunStatus(text) }
        );
        setExecutionResult(res as ExecutionResult);
        if (res.status === 'SUCCESS') toast.success(`Ran in your browser in ${res.execution_time_ms} ms`);
        else toast.error(`Execution ended with ${res.status.replace(/_/g, ' ')}`);
        return;
      }
      const res = await codingApi.runCode({
        language,
        source_code: sourceCode,
        stdin,
        problem_id: activeProblem?.id,
      });
      setExecutionResult(res);
      if (res.status === 'SUCCESS') {
        toast.success(`Executed in ${res.execution_time_ms} ms`);
      } else {
        toast.error(`Execution ended with ${res.status.replace(/_/g, ' ')}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Run request failed');
      setExecutionResult({
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr: err.message || 'Failed to communicate with sandbox execution service.',
        exit_code: 1,
        execution_time_ms: 0,
      });
    } finally {
      setIsExecuting(false);
      setRunStatus('');
    }
  };

  // Submit Solution Action
  const handleSubmitSolution = async () => {
    if (!activeProblem) {
      toast.info('No practice problem selected. Use "Run" for custom execution.');
      return;
    }

    setIsSubmitting(true);
    try {
      const sub = await codingApi.submitProblem(activeProblem.id, {
        language,
        source_code: sourceCode,
      });
      setSubmissionResults(sub);
      useCodingEditorStore.getState().setOutputTab('tests');

      if (sub.status === 'ACCEPTED') {
        toast.success(`🎉 Accepted! All ${sub.total_tests} test cases passed!`);
      } else {
        toast.error(`Submission result: ${sub.status.replace(/_/g, ' ')} (${sub.passed_tests}/${sub.total_tests} passed)`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Code Action
  const handleSaveSnippet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) {
      toast.error('Please enter a title for this snippet.');
      return;
    }

    try {
      const tagsArray = saveTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const saved = await codingApi.saveCode({
        title: saveTitle.trim(),
        language,
        source_code: sourceCode,
        description: saveDescription.trim(),
        tags: tagsArray,
      });

      toast.success(`Saved "${saved.title}"`);
      setShowSaveDialog(false);
      setSaveTitle('');
      setSaveDescription('');
      setSaveTags('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save code');
    }
  };

  const handleAskAiDebug = (err: string) => {
    useCodingEditorStore.getState().setAiPanelOpen(true);
    codingApi
      .aiDebug({
        language,
        source_code: sourceCode,
        error: err,
        problem_statement: activeProblem?.description,
      })
      .then((debugRes) => {
        openDiffModal({
          title: `Debugged Fix: ${debugRes.problem}`,
          originalCode: sourceCode,
          suggestedCode: debugRes.corrected_code,
          rationale: debugRes.explanation,
          changes: [debugRes.suggested_fix],
          onApply: () => {
            setSourceCode(debugRes.corrected_code);
            toast.success('Applied fix to editor');
          },
        });
      })
      .catch((e) => toast.error(`AI Debug failed: ${e.message}`));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Top Header Breadcrumb */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/coding')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Coding Lab</span>
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {activeProblem ? activeProblem.title : 'Interactive IDE'}
          </span>
        </div>
      </div>

      {/* Editor Toolbar */}
      <EditorToolbar
        onRun={handleRunCode}
        onSave={() => setShowSaveDialog(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenSaved={() => setShowSavedModal(true)}
        isSubmitting={isSubmitting}
      />

      {/* Resizable 3-Column IDE Layout */}
      <div className="flex-1 w-full overflow-hidden">
        <Group orientation="horizontal" className="h-full w-full">
          {/* Left Panel: Problem Statement (if in problem mode) */}
          {activeProblem && (
            <>
              <Panel defaultSize={28} minSize={20} maxSize={45}>
                <CodingProblemPanel
                  problem={activeProblem}
                  onSubmit={handleSubmitSolution}
                  onRun={handleRunCode}
                  isSubmitting={isSubmitting}
                />
              </Panel>
              <Separator className="w-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 transition-colors cursor-col-resize" />
            </>
          )}

          {/* Center Panel: Editor + Output */}
          <Panel minSize={30}>
            <Group orientation="vertical" className="h-full w-full">
              {/* Code Editor Panel */}
              <Panel defaultSize={65} minSize={25}>
                <div className="w-full h-full p-1 bg-slate-950">
                  <CodeEditor onRun={handleRunCode} onSave={() => setShowSaveDialog(true)} />
                </div>
              </Panel>

              <Separator className="h-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 transition-colors cursor-row-resize" />

              {/* Bottom Output Panel */}
              <Panel defaultSize={35} minSize={15}>
                <CodeOutputPanel
                  onAskAiDebug={handleAskAiDebug}
                  submissionResults={submissionResults}
                />
              </Panel>
            </Group>
          </Panel>

          {/* Right Panel: AI Assistant */}
          {aiPanelOpen && (
            <>
              <Separator className="w-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-purple-500 transition-colors cursor-col-resize" />
              <Panel defaultSize={28} minSize={20} maxSize={45}>
                <CodeAIChat problemContext={activeProblem} />
              </Panel>
            </>
          )}
        </Group>
      </div>

      {/* Save Code Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
              <Save className="w-4 h-4 text-blue-600" /> Save Code to Library
            </h3>
            <form onSubmit={handleSaveSnippet} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Snippet Title *</label>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g. Binary Search Implementation"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={saveDescription}
                  onChange={(e) => setSaveDescription(e.target.value)}
                  placeholder="Optional brief notes about this solution..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="algorithms, arrays, dsa"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveDialog(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Saved Code Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl h-[70vh]">
            <SavedCodeList onClose={() => setShowSavedModal(false)} />
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl h-[70vh]">
            <CodingHistory onClose={() => setShowHistoryModal(false)} />
          </div>
        </div>
      )}

      {/* Monaco Diff Viewer Modal */}
      <CodeDiffViewer />
    </div>
  );
};
