import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { githubApi } from '../api/githubApi';
import { toast } from 'sonner';

export function useGitHubStatus() {
  return useQuery({
    queryKey: ['github-status'],
    queryFn: () => githubApi.getStatus(),
  });
}

export function useGitHubRepositories(filters?: { language?: string; visibility?: string }) {
  return useQuery({
    queryKey: ['github-repos', filters],
    queryFn: () => githubApi.listRepositories(filters),
  });
}

export function useGitHubRepository(repoId?: string) {
  return useQuery({
    queryKey: ['github-repo', repoId],
    queryFn: () => (repoId ? githubApi.getRepository(repoId) : Promise.reject('No repo ID')),
    enabled: !!repoId,
  });
}

export function useGitHubTree(repoId?: string) {
  return useQuery({
    queryKey: ['github-tree', repoId],
    queryFn: () => (repoId ? githubApi.getTree(repoId) : Promise.resolve([])),
    enabled: !!repoId,
  });
}

export function useGitHubFile(repoId?: string, filePath?: string) {
  return useQuery({
    queryKey: ['github-file', repoId, filePath],
    queryFn: () => (repoId && filePath ? githubApi.getFile(repoId, filePath) : Promise.reject('Missing params')),
    enabled: !!repoId && !!filePath,
  });
}

export function useGitHubCommits(repoId?: string) {
  return useQuery({
    queryKey: ['github-commits', repoId],
    queryFn: () => (repoId ? githubApi.getCommits(repoId) : Promise.resolve([])),
    enabled: !!repoId,
  });
}

export function useGitHubIssues(repoId?: string) {
  return useQuery({
    queryKey: ['github-issues', repoId],
    queryFn: () => (repoId ? githubApi.getIssues(repoId) : Promise.resolve([])),
    enabled: !!repoId,
  });
}

export function useGitHubPullRequests(repoId?: string) {
  return useQuery({
    queryKey: ['github-pulls', repoId],
    queryFn: () => (repoId ? githubApi.getPullRequests(repoId) : Promise.resolve([])),
    enabled: !!repoId,
  });
}

export function useGitHubAnalysis(repoId?: string) {
  return useQuery({
    queryKey: ['github-analysis', repoId],
    queryFn: () => (repoId ? githubApi.analyzeRepository(repoId) : Promise.reject('No repo ID')),
    enabled: !!repoId,
  });
}

// Mutations
export function useSyncGitHubRepository(repoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => githubApi.syncRepository(repoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['github-repo', repoId] });
      qc.invalidateQueries({ queryKey: ['github-repos'] });
      toast.success('Repository synchronized with GitHub');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Sync failed');
    },
  });
}

export function useAnalyzeGitHubRepository(repoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => githubApi.analyzeRepository(repoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['github-analysis', repoId] });
      qc.invalidateQueries({ queryKey: ['github-repo', repoId] });
      toast.success('Repository architectural & security analysis complete');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Analysis failed');
    },
  });
}

export function useLinkGitHubProject(repoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) => githubApi.linkProject(repoId, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['github-repo', repoId] });
      qc.invalidateQueries({ queryKey: ['github-repos'] });
      toast.success('Repository linked to Project Builder');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to link project');
    },
  });
}

export function useConnectGitHub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (username?: string) => githubApi.completeCallback(username),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['github-status'] });
      qc.invalidateQueries({ queryKey: ['github-repos'] });
      toast.success('GitHub account connected securely');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Connection failed');
    },
  });
}

export function useDisconnectGitHub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => githubApi.disconnect(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['github-status'] });
      qc.invalidateQueries({ queryKey: ['github-repos'] });
      toast.success('GitHub account disconnected');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Disconnection failed');
    },
  });
}
