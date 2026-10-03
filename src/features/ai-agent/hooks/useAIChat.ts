import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { conversationApi } from '../api/conversationApi';
import { AIMessageRecord, ToolExecutionSummary, AgentPlanItem } from '../types/ai';
import { toast } from 'sonner';

export function useAIChat(
  conversationId?: string,
  onAutoSelectConversation?: (newId: string) => void
) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = React.useState<AIMessageRecord[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [streamingContent, setStreamingContent] = React.useState('');
  const [activeTool, setActiveTool] = React.useState<ToolExecutionSummary | null>(null);
  const [activePlan, setActivePlan] = React.useState<AgentPlanItem[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Load message history when conversation changes
  const { data: convData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['ai-conversation', conversationId],
    queryFn: () => (conversationId ? conversationApi.getConversation(conversationId) : null),
    enabled: !!conversationId,
  });

  React.useEffect(() => {
    if (convData?.messages) {
      setMessages(convData.messages);
    } else if (!conversationId) {
      setMessages([]);
    }
    setError(null);
    setStreamingContent('');
    setActiveTool(null);
    setActivePlan(null);
  }, [convData, conversationId]);

  const sendMessage = async (text: string, mode?: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    setError(null);
    setIsGenerating(true);
    setStreamingContent('');
    setActiveTool(null);
    setActivePlan(null);

    // Optimistic user message
    const tempUserMsg: AIMessageRecord = {
      id: `msg_user_${Date.now()}`,
      conversation_id: conversationId || 'new',
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message: trimmed,
          context: { mode: mode || 'AUTO' },
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Chat error (${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Streaming not supported by browser stream');
      }

      let currentAssistedContent = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'message';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.replace('event: ', '').trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);

              if (currentEvent === 'agent_plan') {
                setActivePlan(parsed.steps);
              } else if (currentEvent === 'tool_start') {
                setActiveTool({
                  id: `tool_${Date.now()}`,
                  tool_name: parsed.toolName,
                  status: 'running',
                  parameters: parsed.parameters,
                });
              } else if (currentEvent === 'tool_result') {
                setActiveTool((prev) =>
                  prev ? { ...prev, status: 'completed', result: parsed.result } : null
                );
              } else if (currentEvent === 'message_delta') {
                currentAssistedContent += parsed.delta;
                setStreamingContent(currentAssistedContent);
              } else if (currentEvent === 'message_complete') {
                const completeMsg: AIMessageRecord = parsed.message;
                setMessages((prev) => [...prev, completeMsg]);
                setStreamingContent('');
                setActiveTool(null);
                setActivePlan(null);

                // Auto select new conversation if one was created
                if (parsed.conversationId && parsed.conversationId !== conversationId) {
                  onAutoSelectConversation?.(parsed.conversationId);
                }

                queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
              } else if (currentEvent === 'error') {
                setError(parsed.message || 'Error executing assistant response');
              }
            } catch {
              // Ignore non-json lines
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast.info('Generation stopped');
      } else {
        setError(err.message || 'Failed to communicate with AI Agent');
        toast.error('AI response error');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      if (streamingContent) {
        // Append partial content
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_partial_${Date.now()}`,
            conversation_id: conversationId || 'new',
            role: 'assistant',
            content: streamingContent + ' [Generation stopped]',
            created_at: new Date().toISOString(),
          },
        ]);
        setStreamingContent('');
      }
    }
  };

  const retryLastMessage = () => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      // Remove trailing failed messages
      setMessages((prev) => prev.slice(0, prev.lastIndexOf(lastUserMessage)));
      sendMessage(lastUserMessage.content);
    }
  };

  const submitFeedback = async (messageId: string, isHelpful: boolean, reason?: string) => {
    try {
      await conversationApi.submitFeedback(messageId, isHelpful, reason);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, metadata: { ...m.metadata, feedback: { is_helpful: isHelpful, reason } } }
            : m
        )
      );
      toast.success(isHelpful ? 'Feedback recorded! Thank you.' : 'Feedback recorded. We will improve.');
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  return {
    messages,
    isGenerating,
    streamingContent,
    activeTool,
    activePlan,
    error,
    isLoadingHistory,
    sendMessage,
    stopGeneration,
    retryLastMessage,
    submitFeedback,
  };
}
