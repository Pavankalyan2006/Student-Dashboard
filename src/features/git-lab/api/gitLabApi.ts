import { apiClient } from '../../../api/client';

export interface GitRepoView {
  initialized: boolean;
  head: { branch: string | null; commit: string | null };
  branches: { name: string; commit: string | null }[];
  tags: { name: string; commit: string }[];
  remote: { name: string; url: string; branches: { name: string; commit: string }[] } | null;
  commits: { id: string; short_id: string; message: string; parents: string[]; refs: string[] }[];
  status: { staged: { path: string; change: string }[]; unstaged: { path: string; change: string }[]; untracked: string[]; conflicted: string[] } | null;
  files: { path: string; content: string }[];
  stash: string[];
  merge_in_progress: { conflicts: string[] } | null;
}
export interface GitLessonSummary { id: string; order: number; title: string; summary: string; exercise_ids: string[]; completed: boolean; exercises_completed: number }
export interface GitExerciseSummary { id: string; lesson_id: string; order: number; title: string; difficulty: string; instructions: string; checks: { id: string; label: string }[]; hint_count: number; status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'; completed_at: string | null }
export interface GitLesson extends GitLessonSummary { sections: { heading: string; body: string; commands?: string[] }[]; exercises: GitExerciseSummary[] }
export interface GitWorkspace {
  exercise: GitExerciseSummary;
  repo: GitRepoView;
  evaluation: { passed: boolean; checks: { id: string; label: string; passed: boolean }[] };
  hints: string[];
  commands_run: number;
  explanation: string | null;
  result?: { ok: boolean; output: string };
  newly_completed?: boolean;
}
export interface GitProgress { lessons_total: number; lessons_completed: number; exercises_total: number; exercises_completed: number; completed_exercise_ids: string[]; hints_used: number }

export const gitLabApi = {
  lessons: () => apiClient.get<GitLessonSummary[]>('/git-lab/lessons'),
  lesson: (id: string) => apiClient.get<GitLesson>(`/git-lab/lessons/${id}`),
  completeLesson: (id: string) => apiClient.post<{ completed: boolean }>(`/git-lab/lessons/${id}/complete`, {}),
  exercises: () => apiClient.get<GitExerciseSummary[]>('/git-lab/exercises'),
  exercise: (id: string) => apiClient.get<GitWorkspace>(`/git-lab/exercises/${id}`),
  resetExercise: (id: string) => apiClient.post<GitWorkspace>(`/git-lab/exercises/${id}/reset`, {}),
  run: (id: string, command: string) => apiClient.post<GitWorkspace>(`/git-lab/exercises/${id}/commands`, { command }),
  hint: (id: string) => apiClient.post<{ hint: string; hints_used: number; hint_count: number }>(`/git-lab/exercises/${id}/hint`, {}),
  solution: (id: string) => apiClient.get<{ solution: string[]; explanation: string }>(`/git-lab/exercises/${id}/solution`),
  sandbox: () => apiClient.get<{ repo: GitRepoView }>('/git-lab/sandbox'),
  runSandbox: (command: string) => apiClient.post<{ result: { ok: boolean; output: string }; repo: GitRepoView }>('/git-lab/sandbox/commands', { command }),
  resetSandbox: () => apiClient.post<{ repo: GitRepoView }>('/git-lab/sandbox/reset', {}),
  progress: () => apiClient.get<GitProgress>('/git-lab/progress'),
};
