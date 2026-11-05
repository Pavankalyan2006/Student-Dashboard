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
  FlashcardStats,
  ReviewRating,
  FlashcardAIGenerateRequest,
  LabEntity,
  VivaQuestionItem,
  SQLTableDefinition,
  SQLChallenge,
  SQLExecutionResult,
  SQLQueryHistoryItem,
  TableDataResponse,
  TableDataFilter,
  MLWorkspace,
  MLWorkspaceFile,
  MLTrainingConfig,
  MLPredictionResult,
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
    addTask: async (
      planId: string,
      task: { title: string; subject?: string; date?: string; duration_minutes?: number; priority?: string }
    ): Promise<StudyPlanTask> => {
      const res = await apiClient.request<any>(`/study-planner/plans/${encodeURIComponent(planId)}/tasks`, {
        method: 'POST',
        body: JSON.stringify(task),
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

  // 4. Flashcards + Spaced Revision
  flashcards: {
    getDecks: async (params?: {
      search?: string;
      subject?: string;
      course_id?: string;
      status?: string;
      sortBy?: string;
    }): Promise<FlashcardDeck[]> => {
      const query = new URLSearchParams();
      if (params?.search) query.set('search', params.search);
      if (params?.subject) query.set('subject', params.subject);
      if (params?.course_id) query.set('course_id', params.course_id);
      if (params?.status) query.set('status', params.status);
      if (params?.sortBy) query.set('sortBy', params.sortBy);

      const qs = query.toString();
      const res = await apiClient.request<any>(`/flashcards/decks${qs ? `?${qs}` : ''}`);
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

    updateDeck: async (deckId: string, updates: Partial<FlashcardDeck>): Promise<FlashcardDeck> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return unwrap<FlashcardDeck>(res);
    },

    duplicateDeck: async (deckId: string): Promise<FlashcardDeck> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}/duplicate`, {
        method: 'POST',
      });
      return unwrap<FlashcardDeck>(res);
    },

    archiveDeck: async (deckId: string, is_archived: boolean = true): Promise<FlashcardDeck> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}/archive`, {
        method: 'POST',
        body: JSON.stringify({ is_archived }),
      });
      return unwrap<FlashcardDeck>(res);
    },

    bookmarkDeck: async (deckId: string, is_bookmarked: boolean = true): Promise<FlashcardDeck> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}/bookmark`, {
        method: 'POST',
        body: JSON.stringify({ is_bookmarked }),
      });
      return unwrap<FlashcardDeck>(res);
    },

    deleteDeck: async (deckId: string): Promise<void> => {
      await apiClient.request<any>(`/flashcards/decks/${deckId}`, {
        method: 'DELETE',
      });
    },

    addCard: async (deckId: string, card: Partial<Flashcard>): Promise<Flashcard> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}/cards`, {
        method: 'POST',
        body: JSON.stringify(card),
      });
      return unwrap<Flashcard>(res);
    },

    updateCard: async (
      deckId: string,
      cardId: string,
      updates: Partial<Flashcard>,
      resetSchedule: boolean = false
    ): Promise<Flashcard> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}/cards/${cardId}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updates, reset_schedule: resetSchedule }),
      });
      return unwrap<Flashcard>(res);
    },

    deleteCard: async (deckId: string, cardId: string): Promise<void> => {
      await apiClient.request<any>(`/flashcards/decks/${deckId}/cards/${cardId}`, {
        method: 'DELETE',
      });
    },

    bookmarkCard: async (deckId: string, cardId: string, is_bookmarked: boolean = true): Promise<Flashcard> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}/cards/${cardId}/bookmark`, {
        method: 'POST',
        body: JSON.stringify({ is_bookmarked }),
      });
      return unwrap<Flashcard>(res);
    },

    reviewCard: async (
      deckId: string,
      cardId: string,
      ratingOrConfidence: ReviewRating | number
    ): Promise<Flashcard> => {
      const payload: any = {};
      if (typeof ratingOrConfidence === 'string') {
        payload.rating = ratingOrConfidence;
      } else {
        payload.confidence = ratingOrConfidence;
      }
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}/cards/${cardId}/review`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return unwrap<Flashcard>(res);
    },

    getDueCards: async (params?: { deck_id?: string; course_id?: string; limit?: number }): Promise<Flashcard[]> => {
      const query = new URLSearchParams();
      if (params?.deck_id) query.set('deck_id', params.deck_id);
      if (params?.course_id) query.set('course_id', params.course_id);
      if (params?.limit) query.set('limit', String(params.limit));

      const qs = query.toString();
      const res = await apiClient.request<any>(`/flashcards/due${qs ? `?${qs}` : ''}`);
      return unwrap<Flashcard[]>(res, []) || [];
    },

    getStats: async (): Promise<FlashcardStats> => {
      const res = await apiClient.request<any>('/flashcards/stats');
      return unwrap<FlashcardStats>(res);
    },

    generateAIFlashcards: async (req: FlashcardAIGenerateRequest): Promise<{
      title: string;
      subject: string;
      cards: Array<{
        front: string;
        back: string;
        type: Flashcard['type'];
        topic: string;
        difficulty: Flashcard['difficulty'];
        explanation?: string;
        example?: string;
      }>;
      is_fallback: boolean;
    }> => {
      const res = await apiClient.request<any>('/flashcards/generate/ai', {
        method: 'POST',
        body: JSON.stringify(req),
      });
      return unwrap(res);
    },

    generateFromNote: async (noteId: string): Promise<{
      title: string;
      subject: string;
      source_id: string;
      source_title: string;
      cards: Array<{
        front: string;
        back: string;
        type: Flashcard['type'];
        topic: string;
        difficulty: Flashcard['difficulty'];
      }>;
    }> => {
      const res = await apiClient.request<any>('/flashcards/generate/from-note', {
        method: 'POST',
        body: JSON.stringify({ note_id: noteId }),
      });
      return unwrap(res);
    },

    generateFromDocument: async (documentId: string, count: number = 8): Promise<{
      title: string;
      subject: string;
      source_id: string;
      source_title: string;
      cards: Array<{
        front: string;
        back: string;
        type: Flashcard['type'];
        topic: string;
        difficulty: Flashcard['difficulty'];
      }>;
    }> => {
      const res = await apiClient.request<any>('/flashcards/generate/from-document', {
        method: 'POST',
        body: JSON.stringify({ document_id: documentId, count }),
      });
      return unwrap(res);
    },

    generateFromCourse: async (courseId: string, chapterId?: string, count: number = 8): Promise<{
      title: string;
      subject: string;
      source_id: string;
      source_title: string;
      cards: Array<{
        front: string;
        back: string;
        type: Flashcard['type'];
        topic: string;
        difficulty: Flashcard['difficulty'];
      }>;
    }> => {
      const res = await apiClient.request<any>('/flashcards/generate/from-course', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId, chapter_id: chapterId, count }),
      });
      return unwrap(res);
    },

    scheduleStudyTask: async (deckId: string): Promise<StudyPlanTask> => {
      const res = await apiClient.request<any>(`/flashcards/decks/${deckId}/schedule-task`, {
        method: 'POST',
      });
      return unwrap<StudyPlanTask>(res);
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
    getWorkspaces: async (): Promise<Array<{ name: string; table_count: number }>> => {
      const res = await apiClient.request<any>('/sql-lab/workspaces');
      return unwrap<Array<{ name: string; table_count: number }>>(res, []) || [];
    },
    createWorkspace: async (name: string): Promise<{ success: boolean; message: string }> => {
      const res = await apiClient.request<any>('/sql-lab/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      return unwrap<any>(res);
    },
    getSchemas: async (): Promise<Record<string, SQLTableDefinition[]>> => {
      const res = await apiClient.request<any>('/sql-lab/schemas');
      return unwrap<Record<string, SQLTableDefinition[]>>(res, {}) || {};
    },
    getSchemaTables: async (dbName: string): Promise<SQLTableDefinition[]> => {
      const res = await apiClient.request<any>(`/sql-lab/schemas/${dbName}/tables`);
      return unwrap<SQLTableDefinition[]>(res, []) || [];
    },
    createTable: async (dbName: string, tableDef: SQLTableDefinition): Promise<{ success: boolean; generated_sql: string; table: SQLTableDefinition }> => {
      const res = await apiClient.request<any>(`/sql-lab/schemas/${dbName}/tables`, {
        method: 'POST',
        body: JSON.stringify(tableDef),
      });
      return unwrap<any>(res);
    },
    dropTable: async (dbName: string, tableName: string): Promise<{ success: boolean; message: string }> => {
      const res = await apiClient.request<any>(`/sql-lab/schemas/${dbName}/tables/${tableName}`, {
        method: 'DELETE',
      });
      return unwrap<any>(res);
    },
    getTableData: async (dbName: string, tableName: string, filter?: TableDataFilter): Promise<TableDataResponse> => {
      const params = new URLSearchParams();
      if (filter?.page) params.set('page', String(filter.page));
      if (filter?.limit) params.set('limit', String(filter.limit));
      if (filter?.sort_by) params.set('sort_by', filter.sort_by);
      if (filter?.sort_dir) params.set('sort_dir', filter.sort_dir);
      if (filter?.search) params.set('search', filter.search);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient.request<any>(`/sql-lab/schemas/${dbName}/tables/${tableName}/data${queryStr}`);
      return unwrap<TableDataResponse>(res);
    },
    insertRow: async (dbName: string, tableName: string, rowData: Record<string, any>): Promise<{ success: boolean; inserted_row: Record<string, any> }> => {
      const res = await apiClient.request<any>(`/sql-lab/schemas/${dbName}/tables/${tableName}/rows`, {
        method: 'POST',
        body: JSON.stringify(rowData),
      });
      return unwrap<any>(res);
    },
    updateRow: async (dbName: string, tableName: string, pkValue: any, rowData: Record<string, any>): Promise<{ success: boolean; updated_row: Record<string, any> }> => {
      const res = await apiClient.request<any>(`/sql-lab/schemas/${dbName}/tables/${tableName}/rows/${encodeURIComponent(pkValue)}`, {
        method: 'PUT',
        body: JSON.stringify(rowData),
      });
      return unwrap<any>(res);
    },
    deleteRow: async (dbName: string, tableName: string, pkValue: any): Promise<{ success: boolean; message: string }> => {
      const res = await apiClient.request<any>(`/sql-lab/schemas/${dbName}/tables/${tableName}/rows/${encodeURIComponent(pkValue)}`, {
        method: 'DELETE',
      });
      return unwrap<any>(res);
    },
    generateSampleData: async (dbName: string, tableName: string, count: number = 3): Promise<{ success: boolean; generated_count: number }> => {
      const res = await apiClient.request<any>(`/sql-lab/schemas/${dbName}/tables/${tableName}/sample-data`, {
        method: 'POST',
        body: JSON.stringify({ count }),
      });
      return unwrap<any>(res);
    },
    previewSql: async (tableDef: SQLTableDefinition): Promise<{ sql: string }> => {
      const res = await apiClient.request<any>('/sql-lab/preview-sql', {
        method: 'POST',
        body: JSON.stringify(tableDef),
      });
      return unwrap<any>(res);
    },
    getHistory: async (schemaName?: string): Promise<SQLQueryHistoryItem[]> => {
      const queryStr = schemaName ? `?schema_name=${encodeURIComponent(schemaName)}` : '';
      const res = await apiClient.request<any>(`/sql-lab/history${queryStr}`);
      return unwrap<SQLQueryHistoryItem[]>(res, []) || [];
    },
    getSavedQueries: async (): Promise<Array<{ id: string; name: string; query: string; schema_name: string; created_at: string }>> => {
      const res = await apiClient.request<any>('/sql-lab/saved-queries');
      return unwrap<any[]>(res, []) || [];
    },
    saveQuery: async (name: string, query: string, schemaName: string) => {
      const res = await apiClient.request<any>('/sql-lab/saved-queries', {
        method: 'POST',
        body: JSON.stringify({ name, query, schema_name: schemaName }),
      });
      return unwrap<any>(res);
    },
    deleteSavedQuery: async (id: string) => {
      const res = await apiClient.request<any>(`/sql-lab/saved-queries/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return unwrap<any>(res);
    },
    getChallenges: async (): Promise<SQLChallenge[]> => {
      const res = await apiClient.request<any>('/sql-lab/challenges');
      return unwrap<SQLChallenge[]>(res, []) || [];
    },
    executeSql: async (query: string, dbName: string = 'university_db'): Promise<SQLExecutionResult> => {
      const res = await apiClient.request<any>('/sql-lab/execute', {
        method: 'POST',
        body: JSON.stringify({ query, db_name: dbName }),
      });
      return unwrap<SQLExecutionResult>(res);
    },
  },

  // 7. AI/ML Lab
  mlLab: {
    getWorkspaces: async (): Promise<MLWorkspace[]> => {
      const res = await apiClient.request<any>('/ml-lab/workspaces');
      return unwrap<MLWorkspace[]>(res, []) || [];
    },
    createWorkspace: async (data: { name: string; description?: string; task_type?: string }): Promise<MLWorkspace> => {
      const res = await apiClient.request<any>('/ml-lab/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return unwrap<MLWorkspace>(res);
    },
    getWorkspace: async (workspaceId: string): Promise<MLWorkspace> => {
      const res = await apiClient.request<any>(`/ml-lab/workspaces/${workspaceId}`);
      return unwrap<MLWorkspace>(res);
    },
    deleteWorkspace: async (workspaceId: string): Promise<{ success: boolean }> => {
      const res = await apiClient.request<any>(`/ml-lab/workspaces/${workspaceId}`, {
        method: 'DELETE',
      });
      return unwrap<any>(res);
    },
    addFile: async (workspaceId: string, fileData: { name: string; content: string }): Promise<MLWorkspaceFile> => {
      const res = await apiClient.request<any>(`/ml-lab/workspaces/${workspaceId}/files`, {
        method: 'POST',
        body: JSON.stringify(fileData),
      });
      return unwrap<MLWorkspaceFile>(res);
    },
    updateFile: async (workspaceId: string, fileId: string, content: string): Promise<MLWorkspaceFile> => {
      const res = await apiClient.request<any>(`/ml-lab/workspaces/${workspaceId}/files/${fileId}`, {
        method: 'PUT',
        body: JSON.stringify({ content }),
      });
      return unwrap<MLWorkspaceFile>(res);
    },
    deleteFile: async (workspaceId: string, fileId: string): Promise<{ success: boolean }> => {
      const res = await apiClient.request<any>(`/ml-lab/workspaces/${workspaceId}/files/${fileId}`, {
        method: 'DELETE',
      });
      return unwrap<any>(res);
    },
    getDatasets: async (): Promise<MLDataset[]> => {
      const res = await apiClient.request<any>('/ml-lab/datasets');
      return unwrap<MLDataset[]>(res, []) || [];
    },
    getDatasetById: async (datasetId: string): Promise<MLDataset> => {
      const res = await apiClient.request<any>(`/ml-lab/datasets/${datasetId}`);
      return unwrap<MLDataset>(res);
    },
    uploadDataset: async (data: { name: string; csvContent: string; description?: string; target_column?: string }): Promise<MLDataset> => {
      const res = await apiClient.request<any>('/ml-lab/datasets/upload', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return unwrap<MLDataset>(res);
    },
    getExperiments: async (workspaceId?: string): Promise<MLExperimentEntity[]> => {
      const q = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : '';
      const res = await apiClient.request<any>(`/ml-lab/experiments${q}`);
      return unwrap<MLExperimentEntity[]>(res, []) || [];
    },
    getExperimentById: async (experimentId: string): Promise<MLExperimentEntity> => {
      const res = await apiClient.request<any>(`/ml-lab/experiments/${experimentId}`);
      return unwrap<MLExperimentEntity>(res);
    },
    runExperiment: async (exp: any): Promise<MLExperimentEntity> => {
      const res = await apiClient.request<any>('/ml-lab/experiments', {
        method: 'POST',
        body: JSON.stringify(exp),
      });
      return unwrap<MLExperimentEntity>(res);
    },
    predict: async (experimentId: string, inputs: Record<string, any>): Promise<MLPredictionResult> => {
      const res = await apiClient.request<any>(`/ml-lab/experiments/${experimentId}/predict`, {
        method: 'POST',
        body: JSON.stringify({ inputs }),
      });
      return unwrap<MLPredictionResult>(res);
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
    updateStatus: async (appId: string, status: ApplicationStatus, note?: string): Promise<InternshipApplication> => {
      const res = await apiClient.request<any>(`/applications/${appId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      });
      return unwrap<InternshipApplication>(res);
    },
    updateApplication: async (appId: string, patch: Partial<InternshipApplication>): Promise<InternshipApplication> => {
      const res = await apiClient.request<any>(`/applications/${appId}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      });
      return unwrap<InternshipApplication>(res);
    },
    deleteApplication: async (appId: string): Promise<boolean> => {
      await apiClient.request<any>(`/applications/${appId}`, {
        method: 'DELETE',
      });
      return true;
    },
    addTimelineEvent: async (
      appId: string,
      event: { title: string; date?: string; notes?: string; status?: ApplicationStatus }
    ): Promise<InternshipApplication> => {
      const res = await apiClient.request<any>(`/applications/${appId}/timeline`, {
        method: 'POST',
        body: JSON.stringify(event),
      });
      return unwrap<InternshipApplication>(res);
    },
  },
};
