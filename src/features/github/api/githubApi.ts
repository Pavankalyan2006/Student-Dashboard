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

  // Connection with PAT
  async connectWithPat(token: string, username?: string): Promise<any> {
    return apiClient.post<any>('/github/connect-pat', { token, username });
  },

  async syncAll(): Promise<{ synced_at: string; repositories_count: number; message: string }> {
    return apiClient.post<{ synced_at: string; repositories_count: number; message: string }>('/github/sync', {});
  },

  // Readme
  async getReadme(repoId: string): Promise<{ repo_id: string; name: string; content: string; path: string }> {
    return apiClient.get<{ repo_id: string; name: string; content: string; path: string }>(`/github/repos/${repoId}/readme`);
  },

  // Featured Projects & Portfolio
  async toggleFeatured(repoId: string, is_featured: boolean, metadata?: any): Promise<GitHubRepository> {
    return apiClient.post<GitHubRepository>(`/github/repos/${repoId}/featured`, { is_featured, metadata });
  },

  async listFeatured(): Promise<GitHubRepository[]> {
    return apiClient.get<GitHubRepository[]>('/github/featured');
  },

  async updatePersonalNotes(repoId: string, notes: string): Promise<GitHubRepository> {
    return apiClient.post<GitHubRepository>(`/github/repos/${repoId}/personal-notes`, { notes });
  },

  // Languages Summary
  async getLanguagesSummary(): Promise<{
    total_repositories: number;
    languages: { name: string; repo_count: number; percentage: number }[];
  }> {
    return apiClient.get<any>('/github/languages');
  },

  // Career & Resume Integration
  async generateResumeBullets(repoId: string, role_context?: string): Promise<{ bullets: any[]; generated_at: string }> {
    return apiClient.post<{ bullets: any[]; generated_at: string }>(`/github/repos/${repoId}/resume-bullets`, { role_context });
  },

  async exportToResume(
    repoId: string,
    data: { bullets: string[]; title?: string; tech_stack?: string[] }
  ): Promise<{ success: boolean; project_id: string; title: string; bullets_count: number; message: string }> {
    return apiClient.post<any>(`/github/repos/${repoId}/resume-export`, data);
  },

  async generateInterviewPrep(repoId: string): Promise<{ questions: any[]; repo_name: string; generated_at: string }> {
    return apiClient.post<{ questions: any[]; repo_name: string; generated_at: string }>(`/github/repos/${repoId}/interview-prep`, {});
  },

  // Learning Discovery
  async searchLearningRepositories(params?: {
    query?: string;
    topic?: string;
    language?: string;
  }): Promise<{ total_count: number; items: any[] }> {
    const query = new URLSearchParams();
    if (params?.query) query.set('query', params.query);
    if (params?.topic) query.set('topic', params.topic);
    if (params?.language) query.set('language', params.language);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<any>(`/github/learning-discovery${qs}`);
  },

  // Linking to Project Builder
  async linkProject(repoId: string, projectId: string): Promise<GitHubRepository> {
    return apiClient.post<GitHubRepository>(`/github/repos/${repoId}/link-project`, { project_id: projectId });
  },
};
