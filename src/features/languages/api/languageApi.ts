// src/features/languages/api/languageApi.ts
// Frontend API Client for the Language Learning Platform (150+ Languages)

import { apiClient } from '../../../api/client';
import {
  LanguageEntry,
  StudentLanguageEnrollment,
  LanguageLearningPath,
  LanguageLessonDetail,
  SpacedRepetitionCard,
  WritingSubmission,
  ConversationSession,
  ContextualTranslationResult,
  QuizSubmissionResult,
  StudentLanguageAnalytics,
  ReviewRating,
} from '../types/languageTypes';

const unpack = (res: any) => {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined && !Array.isArray(res)) {
    return res.data;
  }
  return res;
};

export const languageApi = {
  // 1. Catalog & Discovery
  getCatalog: async (params?: {
    query?: string;
    region?: string;
    script?: string;
    capability?: string;
  }): Promise<{
    languages: LanguageEntry[];
    total_count: number;
    regions: string[];
    scripts: string[];
  }> => {
    const res = await apiClient.get('/languages', { params });
    return unpack(res) || { languages: [], total_count: 0, regions: [], scripts: [] };
  },

  getLanguage: async (code: string): Promise<LanguageEntry> => {
    const res = await apiClient.get(`/languages/${code}`);
    return unpack(res);
  },

  getCapabilities: async (code: string) => {
    const res = await apiClient.get(`/languages/${code}/capabilities`);
    return unpack(res);
  },

  // 2. Student Enrollment & Overall Analytics
  getMyEnrollments: async (): Promise<StudentLanguageEnrollment[]> => {
    const res = await apiClient.get('/languages/enrollments/my');
    return unpack(res) || [];
  },

  getMyAnalytics: async (): Promise<StudentLanguageAnalytics> => {
    const res = await apiClient.get('/languages/analytics/my');
    return unpack(res);
  },

  enroll: async (code: string, data: any): Promise<StudentLanguageEnrollment> => {
    const res = await apiClient.post(`/languages/${code}/enroll`, data);
    return unpack(res);
  },

  unenroll: async (code: string): Promise<void> => {
    await apiClient.delete(`/languages/${code}/enroll`);
  },

  // 3. Personalized Dashboard & Curricula
  getDashboard: async (code: string): Promise<any> => {
    const res = await apiClient.get(`/languages/${code}/dashboard`);
    return unpack(res);
  },

  getLearningPaths: async (code: string): Promise<LanguageLearningPath[]> => {
    const res = await apiClient.get(`/languages/${code}/paths`);
    return unpack(res) || [];
  },

  getLesson: async (code: string, lessonId: string): Promise<LanguageLessonDetail> => {
    const res = await apiClient.get(`/languages/${code}/lessons/${lessonId}`);
    return unpack(res);
  },

  completeLesson: async (code: string, lessonId: string, notes?: string): Promise<any> => {
    const res = await apiClient.post(`/languages/${code}/lessons/${lessonId}/complete`, { notes });
    return unpack(res);
  },

  // 4. Vocabulary & Spaced Repetition
  getVocabulary: async (code: string, topic?: string): Promise<SpacedRepetitionCard[]> => {
    const res = await apiClient.get(`/languages/${code}/vocabulary`, { params: { topic } });
    return unpack(res) || [];
  },

  bookmarkVocab: async (code: string, cardId: string, bookmarked: boolean): Promise<SpacedRepetitionCard> => {
    const res = await apiClient.post(`/languages/${code}/vocabulary/${cardId}/bookmark`, { bookmarked });
    return unpack(res);
  },

  reviewSpacedVocab: async (code: string, cardId: string, rating: ReviewRating): Promise<SpacedRepetitionCard> => {
    const res = await apiClient.post(`/languages/${code}/vocabulary/${cardId}/review`, { rating });
    return unpack(res);
  },

  getDueRevisions: async (code: string): Promise<SpacedRepetitionCard[]> => {
    const res = await apiClient.get(`/languages/${code}/revisions/due`);
    return unpack(res) || [];
  },

  // 5. Writing Practice
  getWritingSubmissions: async (code: string): Promise<WritingSubmission[]> => {
    const res = await apiClient.get(`/languages/${code}/writing`);
    return unpack(res) || [];
  },

  submitWritingPractice: async (code: string, data: { prompt_type: string; prompt_text: string; student_text: string }): Promise<WritingSubmission> => {
    const res = await apiClient.post(`/languages/${code}/writing`, data);
    return unpack(res);
  },

  // 6. AI Conversation Partner
  getConversations: async (code: string): Promise<ConversationSession[]> => {
    const res = await apiClient.get(`/languages/${code}/conversations`);
    return unpack(res) || [];
  },

  startConversation: async (code: string, data: { scenario: string; mode: 'PRACTICE' | 'CORRECTION' }): Promise<ConversationSession> => {
    const res = await apiClient.post(`/languages/${code}/conversations`, data);
    return unpack(res);
  },

  sendMessage: async (code: string, sessionId: string, text: string): Promise<ConversationSession> => {
    const res = await apiClient.post(`/languages/${code}/conversations/${sessionId}/message`, { text });
    return unpack(res);
  },

  // 7. Contextual AI Translation
  translate: async (sourceLang: string, targetLang: string, text: string): Promise<ContextualTranslationResult> => {
    const res = await apiClient.post('/languages/translate', { source_lang: sourceLang, target_lang: targetLang, text });
    return unpack(res);
  },

  // 8. Quizzes & Assessments
  submitQuiz: async (code: string, quizId: string, answers: any[]): Promise<QuizSubmissionResult> => {
    const res = await apiClient.post(`/languages/${code}/quizzes/${quizId}/submit`, { answers });
    return unpack(res);
  },
};
