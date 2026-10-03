import * as React from 'react';
import { Sparkles, Bot, Terminal, CheckCircle2, AlertTriangle, ArrowRight, CornerDownLeft, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export function AIButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:brightness-105 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]',
        className
      )}
      {...props}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

export function AIBadge({ label = 'AI Verified', className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50/80 px-2 py-0.5 text-[11px] font-medium text-indigo-700',
        className
      )}
    >
      <Sparkles className="h-3 w-3 text-indigo-600" />
      <span>{label}</span>
    </span>
  );
}

export function AIStatus({
  status = 'ready',
  className,
}: {
  status: 'ready' | 'thinking' | 'streaming' | 'tool_executing' | 'error';
  className?: string;
}) {
  const configs = {
    ready: { label: 'Agent Ready', color: 'bg-emerald-500' },
    thinking: { label: 'Synthesizing...', color: 'bg-indigo-500 animate-pulse' },
    streaming: { label: 'Streaming Response', color: 'bg-blue-500 animate-pulse' },
    tool_executing: { label: 'Executing Tool', color: 'bg-amber-500 animate-ping' },
    error: { label: 'Agent Error', color: 'bg-rose-500' },
  };

  const current = configs[status];

  return (
    <div className={cn('inline-flex items-center gap-2 text-xs text-[#475467]', className)}>
      <span className={cn('h-2 w-2 rounded-full', current.color)} />
      <span className="font-medium">{current.label}</span>
    </div>
  );
}

export function AIActionCard({
  title,
  description,
  actionLabel = 'Run Prompt',
  onClick,
  className,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group cursor-pointer rounded-xl border border-[#E4E7EC] bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-xs',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#4F46E5]" />
            <h4 className="text-xs font-semibold text-[#101828] group-hover:text-[#4F46E5] transition-colors">
              {title}
            </h4>
          </div>
          <p className="text-xs text-[#475467] leading-relaxed line-clamp-2">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#4F46E5] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#667085]">
        <span>Quick Action</span>
        <span className="font-medium text-[#4F46E5]">{actionLabel}</span>
      </div>
    </div>
  );
}

export function AIResponseContainer({
  children,
  role = 'assistant',
  timestamp,
  className,
}: {
  children: React.ReactNode;
  role?: 'assistant' | 'user' | 'system';
  timestamp?: string;
  className?: string;
}) {
  const isAssistant = role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-3 text-sm transition-opacity duration-200',
        isAssistant ? 'bg-indigo-50/20 p-4 rounded-xl border border-indigo-100/60' : 'p-3',
        className
      )}
    >
      <div className="shrink-0 mt-0.5">
        {isAssistant ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-700 font-semibold text-xs">
            U
          </div>
        )}
      </div>
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between text-xs text-[#667085]">
          <span className="font-semibold text-[#101828]">
            {isAssistant ? 'B.Tech AI Agent' : 'You'}
          </span>
          {timestamp && <span className="tabular-nums">{timestamp}</span>}
        </div>
        <div className="text-xs sm:text-sm text-[#101828] leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export function AIThinkingIndicator({ message = 'Synthesizing response...' }: { message?: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900">
      <Loader2 className="h-4 w-4 animate-spin text-[#4F46E5]" />
      <span className="font-medium">{message}</span>
    </div>
  );
}

export function ToolExecutionCard({
  toolName,
  parameters,
  result,
  status = 'completed',
  className,
}: {
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  status?: 'running' | 'completed' | 'failed';
  className?: string;
}) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={cn('rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-slate-600" />
          <span className="font-mono font-semibold text-slate-800">{toolName}</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
            tool call
          </span>
        </div>
        <div className="flex items-center gap-2">
          {status === 'running' && <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />}
          {status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
          {status === 'failed' && <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />}
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
          >
            {expanded ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-200 space-y-2">
          <div>
            <span className="text-[11px] font-medium text-slate-500">Parameters:</span>
            <pre className="mt-1 p-2 rounded bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto">
              {JSON.stringify(parameters, null, 2)}
            </pre>
          </div>
          {result && (
            <div>
              <span className="text-[11px] font-medium text-slate-500">Result:</span>
              <pre className="mt-1 p-2 rounded bg-slate-900 text-emerald-400 text-[11px] font-mono overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AgentStep({
  stepNumber,
  title,
  description,
  status = 'completed',
}: {
  stepNumber: number;
  title: string;
  description: string;
  status?: 'pending' | 'active' | 'completed';
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
          status === 'completed' && 'bg-emerald-100 text-emerald-800',
          status === 'active' && 'bg-[#2563EB] text-white animate-pulse',
          status === 'pending' && 'bg-slate-100 text-slate-500'
        )}
      >
        {status === 'completed' ? '✓' : stepNumber}
      </div>
      <div className="space-y-0.5">
        <h5 className="text-xs font-semibold text-[#101828]">{title}</h5>
        <p className="text-[11px] text-[#475467]">{description}</p>
      </div>
    </div>
  );
}

export function AgentPlan({
  goal,
  steps = [],
}: {
  goal: string;
  steps: { title: string; description: string; status: 'pending' | 'active' | 'completed' }[];
}) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-4 space-y-3 shadow-2xs">
      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-950">
        <Sparkles className="h-4 w-4 text-[#4F46E5]" />
        <span>Agent Plan: {goal}</span>
      </div>
      <div className="space-y-2.5 pl-1">
        {steps.map((s, idx) => (
          <AgentStep
            key={idx}
            stepNumber={idx + 1}
            title={s.title}
            description={s.description}
            status={s.status}
          />
        ))}
      </div>
    </div>
  );
}

export function AIError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-900">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} className="h-7 px-2.5 text-xs">
          Retry
        </Button>
      )}
    </div>
  );
}

export function AIEmptyState({ onSelectPrompt }: { onSelectPrompt?: (text: string) => void }) {
  const suggestions = [
    'Explain the Time & Space Complexity of AVL Rotations',
    'Summarize Virtual Memory Paging with Inverted Page Tables',
    'Generate an Engineering Capstone Architecture for Multi-Agent Systems',
    'Explain Dijkstra Algorithm vs Bellman-Ford for negative weights',
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-sm mb-4">
        <Bot className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-[#101828] mb-1">
        B.Tech AI Learning Agent
      </h3>
      <p className="text-xs text-[#475467] leading-relaxed mb-6">
        Ask any algorithmic concept, coursework question, syllabus breakdown, or engineering lab query.
      </p>
      <div className="w-full space-y-2">
        <div className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider text-left">
          Suggested Engineering Prompts
        </div>
        {suggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt?.(prompt)}
            className="w-full flex items-center justify-between p-2.5 rounded-lg border border-[#E4E7EC] bg-white text-left text-xs text-[#101828] hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group"
          >
            <span className="truncate pr-2">{prompt}</span>
            <CornerDownLeft className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
