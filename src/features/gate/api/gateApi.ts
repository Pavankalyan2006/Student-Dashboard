// src/features/gate/api/gateApi.ts
// Client API for GATE Exam Preparation System

import { apiClient } from '../../../api/client';
import {
  GatePaper,
  GateSyllabusSection,
  GateQuestion,
  GateMockTest,
  GateStudentProfile,
  GateQuestionAttempt,
  GateBookmark,
  GateTestSession,
  GateTestResult,
  GateStudyTask,
  GateDashboardData,
  TopicStatus,
  StudentConfidence
} from '../types/gateTypes';

const unpack = (res: any) => {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined && !Array.isArray(res)) {
    return res.data;
  }
  return res;
};

export const gateApi = {
  // Papers & Syllabus
  getPapers: async (): Promise<GatePaper[]> => {
    const res = await apiClient.get<GatePaper[]>('/gate/papers');
    return unpack(res);
  },

  getPaperByCode: async (code: string): Promise<GatePaper> => {
    const res = await apiClient.get<GatePaper>(`/gate/papers/${code}`);
    return unpack(res);
  },

  getSyllabus: async (paperCode = 'CS'): Promise<GateSyllabusSection[]> => {
    const res = await apiClient.get<GateSyllabusSection[]>(`/gate/syllabus?paper_code=${paperCode}`);
    return unpack(res);
  },

  updateTopicStatus: async (data: {
    topic_id: string;
    status?: TopicStatus;
    confidence?: StudentConfidence;
    revision_flag?: boolean;
    student_notes?: string;
  }) => {
    const res = await apiClient.post('/gate/syllabus/topic-status', data);
    return unpack(res);
  },

  // Student Profile
  getProfile: async (): Promise<GateStudentProfile> => {
    const res = await apiClient.get<GateStudentProfile>('/gate/profile');
    return unpack(res);
  },

  updateProfile: async (updates: Partial<GateStudentProfile>): Promise<GateStudentProfile> => {
    const res = await apiClient.post<GateStudentProfile>('/gate/profile', updates);
    return unpack(res);
  },

  // Questions & Practice
  getQuestions: async (filters: {
    paper_code?: string;
    subject?: string;
    topic_id?: string;
    difficulty?: string;
    question_type?: string;
    is_pyq?: boolean;
    search?: string;
  } = {}): Promise<GateQuestion[]> => {
    const params = new URLSearchParams();
    if (filters.paper_code) params.append('paper_code', filters.paper_code);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.topic_id) params.append('topic_id', filters.topic_id);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.question_type) params.append('question_type', filters.question_type);
    if (filters.is_pyq !== undefined) params.append('is_pyq', String(filters.is_pyq));
    if (filters.search) params.append('search', filters.search);
    const q = params.toString() ? `?${params.toString()}` : '';

    const res = await apiClient.get<GateQuestion[]>(`/gate/questions${q}`);
    return unpack(res);
  },

  getQuestionById: async (id: string): Promise<GateQuestion> => {
    const res = await apiClient.get<GateQuestion>(`/gate/questions/${id}`);
    return unpack(res);
  },

  attemptQuestion: async (
    questionId: string,
    selectedAnswer: any,
    timeSpentSeconds: number
  ): Promise<{
    attempt: GateQuestionAttempt;
    is_correct: boolean;
    marks_awarded: number;
    negative_deducted: number;
    correct_answer: any;
    explanation: string;
  }> => {
    const res = await apiClient.post(`/gate/questions/${questionId}/attempt`, {
      selected_answer: selectedAnswer,
      time_spent_seconds: timeSpentSeconds,
    });
    return unpack(res);
  },

  toggleBookmark: async (questionId: string, notes?: string): Promise<{ bookmarked: boolean; bookmark?: GateBookmark }> => {
    const res = await apiClient.post(`/gate/questions/${questionId}/bookmark`, { notes });
    return unpack(res);
  },

  getBookmarks: async (): Promise<(GateBookmark & { question: GateQuestion | null })[]> => {
    const res = await apiClient.get<any[]>('/gate/bookmarks');
    return unpack(res);
  },

  // Mock Tests
  getMockTests: async (paperCode?: string, type?: string): Promise<GateMockTest[]> => {
    const params = new URLSearchParams();
    if (paperCode) params.append('paper_code', paperCode);
    if (type) params.append('type', type);
    const q = params.toString() ? `?${params.toString()}` : '';

    const res = await apiClient.get<GateMockTest[]>(`/gate/tests${q}`);
    return unpack(res);
  },

  getMockTestById: async (id: string): Promise<GateMockTest> => {
    const res = await apiClient.get<GateMockTest>(`/gate/tests/${id}`);
    return unpack(res);
  },

  startMockTest: async (testId: string): Promise<GateTestSession> => {
    const res = await apiClient.post<GateTestSession>(`/gate/tests/${testId}/start`);
    return unpack(res);
  },

  saveMockTestAnswers: async (
    sessionId: string,
    answers: Record<string, any>,
    remainingSeconds: number
  ): Promise<GateTestSession> => {
    const res = await apiClient.put<GateTestSession>(`/gate/sessions/${sessionId}/answers`, {
      answers,
      remaining_seconds: remainingSeconds,
    });
    return unpack(res);
  },

  submitMockTest: async (sessionId: string): Promise<GateTestResult> => {
    const res = await apiClient.post<GateTestResult>(`/gate/sessions/${sessionId}/submit`);
    return unpack(res);
  },

  getMockTestSession: async (sessionId: string): Promise<GateTestSession> => {
    const res = await apiClient.get<GateTestSession>(`/gate/sessions/${sessionId}`);
    return unpack(res);
  },

  getTestResults: async (): Promise<GateTestResult[]> => {
    const res = await apiClient.get<GateTestResult[]>('/gate/results');
    return unpack(res);
  },

  // Study Plan
  getStudyPlan: async (paperCode?: string): Promise<GateStudyTask[]> => {
    const q = paperCode ? `?paper_code=${paperCode}` : '';
    const res = await apiClient.get<GateStudyTask[]>(`/gate/study-plan${q}`);
    return unpack(res);
  },

  addStudyTask: async (task: Omit<GateStudyTask, 'id' | 'student_id' | 'is_completed'>): Promise<GateStudyTask> => {
    const res = await apiClient.post<GateStudyTask>('/gate/study-plan/tasks', task);
    return unpack(res);
  },

  toggleStudyTask: async (taskId: string): Promise<GateStudyTask> => {
    const res = await apiClient.post<GateStudyTask>(`/gate/study-plan/tasks/${taskId}/toggle`);
    return unpack(res);
  },

  // Dashboard
  getDashboard: async (): Promise<GateDashboardData> => {
    const res = await apiClient.get<GateDashboardData>('/gate/dashboard');
    return unpack(res);
  },

  // AI GATE Study Assistant
  queryAiTutor: async (
    prompt: string,
    mode: 'SOLVE' | 'CONCEPT' | 'HINT' | 'MISTAKE_ANALYSIS' = 'CONCEPT',
    context?: any
  ): Promise<{ response: string; formulas?: string[]; follow_up_questions?: string[] }> => {
    const res = await apiClient.post('/gate/ai-tutor', { prompt, mode, context });
    return unpack(res);
  },
};
