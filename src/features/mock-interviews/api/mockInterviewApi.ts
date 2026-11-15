// src/features/mock-interviews/api/mockInterviewApi.ts
// Frontend API Client for AI Mock Interviews Module

import { apiClient } from '../../../api/client';
import { runInBrowser } from '../../../lib/browserSandbox';
import { loadLanguageAvailability } from '../../coding/hooks/useLanguageAvailability';
import {
  CategoryMetadata,
  TargetRoleMetadata,
  MockInterviewQuestionCatalogItem,
  MockInterviewSessionEntity,
  MockInterviewSessionQuestion,
  MockInterviewAnswerEntity,
  MockInterviewReport,
  SavedMockQuestionEntity,
  ScheduledMockInterviewEntity,
  MockInterviewAnalytics,
  CreateMockInterviewSessionRequest,
} from '../types/mockInterviewTypes';

const unpack = (res: any) => {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined && !Array.isArray(res)) {
    return res.data;
  }
  return res;
};

export const mockInterviewApi = {
  // Metadata & Questions
  getCategories: async (): Promise<CategoryMetadata[]> => {
    const res = await apiClient.get('/mock-interviews/types');
    return unpack(res);
  },

  getTargetRoles: async (): Promise<TargetRoleMetadata[]> => {
    const res = await apiClient.get('/mock-interviews/roles');
    return unpack(res);
  },

  getQuestions: async (params?: {
    category?: string;
    difficulty?: string;
    role?: string;
    search?: string;
  }): Promise<MockInterviewQuestionCatalogItem[]> => {
    const res = await apiClient.get('/mock-interviews/questions', { params });
    return unpack(res);
  },

  getQuestionById: async (id: string): Promise<MockInterviewQuestionCatalogItem> => {
    const res = await apiClient.get(`/mock-interviews/questions/${id}`);
    return unpack(res);
  },

  // Sessions
  createSession: async (
    data: CreateMockInterviewSessionRequest
  ): Promise<{ session: MockInterviewSessionEntity; initial_question: MockInterviewSessionQuestion }> => {
    const res = await apiClient.post('/mock-interviews/sessions', data);
    return unpack(res);
  },

  getSession: async (
    sessionId: string
  ): Promise<{
    session: MockInterviewSessionEntity;
    questions: MockInterviewSessionQuestion[];
    answers: MockInterviewAnswerEntity[];
  }> => {
    const res = await apiClient.get(`/mock-interviews/sessions/${sessionId}`);
    return unpack(res);
  },

  startSession: async (sessionId: string): Promise<MockInterviewSessionEntity> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/start`);
    return unpack(res);
  },

  pauseSession: async (sessionId: string): Promise<MockInterviewSessionEntity> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/pause`);
    return unpack(res);
  },

  resumeSession: async (sessionId: string): Promise<MockInterviewSessionEntity> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/resume`);
    return unpack(res);
  },

  skipQuestion: async (
    sessionId: string,
    questionId: string
  ): Promise<{
    next_question: MockInterviewSessionQuestion | null;
    is_completed: boolean;
  }> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/skip`, {
      question_id: questionId,
    });
    return unpack(res);
  },

  requestHint: async (
    sessionId: string,
    questionId: string
  ): Promise<{ hint: string; remaining_hints: number }> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/hint`, {
      question_id: questionId,
    });
    return unpack(res);
  },

  runCode: async (
    sessionId: string,
    params: {
      question_id: string;
      language: string;
      source_code: string;
      stdin?: string;
    }
  ): Promise<any> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/code/run`, params);
    // The server keeps the code snapshot for the interview. If it cannot run code (as on Vercel), Python and
    // JavaScript then run in an isolated worker in this browser.
    if ((await loadLanguageAvailability())[params.language]?.runs === 'browser') {
      return runInBrowser({ language: params.language as 'python' | 'javascript', source: params.source_code, stdin: params.stdin });
    }
    return unpack(res);
  },

  runSql: async (
    sessionId: string,
    params: {
      question_id: string;
      query: string;
      db_name?: string;
    }
  ): Promise<any> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/sql/run`, params);
    return unpack(res);
  },

  saveArtifact: async (
    sessionId: string,
    params: {
      question_id: string;
      topology: any;
    }
  ): Promise<any> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/artifacts`, params);
    return unpack(res);
  },

  updateScratchpad: async (sessionId: string, notes: string): Promise<any> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/scratchpad`, { notes });
    return unpack(res);
  },

  submitAnswer: async (
    sessionId: string,
    params: {
      question_id: string;
      answer_text: string;
      duration_seconds?: number;
      input_mode?: 'TEXT' | 'VOICE';
      code_used?: string;
      sql_query_used?: string;
      architecture_used?: any;
    }
  ): Promise<{
    answer: MockInterviewAnswerEntity;
    next_question: MockInterviewSessionQuestion | null;
    is_completed: boolean;
  }> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/answers`, params);
    return unpack(res);
  },

  completeSession: async (
    sessionId: string
  ): Promise<{ session: MockInterviewSessionEntity; report: MockInterviewReport }> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/finish`);
    return unpack(res);
  },

  abandonSession: async (sessionId: string): Promise<MockInterviewSessionEntity> => {
    const res = await apiClient.post(`/mock-interviews/sessions/${sessionId}/abandon`);
    return unpack(res);
  },

  getReport: async (sessionId: string): Promise<MockInterviewReport> => {
    const res = await apiClient.get(`/mock-interviews/sessions/${sessionId}/report`);
    return unpack(res);
  },

  // Saved Questions
  getSavedQuestions: async (): Promise<SavedMockQuestionEntity[]> => {
    const res = await apiClient.get('/mock-interviews/saved-questions');
    return unpack(res);
  },

  saveQuestion: async (params: {
    question_id: string;
    category?: string;
    topic?: string;
    question?: string;
    expected_concepts?: string[];
    reference_answer?: string;
    student_notes?: string;
  }): Promise<SavedMockQuestionEntity> => {
    const res = await apiClient.post('/mock-interviews/saved-questions', params);
    return unpack(res);
  },

  deleteSavedQuestion: async (id: string): Promise<{ deleted: boolean }> => {
    const res = await apiClient.delete(`/mock-interviews/saved-questions/${id}`);
    return unpack(res);
  },

  // Scheduling & Analytics
  getScheduled: async (): Promise<ScheduledMockInterviewEntity[]> => {
    const res = await apiClient.get('/mock-interviews/scheduled');
    return unpack(res);
  },

  scheduleInterview: async (params: {
    category: string;
    target_role: string;
    scheduled_date: string;
    scheduled_time: string;
    reminder_minutes_before?: number;
  }): Promise<ScheduledMockInterviewEntity> => {
    const res = await apiClient.post('/mock-interviews/schedule', params);
    return unpack(res);
  },

  deleteScheduled: async (id: string): Promise<{ deleted: boolean }> => {
    const res = await apiClient.delete(`/mock-interviews/scheduled/${id}`);
    return unpack(res);
  },

  getAnalytics: async (): Promise<MockInterviewAnalytics> => {
    const res = await apiClient.get('/mock-interviews/analytics');
    return unpack(res);
  },
};
