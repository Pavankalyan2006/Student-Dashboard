import * as React from 'react';
import { Copy, Check, Code, Play } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { copyText } from '../../lib/clipboard';

export interface CodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  language?: string;
  readOnly?: boolean;
  filename?: string;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  readOnly = false,
  filename = 'main.ts',
  className,
}: CodeEditorProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    copyText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = value.split('\n');

  return (
    <div className={cn('rounded-xl border border-slate-800 bg-[#0B1530] text-slate-100 overflow-hidden shadow-md', className)}>
      {/* Editor topbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#081024] text-xs">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-[#2563EB]" />
          <span className="font-mono text-slate-300">{filename}</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/80 cursor-pointer transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          {!readOnly && (
            <Button variant="ai" size="sm" className="h-7 text-xs gap-1">
              <Play className="h-3 w-3" />
              <span>Run (Phase 7)</span>
            </Button>
          )}
        </div>
      </div>

      {/* Editor body */}
      <div className="flex font-mono text-xs overflow-x-auto min-h-[160px] p-3">
        {/* Line numbers */}
        <div className="select-none text-slate-600 pr-4 text-right border-r border-slate-800/80 shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>
        {/* Code view / textarea */}
        <div className="pl-4 flex-1">
          {readOnly ? (
            <pre className="text-slate-200 leading-6 font-mono whitespace-pre">{value}</pre>
          ) : (
            <textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              spellCheck={false}
              className="w-full h-full bg-transparent text-slate-200 leading-6 font-mono focus:outline-none resize-none"
              rows={Math.max(6, lines.length)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
