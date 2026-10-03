import { useQuery } from '@tanstack/react-query';
import { searchApi, SearchType, SearchResponse } from '../api/search';

export function useSearch(query: string, type: SearchType = 'all', page = 1, limit = 10) {
  return useQuery<SearchResponse>({
    queryKey: ['search', query, type, page, limit],
    queryFn: () => searchApi.search(query, type, page, limit),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60, // 1 minute
  });
}
