export interface GitHubConnectionStatus {
  is_connected: boolean;
  connection?: {
    id: string;
    student_id: string;
    github_user_id: string;
    username: string;
    name?: string;
    avatar_url?: string;
    scopes: string[];
    is_connected: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface GitHubRepository {
  id: string;
  student_id: string;
  github_connection_id: string;
  external_repo_id: string;
  owner: string;
  name: string;
  full_name: string;
  description?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  default_branch: string;
  language: string;
  stars: number;
  forks: number;
  open_issues_count: number;
  url: string;
  clone_url: string;
  linked_project_id?: string;
  analysis_status: 'NOT_ANALYZED' | 'ANALYZING' | 'ANALYZED' | 'FAILED';
  last_synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepositoryFile {
  id?: string;
  path: string;
  name: string;
  type: 'file' | 'dir';
  size: number;
  sha?: string;
  content?: string;
}

export interface GitHubCommit {
  id: string;
  repository_id: string;
  hash: string;
  message: string;
  author: string;
  branch: string;
  files_changed: number;
  additions: number;
  deletions: number;
  committed_at: string;
}

export interface GitHubIssue {
  id: string;
  repository_id: string;
  number: number;
  title: string;
  body?: string;
  status: 'open' | 'closed';
  author: string;
  labels: string[];
  created_at: string;
}

export interface GitHubPullRequest {
  id: string;
  repository_id: string;
  number: number;
  title: string;
  body?: string;
  status: 'open' | 'closed' | 'merged';
  author: string;
  branch: string;
  target_branch: string;
  files_changed: number;
  additions: number;
  deletions: number;
  created_at: string;
}

export interface GitHubArchitectureComponent {
  name: string;
  category: 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'AI_SERVICE' | 'STORAGE' | 'EXTERNAL_API';
  evidence_files: string[];
  description: string;
}

export interface GitHubRepositoryAnalysis {
  id: string;
  repository_id: string;
  architecture_components: GitHubArchitectureComponent[];
  technologies: string[];
  frameworks: string[];
  entry_points: string[];
  apis: string[];
  database_usage: string[];
  dependencies: string[];
  potential_security_concerns: string[];
  maintainability_observations: string[];
  observed_facts: string[];
  ai_suggestions: string[];
  created_at: string;
  updated_at: string;
}
