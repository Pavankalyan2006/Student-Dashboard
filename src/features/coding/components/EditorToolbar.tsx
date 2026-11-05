import React, { useState } from 'react';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import { LanguageSelector } from './LanguageSelector';
import {
  Play,
  Square,
  Save,
  RotateCcw,
  Sparkles,
  Settings,
  AlignLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Bookmark,
  Share2,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';

interface EditorToolbarProps {
  onRun: () => void;
  onSave: () => void;
  onOpenHistory?: () => void;
  onOpenSaved?: () => void;
  isSubmitting?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onRun,
  onSave,
  onOpenHistory,
  onOpenSaved,
}) => {
  const isExecuting = useCodingEditorStore((s) => s.isExecuting);
  const runStatus = useCodingEditorStore((s) => s.runStatus);
  const resetCode = useCodingEditorStore((s) => s.resetCode);
  const aiPanelOpen = useCodingEditorStore((s) => s.aiPanelOpen);
  const toggleAiPanel = useCodingEditorStore((s) => s.toggleAiPanel);
  const settings = useCodingEditorStore((s) => s.editorSettings);
  const updateEditorSettings = useCodingEditorStore((s) => s.updateEditorSettings);

  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  const handleFormat = () => {
    const fmt = (window as any).__btech_format_code;
    const ok = typeof fmt === 'function' ? fmt() : false;
    if (ok) toast.success('Code formatted');
    else toast.info('Automatic formatting is only available for JavaScript in this editor.');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(useCodingEditorStore.getState().sourceCode);
      toast.success('Code copied to clipboard');
    } catch {
      toast.error('Could not access the clipboard');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset editor to initial template? Any unsaved edits will be lost.')) {
      resetCode();
      toast.info('Editor reset to template');
    }
  };

  const handleShare = async () => {
    // Only a saved session has a URL that reopens this code; an unsaved editor link would open a blank editor.
    if (!/\/coding\/(session|problem)\//.test(window.location.pathname)) {
      toast.info('Save the code first; only saved sessions and problems have a link that reopens them.');
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Workspace link copied to clipboard (only you can open it while signed in)');
    } catch {
      toast.error('Could not access the clipboard');
    }
  };

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {/* Left controls: Language & Primary Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <LanguageSelector />

        {/* Run Button */}
        <button
          onClick={onRun}
          disabled={isExecuting}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            isExecuting
              ? 'bg-amber-500 text-white cursor-wait animate-pulse'
              : runStatus === 'completed'
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : runStatus === 'failed'
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
          }`}
          title="Run Code (Ctrl + Enter)"
        >
          {isExecuting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running...</span>
            </>
          ) : runStatus === 'completed' ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
            </>
          ) : runStatus === 'failed' ? (
            <>
              <XCircle className="w-3.5 h-3.5" />
              <span>Failed</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Stop Button (Active only when running) */}
        {isExecuting && (
          <button
            onClick={() => useCodingEditorStore.getState().setIsExecuting(false)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-medium"
            title="Stop waiting for this run (the server still enforces its time limit)"
            aria-label="Stop waiting for this run"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        )}

        {/* Save Code */}
        <button
          onClick={onSave}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
          title="Save Code (Ctrl + S)"
        >
          <Save className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Save</span>
        </button>

        {/* Format Code */}
        <button
          onClick={handleFormat}
          disabled={isExecuting}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
          title="Format Code (Shift + Alt + F)"
        >
          <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
          <span>Format</span>
        </button>

        {/* Reset Code */}
        <button
          onClick={handleReset}
          disabled={isExecuting}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors"
          title="Reset to Template"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset</span>
        </button>
      </div>

      {/* Right controls: AI, Settings, History */}
      <div className="flex items-center gap-2">
        {onOpenSaved && (
          <button
            onClick={onOpenSaved}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Saved Snippets"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Saved</span>
          </button>
        )}

        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1 px-2 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Execution History"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </button>
        )}

        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg text-xs"
          title="Copy code"
          aria-label="Copy code"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleShare}
          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Share Workspace Link"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        {/* Settings Button */}
        <div className="relative">
          <button
            onClick={() => setShowSettingsDialog(!showSettingsDialog)}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Editor Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showSettingsDialog && (
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 text-xs">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2.5 pb-1 border-b border-slate-200 dark:border-slate-800">
                Editor Preferences
              </h4>
              <div className="space-y-3">
                {/* Theme */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Editor Theme</span>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateEditorSettings({ theme: e.target.value as any })}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-700"
                  >
                    <option value="vs-dark">Dark (VS Code)</option>
                    <option value="light">Light</option>
                  </select>
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Font Size</span>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => updateEditorSettings({ fontSize: Number(e.target.value) })}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-slate-700"
                  >
                    <option value={12}>12 px</option>
                    <option value={14}>14 px (Default)</option>
                    <option value={16}>16 px</option>
                    <option value={18}>18 px</option>
                  </select>
                </div>

                {/* Word Wrap */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Word Wrap</span>
                  <button
                    onClick={() => updateEditorSettings({ wordWrap: settings.wordWrap === 'on' ? 'off' : 'on' })}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                      settings.wordWrap === 'on' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {settings.wordWrap.toUpperCase()}
                  </button>
                </div>

                {/* Minimap */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Minimap</span>
                  <button
                    onClick={() => updateEditorSettings({ minimap: !settings.minimap })}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                      settings.minimap ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                    }`}
                  >
                    {settings.minimap ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Toggle */}
        <button
          onClick={toggleAiPanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            aiPanelOpen
              ? 'bg-purple-600 text-white shadow-purple-500/20'
              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100'
          }`}
          title="Toggle AI Coding Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>AI Assistant</span>
        </button>
      </div>
    </div>
  );
};
