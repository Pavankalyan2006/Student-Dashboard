import * as React from 'react';
import {
  Sparkles,
  Bot,
  PanelLeft,
  PanelRight,
  RefreshCw,
  AlertTriangle,
  Loader2,
  BookOpen,
  GraduationCap,
  Layers,
  HelpCircle,
  Code2,
  FileText,
  BrainCircuit,
  Calculator,
} from 'lucide-react';
import { AIMessageRecord, ToolExecutionSummary, AgentPlanItem, SelectedTutorContext } from '../types/ai';
import { MessageItem } from './MessageItem';
import { AIComposer } from './AIComposer';
import { AgentPlanCard, ToolExecutionCard } from './RichCards';
import { MarkdownContent } from '../../../components/content/MarkdownContent';
import { useAIContext } from '../hooks/useAIContext';

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
  selectedContext,
  onContextChange,
  onSend,
  onStop,
  onRetry,
  onSelectPrompt,
  onSubmitFeedback,
  onToggleHistory,
  onToggleContext,
  onNavigate,
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
  selectedContext: SelectedTutorContext;
  onContextChange: (ctx: SelectedTutorContext) => void;
  onSend: (text?: string, mode?: string) => void;
  onStop: () => void;
  onRetry: () => void;
  onSelectPrompt: (prompt: string, mode?: string) => void;
  onSubmitFeedback: (messageId: string, isHelpful: boolean, reason?: string) => void;
  onToggleHistory?: () => void;
  onToggleContext?: () => void;
  onNavigate?: (path: string) => void;
}) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { data: studentContext } = useAIContext();

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent, activeTool, isGenerating]);

  const studentName = studentContext?.student?.name;
  const branchName = studentContext?.student?.branch || 'Engineering';
  const semesterNum = studentContext?.student?.semester;

  // 10 real quick-start actions conforming to Section 4
  const quickStartActions = [
    {
      title: 'Explain a Concept',
      desc: 'Intuitive analogies, mathematical formulations, and practical applications.',
      icon: <BrainCircuit className="h-4 w-4 text-[#2563EB]" />,
      prompt: 'Explain the core principles, mathematical formulation, and practical applications of AVL Tree rotations.',
      mode: 'EXPLAIN',
    },
    {
      title: 'Solve a Question Step by Step',
      desc: 'Systematic solution with intermediate equations and verification.',
      icon: <Calculator className="h-4 w-4 text-emerald-600" />,
      prompt: 'Help me solve this problem step-by-step: Compute Effective Memory Access Time (EMAT) given TLB hit ratio of 95%, TLB search time 20ns, and main memory access 100ns.',
      mode: 'SOLVE',
    },
    {
      title: 'Teach Me a Topic',
      desc: 'Socratic staged breakdown with understanding-check questions.',
      icon: <BookOpen className="h-4 w-4 text-purple-600" />,
      prompt: 'Teach me Dynamic Programming from scratch using the 4-step framework, starting with stage 1.',
      mode: 'STEP_BY_STEP',
    },
    {
      title: 'Explain My Notes',
      desc: 'Deconstruct verified definitions and high-yield formulas from notes.',
      icon: <FileText className="h-4 w-4 text-amber-600" />,
      prompt: 'Review my uploaded study notes on Database Normalization and explain why BCNF does not always preserve functional dependencies.',
      mode: 'EXPLAIN',
    },
    {
      title: 'Ask Questions About a Document',
      desc: 'Query textbook excerpts and curriculum syllabus with exact citations.',
      icon: <BookOpen className="h-4 w-4 text-indigo-600" />,
      prompt: 'Based on my curriculum textbook, what are the 4 simultaneous conditions required for Deadlock and how does Banker’s Algorithm prevent them?',
      mode: 'EXPLAIN',
    },
    {
      title: 'Help Me Understand Code',
      desc: 'Line-by-line inspection, bug detection, and Big-O analysis.',
      icon: <Code2 className="h-4 w-4 text-blue-600" />,
      prompt: 'Explain this Python code, identify any boundary or edge case bugs, and determine asymptotic time and space complexity:\n\ndef binary_search(arr, target):\n    low, high = 0, len(arr)\n    while low < high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid\n    return -1',
      mode: 'CODING',
    },
    {
      title: 'Prepare Me for an Exam',
      desc: 'High-yield university question patterns and marks-weighted topics.',
      icon: <GraduationCap className="h-4 w-4 text-rose-600" />,
      prompt: 'Prepare me for my upcoming Operating Systems semester exam. Highlight the highest marks-weightage topics and formulate a model 10-mark answer on Virtual Memory.',
      mode: 'EXAM_PREP',
    },
    {
      title: 'Generate Practice Questions',
      desc: 'Diagnostic multiple-choice and short-answer assessment items.',
      icon: <HelpCircle className="h-4 w-4 text-amber-600" />,
      prompt: 'Generate 4 rigorous diagnostic multiple-choice questions on Process Synchronization and Semaphores with detailed explanations.',
      mode: 'EXAM_PREP',
    },
    {
      title: 'Revise a Chapter',
      desc: 'Active recall summary, cheat sheet, and formula recap.',
      icon: <Layers className="h-4 w-4 text-teal-600" />,
      prompt: 'Give me a rapid active recall revision cheat sheet for Computer Networks Transport Layer, including TCP vs UDP header fields and 3-way handshake invariants.',
      mode: 'REVISION',
    },
    {
      title: 'Continue My Previous Session',
      desc: 'Resume your prior learning context with retrieval drills.',
      icon: <Sparkles className="h-4 w-4 text-[#4F46E5]" />,
      prompt: 'Review the key concepts from our previous learning session and test my retention with 2 quick comprehension questions.',
      mode: 'REVISION',
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
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shrink-0 shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {conversationTitle}
              </h2>
              {selectedContext.courseName && (
                <span className="text-[10px] text-blue-600 font-semibold truncate block">
                  Course: {selectedContext.courseName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            {selectedContext.mode || 'Explain'} Mode
          </span>

          <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            gemini-2.5-flash
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
          /* Personalized Welcome Experience */
          <div className="p-4 sm:p-8 max-w-3xl mx-auto flex flex-col items-center text-center space-y-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-md">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                {studentName
                  ? `Hi ${studentName}! What would you like to learn today?`
                  : 'Hi! What would you like to learn today?'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg leading-relaxed">
                I am your personal AI Academic Teaching Assistant for{' '}
                <span className="font-semibold text-slate-800">{branchName}</span>
                {semesterNum ? ` (Semester ${semesterNum})` : ''}. I can explain difficult concepts,
                solve questions step-by-step, teach you sequentially, and prepare you for exams.
              </p>

              {/* Student Context Badges */}
              {studentContext?.student && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    B.Tech {branchName}
                  </span>
                  {semesterNum && (
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Semester {semesterNum}
                    </span>
                  )}
                  {studentContext.weak_areas && studentContext.weak_areas.length > 0 && (
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Focus: {studentContext.weak_areas[0]}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 10 Quick-Start Interactive Actions */}
            <div className="w-full text-left pt-2 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Quick-Start Learning Actions:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {quickStartActions.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onContextChange({ ...selectedContext, mode: act.mode });
                      onSelectPrompt(act.prompt, act.mode);
                    }}
                    className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-[#2563EB] hover:shadow-xs transition-all text-left space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs group-hover:border-blue-300">
                        {act.icon}
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                        {act.title}
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 pl-8">
                      {act.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Render History Messages */
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onActionClick={(action) => onSelectPrompt(action, selectedContext.mode)}
                onSubmitFeedback={onSubmitFeedback}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}

        {/* Live Streaming Content Accumulator */}
        {isGenerating && (
          <div className="p-4 sm:p-5 bg-slate-50/60 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-2xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900">AI Academic Tutor</span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                Synthesizing pedagogical response...
              </span>
            </div>

            {/* Active multi-step plan */}
            {activePlan && <AgentPlanCard steps={activePlan} />}

            {/* Active tool execution */}
            {activeTool && <ToolExecutionCard tool={activeTool} />}

            {/* Streaming markdown text with KaTeX formulas */}
            {streamingContent ? (
              <div className="text-xs sm:text-sm text-slate-900 leading-relaxed">
                <MarkdownContent content={streamingContent} />
                <span className="inline-block h-3.5 w-1.5 ml-1 bg-[#2563EB] animate-pulse align-middle" />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                <span>Consulting curriculum syllabus &amp; computing proof invariants...</span>
              </div>
            )}
          </div>
        )}

        {/* Error notification banner */}
        {error && (
          <div className="m-4 p-3 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-between text-xs text-rose-900 shadow-2xs">
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
        activeMode={selectedContext.mode || 'EXPLAIN'}
        onModeChange={(newMode) => onContextChange({ ...selectedContext, mode: newMode })}
        onSend={(txt, mode) => onSend(txt || input, mode)}
        onStop={onStop}
        onSelectPrompt={(p) => onSelectPrompt(p, selectedContext.mode)}
      />
    </div>
  );
}
