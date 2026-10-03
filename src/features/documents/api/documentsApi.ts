import { apiClient } from '../../../api/client';
import {
  Document,
  DocumentPage,
  DocumentSummary,
  DocumentCardData,
  DocumentListParams,
  DocumentsListResponse,
  UploadDocumentPayload,
  DocumentChatRequest,
  DocumentChatResponse,
  DocumentSearchResult,
} from '../types/document';

export const documentsApi = {
  getDocuments: async (params: DocumentListParams = {}): Promise<DocumentsListResponse> => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.filter && params.filter !== 'all') query.set('filter', params.filter);
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return apiClient.get<DocumentsListResponse>(`/documents${qs ? `?${qs}` : ''}`);
  },

  getDocument: async (documentId: string): Promise<Document> => {
    return apiClient.get<Document>(`/documents/${documentId}`);
  },

  uploadDocument: async (payload: UploadDocumentPayload): Promise<Document> => {
    return apiClient.post<Document>('/documents', payload);
  },

  updateDocument: async (
    documentId: string,
    updates: Partial<Document>
  ): Promise<Document> => {
    return apiClient.patch<Document>(`/documents/${documentId}`, updates);
  },

  deleteDocument: async (documentId: string): Promise<{ id: string; deleted: boolean }> => {
    return apiClient.delete<{ id: string; deleted: boolean }>(`/documents/${documentId}`);
  },

  getStatus: async (
    documentId: string
  ): Promise<{
    id: string;
    status: string;
    page_count: number;
    processing_started_at?: string;
    processing_completed_at?: string;
    processing_error?: string;
  }> => {
    return apiClient.get(`/documents/${documentId}/status`);
  },

  getPages: async (documentId: string): Promise<DocumentPage[]> => {
    return apiClient.get<DocumentPage[]>(`/documents/${documentId}/pages`);
  },

  getPage: async (documentId: string, pageNumber: number): Promise<DocumentPage> => {
    return apiClient.get<DocumentPage>(`/documents/${documentId}/pages/${pageNumber}`);
  },

  searchContent: async (
    documentId: string,
    query: string,
    pageNumbers?: number[]
  ): Promise<DocumentSearchResult[]> => {
    const qs = new URLSearchParams({ q: query });
    if (pageNumbers && pageNumbers.length > 0) {
      qs.set('pageNumbers', pageNumbers.join(','));
    }
    return apiClient.get<DocumentSearchResult[]>(`/documents/${documentId}/search?${qs.toString()}`);
  },

  chat: async (
    documentId: string,
    request: DocumentChatRequest
  ): Promise<DocumentChatResponse> => {
    return apiClient.post<DocumentChatResponse>(`/documents/${documentId}/chat`, request);
  },

  getSummary: async (documentId: string, level = 'standard'): Promise<DocumentSummary> => {
    return apiClient.get<DocumentSummary>(`/documents/${documentId}/summary?level=${level}`);
  },

  generateSummary: async (
    documentId: string,
    options: {
      level?: string;
      start_page?: number;
      end_page?: number;
      force_regenerate?: boolean;
    }
  ): Promise<DocumentSummary> => {
    return apiClient.post<DocumentSummary>(`/documents/${documentId}/summary`, options);
  },

  generateNotes: async (
    documentId: string,
    options: {
      start_page?: number;
      end_page?: number;
      note_type?: string;
      level?: string;
    }
  ): Promise<any> => {
    return apiClient.post(`/documents/${documentId}/notes`, options);
  },

  retryProcessing: async (
    documentId: string
  ): Promise<{ success: boolean; status: string }> => {
    return apiClient.post(`/documents/${documentId}/retry-processing`);
  },

  toggleFavorite: async (
    documentId: string
  ): Promise<{ is_favorite: boolean }> => {
    return apiClient.post(`/documents/${documentId}/favorite`);
  },
};
