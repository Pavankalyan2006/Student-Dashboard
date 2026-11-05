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
  Layers,
  HelpCircle,
  FilePlus,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { AIMessageRecord } from '../types/ai';
import { MarkdownContent } from '../../../components/content/MarkdownContent';
import { AICitation, ToolExecutionCard, AgentPlanCard } from './RichCards';
import { conversationApi } from '../api/conversationApi';
import { toast } from 'sonner';

export function MessageItem({
  message,
  onActionClick,
  onSubmitFeedback,
  onNavigate,
}: {
  message: AIMessageRecord;
  onActionClick: (action: string) => void;
  onSubmitFeedback: (messageId: string, isHelpful: boolean, reason?: string) => void;
  onNavigate?: (path: string) => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const [isSavingNote, setIsSavingNote] = React.useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = React.useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = React.useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);

  const isAssistant = message.role === 'assistant';
  const hasCode = message.content.includes('```');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Response copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToNotes = async () => {
    try {
      setIsSavingNote(true);
      const firstLine = message.content.split('\n')[0].replace(/[#*`]/g, '').trim();
      const title = firstLine.slice(0, 50) || 'AI Tutor Study Note';
      await conversationApi.generateNote({
        title,
        content: message.content,
        topic: 'AI Academic Tutoring',
      });
      toast.success('Saved to Notes module successfully!');
    } catch {
      toast.error('Failed to save to Notes');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    try {
      setIsGeneratingFlashcards(true);
      const firstLine = message.content.split('\n')[0].replace(/[#*`]/g, '').trim();
      const topic = firstLine.slice(0, 40) || 'Engineering Concept';
      await conversationApi.generateFlashcards({ topic, source_text: message.content });
      toast.success(`Flashcard deck created for "${topic}"`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate flashcards');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setIsGeneratingQuiz(true);
      const firstLine = message.content.split('\n')[0].replace(/[#*`]/g, '').trim();
      const topic = firstLine.slice(0, 40) || 'Engineering Concept';
      await conversationApi.generateQuiz({ topic, question_count: 3 });
      toast.success(`Practice quiz generated for "${topic}"!`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate quiz');
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const feedbackReasons = [
    'Needs more detail',
    'Explanation too difficult',
    'Incorrect answer',
    'Source mismatch',
    'Formatting issues',
  ];

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
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              {isAssistant ? 'AI Academic Tutor' : 'You'}
            </span>
          </div>
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

        {/* Formatted Markdown with KaTeX & Syntax-highlighted code */}
        <div className="text-slate-800 leading-relaxed text-xs sm:text-sm">
          <MarkdownContent content={message.content} />
        </div>

        {/* Source Citations */}
        {message.metadata?.citations && message.metadata.citations.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Grounding Citations:
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

        {/* Assistant Action Ribbon */}
        {isAssistant && (
          <div className="pt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-t border-slate-100">
            {/* Learning module action buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                title="Copy entire response"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingFlashcards}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-[11px] font-medium transition-colors cursor-pointer"
                title="Create active recall flashcard deck"
              >
                {isGeneratingFlashcards ? <Loader2 className="h-3 w-3 animate-spin" /> : <Layers className="h-3 w-3" />}
                <span>Flashcards</span>
              </button>

              <button
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-amber-200 hover:bg-amber-50 text-amber-700 text-[11px] font-medium transition-colors cursor-pointer"
                title="Create practice quiz from this topic"
              >
                {isGeneratingQuiz ? <Loader2 className="h-3 w-3 animate-spin" /> : <HelpCircle className="h-3 w-3" />}
                <span>Create Quiz</span>
              </button>

              <button
                onClick={handleSaveToNotes}
                disabled={isSavingNote}
                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-[11px] font-medium transition-colors cursor-pointer"
                title="Save explanation into personal study notes"
              >
                {isSavingNote ? <Loader2 className="h-3 w-3 animate-spin" /> : <FilePlus className="h-3 w-3" />}
                <span>Save to Notes</span>
              </button>

              {hasCode && (
                <button
                  onClick={() => onNavigate?.('/placements/coding')}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 border border-blue-200 hover:bg-blue-100 text-[#2563EB] text-[11px] font-semibold transition-colors cursor-pointer"
                  title="Open in isolated Coding Lab"
                >
                  <Code2 className="h-3 w-3" />
                  <span>Open in Coding Lab</span>
                </button>
              )}
            </div>

            {/* Feedback controls */}
            <div className="flex items-center gap-1 shrink-0 relative">
              <button
                onClick={() => onSubmitFeedback(message.id, true)}
                className={`p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer ${
                  message.metadata?.feedback?.is_helpful === true ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Helpful explanation"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  if (message.metadata?.feedback?.is_helpful === false) {
                    onSubmitFeedback(message.id, false);
                  } else {
                    setShowFeedbackModal(!showFeedbackModal);
                  }
                }}
                className={`p-1 rounded hover:bg-slate-200/60 transition-colors cursor-pointer ${
                  message.metadata?.feedback?.is_helpful === false ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Not helpful"
              >
                <ThumbsDown className="h-3.5 w-3.5" />
              </button>

              {/* Feedback reason dropdown */}
              {showFeedbackModal && (
                <div className="absolute right-0 bottom-full mb-1 z-20 w-48 bg-white rounded-xl border border-slate-200 shadow-xl p-2 space-y-1 text-left">
                  <p className="text-[10px] font-bold text-slate-600 px-1">How can we improve?</p>
                  {feedbackReasons.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => {
                        onSubmitFeedback(message.id, false, reason);
                        setShowFeedbackModal(false);
                      }}
                      className="w-full text-left px-2 py-1 text-[11px] text-slate-700 hover:bg-rose-50 hover:text-rose-900 rounded transition-colors cursor-pointer"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
