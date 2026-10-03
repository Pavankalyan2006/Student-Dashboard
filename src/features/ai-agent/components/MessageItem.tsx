import * as React from 'react';
import {
  Sparkles,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Code2,
} from 'lucide-react';
import { AIMessageRecord } from '../types/ai';
import { MarkdownContent } from '../../../components/content/MarkdownContent';
import { AICitation, ToolExecutionCard, AgentPlanCard } from './RichCards';
import { toast } from 'sonner';

export function MessageItem({
  message,
  onActionClick,
  onSubmitFeedback,
}: {
  message: AIMessageRecord;
  onActionClick: (action: string) => void;
  onSubmitFeedback: (messageId: string, isHelpful: boolean) => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group flex gap-3 p-4 sm:p-5 transition-colors ${
        isAssistant ? 'bg-slate-50/50 border-y border-slate-100/80' : 'bg-white'
      }`}
    >
      {/* Avatar Icon */}
      <div className="shrink-0 mt-1">
        {isAssistant ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-700 font-bold text-xs">
            <User className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Message Content Body */}
      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold text-slate-900">
            {isAssistant ? 'B.Tech AI Learning Assistant' : 'You'}
          </span>
          <span className="text-[11px] tabular-nums">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Multi-step Agent Plan */}
        {message.metadata?.agentPlan && message.metadata.agentPlan.length > 0 && (
          <AgentPlanCard steps={message.metadata.agentPlan} />
        )}

        {/* Executed Tools */}
        {message.metadata?.toolCalls && message.metadata.toolCalls.length > 0 && (
          <div className="space-y-1">
            {message.metadata.toolCalls.map((t) => (
              <ToolExecutionCard key={t.id} tool={t} />
            ))}
          </div>
        )}

        {/* Formatted Markdown with KaTeX */}
        <MarkdownContent content={message.content} />

        {/* Citations */}
        {message.metadata?.citations && message.metadata.citations.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Source:
            </span>
            {message.metadata.citations.map((c) => (
              <AICitation key={c.id} citation={c} />
            ))}
          </div>
        )}

        {/* Contextual Suggested Actions */}
        {message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
          <div className="pt-2 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Suggested Next Actions:
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {message.metadata.suggestedActions.map((act, i) => (
                <button
                  key={i}
                  onClick={() => onActionClick(act)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-semibold text-slate-700 hover:text-indigo-900 transition-all cursor-pointer shadow-2xs group/btn"
                >
                  <span>{act}</span>
                  <ArrowRight className="h-3 w-3 text-slate-400 group-hover/btn:text-indigo-600 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer actions for assistant response */}
        {isAssistant && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 hover:text-slate-700 transition-colors cursor-pointer text-[11px]"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Feedback controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSubmitFeedback(message.id, true)}
                className={`p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer ${
                  message.metadata?.feedback?.is_helpful === true ? 'text-emerald-600 font-bold' : 'hover:text-slate-700'
                }`}
                title="Helpful"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onSubmitFeedback(message.id, false)}
                className={`p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer ${
                  message.metadata?.feedback?.is_helpful === false ? 'text-rose-600 font-bold' : 'hover:text-slate-700'
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
