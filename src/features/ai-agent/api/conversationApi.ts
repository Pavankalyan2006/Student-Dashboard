import { apiClient } from '../../../api/client';
import {
  AIConversation,
  AIMessageRecord,
  StudentLearningContext,
  AITutorContextOptions,
  SelectedTutorContext,
} from '../types/ai';

export const conversationApi = {
  getConversations: async (): Promise<AIConversation[]> => {
    return apiClient.get<AIConversation[]>('/ai/conversations');
  },

  createConversation: async (title?: string): Promise<AIConversation> => {
    return apiClient.post<AIConversation>('/ai/conversations', { title });
  },

  getConversation: async (
    id: string
  ): Promise<{ conversation: AIConversation; messages: AIMessageRecord[] }> => {
    return apiClient.get<{ conversation: AIConversation; messages: AIMessageRecord[] }>(
      `/ai/conversations/${id}`
    );
  },

  updateConversation: async (
    id: string,
    updates: Partial<AIConversation>
  ): Promise<AIConversation> => {
    return apiClient.patch<AIConversation>(`/ai/conversations/${id}`, updates);
  },

  deleteConversation: async (id: string): Promise<{ id: string; deleted: boolean }> => {
    return apiClient.delete<{ id: string; deleted: boolean }>(`/ai/conversations/${id}`);
  },

  searchConversations: async (query: string): Promise<AIConversation[]> => {
    return apiClient.get<AIConversation[]>(`/ai/conversations/search?q=${encodeURIComponent(query)}`);
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    attachments?: any[]
  ): Promise<{ userMessage: AIMessageRecord; assistantMessage: AIMessageRecord }> => {
    return apiClient.post(`/ai/conversations/${conversationId}/messages`, {
      content,
      attachments,
    });
  },

  submitFeedback: async (messageId: string, isHelpful: boolean, reason?: string) => {
    return apiClient.post(`/ai/messages/${messageId}/feedback`, {
      is_helpful: isHelpful,
      reason,
    });
  },

  getLearningContext: async (): Promise<StudentLearningContext> => {
    return apiClient.get<StudentLearningContext>('/ai/context');
  },

  getTutorContextOptions: async (): Promise<AITutorContextOptions> => {
    return apiClient.get<AITutorContextOptions>('/ai/tutor/context-options');
  },

  generateFlashcards: async (data: {
    topic: string;
    subject?: string;
    cards?: { front: string; back: string; topic?: string }[];
    course_id?: string;
  }) => {
    return apiClient.post('/ai/tutor/generate-flashcards', data);
  },

  generateQuiz: async (data: {
    topic: string;
    difficulty?: string;
    question_count?: number;
    course_id?: string;
  }) => {
    return apiClient.post('/ai/tutor/generate-quiz', data);
  },

  generateNote: async (data: {
    title: string;
    content: string;
    topic?: string;
    course_id?: string;
  }) => {
    return apiClient.post('/ai/tutor/generate-note', data);
  },

  createStudyTask: async (data: {
    title: string;
    description?: string;
    target_date?: string;
  }) => {
    return apiClient.post('/ai/tutor/create-study-task', data);
  },
};
