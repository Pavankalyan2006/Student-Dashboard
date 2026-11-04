import { apiClient } from '../../../api/client';
import {
  DSATopic,
  Algorithm,
  DSAProblem,
  DSAProgress,
  VisualizationSession,
  AlgorithmComparisonDimension,
} from '../types/dsa';

export const dsaApi = {
  getTopics: async (): Promise<DSATopic[]> => {
    return apiClient.get<DSATopic[]>('/dsa/topics');
  },

  getTopic: async (idOrSlug: string): Promise<DSATopic> => {
    return apiClient.get<DSATopic>(`/dsa/topics/${idOrSlug}`);
  },

  getAlgorithms: async (topicId?: string): Promise<Algorithm[]> => {
    const url = topicId ? `/dsa/algorithms?topic_id=${topicId}` : '/dsa/algorithms';
    return apiClient.get<Algorithm[]>(url);
  },

  getAlgorithm: async (idOrSlug: string): Promise<Algorithm> => {
    return apiClient.get<Algorithm>(`/dsa/algorithms/${idOrSlug}`);
  },

  visualizeAlgorithm: async (algorithmId: string, customInput?: any): Promise<VisualizationSession> => {
    return apiClient.post<VisualizationSession>(`/dsa/algorithms/${algorithmId}/visualize`, {
      input: customInput,
    });
  },

  compareAlgorithms: async (algorithmIds: string[]): Promise<AlgorithmComparisonDimension[]> => {
    return apiClient.post<AlgorithmComparisonDimension[]>('/dsa/algorithms/compare', {
      algorithm_ids: algorithmIds,
    });
  },

  getProblems: async (params?: {
    topic_id?: string;
    difficulty?: string;
    search?: string;
    subtopic?: string;
    company?: string;
    roadmap_stage?: string;
    status?: string;
  }): Promise<DSAProblem[]> => {
    const q = new URLSearchParams();
    if (params?.topic_id) q.set('topic_id', params.topic_id);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    if (params?.search) q.set('search', params.search);
    if (params?.subtopic) q.set('subtopic', params.subtopic);
    if (params?.company) q.set('company', params.company);
    if (params?.roadmap_stage) q.set('roadmap_stage', params.roadmap_stage);
    if (params?.status) q.set('status', params.status);
    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return apiClient.get<DSAProblem[]>(`/dsa/problems${queryStr}`);
  },

  getProblem: async (idOrSlug: string): Promise<DSAProblem> => {
    return apiClient.get<DSAProblem>(`/dsa/problems/${idOrSlug}`);
  },

  runCode: async (
    problemId: string,
    payload: { language: string; source_code: string }
  ) => {
    return apiClient.post(`/dsa/problems/${problemId}/run`, payload);
  },

  submitProblemSolution: async (
    problemId: string,
    payload: { language: string; source_code: string }
  ) => {
    return apiClient.post(`/dsa/problems/${problemId}/submit`, payload);
  },

  getDailyChallenge: async () => {
    return apiClient.get<{
      date: string;
      problem: DSAProblem;
      is_completed: boolean;
    }>('/dsa/daily-challenge');
  },

  getRoadmap: async () => {
    return apiClient.get<Array<{
      stage: string;
      description: string;
      total_problems: number;
      solved_problems: number;
      topics: Array<{
        topic_id: string;
        topic_name: string;
        total: number;
        solved: number;
      }>;
    }>>('/dsa/roadmap');
  },

  getAnalytics: async () => {
    return apiClient.get<{
      total_problems: number;
      total_solved: number;
      total_attempted: number;
      total_unsolved: number;
      completion_percentage: number;
      acceptance_rate: number;
      daily_streak: number;
      by_difficulty: {
        easy: { solved: number; total: number; percentage: number };
        medium: { solved: number; total: number; percentage: number };
        hard: { solved: number; total: number; percentage: number };
      };
      by_topic: Array<{
        topic_id: string;
        topic_name: string;
        solved: number;
        total: number;
        percentage: number;
      }>;
      weak_topics: string[];
      bookmarked_count: number;
    }>('/dsa/analytics');
  },

  getBookmarks: async (): Promise<string[]> => {
    return apiClient.get<string[]>('/dsa/bookmarks');
  },

  toggleBookmark: async (problemId: string): Promise<{ bookmarked: boolean; bookmarks: string[] }> => {
    return apiClient.post<{ bookmarked: boolean; bookmarks: string[] }>(`/dsa/bookmarks/${problemId}`, {});
  },

  getDraft: async (problemId: string): Promise<{ code: string; language: string; updated_at: string } | null> => {
    return apiClient.get(`/dsa/drafts/${problemId}`);
  },

  saveDraft: async (problemId: string, payload: { code: string; language: string }): Promise<void> => {
    return apiClient.post(`/dsa/drafts/${problemId}`, payload);
  },

  getHints: async (problemId: string, level = 1): Promise<{
    problem_id: string;
    level: number;
    hint: string;
    total_hints: number;
  }> => {
    return apiClient.get(`/dsa/problems/${problemId}/hints?level=${level}`);
  },

  getProgress: async (): Promise<DSAProgress> => {
    return apiClient.get<DSAProgress>('/dsa/progress');
  },

  getTopicProgress: async (topicId: string) => {
    return apiClient.get(`/dsa/topics/${topicId}/progress`);
  },

  recordVisualizationComplete: async (algorithmId: string): Promise<DSAProgress> => {
    return apiClient.post<DSAProgress>(`/dsa/visualizations/${algorithmId}/complete`, {});
  },

  askAITutor: async (payload: {
    problem_id?: string;
    algorithm_id?: string;
    question: string;
    code?: string;
    language?: string;
    step_number?: number;
  }): Promise<{
    message: string;
    suggestions: string[];
    problem_title?: string;
    topic?: string;
    optimal_complexity?: { time: string; space: string };
  }> => {
    return apiClient.post('/dsa/tutor/chat', payload);
  },
};
