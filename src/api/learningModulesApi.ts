// src/api/learningModulesApi.ts
// Frontend API client for the 10 New AI Learning Modules

import { apiClient, ApiResponse } from './client';
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

export const learningModulesApi = {
  // 1. Study Planner
  studyPlanner: {
    getPlans: async (): Promise<StudyPlan[]> => {
      const res = await apiClient.request<StudyPlan[]>('/study-planner/plans');
      return res.data || [];
    },
    getPlanById: async (planId: string): Promise<StudyPlan> => {
      const res = await apiClient.request<StudyPlan>(`/study-planner/plans/${planId}`);
      return res.data;
    },
    createPlan: async (plan: Partial<StudyPlan>): Promise<StudyPlan> => {
      const res = await apiClient.request<StudyPlan>('/study-planner/plans', {
        method: 'POST',
        body: JSON.stringify(plan),
      });
      return res.data;
    },
    updateTaskStatus: async (planId: string, taskId: string, status: string): Promise<StudyPlanTask> => {
      const res = await apiClient.request<StudyPlanTask>(`/study-planner/plans/${planId}/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return res.data;
    },
    getTodayTasks: async (): Promise<StudyPlanTask[]> => {
      const res = await apiClient.request<StudyPlanTask[]>('/study-planner/today');
      return res.data || [];
    },
  },

  // 2. Exam Preparation
  exams: {
    getExams: async (): Promise<ExamEntity[]> => {
      const res = await apiClient.request<ExamEntity[]>('/exams');
      return res.data || [];
    },
    getExamById: async (examId: string): Promise<ExamEntity> => {
      const res = await apiClient.request<ExamEntity>(`/exams/${examId}`);
      return res.data;
    },
    createExam: async (exam: Partial<ExamEntity>): Promise<ExamEntity> => {
      const res = await apiClient.request<ExamEntity>('/exams', {
        method: 'POST',
        body: JSON.stringify(exam),
      });
      return res.data;
    },
  },

  // 3. Doubt Solver
  doubts: {
    getDoubts: async (): Promise<StudentDoubt[]> => {
      const res = await apiClient.request<StudentDoubt[]>('/doubts');
      return res.data || [];
    },
    getDoubtById: async (doubtId: string): Promise<StudentDoubt> => {
      const res = await apiClient.request<StudentDoubt>(`/doubts/${doubtId}`);
      return res.data;
    },
    createDoubt: async (doubt: Partial<StudentDoubt>): Promise<StudentDoubt> => {
      const res = await apiClient.request<StudentDoubt>('/doubts', {
        method: 'POST',
        body: JSON.stringify(doubt),
      });
      return res.data;
    },
  },

  // 4. Flashcards
  flashcards: {
    getDecks: async (): Promise<FlashcardDeck[]> => {
      const res = await apiClient.request<FlashcardDeck[]>('/flashcards/decks');
      return res.data || [];
    },
    getDeckById: async (deckId: string): Promise<FlashcardDeck> => {
      const res = await apiClient.request<FlashcardDeck>(`/flashcards/decks/${deckId}`);
      return res.data;
    },
    createDeck: async (deck: Partial<FlashcardDeck>): Promise<FlashcardDeck> => {
      const res = await apiClient.request<FlashcardDeck>('/flashcards/decks', {
        method: 'POST',
        body: JSON.stringify(deck),
      });
      return res.data;
    },
    reviewCard: async (deckId: string, cardId: string, confidence: number): Promise<Flashcard> => {
      const res = await apiClient.request<Flashcard>(`/flashcards/decks/${deckId}/cards/${cardId}/review`, {
        method: 'POST',
        body: JSON.stringify({ confidence }),
      });
      return res.data;
    },
  },

  // 5. Labs & Viva
  labs: {
    getLabs: async (): Promise<LabEntity[]> => {
      const res = await apiClient.request<LabEntity[]>('/labs');
      return res.data || [];
    },
    getLabById: async (labId: string): Promise<LabEntity> => {
      const res = await apiClient.request<LabEntity>(`/labs/${labId}`);
      return res.data;
    },
    evaluateViva: async (labId: string, expId: string, qId: string, studentAnswer: string): Promise<VivaQuestionItem> => {
      const res = await apiClient.request<VivaQuestionItem>(`/labs/${labId}/experiments/${expId}/viva/${qId}`, {
        method: 'POST',
        body: JSON.stringify({ student_answer: studentAnswer }),
      });
      return res.data;
    },
  },

  // 6. SQL Lab
  sqlLab: {
    getSchemas: async (): Promise<Record<string, SQLTableDefinition[]>> => {
      const res = await apiClient.request<Record<string, SQLTableDefinition[]>>('/sql-lab/schemas');
      return res.data || {};
    },
    getChallenges: async (): Promise<SQLChallenge[]> => {
      const res = await apiClient.request<SQLChallenge[]>('/sql-lab/challenges');
      return res.data || [];
    },
    executeSql: async (query: string): Promise<SQLExecutionResult> => {
      const res = await apiClient.request<SQLExecutionResult>('/sql-lab/execute', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });
      return res.data;
    },
  },

  // 7. AI/ML Lab
  mlLab: {
    getDatasets: async (): Promise<MLDataset[]> => {
      const res = await apiClient.request<MLDataset[]>('/ml-lab/datasets');
      return res.data || [];
    },
    getExperiments: async (): Promise<MLExperimentEntity[]> => {
      const res = await apiClient.request<MLExperimentEntity[]>('/ml-lab/experiments');
      return res.data || [];
    },
    runExperiment: async (exp: Partial<MLExperimentEntity>): Promise<MLExperimentEntity> => {
      const res = await apiClient.request<MLExperimentEntity>('/ml-lab/experiments', {
        method: 'POST',
        body: JSON.stringify(exp),
      });
      return res.data;
    },
  },

  // 8. System Design Lab
  systemDesign: {
    getProblems: async (): Promise<SystemDesignProblem[]> => {
      const res = await apiClient.request<SystemDesignProblem[]>('/system-design/problems');
      return res.data || [];
    },
    getDesigns: async (): Promise<SystemDesignEntity[]> => {
      const res = await apiClient.request<SystemDesignEntity[]>('/system-design/designs');
      return res.data || [];
    },
    createDesign: async (design: Partial<SystemDesignEntity>): Promise<SystemDesignEntity> => {
      const res = await apiClient.request<SystemDesignEntity>('/system-design/designs', {
        method: 'POST',
        body: JSON.stringify(design),
      });
      return res.data;
    },
  },

  // 9. Personal Knowledge Base
  knowledge: {
    getCollections: async (): Promise<KnowledgeCollection[]> => {
      const res = await apiClient.request<KnowledgeCollection[]>('/knowledge/collections');
      return res.data || [];
    },
    getItems: async (search?: string): Promise<KnowledgeItem[]> => {
      const url = search ? `/knowledge/items?search=${encodeURIComponent(search)}` : '/knowledge/items';
      const res = await apiClient.request<KnowledgeItem[]>(url);
      return res.data || [];
    },
    createItem: async (item: Partial<KnowledgeItem>): Promise<KnowledgeItem> => {
      const res = await apiClient.request<KnowledgeItem>('/knowledge/items', {
        method: 'POST',
        body: JSON.stringify(item),
      });
      return res.data;
    },
    getGraph: async (): Promise<KnowledgeGraphData> => {
      const res = await apiClient.request<KnowledgeGraphData>('/knowledge/graph');
      return res.data || { nodes: [], edges: [] };
    },
  },

  // 10. Internship / Application Tracker
  applications: {
    getApplications: async (): Promise<InternshipApplication[]> => {
      const res = await apiClient.request<InternshipApplication[]>('/applications');
      return res.data || [];
    },
    getApplicationById: async (appId: string): Promise<InternshipApplication> => {
      const res = await apiClient.request<InternshipApplication>(`/applications/${appId}`);
      return res.data;
    },
    createApplication: async (app: Partial<InternshipApplication>): Promise<InternshipApplication> => {
      const res = await apiClient.request<InternshipApplication>('/applications', {
        method: 'POST',
        body: JSON.stringify(app),
      });
      return res.data;
    },
    updateStatus: async (appId: string, status: ApplicationStatus): Promise<InternshipApplication> => {
      const res = await apiClient.request<InternshipApplication>(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return res.data;
    },
  },
};
