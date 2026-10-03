import { apiClient } from '../../../api/client';
import {
  Note,
  NoteCardData,
  NoteVersion,
  GenerateNotesRequest,
  FlashcardItem,
  QuizQuestionItem,
} from '../types/notes';

export interface NotesListResponse {
  items: NoteCardData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const notesApi = {
  getNotes: async (params?: {
    search?: string;
    source_type?: string;
    note_type?: string;
    is_favorite?: boolean;
    course_id?: string;
    page?: number;
    limit?: number;
  }): Promise<NotesListResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.source_type) queryParams.source_type = params.source_type;
    if (params?.note_type) queryParams.note_type = params.note_type;
    if (params?.is_favorite !== undefined) queryParams.is_favorite = String(params.is_favorite);
    if (params?.course_id) queryParams.course_id = params.course_id;
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    return apiClient.get<NotesListResponse>('/notes', queryParams);
  },

  searchNotes: async (query: string): Promise<NoteCardData[]> => {
    return apiClient.get<NoteCardData[]>('/notes/search', { q: query });
  },

  getNote: async (noteId: string): Promise<Note> => {
    return apiClient.get<Note>(`/notes/${noteId}`);
  },

  generateNote: async (req: GenerateNotesRequest): Promise<Note> => {
    return apiClient.post<Note>('/notes/generate', req);
  },

  createManualNote: async (data: {
    title: string;
    content: string;
    description?: string;
    tags?: string[];
  }): Promise<Note> => {
    return apiClient.post<Note>('/notes', data);
  },

  updateNote: async (
    noteId: string,
    updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'is_favorite' | 'structured_data'>>,
    changeSummary?: string
  ): Promise<Note> => {
    return apiClient.patch<Note>(`/notes/${noteId}`, { ...updates, changeSummary });
  },

  deleteNote: async (noteId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/notes/${noteId}`);
  },

  toggleFavorite: async (noteId: string): Promise<{ is_favorite: boolean }> => {
    return apiClient.post<{ is_favorite: boolean }>(`/notes/${noteId}/favorite`, {});
  },

  getVersions: async (noteId: string): Promise<NoteVersion[]> => {
    return apiClient.get<NoteVersion[]>(`/notes/${noteId}/versions`);
  },

  regenerateNote: async (noteId: string, style: string): Promise<Note> => {
    return apiClient.post<Note>(`/notes/${noteId}/regenerate`, { style });
  },

  summarizeNote: async (noteId: string): Promise<{ summary: string; key_takeaways: string[] }> => {
    return apiClient.post<{ summary: string; key_takeaways: string[] }>(`/notes/${noteId}/summarize`, {});
  },

  generateFlashcards: async (noteId: string): Promise<FlashcardItem[]> => {
    return apiClient.post<FlashcardItem[]>(`/notes/${noteId}/flashcards`, {});
  },

  generateQuiz: async (noteId: string): Promise<QuizQuestionItem[]> => {
    return apiClient.post<QuizQuestionItem[]>(`/notes/${noteId}/quiz`, {});
  },

  explainSection: async (
    noteId: string,
    data: { sectionTitle: string; sectionText: string; instruction?: string }
  ): Promise<{ explanation: string; key_takeaway: string }> => {
    return apiClient.post<{ explanation: string; key_takeaway: string }>(`/notes/${noteId}/explain-section`, data);
  },
};
