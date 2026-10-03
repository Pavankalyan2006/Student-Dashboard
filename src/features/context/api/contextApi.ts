import { apiClient } from '../../../api/client';
import { AIContextItem, SourceProvenanceItem, ContextOption } from '../types';

export const contextApi = {
  async resolveContext(items: AIContextItem[]): Promise<SourceProvenanceItem[]> {
    return apiClient.post<SourceProvenanceItem[]>('/context/resolve', { items });
  },

  async buildMultiSourcePrompt(
    prompt: string,
    items: AIContextItem[]
  ): Promise<{ prompt: string; citations: SourceProvenanceItem[] }> {
    return apiClient.post<{ prompt: string; citations: SourceProvenanceItem[] }>('/context/build-prompt', {
      prompt,
      items,
    });
  },

  async listAvailableContextOptions(): Promise<ContextOption[]> {
    return apiClient.get<ContextOption[]>('/context/options');
  },
};
