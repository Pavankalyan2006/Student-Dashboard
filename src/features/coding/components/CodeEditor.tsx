import React, { useRef, useEffect } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
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

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  // Expose format trigger globally if needed
  useEffect(() => {
    (window as any).__btech_format_code = handleFormatCode;
    return () => {
      delete (window as any).__btech_format_code;
    };
  }, []);

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
