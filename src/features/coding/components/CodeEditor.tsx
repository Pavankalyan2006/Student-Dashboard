import React, { useRef, useEffect, useState } from 'react';
import Editor, { Monaco, OnMount, loader } from '@monaco-editor/react';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import { CodingLanguage } from '../types/coding';

interface CodeEditorProps {
  onRun?: () => void;
  onSave?: () => void;
  readOnly?: boolean;
}

const mapLanguageToMonaco = (lang: CodingLanguage): string => {
  switch (lang) {
    case 'python':
      return 'python';
    case 'javascript':
      return 'javascript';
    case 'c':
      return 'c';
    case 'cpp':
      return 'cpp';
    case 'java':
      return 'java';
    default:
      return 'python';
  }
};

export const CodeEditor: React.FC<CodeEditorProps> = ({ onRun, onSave, readOnly = false }) => {
  const sourceCode = useCodingEditorStore((s) => s.sourceCode);
  const setSourceCode = useCodingEditorStore((s) => s.setSourceCode);
  const language = useCodingEditorStore((s) => s.language);
  const settings = useCodingEditorStore((s) => s.editorSettings);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  // Monaco is fetched from a CDN. Without internet access to it the editor would spin forever,
  // so after a failure or 12 s the page switches to a plain text editor that still edits,
  // runs (Ctrl+Enter) and saves (Ctrl+S) the same code.
  const [plainEditor, setPlainEditor] = useState(false);
  useEffect(() => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) setPlainEditor(true);
    }, 12000);
    loader
      .init()
      .then(() => {
        settled = true;
        clearTimeout(timer);
      })
      .catch(() => {
        settled = true;
        clearTimeout(timer);
        setPlainEditor(true);
      });
    return () => clearTimeout(timer);
  }, []);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Keyboard shortcut: Ctrl+Enter / Cmd+Enter => Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun) onRun();
    });

    // Keyboard shortcut: Ctrl+S / Cmd+S => Save Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (onSave) onSave();
    });
  };

  // Returns true only when Monaco has a formatter for the current language (it ships one for
  // JavaScript; Python, C, C++ and Java have none), so the toolbar never claims a no-op succeeded.
  const handleFormatCode = (): boolean => {
    const action = editorRef.current?.getAction('editor.action.formatDocument');
    if (!action || (typeof action.isSupported === 'function' && !action.isSupported())) return false;
    action.run();
    return true;
  };

  // Expose format trigger globally if needed
  useEffect(() => {
    (window as any).__btech_format_code = handleFormatCode;
    return () => {
      delete (window as any).__btech_format_code;
    };
  }, []);

  if (plainEditor) {
    const lines = sourceCode.split('\n').length;
    return (
      <div className="relative w-full h-full min-h-[300px] flex flex-col overflow-hidden bg-slate-900 border border-slate-700/60 rounded-lg">
        <p className="px-3 py-1.5 text-[11px] text-amber-300 bg-amber-900/30 border-b border-amber-900/50" role="status">
          The full code editor could not be loaded (it needs internet access to cdn.jsdelivr.net). Using the plain editor; running and saving work the same.
        </p>
        <div className="flex flex-1 overflow-auto font-mono" style={{ fontSize: settings.fontSize }}>
          <pre aria-hidden="true" className="select-none text-right text-slate-500 px-2 py-3 leading-6 bg-slate-950/60">
            {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
          </pre>
          <textarea
            aria-label={`${language} source code`}
            value={sourceCode}
            readOnly={readOnly}
            spellCheck={false}
            wrap={settings.wordWrap === 'on' ? 'soft' : 'off'}
            onChange={(e) => setSourceCode(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                onRun?.();
              } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
                e.preventDefault();
                onSave?.();
              } else if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                const el = e.currentTarget;
                const pad = ' '.repeat(settings.tabSize || 4);
                const { selectionStart: a, selectionEnd: b } = el;
                const next = sourceCode.slice(0, a) + pad + sourceCode.slice(b);
                setSourceCode(next);
                requestAnimationFrame(() => el.setSelectionRange(a + pad.length, a + pad.length));
              }
            }}
            className="flex-1 bg-transparent text-slate-100 px-3 py-3 leading-6 outline-none resize-none focus-visible:ring-1 focus-visible:ring-blue-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] overflow-hidden bg-slate-900 border border-slate-700/60 rounded-lg shadow-inner">
      <Editor
        height="100%"
        language={mapLanguageToMonaco(language)}
        value={sourceCode}
        theme={settings.theme}
        onChange={(val) => setSourceCode(val || '')}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap,
          minimap: { enabled: settings.minimap },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Consolas, monospace",
          fontLigatures: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          formatOnPaste: true,
          padding: { top: 12, bottom: 12 },
        }}
        loading={
          <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-slate-400 gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono">Initializing Monaco Workspace...</span>
          </div>
        }
      />
    </div>
  );
};
