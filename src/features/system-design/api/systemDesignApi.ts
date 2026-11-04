// src/features/system-design/api/systemDesignApi.ts
// Comprehensive frontend API client for System Design Lab

import { apiClient } from '../../../api/client';
import {
  SystemDesignLesson,
  SystemDesignChallenge,
  SystemDesignProject,
  DesignProjectVersion,
  ChallengeSubmission,
  InterviewSession,
  CapacityCalculationInput,
  CapacityCalculation,
  DatabaseDesign,
  SqlDialect,
  ApiSpecification,
  SimulationResult
} from '../types/systemDesign';

// Helper to safely extract response whether unwrapped by apiClient or raw
const unpack = (res: any) => {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined && !Array.isArray(res)) {
    return res.data;
  }
  return res;
};

export const systemDesignApi = {
  // Roadmap & Lessons
  getRoadmap: async () => {
    const res = await apiClient.get<any>('/system-design/roadmap');
    return unpack(res);
  },

  getLessons: async (level?: number) => {
    const q = level !== undefined ? `?level=${level}` : '';
    const res = await apiClient.get<SystemDesignLesson[]>(`/system-design/lessons${q}`);
    return unpack(res);
  },

  getLessonById: async (lessonId: string) => {
    const res = await apiClient.get<SystemDesignLesson>(`/system-design/lessons/${lessonId}`);
    return unpack(res);
  },

  completeLesson: async (lessonId: string, quizScore?: number) => {
    const res = await apiClient.post<any>(`/system-design/lessons/${lessonId}/complete`, {
      quiz_score: quizScore
    });
    return unpack(res);
  },

  // Projects
  getProjects: async () => {
    const res = await apiClient.get<SystemDesignProject[]>('/system-design/projects');
    return unpack(res);
  },

  getProjectById: async (projectId: string) => {
    const res = await apiClient.get<SystemDesignProject>(`/system-design/projects/${projectId}`);
    return unpack(res);
  },

  createProject: async (data: Partial<SystemDesignProject>) => {
    const res = await apiClient.post<SystemDesignProject>('/system-design/projects', data);
    return unpack(res);
  },

  updateProject: async (projectId: string, updates: Partial<SystemDesignProject>) => {
    const res = await apiClient.patch<SystemDesignProject>(`/system-design/projects/${projectId}`, updates);
    return unpack(res);
  },

  deleteProject: async (projectId: string) => {
    const res = await apiClient.delete<any>(`/system-design/projects/${projectId}`);
    return unpack(res);
  },

  createVersion: async (projectId: string, note: string) => {
    const res = await apiClient.post<DesignProjectVersion>(`/system-design/projects/${projectId}/versions`, { note });
    return unpack(res);
  },

  duplicateProject: async (projectId: string, title?: string) => {
    const res = await apiClient.post<SystemDesignProject>(`/system-design/projects/${projectId}/duplicate`, { title });
    return unpack(res);
  },

  importProject: async (jsonData: any) => {
    const res = await apiClient.post<SystemDesignProject>('/system-design/projects/import', jsonData);
    return unpack(res);
  },

  // Challenges
  getChallenges: async (difficulty?: string, category?: string) => {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (category) params.append('category', category);
    const q = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<SystemDesignChallenge[]>(`/system-design/challenges${q}`);
    return unpack(res);
  },

  getChallengeById: async (challengeId: string) => {
    const res = await apiClient.get<SystemDesignChallenge>(`/system-design/challenges/${challengeId}`);
    return unpack(res);
  },

  startChallenge: async (challengeId: string) => {
    const res = await apiClient.post<SystemDesignProject>(`/system-design/challenges/${challengeId}/start`);
    return unpack(res);
  },

  submitChallenge: async (challengeId: string, projectId: string) => {
    const res = await apiClient.post<ChallengeSubmission>(`/system-design/challenges/${challengeId}/submissions`, {
      project_id: projectId
    });
    return unpack(res);
  },

  getChallengeSubmissions: async (challengeId?: string) => {
    const res = await apiClient.get<ChallengeSubmission[]>(`/system-design/challenges/${challengeId || 'all'}/submissions`);
    return unpack(res);
  },

  // Evaluation & Workspace Utilities
  evaluateArchitecture: async (projectId: string) => {
    const res = await apiClient.post<any>(`/system-design/projects/${projectId}/evaluate`);
    return unpack(res);
  },

  runSimulation: async (simulationType: string, params: any) => {
    const res = await apiClient.post<SimulationResult>('/system-design/simulate', {
      simulation_type: simulationType,
      params
    });
    return unpack(res);
  },

  calculateCapacity: async (inputs: CapacityCalculationInput) => {
    const res = await apiClient.post<CapacityCalculation>('/system-design/capacity-estimate', inputs);
    return unpack(res);
  },

  generateSql: async (databaseDesign: DatabaseDesign, dialect: SqlDialect = 'POSTGRESQL') => {
    const res = await apiClient.post<{ sql: string; dialect: string }>('/system-design/generate-sql', {
      database_design: databaseDesign,
      dialect
    });
    return unpack(res);
  },

  generateOpenApi: async (apiSpecification: ApiSpecification) => {
    const res = await apiClient.post<{ openapi_json: string; openapi_yaml: string; validation_errors: string[] }>(
      '/system-design/generate-openapi',
      { api_specification: apiSpecification }
    );
    return unpack(res);
  },

  // Interview Practice
  startInterview: async (challengeId: string, targetRole: string = 'SENIOR_SDE', durationMinutes = 45) => {
    const res = await apiClient.post<InterviewSession>('/system-design/interviews', {
      challenge_id: challengeId,
      target_role: targetRole,
      duration_minutes: durationMinutes
    });
    return unpack(res);
  },

  getInterviews: async () => {
    const res = await apiClient.get<InterviewSession[]>('/system-design/interviews');
    return unpack(res);
  },

  getInterviewById: async (sessionId: string) => {
    const res = await apiClient.get<InterviewSession>(`/system-design/interviews/${sessionId}`);
    return unpack(res);
  },

  submitInterviewStep: async (sessionId: string, step: string, notes: string, diagramSnapshot?: string) => {
    const res = await apiClient.post<InterviewSession>(`/system-design/interviews/${sessionId}/responses`, {
      step,
      notes,
      diagram_snapshot: diagramSnapshot
    });
    return unpack(res);
  },

  // AI Assistant & Analytics
  queryAiAssistant: async (prompt: string, mode: string = 'CONCEPT', context?: any) => {
    const res = await apiClient.post<any>('/system-design/ai-tutor', {
      prompt,
      mode,
      context
    });
    return unpack(res);
  },

  getAnalytics: async () => {
    const res = await apiClient.get<any>('/system-design/analytics');
    return unpack(res);
  }
};
