import { apiClient } from './client';

export type SearchType =
  | 'all'
  | 'courses'
  | 'lessons'
  | 'notes'
  | 'documents'
  | 'doubts'
  | 'flashcards'
  | 'labs'
  | 'knowledge'
  | 'applications'
  | 'projects'
  | 'dsa'
  | 'coding'
  | 'ai'
  | 'community';

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  type: SearchType;
  url: string;
  tags: string[];
}

export interface SearchResponse {
  items: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const searchApi = {
  search: async (
    query: string,
    type: SearchType = 'all',
    page = 1,
    limit = 10
  ): Promise<SearchResponse> => {
    const params = new URLSearchParams({
      q: query,
      type,
      page: page.toString(),
      limit: limit.toString(),
    });
    return apiClient.get<SearchResponse>(`/search?${params.toString()}`);
  },
};
