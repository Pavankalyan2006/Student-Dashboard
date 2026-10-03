import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { documentsApi } from '../api/documentsApi';
import { DocumentCitation, DocumentChatResponse } from '../types/document';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: DocumentCitation[];
  confidence?: 'grounded' | 'partially_grounded' | 'not_found';
  followUpQuestions?: string[];
  timestamp: string;
}

export function useDocumentChat(documentId: string, initialConversationId?: string) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your AI Study Assistant for this document. You can ask me questions about specific pages, request summaries, or ask for exam-oriented explanations grounded in this text.`,
      timestamp: new Date().toISOString(),
      followUpQuestions: [
        'What is this document about?',
        'Explain the core concepts on this page',
        'What are the key exam points?',
      ],
    },
  ]);
  const [conversationId, setConversationId] = React.useState<string | undefined>(
    initialConversationId
  );

  const chatMutation = useMutation({
    mutationFn: (params: {
      question: string;
      currentPage?: number;
      selectedPages?: number[];
    }) =>
      documentsApi.chat(documentId, {
        question: params.question,
        current_page: params.currentPage,
        selected_pages: params.selectedPages,
        conversation_id: conversationId,
      }),
    onMutate: async (params) => {
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: params.question,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
    },
    onSuccess: (data: DocumentChatResponse) => {
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const assistantMsg: ChatMessage = {
        id: data.message_id || `asst_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
        confidence: data.confidence,
        followUpQuestions: data.follow_up_questions,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to get AI answer from document');
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error while searching the document: ${err.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const sendMessage = (
    question: string,
    options?: { currentPage?: number; selectedPages?: number[] }
  ) => {
    if (!question.trim() || chatMutation.isPending) return;
    chatMutation.mutate({
      question: question.trim(),
      currentPage: options?.currentPage,
      selectedPages: options?.selectedPages,
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: `Chat history reset. How can I help you learn from this document?`,
        timestamp: new Date().toISOString(),
        followUpQuestions: [
          'Summarize this document',
          'Explain the key formulas',
          'Generate study notes',
        ],
      },
    ]);
  };

  return {
    messages,
    sendMessage,
    isGenerating: chatMutation.isPending,
    clearChat,
    conversationId,
  };
}
