import { apiClient } from '../../../api/client';
import {
  GitHubConnectionStatus,
  GitHubRepository,
  GitHubRepositoryFile,
  GitHubCommit,
  GitHubIssue,
  GitHubPullRequest,
  GitHubRepositoryAnalysis,
} from '../types';

export const githubApi = {
  // Connection
  async getStatus(): Promise<GitHubConnectionStatus> {
    return apiClient.get<GitHubConnectionStatus>('/github/status');
  },

  async getConnectUrl(): Promise<{ oauth_url: string; state: string }> {
    return apiClient.get<{ oauth_url: string; state: string }>('/github/connect');
  },

  async completeCallback(username: string = 'student-engineer'): Promise<any> {
    return apiClient.get<any>(`/github/callback?username=${encodeURIComponent(username)}`);
  },

  async disconnect(): Promise<{ disconnected: boolean }> {
    return apiClient.post<{ disconnected: boolean }>('/github/disconnect', {});
  },

  // Repositories
  async listRepositories(params?: { language?: string; visibility?: string }): Promise<GitHubRepository[]> {
    const query = new URLSearchParams();
    if (params?.language) query.set('language', params.language);
    if (params?.visibility) query.set('visibility', params.visibility);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<GitHubRepository[]>(`/github/repos${qs}`);
  },

  async getRepository(repoId: string): Promise<GitHubRepository> {
    return apiClient.get<GitHubRepository>(`/github/repos/${repoId}`);
  },

  async syncRepository(repoId: string): Promise<GitHubRepository> {
    return apiClient.post<GitHubRepository>(`/github/repos/${repoId}/sync`, {});
  },

  // Files & Tree
  async getTree(repoId: string): Promise<GitHubRepositoryFile[]> {
    return apiClient.get<GitHubRepositoryFile[]>(`/github/repos/${repoId}/tree`);
  },

  async getFiles(repoId: string): Promise<GitHubRepositoryFile[]> {
    return apiClient.get<GitHubRepositoryFile[]>(`/github/repos/${repoId}/files`);
  },

  async getFile(repoId: string, filePath: string): Promise<GitHubRepositoryFile> {
    return apiClient.get<GitHubRepositoryFile>(`/github/repos/${repoId}/files?path=${encodeURIComponent(filePath)}`);
  },

  // Commits, Issues & PRs
  async getCommits(repoId: string): Promise<GitHubCommit[]> {
    return apiClient.get<GitHubCommit[]>(`/github/repos/${repoId}/commits`);
  },

  async getIssues(repoId: string): Promise<GitHubIssue[]> {
    return apiClient.get<GitHubIssue[]>(`/github/repos/${repoId}/issues`);
  },

  async getPullRequests(repoId: string): Promise<GitHubPullRequest[]> {
    return apiClient.get<GitHubPullRequest[]>(`/github/repos/${repoId}/pulls`);
  },

  // Analysis & Intelligence
  async analyzeRepository(repoId: string): Promise<GitHubRepositoryAnalysis> {
    return apiClient.post<GitHubRepositoryAnalysis>(`/github/repos/${repoId}/analyze`, {});
  },

  async searchCode(repoId: string, query: string): Promise<{ path: string; name: string; size: number; snippet: string }[]> {
    return apiClient.post<{ path: string; name: string; size: number; snippet: string }[]>(`/github/repos/${repoId}/search`, { query });
  },

  async explainFile(repoId: string, filePath: string): Promise<{ explanation: string; key_functions: string[]; imports: string[] }> {
    return apiClient.post<{ explanation: string; key_functions: string[]; imports: string[] }>('/github/files/explain', {
      repo_id: repoId,
      file_path: filePath,
    });
  },

  async reviewCode(repoId: string, filePath: string): Promise<{ review_summary: string; strengths: string[]; recommendations: string[] }> {
    return apiClient.post<{ review_summary: string; strengths: string[]; recommendations: string[] }>('/github/files/review', {
      repo_id: repoId,
      file_path: filePath,
    });
  },

  async generateTests(repoId: string, filePath: string): Promise<{ test_code: string; test_framework: string }> {
    return apiClient.post<{ test_code: string; test_framework: string }>('/github/files/generate-tests', {
      repo_id: repoId,
      file_path: filePath,
    });
  },

  async getOnboardingGuide(repoId: string): Promise<{ title: string; sections: { heading: string; body: string }[] }> {
    return apiClient.post<{ title: string; sections: { heading: string; body: string }[] }>(`/github/repos/${repoId}/onboarding-guide`, {});
  },

  // Linking to Project Builder
  async linkProject(repoId: string, projectId: string): Promise<GitHubRepository> {
    return apiClient.post<GitHubRepository>(`/github/repos/${repoId}/link-project`, { project_id: projectId });
  },
};
