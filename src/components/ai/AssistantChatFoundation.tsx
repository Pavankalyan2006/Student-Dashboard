import * as React from 'react';
import { Send, StopCircle, RefreshCw, Paperclip, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { AIResponseContainer, AIThinkingIndicator, ToolExecutionCard, AIEmptyState } from './AIComponents';
import { aiApi, AIMessage } from '../../api/ai';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  toolCall?: {
    toolName: string;
    parameters: Record<string, any>;
    result?: any;
    status: 'running' | 'completed' | 'failed';
  };
}

export function AssistantChatFoundation({
  initialPrompt,
  className,
}: {
  initialPrompt?: string;
  className?: string;
}) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState(initialPrompt || '');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isGenerating) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const apiPayload: AIMessage[] = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Simulate step / tool execution if keyword detected
      if (text.toLowerCase().includes('profile') || text.toLowerCase().includes('student')) {
        const assistantMsgId = `msg_ai_${Date.now()}`;
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: "Retrieving verified student academic profile via Tool Registry...",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            toolCall: {
              toolName: 'get_student_profile',
              parameters: {},
              status: 'running',
            },
          },
        ]);

        const toolRes = await aiApi.executeTool('get_student_profile', {});

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: `Here is the current academic record for ${toolRes.result.name}:\n\n` +
                    `- **Branch:** ${toolRes.result.branch}\n` +
                    `- **Semester:** ${toolRes.result.semester}\n` +
                    `- **Account Status:** Active (${toolRes.result.role})`,
                  toolCall: {
                    toolName: 'get_student_profile',
                    parameters: {},
                    result: toolRes.result,
                    status: 'completed',
                  },
                }
              : m
          )
        );
      } else {
        const res = await aiApi.generate(apiPayload, 'student_learning_agent');
        const assistantMsg: ChatMessage = {
          id: `msg_ai_${Date.now()}`,
          role: 'assistant',
          content: res.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Generation failed');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSend(lastUserMsg.content);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden ${className || ''}`}>
      {/* Top status bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900">NEXORA AI Assistant</h4>
            <p className="text-[11px] text-slate-500">AI Provider & Tool Registry Architecture (Phase 1)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessages([])}
              className="h-7 text-xs text-slate-500"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <AIEmptyState onSelectPrompt={(text) => handleSend(text)} />
        ) : (
          messages.map((m) => (
            <div key={m.id} className="space-y-2">
              <AIResponseContainer role={m.role} timestamp={m.timestamp}>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </AIResponseContainer>
              {m.toolCall && (
                <div className="ml-10">
                  <ToolExecutionCard
                    toolName={m.toolCall.toolName}
                    parameters={m.toolCall.parameters}
                    result={m.toolCall.result}
                    status={m.toolCall.status}
                  />
                </div>
              )}
            </div>
          ))
        )}

        {isGenerating && (
          <div className="ml-10">
            <AIThinkingIndicator message="Evaluating query via AIService..." />
          </div>
        )}

        {error && (
          <div className="ml-10 flex items-center justify-between p-3 rounded-lg border border-rose-200 bg-rose-50 text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <span>{error}</span>
            </div>
            <Button variant="danger" size="sm" onClick={handleRetry} className="h-7 px-2">
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input composer */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask a coursework question, algorithm complexity, or engineering concept..."
              rows={2}
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <button
                type="button"
                title="Attach Document (Phase 6 foundation)"
                className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
              >
                <Paperclip className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          {isGenerating ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleStop}
              className="h-10 w-10 text-rose-600 hover:bg-rose-50 shrink-0"
              title="Stop Generation"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="ai"
              size="icon"
              disabled={!input.trim()}
              className="h-10 w-10 shrink-0"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </form>
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="font-mono text-[10px]">ai_stream: v1_ready</span>
        </div>
      </div>
    </div>
  );
}
