import * as React from 'react';
import { useDocumentChat, ChatMessage } from '../hooks/useDocumentChat';
import { Document } from '../types/document';
import { CitationList } from './DocumentCitation';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import {
  Sparkles,
  Send,
  RefreshCw,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';
import { copyText } from '../../../lib/clipboard';

export interface DocumentChatProps {
  document: Document;
  currentPage: number;
  selectedPages?: number[];
  onNavigateToPage?: (pageNumber: number) => void;
  className?: string;
}

export function DocumentChat({
  document,
  currentPage,
  selectedPages = [],
  onNavigateToPage,
  className,
}: DocumentChatProps) {
  const { messages, sendMessage, isGenerating, clearChat } = useDocumentChat(document.id);
  const [input, setInput] = React.useState('');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    sendMessage(input, { currentPage, selectedPages });
    setInput('');
  };

  const handleCopy = (id: string, text: string) => {
    copyText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    `Explain Page ${currentPage}`,
    'What are the key concepts here?',
    'Summarize this for an exam',
    'What are the important formulas?',
  ];

  return (
    <div className={cn('flex flex-col h-full bg-white border-l border-slate-200', className)}>
      {/* Header with active page context badge */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="truncate">
            <h3 className="text-xs font-bold text-slate-900 truncate">Document AI Assistant</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="font-medium text-blue-600">Focus: Page {currentPage}</span>
              {selectedPages.length > 0 && (
                <span>· ({selectedPages.length} pages focused)</span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
          title="Clear Chat"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Grounding rule notice */}
      <div className="px-3 py-1.5 bg-blue-50/50 border-b border-blue-100 flex items-center gap-1.5 text-[10px] text-blue-700">
        <Info className="h-3 w-3 shrink-0 text-blue-500" />
        <span className="truncate">
          Answers are strictly grounded in <strong>{document.title}</strong>
        </span>
      </div>

      {/* Message Thread */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={cn('flex flex-col', isUser ? 'items-end' : 'items-start')}
            >
              <div
                className={cn(
                  'rounded-xl p-3 max-w-[92%] leading-relaxed shadow-2xs',
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-xs'
                )}
              >
                {/* Content */}
                <div className="prose prose-slate max-w-none text-xs leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Citations if assistant message */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <CitationList citations={msg.citations} onNavigateToPage={onNavigateToPage} />
                )}

                {/* Message footer buttons */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span className="font-mono">Grounded AI</span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 hover:text-slate-700 rounded transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Follow-up Question Chips */}
              {!isUser && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 max-w-[92%]">
                  {msg.followUpQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(q, { currentPage, selectedPages })}
                      className="text-[10px] text-slate-600 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 rounded-full px-2.5 py-1 transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl max-w-[80%]">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>Searching document and retrieving grounded pages...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto text-[10px]">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => sendMessage(prompt, { currentPage, selectedPages })}
            className="shrink-0 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input composer */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Ask about Page ${currentPage} or the whole document...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isGenerating}
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || isGenerating}
            className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0"
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
