import React from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import { Check, X, Sparkles } from 'lucide-react';

export const CodeDiffViewer: React.FC = () => {
  const diffModal = useCodingEditorStore((s) => s.diffModal);
  const closeDiffModal = useCodingEditorStore((s) => s.closeDiffModal);
  const language = useCodingEditorStore((s) => s.language);
  const settings = useCodingEditorStore((s) => s.editorSettings);

  if (!diffModal.isOpen) return null;

  const handleApply = () => {
    if (diffModal.onApply) {
      diffModal.onApply();
    }
    closeDiffModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-5xl h-[85vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/60 text-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {diffModal.title || 'Review Suggested Code Changes'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Left: Current Code · Right: AI Proposed Revision. Review carefully before applying.
              </p>
            </div>
          </div>

          <button
            onClick={closeDiffModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rationale & Changes list */}
        {(diffModal.rationale || diffModal.changes) && (
          <div className="px-6 py-3 bg-purple-50/50 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30 text-xs">
            {diffModal.rationale && (
              <p className="font-medium text-purple-900 dark:text-purple-200 mb-1">
                <strong>Why:</strong> {diffModal.rationale}
              </p>
            )}
            {diffModal.changes && diffModal.changes.length > 0 && (
              <ul className="list-disc list-inside space-y-0.5 text-purple-800 dark:text-purple-300">
                {diffModal.changes.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Diff Editor Body */}
        <div className="flex-1 w-full min-h-[350px] bg-slate-900 overflow-hidden">
          <DiffEditor
            height="100%"
            language={language}
            original={diffModal.originalCode}
            modified={diffModal.suggestedCode}
            theme={settings.theme}
            options={{
              readOnly: true,
              fontSize: settings.fontSize,
              renderSideBySide: true,
              automaticLayout: true,
              fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace",
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              minimap: { enabled: false },
            }}
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <span className="text-xs text-slate-500">
            Note: Your editor will be updated with the right side code.
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={closeDiffModal}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Apply Fix to Editor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
