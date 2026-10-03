import { apiClient } from '../../../api/client';
import {
  CodingLanguage,
  LanguageConfig,
  ExecutionResult,
  CodingSession,
  SavedCode,
  CodeExecution,
  CodingProblem,
  CodeSubmission,
  CodingProgressSummary,
  CodeExplanationResult,
  CodeDebugResult,
  CodeGenerationResult,
  CodeRefactorResult,
  GeneratedTestCase,
  CodeReviewResult,
  CodeHintResult,
} from '../types/coding';

export const codingApi = {
  getLanguages: async (): Promise<LanguageConfig[]> => {
    return apiClient.get<LanguageConfig[]>('/coding/languages');
  },

  runCode: async (payload: {
    language: CodingLanguage;
    source_code: string;
    stdin?: string;
    problem_id?: string;
    session_id?: string;
  }): Promise<ExecutionResult> => {
    return apiClient.post<ExecutionResult>('/coding/run', payload);
  },

  getExecutions: async (limit = 50): Promise<CodeExecution[]> => {
    return apiClient.get<CodeExecution[]>(`/coding/executions?limit=${limit}`);
  },

  // Sessions
  getSessions: async (): Promise<CodingSession[]> => {
    return apiClient.get<CodingSession[]>('/coding/sessions');
  },

  getSession: async (id: string): Promise<CodingSession> => {
    return apiClient.get<CodingSession>(`/coding/sessions/${id}`);
  },

  createSession: async (payload: {
    language: CodingLanguage;
    source_code: string;
    stdin?: string;
    problem_id?: string;
  }): Promise<CodingSession> => {
    return apiClient.post<CodingSession>('/coding/sessions', payload);
  },

  updateSession: async (id: string, updates: Partial<CodingSession>): Promise<CodingSession> => {
    return apiClient.patch<CodingSession>(`/coding/sessions/${id}`, updates);
  },

  deleteSession: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/coding/sessions/${id}`);
  },

  // Saved Code
  getSavedCodeList: async (): Promise<SavedCode[]> => {
    return apiClient.get<SavedCode[]>('/coding/saved');
  },

  getSavedCode: async (id: string): Promise<SavedCode> => {
    return apiClient.get<SavedCode>(`/coding/saved/${id}`);
  },

  saveCode: async (payload: {
    title: string;
    language: CodingLanguage;
    source_code: string;
    description?: string;
    tags?: string[];
  }): Promise<SavedCode> => {
    return apiClient.post<SavedCode>('/coding/saved', payload);
  },

  updateSavedCode: async (id: string, updates: Partial<SavedCode>): Promise<SavedCode> => {
    return apiClient.patch<SavedCode>(`/coding/saved/${id}`, updates);
  },

  deleteSavedCode: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/coding/saved/${id}`);
  },

  // Problems
  getProblems: async (params?: { difficulty?: string; topic?: string; search?: string }): Promise<CodingProblem[]> => {
    const q = new URLSearchParams();
    if (params?.difficulty && params.difficulty !== 'ALL') q.set('difficulty', params.difficulty);
    if (params?.topic && params.topic !== 'ALL') q.set('topic', params.topic);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return apiClient.get<CodingProblem[]>(`/coding/problems${qs ? `?${qs}` : ''}`);
  },

  getProblem: async (id: string): Promise<CodingProblem> => {
    return apiClient.get<CodingProblem>(`/coding/problems/${id}`);
  },

  submitProblem: async (problemId: string, payload: { language: CodingLanguage; source_code: string }): Promise<CodeSubmission> => {
    return apiClient.post<CodeSubmission>(`/coding/problems/${problemId}/submit`, payload);
  },

  getProblemHints: async (problemId: string, level = 1): Promise<CodeHintResult> => {
    return apiClient.get<CodeHintResult>(`/coding/problems/${problemId}/hints?level=${level}`);
  },

  // Progress
  getProgress: async (): Promise<CodingProgressSummary> => {
    return apiClient.get<CodingProgressSummary>('/coding/progress');
  },

  // AI Intelligence
  aiExplain: async (payload: { language: CodingLanguage; source_code: string; level?: 'beginner' | 'intermediate' | 'advanced' }): Promise<CodeExplanationResult> => {
    return apiClient.post<CodeExplanationResult>('/coding/ai/explain', payload);
  },

  aiDebug: async (payload: {
    language: CodingLanguage;
    source_code: string;
    error: string;
    stdout?: string;
    stdin?: string;
    problem_statement?: string;
  }): Promise<CodeDebugResult> => {
    return apiClient.post<CodeDebugResult>('/coding/ai/debug', payload);
  },

  aiGenerate: async (payload: { prompt: string; language: CodingLanguage }): Promise<CodeGenerationResult> => {
    return apiClient.post<CodeGenerationResult>('/coding/ai/generate', payload);
  },

  aiRefactor: async (payload: { language: CodingLanguage; source_code: string; instruction?: string }): Promise<CodeRefactorResult> => {
    return apiClient.post<CodeRefactorResult>('/coding/ai/refactor', payload);
  },

  aiTestCases: async (payload: { language: CodingLanguage; source_code: string; problem_statement?: string }): Promise<GeneratedTestCase[]> => {
    return apiClient.post<GeneratedTestCase[]>('/coding/ai/test-cases', payload);
  },

  aiReview: async (payload: { language: CodingLanguage; source_code: string }): Promise<CodeReviewResult> => {
    return apiClient.post<CodeReviewResult>('/coding/ai/review', payload);
  },

  aiHint: async (payload: { problem_id?: string; level?: number; current_code?: string }): Promise<CodeHintResult> => {
    return apiClient.post<CodeHintResult>('/coding/ai/hints', payload);
  },
};
