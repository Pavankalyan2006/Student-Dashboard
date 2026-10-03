import React, { useState } from 'react';
import { CodingProblem } from '../types/coding';
import {
  Code,
  Tag,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  FileCheck2,
  Clock,
  Layers,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { toast } from 'sonner';

interface CodingProblemPanelProps {
  problem: CodingProblem;
  onSubmit: () => void;
  onRun: () => void;
  isSubmitting?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toUpperCase()) {
    case 'BEGINNER':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'EASY':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'HARD':
    case 'ADVANCED':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
  }
};

export const CodingProblemPanel: React.FC<CodingProblemPanelProps> = ({
  problem,
  onSubmit,
  onRun,
  isSubmitting = false,
}) => {
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(0);
  const [hintsExpanded, setHintsExpanded] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-y-auto">
      {/* Problem Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getDifficultyColor(
              problem.difficulty
            )}`}
          >
            {problem.difficulty}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
            <Layers className="w-3 h-3 text-slate-400" />
            {problem.topic}
          </span>
        </div>

        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {problem.title}
        </h1>

        {/* Action button: Submit */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Submission...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                <span>Submit Solution</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Problem Body */}
      <div className="p-4 space-y-5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
        {/* Description */}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1.5 text-xs uppercase tracking-wider">
            Description
          </h3>
          <div className="prose dark:prose-invert prose-xs max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {problem.description}
            </ReactMarkdown>
          </div>
        </div>

        {/* Input & Output Format */}
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-xs">
              Input Format:
            </h4>
            <p className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
              {problem.input_format}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1 text-xs">
              Output Format:
            </h4>
            <p className="p-2 bg-slate-50 dark:bg-slate-950/60 rounded border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
              {problem.output_format}
            </p>
          </div>
        </div>

        {/* Examples */}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 text-xs uppercase tracking-wider">
            Examples
          </h3>
          <div className="space-y-3">
            {problem.examples?.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2"
              >
                <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                  Example {idx + 1}
                </span>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span>Input:</span>
                    <button
                      onClick={() => handleCopy(ex.input)}
                      className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-0.5"
                    >
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </button>
                  </div>
                  <pre className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded font-mono text-[11px] overflow-x-auto">
                    {ex.input}
                  </pre>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span>Output:</span>
                    <button
                      onClick={() => handleCopy(ex.output)}
                      className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-0.5"
                    >
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </button>
                  </div>
                  <pre className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded font-mono text-[11px] overflow-x-auto text-emerald-600 dark:text-emerald-400">
                    {ex.output}
                  </pre>
                </div>

                {ex.explanation && (
                  <p className="text-[11px] text-slate-500 italic">
                    <strong>Explanation:</strong> {ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1.5 text-xs uppercase tracking-wider">
              Constraints
            </h3>
            <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Progressive Hints Accordion */}
        {problem.hints && problem.hints.length > 0 && (
          <div className="border border-amber-200 dark:border-amber-900/40 rounded-lg overflow-hidden bg-amber-50/30 dark:bg-amber-950/10">
            <button
              onClick={() => setHintsExpanded(!hintsExpanded)}
              className="w-full flex items-center justify-between p-3 text-left font-semibold text-amber-900 dark:text-amber-200 text-xs hover:bg-amber-100/40 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Progressive Hints ({problem.hints.length})</span>
              </div>
              {hintsExpanded ? (
                <ChevronDown className="w-4 h-4 text-amber-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-amber-600" />
              )}
            </button>

            {hintsExpanded && (
              <div className="p-3 pt-0 space-y-2.5 text-xs">
                {problem.hints.slice(0, revealedHintIndex + 1).map((h, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/60 rounded-md"
                  >
                    <span className="font-bold text-amber-800 dark:text-amber-400 block mb-0.5">
                      Hint {i + 1}:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                      {h}
                    </p>
                  </div>
                ))}

                {revealedHintIndex < problem.hints.length - 1 && (
                  <button
                    onClick={() => setRevealedHintIndex(revealedHintIndex + 1)}
                    className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] rounded transition-colors"
                  >
                    Unlock Next Hint ({revealedHintIndex + 2} of {problem.hints.length})
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Tag className="w-3 h-3 text-slate-400" />
              {problem.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px]"
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
