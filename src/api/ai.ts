import { apiClient } from './client';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system' | 'model';
  content: string;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: Record<string, { type: string; description: string; required?: boolean }>;
  permissions: string[];
  timeoutMs: number;
  confirmationRequired: boolean;
}

export const aiApi = {
  generate: async (messages: AIMessage[], promptKey?: string, temperature?: number) => {
    return apiClient.post<{ text: string }>('/ai/generate', {
      messages,
      promptKey,
      temperature,
    });
  },

  getTools: async (): Promise<ToolSchema[]> => {
    return apiClient.get<ToolSchema[]>('/ai/tools');
  },

  executeTool: async (toolName: string, parameters: Record<string, any>) => {
    return apiClient.post<{ toolName: string; result: any }>('/ai/tools/execute', {
      toolName,
      parameters,
    });
  },
};
