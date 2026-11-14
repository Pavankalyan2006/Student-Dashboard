import React, { useState } from 'react';
import { GitHubRepositoryFile } from '../types';
import { githubApi } from '../api/githubApi';
import {
  FileText,
  FileCode,
  Folder,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Check,
  Code2,
  Copy,
  Terminal,
} from 'lucide-react';
import { toast } from 'sonner';
import { copyText } from '../../../lib/clipboard';

interface RepoFileExplorerTabProps {
  repoId: string;
  files: GitHubRepositoryFile[];
}

export const RepoFileExplorerTab: React.FC<RepoFileExplorerTabProps> = ({ repoId, files }) => {
  const [selectedFile, setSelectedFile] = useState<GitHubRepositoryFile | null>(files[0] || null);
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [aiReview, setAiReview] = useState<any | null>(null);
  const [generatedTests, setGeneratedTests] = useState<any | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleSelectFile = async (f: GitHubRepositoryFile) => {
    setSelectedFile(f);
    setAiExplanation(null);
    setAiReview(null);
    setGeneratedTests(null);

    // Fetch refreshed file with secret redaction
    try {
      const full = await githubApi.getFile(repoId, f.path);
      if (full && full.path === f.path) {
        setSelectedFile(full);
      }
    } catch (err) {
      // fallback to existing
    }
  };

  React.useEffect(() => {
    if (files && files.length > 0) {
      if (!selectedFile || !files.some((f) => f.path === selectedFile.path)) {
        handleSelectFile(files[0]);
      }
    } else {
      setSelectedFile(null);
    }
  }, [files, repoId]);

  const handleExplain = async () => {
    if (!selectedFile) return;
    setIsLoadingAI(true);
    try {
      const exp = await githubApi.explainFile(repoId, selectedFile.path);
      setAiExplanation(exp);
      setAiReview(null);
      setGeneratedTests(null);
    } catch (err: any) {
      toast.error('Failed to explain file');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleReview = async () => {
    if (!selectedFile) return;
    setIsLoadingAI(true);
    try {
      const rev = await githubApi.reviewCode(repoId, selectedFile.path);
      setAiReview(rev);
      setAiExplanation(null);
      setGeneratedTests(null);
    } catch (err: any) {
      toast.error('Failed to review file');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!selectedFile) return;
    setIsLoadingAI(true);
    try {
      const tests = await githubApi.generateTests(repoId, selectedFile.path);
      setGeneratedTests(tests);
      setAiExplanation(null);
      setAiReview(null);
    } catch (err: any) {
      toast.error('Failed to generate tests');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* File Tree (Left Col) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2 h-[600px] flex flex-col">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Repository Files</span>
          <span className="font-mono text-slate-400">{files.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {files.map((file) => {
            const isSelected = selectedFile?.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => handleSelectFile(file)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">{file.path}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{file.size}B</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Code Viewer & AI Analysis (Right 2 Cols) */}
      <div className="md:col-span-2 space-y-4">
        {selectedFile ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col h-[600px]">
            {/* Header / Actions Bar */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <span className="font-mono text-xs font-bold text-slate-900">{selectedFile.path}</span>
              </div>

              {/* Code Intelligence Action Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={handleExplain}
                  disabled={isLoadingAI}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Explain File
                </button>
                <button
                  onClick={handleReview}
                  disabled={isLoadingAI}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" /> Review Code
                </button>
                <button
                  onClick={handleGenerateTests}
                  disabled={isLoadingAI}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Terminal className="w-3 h-3" /> Generate Tests
                </button>
              </div>
            </div>

            {/* AI Output Drawers if active */}
            {aiExplanation && (
              <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 text-xs text-indigo-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> File Purpose & Architecture
                </div>
                <p className="leading-relaxed">{aiExplanation.explanation}</p>
                {aiExplanation.key_functions?.length > 0 && (
                  <div className="text-[11px] text-indigo-900">
                    <span className="font-semibold">Key Functions/Symbols:</span>{' '}
                    {aiExplanation.key_functions.join(', ')}
                  </div>
                )}
              </div>
            )}

            {aiReview && (
              <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Code Review & Recommendations
                </div>
                <p>{aiReview.review_summary}</p>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  {aiReview.recommendations.map((rec: string, i: number) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {generatedTests && (
              <div className="p-4 bg-slate-900 text-slate-200 border-b border-slate-800 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Unit Test Scaffold ({generatedTests.test_framework})</span>
                  <button
                    onClick={() => {
                      copyText(generatedTests.test_code);
                      toast.success('Test code copied');
                    }}
                    className="text-[11px] hover:text-white"
                  >
                    Copy Tests
                  </button>
                </div>
                <pre className="overflow-x-auto p-2 bg-black/40 rounded-lg">{generatedTests.test_code}</pre>
              </div>
            )}

            {/* Code Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap select-all">
                {selectedFile.content || '// Empty file or binary content'}
              </pre>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
            Select a file to inspect
          </div>
        )}
      </div>
    </div>
  );
};
