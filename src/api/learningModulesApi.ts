// src/api/learningModulesApi.ts
// Frontend API client for the 10 New AI Learning Modules

import { apiClient } from './client';
import {
  StudyPlan,
  StudyPlanTask,
  ExamEntity,
  StudentDoubt,
  FlashcardDeck,
  Flashcard,
  LabEntity,
  VivaQuestionItem,
  SQLTableDefinition,
  SQLChallenge,
  SQLExecutionResult,
  MLDataset,
  MLExperimentEntity,
  SystemDesignProblem,
  SystemDesignEntity,
  KnowledgeItem,
  KnowledgeCollection,
  KnowledgeGraphData,
  InternshipApplication,
  ApplicationStatus,
} from '../types/learningModules';

const unwrap = <T>(res: any, fallback?: T): T => {
  if (res && res.data !== undefined) return res.data as T;
  if (res !== undefined && res !== null) return res as T;
  return fallback as T;
};

export const learningModulesApi = {
  // 1. Study Planner
  studyPlanner: {
    getPlans: async (): Promise<StudyPlan[]> => {
      const res = await apiClient.request<any>('/study-planner/plans');
      return unwrap<StudyPlan[]>(res, []) || [];
    },
    getPlanById: async (planId: string): Promise<StudyPlan> => {
      const res = await apiClient.request<any>(`/study-planner/plans/${planId}`);
      return unwrap<StudyPlan>(res);
    },
    createPlan: async (plan: Partial<StudyPlan>): Promise<StudyPlan> => {
      const res = await apiClient.request<any>('/study-planner/plans', {
        method: 'POST',
        body: JSON.stringify(plan),
      });
      return unwrap<StudyPlan>(res);
    },
    updateTaskStatus: async (planId: string, taskId: string, status: string): Promise<StudyPlanTask> => {
      const res = await apiClient.request<any>(`/study-planner/plans/${planId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return unwrap<StudyPlanTask>(res);
    },
    getTodayTasks: async (): Promise<StudyPlanTask[]> => {
      const res = await apiClient.request<any>('/study-planner/today');
      return unwrap<StudyPlanTask[]>(res, []) || [];
    },
  },

  // 2. Exam Preparation
  exams: {
    getExams: async (): Promise<ExamEntity[]> => {
      const res = await apiClient.request<any>('/exams');
      return unwrap<ExamEntity[]>(res, []) || [];
    },
    getExamById: async (examId: string): Promise<ExamEntity> => {
      const res = await apiClient.request<any>(`/exams/${examId}`);
      return unwrap<ExamEntity>(res);
    },
    createExam: async (exam: Partial<ExamEntity>): Promise<ExamEntity> => {
      const res = await apiClient.request<any>('/exams', {
        method: 'POST',
        body: JSON.stringify(exam),
      });
      return unwrap<ExamEntity>(res);
    },
  },

  // 3. Doubt Solver
  doubts: {
    getDoubts: async (): Promise<StudentDoubt[]> => {
      const res = await apiClient.request<any>('/doubts');
      return unwrap<StudentDoubt[]>(res, []) || [];
    },
    getDoubtById: async (doubtId: string): Promise<StudentDoubt> => {
      const res = await apiClient.request<any>(`/doubts/${doubtId}`);
      return unwrap<StudentDoubt>(res);
    },
    createDoubt: async (doubt: Partial<StudentDoubt>): Promise<StudentDoubt> => {
      const res = await apiClient.request<any>('/doubts', {
        method: 'POST',
        body: JSON.stringify(doubt),
      });
      return unwrap<StudentDoubt>(res);
    },
  },

  // 4. Flashcards
  flashcards: {
    getDecks: async (): Promise<FlashcardDeck[]> => {
      const res = await apiClient.request<any>('/flashcards/decks');
      return unwrap<FlashcardDeck[]>(res, []) || [];
    },
    getDeckById: async (deckId: string): Promise<FlashcardDeck> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}`);
      return unwrap<FlashcardDeck>(res);
    },
    createDeck: async (deck: Partial<FlashcardDeck>): Promise<FlashcardDeck> => {
      const res = await apiClient.request<any>('/flashcards/decks', {
        method: 'POST',
        body: JSON.stringify(deck),
      });
      return unwrap<FlashcardDeck>(res);
    },
    reviewCard: async (deckId: string, cardId: string, confidence: number): Promise<Flashcard> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}/cards/${cardId}/review`, {
        method: 'POST',
        body: JSON.stringify({ confidence }),
      });
      return unwrap<Flashcard>(res);
    },
  },

  // 5. Labs & Viva
  labs: {
    getLabs: async (): Promise<LabEntity[]> => {
      const res = await apiClient.request<any>('/labs');
      return unwrap<LabEntity[]>(res, []) || [];
    },
    getLabById: async (labId: string): Promise<LabEntity> => {
      const res = await apiClient.request<any>(`/labs/${labId}`);
      return unwrap<LabEntity>(res);
    },
    evaluateViva: async (labId: string, expId: string, qId: string, studentAnswer: string): Promise<VivaQuestionItem> => {
      const res = await apiClient.request<any>(`/labs/${labId}/experiments/${expId}/viva/${qId}`, {
        method: 'POST',
        body: JSON.stringify({ student_answer: studentAnswer }),
      });
      return unwrap<VivaQuestionItem>(res);
    },
  },

  // 6. SQL Lab
  sqlLab: {
    getSchemas: async (): Promise<Record<string, SQLTableDefinition[]>> => {
      const res = await apiClient.request<any>('/sql-lab/schemas');
      return unwrap<Record<string, SQLTableDefinition[]>>(res, {}) || {};
    },
    getChallenges: async (): Promise<SQLChallenge[]> => {
      const res = await apiClient.request<any>('/sql-lab/challenges');
      return unwrap<SQLChallenge[]>(res, []) || [];
    },
    executeSql: async (query: string): Promise<SQLExecutionResult> => {
      const res = await apiClient.request<any>('/sql-lab/execute', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      return unwrap<SQLExecutionResult>(res);
    },
  },

  // 7. AI/ML Lab
  mlLab: {
    getDatasets: async (): Promise<MLDataset[]> => {
      const res = await apiClient.request<any>('/ml-lab/datasets');
      return unwrap<MLDataset[]>(res, []) || [];
    },
    getExperiments: async (): Promise<MLExperimentEntity[]> => {
      const res = await apiClient.request<any>('/ml-lab/experiments');
      return unwrap<MLExperimentEntity[]>(res, []) || [];
    },
    runExperiment: async (exp: Partial<MLExperimentEntity>): Promise<MLExperimentEntity> => {
      const res = await apiClient.request<any>('/ml-lab/experiments', {
        method: 'POST',
        body: JSON.stringify(exp),
      });
      return unwrap<MLExperimentEntity>(res);
    },
  },

  // 8. System Design Lab
  systemDesign: {
    getProblems: async (): Promise<SystemDesignProblem[]> => {
      const res = await apiClient.request<any>('/system-design/problems');
      return unwrap<SystemDesignProblem[]>(res, []) || [];
    },
    getDesigns: async (): Promise<SystemDesignEntity[]> => {
      const res = await apiClient.request<any>('/system-design/designs');
      return unwrap<SystemDesignEntity[]>(res, []) || [];
    },
    createDesign: async (design: Partial<SystemDesignEntity>): Promise<SystemDesignEntity> => {
      const res = await apiClient.request<any>('/system-design/designs', {
        method: 'POST',
        body: JSON.stringify(design),
      });
      return unwrap<SystemDesignEntity>(res);
    },
  },

  // 9. Personal Knowledge Base
  knowledge: {
    getCollections: async (): Promise<KnowledgeCollection[]> => {
      const res = await apiClient.request<any>('/knowledge/collections');
      return unwrap<KnowledgeCollection[]>(res, []) || [];
    },
    getItems: async (search?: string): Promise<KnowledgeItem[]> => {
      const url = search ? `/knowledge/items?search=${encodeURIComponent(search)}` : '/knowledge/items';
      const res = await apiClient.request<any>(url);
      return unwrap<KnowledgeItem[]>(res, []) || [];
    },
    createItem: async (item: Partial<KnowledgeItem>): Promise<KnowledgeItem> => {
      const res = await apiClient.request<any>('/knowledge/items', {
        method: 'POST',
        body: JSON.stringify(item),
      });
      return unwrap<KnowledgeItem>(res);
    },
    getGraph: async (): Promise<KnowledgeGraphData> => {
      const res = await apiClient.request<any>('/knowledge/graph');
      return unwrap<KnowledgeGraphData>(res, { nodes: [], edges: [] });
    },
  },

  // 10. Internship / Application Tracker
  applications: {
    getApplications: async (): Promise<InternshipApplication[]> => {
      const res = await apiClient.request<any>('/applications');
      return unwrap<InternshipApplication[]>(res, []) || [];
    },
    getApplicationById: async (appId: string): Promise<InternshipApplication> => {
      const res = await apiClient.request<any>(`/applications/${appId}`);
      return unwrap<InternshipApplication>(res);
    },
    createApplication: async (app: Partial<InternshipApplication>): Promise<InternshipApplication> => {
      const res = await apiClient.request<any>('/applications', {
        method: 'POST',
        body: JSON.stringify(app),
      });
      return unwrap<InternshipApplication>(res);
    },
    updateStatus: async (appId: string, status: ApplicationStatus): Promise<InternshipApplication> => {
      const res = await apiClient.request<any>(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return unwrap<InternshipApplication>(res);
    },
  },
};
