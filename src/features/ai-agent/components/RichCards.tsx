import * as React from 'react';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  HelpCircle,
  Clock,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { AICitationItem, AgentPlanItem, ToolExecutionSummary } from '../types/ai';

export function AICitation({ citation }: { citation: AICitationItem }) {
  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-700 shadow-2xs hover:border-blue-300 transition-colors">
      <FileText className="h-3 w-3 text-[#2563EB] shrink-0" />
      <span className="font-semibold text-slate-900">{citation.title}</span>
      {citation.page && <span className="text-slate-500">p. {citation.page}</span>}
      {citation.link && (
        <a
          href={citation.link}
          className="text-[#2563EB] hover:underline flex items-center gap-0.5 ml-1"
        >
          <span>View</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}
    </div>
  );
}

export function ConfirmationCard({
  title,
  description,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-3 text-xs text-amber-950">
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-900">{title}</h4>
          <p className="text-amber-800 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs">
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={onConfirm} className="h-7 text-xs bg-amber-600 hover:bg-amber-700">
          Confirm Action
        </Button>
      </div>
    </div>
  );
}

export function ToolExecutionCard({ tool }: { tool: ToolExecutionSummary }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="my-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs space-y-1.5 shadow-2xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-[#2563EB]" />
          <span className="font-mono font-bold text-slate-800">{tool.tool_name}</span>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
              tool.status === 'completed'
                ? 'bg-emerald-100 text-emerald-800'
                : tool.status === 'running'
                ? 'bg-blue-100 text-blue-800 animate-pulse'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {tool.status}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-semibold text-[#2563EB] hover:underline cursor-pointer"
        >
          {expanded ? 'Hide Details' : 'View Payload'}
        </button>
      </div>

      {expanded && (
        <div className="pt-2 border-t border-slate-200 space-y-2 text-[11px]">
          <div>
            <span className="font-semibold text-slate-600">Parameters:</span>
            <pre className="mt-1 p-2 rounded-lg bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto">
              {JSON.stringify(tool.parameters, null, 2)}
            </pre>
          </div>
          {tool.result && (
            <div>
              <span className="font-semibold text-slate-600">Verified Output:</span>
              <pre className="mt-1 p-2 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto">
                {JSON.stringify(tool.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AgentPlanCard({ steps }: { steps: AgentPlanItem[] }) {
  return (
    <div className="my-2 p-3.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/50 to-blue-50/30 space-y-2 text-xs">
      <div className="flex items-center justify-between font-bold text-indigo-950">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#4F46E5]" />
          <span>Multi-Agent Orchestration Plan</span>
        </div>
        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
          {steps.filter((s) => s.status === 'completed').length} / {steps.length} Steps
        </span>
      </div>
      <div className="space-y-2 pl-1">
        {steps.map((st) => {
          const match = st.title.match(/^\[(.*?)\]\s*(.*)$/);
          const agentTag = match ? match[1] : null;
          const cleanTitle = match ? match[2] : st.title;

          return (
            <div key={st.step} className="flex items-start gap-2.5 text-[11px]">
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  st.status === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : st.status === 'in_progress'
                    ? 'bg-[#2563EB] text-white animate-pulse'
                    : st.status === 'failed'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
                aria-label={st.status === 'failed' ? 'Not run' : st.status === 'completed' ? 'Done' : undefined}
              >
                {st.status === 'completed' ? '✓' : st.status === 'failed' ? '✕' : st.step}
              </span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {agentTag && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-100/90 text-indigo-800 font-mono text-[9px] font-bold border border-indigo-200">
                      {agentTag}
                    </span>
                  )}
                  <span className="font-semibold text-slate-900">{cleanTitle}</span>
                </div>
                <p className="text-slate-500">{st.description}</p>
                {st.status === 'failed' && st.note && <p className="text-rose-700">{st.note}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
