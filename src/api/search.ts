import { apiClient } from './client';

export type SearchType =
  | 'all'
  | 'courses'
  | 'topics'
  | 'notes'
  | 'documents'
  | 'projects'
  | 'research'
  | 'previous_papers'
  | 'code'
  | 'conversations'
  | 'opportunities'
  | 'community';

export interface SearchResultItem {
  id: string;
  title: string;
  description: string;
  type: SearchType;
  url: string;
  tags: string[];
  /** Phase 7: where the result came from, e.g. "Your documents · page 3". */
  source?: string;
  matched_in?: string;
  private?: boolean;
}

export interface SearchResponse {
  items: SearchResultItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts?: Partial<Record<SearchType, number>>;
  sources_failed?: string[];
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
