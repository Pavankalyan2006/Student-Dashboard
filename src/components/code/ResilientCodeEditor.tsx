// Monaco editor with a plain-textarea fallback. Monaco is served from this site's own bundle
// (src/lib/monacoSetup.ts); if it still cannot load, students get a plain editor instead of a spinner.
import React from 'react';
import Editor, { EditorProps } from '@monaco-editor/react';
import { useMonacoAvailability } from '../../lib/monacoSetup';

export { useMonacoAvailability };

interface Props extends EditorProps {
  ariaLabel?: string;
  onRunShortcut?: () => void;
}

export function ResilientCodeEditor({ ariaLabel, onRunShortcut, ...props }: Props) {
  const state = useMonacoAvailability();
  if (state === 'ready') return <Editor {...props} />;
  if (state === 'loading')
    return (
      <div className="flex items-center justify-center bg-slate-900 rounded-lg text-xs text-slate-400" style={{ height: props.height || 360 }} role="status">
        Loading editor…
      </div>
    );
  const value = props.value ?? '';
  const lines = value.split('\n').length;
  return (
    <div className="flex flex-col bg-slate-900 rounded-lg overflow-hidden" style={{ height: props.height || 360 }}>
      <p className="px-3 py-1.5 text-[11px] text-amber-300 bg-amber-900/30" role="status">
        The full code editor could not be loaded. Using the plain editor.
      </p>
      <div className="flex flex-1 overflow-auto font-mono text-[13px]">
        <pre aria-hidden="true" className="select-none text-right text-slate-500 px-2 py-3 leading-6 bg-slate-950/60">
          {Array.from({ length: lines }, (_, i) => i + 1).join('\n')}
        </pre>
        <textarea
          aria-label={ariaLabel || `${props.language || 'code'} editor`}
          value={value}
          readOnly={!!props.options?.readOnly}
          spellCheck={false}
          wrap="off"
          onChange={(e) => props.onChange?.(e.target.value, undefined as any)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              onRunShortcut?.();
            } else if (e.key === 'Tab' && !e.shiftKey) {
              e.preventDefault();
              const el = e.currentTarget;
              const { selectionStart: a, selectionEnd: b } = el;
              const next = value.slice(0, a) + '    ' + value.slice(b);
              props.onChange?.(next, undefined as any);
              requestAnimationFrame(() => el.setSelectionRange(a + 4, a + 4));
            }
          }}
          className="flex-1 bg-transparent text-slate-100 px-3 py-3 leading-6 outline-none resize-none focus-visible:ring-1 focus-visible:ring-blue-500"
        />
      </div>
    </div>
  );
}
