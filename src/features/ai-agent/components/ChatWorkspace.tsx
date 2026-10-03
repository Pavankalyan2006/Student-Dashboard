import * as React from 'react';
import {
  Sparkles,
  Bot,
  PanelLeft,
  PanelRight,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Terminal,
} from 'lucide-react';
import { AIMessageRecord, ToolExecutionSummary, AgentPlanItem } from '../types/ai';
import { MessageItem } from './MessageItem';
import { AIComposer } from './AIComposer';
import { AgentPlanCard, ToolExecutionCard } from './RichCards';
import { MarkdownContent } from '../../../components/content/MarkdownContent';

export function ChatWorkspace({
  conversationTitle = 'New Learning Session',
  messages,
  isGenerating,
  streamingContent,
  activeTool,
  activePlan,
  error,
  input,
  setInput,
  onSend,
  onStop,
  onRetry,
  onSelectPrompt,
  onSubmitFeedback,
  onToggleHistory,
  onToggleContext,
}: {
  conversationTitle?: string;
  messages: AIMessageRecord[];
  isGenerating: boolean;
  streamingContent: string;
  activeTool: ToolExecutionSummary | null;
  activePlan: AgentPlanItem[] | null;
  error: string | null;
  input: string;
  setInput: (val: string) => void;
  onSend: (text?: string, mode?: string) => void;
  onStop: () => void;
  onRetry: () => void;
  onSelectPrompt: (prompt: string) => void;
  onSubmitFeedback: (messageId: string, isHelpful: boolean) => void;
  onToggleHistory?: () => void;
  onToggleContext?: () => void;
}) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, activeTool, isGenerating]);

  const starterPrompts = [
    {
      title: 'Explain Binary Search Tree Invariants',
      desc: 'Understand AVL rotations, height balance factors, and time complexity proofs.',
      prompt: 'Explain Binary Search Trees and how AVL tree balancing rotations work for my DAA exam.',
    },
    {
      title: 'Analyze Operating Systems Virtual Memory',
      desc: 'Compare multi-level paging with inverted page tables in 64-bit systems.',
      prompt: 'Why do modern 64-bit architectures use inverted page tables instead of standard hierarchical paging?',
    },
    {
      title: 'Check Weak DSA Topics & Practice Plan',
      desc: 'Evaluate my current progress and generate a 3-step targeted practice routine.',
      prompt: 'Analyze my weak DSA topics and generate a targeted practice plan for this week.',
    },
    {
      title: 'Review Capstone System Architecture',
      desc: 'Verify microservice separation, database schemas, and API throughput.',
      prompt: 'Review my B.Tech capstone architecture and recommend the database indexing strategy for high throughput.',
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {/* Top Workspace Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E4E7EC] bg-white/95 backdrop-blur-xs z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          {onToggleHistory && (
            <button
              onClick={onToggleHistory}
              title="Toggle Conversation History"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 md:hidden cursor-pointer"
            >
              <PanelLeft className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2563EB] text-white shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              {conversationTitle}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            gemini-3.8-flash
          </span>

          {onToggleContext && (
            <button
              onClick={onToggleContext}
              title="Toggle Learning Context"
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Messages Viewport */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty Starter State */
          <div className="p-6 sm:p-10 max-w-2xl mx-auto flex flex-col items-center text-center space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-md">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                How can I help you learn today?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
                I am your autonomous B.Tech learning agent. I can explain complex coursework, query your curriculum syllabus, analyze your code, and generate diagnostic quizzes.
              </p>
            </div>

            {/* Suggested Starter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-2">
              {starterPrompts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt(s.prompt)}
                  className="p-3.5 rounded-xl border border-[#E4E7EC] bg-slate-50/50 hover:bg-white hover:border-[#2563EB] hover:shadow-xs transition-all text-left space-y-1 cursor-pointer group"
                >
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {s.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Render History Messages */
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onActionClick={onSelectPrompt}
                onSubmitFeedback={onSubmitFeedback}
              />
            ))}
          </div>
        )}

        {/* Live Streaming Content Accumulator */}
        {isGenerating && (
          <div className="p-4 sm:p-5 bg-slate-50/50 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">B.Tech AI Learning Assistant</span>
            </div>

            {/* Active multi-step plan */}
            {activePlan && <AgentPlanCard steps={activePlan} />}

            {/* Active tool execution */}
            {activeTool && <ToolExecutionCard tool={activeTool} />}

            {/* Streaming markdown text */}
            {streamingContent ? (
              <div className="text-xs sm:text-sm text-slate-900 leading-relaxed">
                <MarkdownContent content={streamingContent} />
                <span className="inline-block h-3.5 w-1.5 ml-1 bg-[#2563EB] animate-pulse align-middle" />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                <span>Evaluating intent &amp; consulting Tool Registry...</span>
              </div>
            )}
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="m-4 p-3 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={onRetry}
              className="flex items-center gap-1 font-semibold text-rose-800 hover:underline cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Composer */}
      <AIComposer
        input={input}
        setInput={setInput}
        isGenerating={isGenerating}
        onSend={(txt, mode) => onSend(txt || input, mode)}
        onStop={onStop}
        onSelectPrompt={onSelectPrompt}
      />
    </div>
  );
}
