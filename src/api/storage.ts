import { apiClient } from './client';

export interface StorageRecord {
  id: string;
  student_id: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  size_bytes: number;
  category: 'document' | 'notes' | 'resume' | 'project' | 'attachment';
  created_at: string;
}

export const storageApi = {
  list: async (): Promise<StorageRecord[]> => {
    return apiClient.get<StorageRecord[]>('/storage');
  },

  getMetadata: async (id: string): Promise<StorageRecord> => {
    return apiClient.get<StorageRecord>(`/storage/${id}/metadata`);
  },

  download: async (id: string): Promise<{ record: StorageRecord; content: string }> => {
    return apiClient.get<{ record: StorageRecord; content: string }>(`/storage/${id}/download`);
  },

  delete: async (id: string): Promise<{ id: string; deleted: boolean }> => {
    return apiClient.delete<{ id: string; deleted: boolean }>(`/storage/${id}`);
  },

  upload: async (
    file: { name: string; type: string; size: number; base64Content?: string },
    category: 'document' | 'notes' | 'resume' | 'project' | 'attachment' = 'document'
  ): Promise<StorageRecord> => {
    return apiClient.post<StorageRecord>('/storage/upload', {
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      category,
      contentBase64: file.base64Content,
    });
  },
};
