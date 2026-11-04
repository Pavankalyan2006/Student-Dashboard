// src/features/knowledge-base/api/knowledgeBaseApi.ts
// Frontend API Client for AI Knowledge Base & Document Repository

import { apiClient } from '../../../api/client';
import {
  KnowledgeCollection,
  KnowledgeResource,
  KnowledgeBookmark,
  KnowledgeAnnotationNote,
  KnowledgeQuestionRecord,
  GeneratedStudyMaterial,
  KnowledgeSearchResult,
  KnowledgeDashboardStats,
  CreateCollectionInput,
  UpdateCollectionInput,
  AskKnowledgeQuestionInput,
  AskKnowledgeQuestionResponse,
  GenerateStudyMaterialInput,
  KnowledgeSearchFilters,
} from '../types/knowledgeBaseTypes';
import { DocumentCardData } from '../../../types';

const unpack = (res: any) => {
  if (res && typeof res === 'object' && 'data' in res && res.data !== undefined && !Array.isArray(res)) {
    return res.data;
  }
  return res;
};

export const knowledgeBaseApi = {
  // 1. Dashboard Stats
  getDashboardStats: async (): Promise<KnowledgeDashboardStats> => {
    const res = await apiClient.get('/knowledge-base/dashboard');
    return unpack(res);
  },

  // 2. Collections
  getCollections: async (): Promise<KnowledgeCollection[]> => {
    const res = await apiClient.get('/knowledge-base/collections');
    return unpack(res);
  },

  getCollectionById: async (
    id: string
  ): Promise<{
    collection: KnowledgeCollection;
    documents: DocumentCardData[];
    resources: KnowledgeResource[];
  }> => {
    const res = await apiClient.get(`/knowledge-base/collections/${id}`);
    return unpack(res);
  },

  createCollection: async (data: CreateCollectionInput): Promise<KnowledgeCollection> => {
    const res = await apiClient.post('/knowledge-base/collections', data);
    return unpack(res);
  },

  updateCollection: async (id: string, data: UpdateCollectionInput): Promise<KnowledgeCollection> => {
    const res = await apiClient.patch(`/knowledge-base/collections/${id}`, data);
    return unpack(res);
  },

  deleteCollection: async (id: string, deleteDocuments: boolean = false): Promise<void> => {
    await apiClient.delete(`/knowledge-base/collections/${id}`, {
      params: { deleteDocuments },
    });
  },

  assignDocumentToCollection: async (
    collectionId: string,
    documentId: string
  ): Promise<KnowledgeCollection> => {
    const res = await apiClient.post(`/knowledge-base/collections/${collectionId}/documents`, { documentId });
    return unpack(res);
  },

  removeDocumentFromCollection: async (
    collectionId: string,
    documentId: string
  ): Promise<KnowledgeCollection> => {
    const res = await apiClient.delete(`/knowledge-base/collections/${collectionId}/documents/${documentId}`);
    return unpack(res);
  },

  // 3. Search & AI QA
  search: async (filters: KnowledgeSearchFilters): Promise<KnowledgeSearchResult> => {
    const res = await apiClient.post('/knowledge-base/search', filters);
    return unpack(res);
  },

  askQuestion: async (input: AskKnowledgeQuestionInput): Promise<AskKnowledgeQuestionResponse> => {
    const res = await apiClient.post('/knowledge-base/ask', input);
    return unpack(res);
  },

  getQuestionHistory: async (limit: number = 20): Promise<KnowledgeQuestionRecord[]> => {
    const res = await apiClient.get('/knowledge-base/questions', { params: { limit } });
    return unpack(res);
  },

  // 4. Study Materials
  generateStudyMaterial: async (input: GenerateStudyMaterialInput): Promise<GeneratedStudyMaterial> => {
    const res = await apiClient.post('/knowledge-base/materials/generate', input);
    return unpack(res);
  },

  getStudyMaterials: async (documentId?: string): Promise<GeneratedStudyMaterial[]> => {
    const res = await apiClient.get('/knowledge-base/materials', { params: { documentId } });
    return unpack(res);
  },

  // 5. Document Re-indexing
  reindexDocument: async (documentId: string): Promise<any> => {
    const res = await apiClient.post(`/knowledge-base/documents/${documentId}/reindex`);
    return unpack(res);
  },

  // 6. Bookmarks
  getBookmarks: async (documentId?: string): Promise<KnowledgeBookmark[]> => {
    const res = await apiClient.get('/knowledge-base/bookmarks', { params: { documentId } });
    return unpack(res);
  },

  createBookmark: async (data: {
    document_id: string;
    page_number: number;
    title: string;
    note?: string;
  }): Promise<KnowledgeBookmark> => {
    const res = await apiClient.post('/knowledge-base/bookmarks', data);
    return unpack(res);
  },

  deleteBookmark: async (id: string): Promise<void> => {
    await apiClient.delete(`/knowledge-base/bookmarks/${id}`);
  },

  // 7. Notes
  getNotes: async (documentId?: string): Promise<KnowledgeAnnotationNote[]> => {
    const res = await apiClient.get('/knowledge-base/notes', { params: { documentId } });
    return unpack(res);
  },

  createNote: async (data: {
    document_id: string;
    page_number: number;
    selected_text?: string;
    note_text: string;
    color?: string;
  }): Promise<KnowledgeAnnotationNote> => {
    const res = await apiClient.post('/knowledge-base/notes', data);
    return unpack(res);
  },

  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(`/knowledge-base/notes/${id}`);
  },

  // 8. Resources
  getResources: async (collectionId?: string): Promise<KnowledgeResource[]> => {
    const res = await apiClient.get('/knowledge-base/resources', { params: { collectionId } });
    return unpack(res);
  },

  createResource: async (data: {
    collection_id?: string;
    title: string;
    description?: string;
    url: string;
    type: 'LINK' | 'VIDEO' | 'PAPER' | 'CODE_REPO';
  }): Promise<KnowledgeResource> => {
    const res = await apiClient.post('/knowledge-base/resources', data);
    return unpack(res);
  },

  deleteResource: async (id: string): Promise<void> => {
    await apiClient.delete(`/knowledge-base/resources/${id}`);
  },

  // 9. Module Integrations (Notes, Flashcards, Quiz)
  saveMaterialToNotes: async (materialId: string): Promise<any> => {
    const res = await apiClient.post(`/knowledge-base/materials/${materialId}/save-to-notes`);
    return unpack(res);
  },

  saveMaterialToFlashcards: async (materialId: string): Promise<any> => {
    const res = await apiClient.post(`/knowledge-base/materials/${materialId}/save-to-flashcards`);
    return unpack(res);
  },

  saveMaterialToQuiz: async (materialId: string): Promise<any> => {
    const res = await apiClient.post(`/knowledge-base/materials/${materialId}/save-to-quiz`);
    return unpack(res);
  },

  // 10. Document Versioning & Download
  uploadDocumentVersion: async (documentId: string, payload: any): Promise<any> => {
    const res = await apiClient.post(`/documents/${documentId}/version`, payload);
    return unpack(res);
  },

  getDocumentDownloadUrl: (documentId: string): string => {
    return `/api/v1/documents/${documentId}/download`;
  },
};
