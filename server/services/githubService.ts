import crypto from 'crypto';
import { db } from '../db/database';
import {
  GitHubConnection,
  GitHubRepository,
  GitHubRepositoryFile,
  GitHubCommit,
  GitHubIssue,
  GitHubPullRequest,
} from '../models/researchGitHubTypes';
import { ProjectService } from './projectService';
import { NotFoundError, AuthorizationError, ValidationError } from '../core/exceptions';
import { logger } from '../core/logging';

export class GitHubService {
  private static readonly ENCRYPTION_KEY =
    process.env.GITHUB_ENCRYPTION_KEY || 'btech_default_secure_aes_256_mock_key_32chars!';

  /**
   * Helper to encrypt tokens
   */
  public static encryptToken(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32),
      iv
    );
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  }

  /**
   * Get student's connection status (safe: strips encrypted_token)
   */
  public static async getConnectionStatus(studentId: string): Promise<{
    is_connected: boolean;
    connection?: Omit<GitHubConnection, 'encrypted_token'>;
  }> {
    const conn = await db.getGitHubConnection(studentId);
    if (!conn || !conn.is_connected) {
      return { is_connected: false };
    }

    const { encrypted_token, ...safeConn } = conn;
    return {
      is_connected: true,
      connection: safeConn,
    };
  }

  /**
   * Initiate OAuth connection with state token
   */
  public static initiateOAuth(studentId: string, redirectUri?: string): { oauth_url: string; state: string } {
    const state = crypto.randomBytes(16).toString('hex');
    const clientId = process.env.GITHUB_CLIENT_ID || 'mock_github_client_id';
    const redirect = encodeURIComponent(redirectUri || '/github/callback');
    const scope = encodeURIComponent('read:user repo:status public_repo');

    return {
      oauth_url: `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirect}&scope=${scope}&state=${state}`,
      state,
    };
  }

  /**
   * Complete connection (simulated callback / OAuth token exchange)
   */
  public static async connectAccount(
    studentId: string,
    githubUsername: string = 'student-engineer'
  ): Promise<Omit<GitHubConnection, 'encrypted_token'>> {
    const student = await db.getStudentById(studentId);
    const now = new Date().toISOString();

    const conn: GitHubConnection = {
      id: `gh_conn_${Date.now()}`,
      student_id: studentId,
      github_user_id: `gh_usr_${Date.now()}`,
      username: githubUsername,
      name: student?.name || 'Engineering Student',
      avatar_url: `https://avatars.githubusercontent.com/u/${Date.now().toString().slice(-6)}?v=4`,
      encrypted_token: this.encryptToken(`gho_${crypto.randomBytes(20).toString('hex')}`),
      scopes: ['read:user', 'repo:status', 'public_repo'],
      is_connected: true,
      created_at: now,
      updated_at: now,
    };

    await db.saveGitHubConnection(conn);

    // Auto-create initial demo repositories for the connected student if none exist
    const existingRepos = await db.getGitHubRepositories(studentId);
    if (existingRepos.length === 0) {
      const demoRepo1: GitHubRepository = {
        id: `gh_repo_${Date.now()}_1`,
        student_id: studentId,
        github_connection_id: conn.id,
        external_repo_id: `ext_${Date.now()}_1`,
        owner: conn.username,
        name: 'b.tech-ai-learning-platform',
        full_name: `${conn.username}/b.tech-ai-learning-platform`,
        description: 'Autonomous AI-powered learning and research environment for B.Tech students.',
        visibility: 'PUBLIC',
        default_branch: 'main',
        language: 'TypeScript',
        stars: 42,
        forks: 8,
        open_issues_count: 2,
        url: `https://github.com/${conn.username}/b.tech-ai-learning-platform`,
        clone_url: `https://github.com/${conn.username}/b.tech-ai-learning-platform.git`,
        linked_project_id: 'prj_01',
        analysis_status: 'ANALYZED',
        last_synced_at: now,
        created_at: now,
        updated_at: now,
      };

      const demoRepo2: GitHubRepository = {
        id: `gh_repo_${Date.now()}_2`,
        student_id: studentId,
        github_connection_id: conn.id,
        external_repo_id: `ext_${Date.now()}_2`,
        owner: conn.username,
        name: 'distributed-vector-retrieval',
        full_name: `${conn.username}/distributed-vector-retrieval`,
        description: 'High-concurrency vector index benchmarks using pgvector and Python FastAPI.',
        visibility: 'PUBLIC',
        default_branch: 'main',
        language: 'Python',
        stars: 12,
        forks: 3,
        open_issues_count: 1,
        url: `https://github.com/${conn.username}/distributed-vector-retrieval`,
        clone_url: `https://github.com/${conn.username}/distributed-vector-retrieval.git`,
        linked_project_id: 'prj_02',
        analysis_status: 'NOT_ANALYZED',
        last_synced_at: now,
        created_at: now,
        updated_at: now,
      };

      await db.saveGitHubRepository(demoRepo1);
      await db.saveGitHubRepository(demoRepo2);

      // Seed files for demoRepo1
      await db.saveGitHubRepositoryFiles(demoRepo1.id, [
        {
          path: 'package.json',
          name: 'package.json',
          type: 'file',
          size: 2450,
          sha: 'f1a92e8',
          content: `{\n  "name": "b.tech-ai-learning-platform",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.21.0",\n    "react": "^18.3.1",\n    "typescript": "^5.5.4"\n  }\n}`,
        },
        {
          path: 'README.md',
          name: 'README.md',
          type: 'file',
          size: 1820,
          sha: 'a8b29c4',
          content: `# B.Tech Student AI Learning Platform\n\nFull-stack student learning platform with RAG, AI research, and coding intelligence.`,
        },
        {
          path: 'server/server.ts',
          name: 'server.ts',
          type: 'file',
          size: 3200,
          sha: 'b7c8d9e',
          content: `import express from 'express';\nconst app = express();\napp.listen(3000, () => console.log('Server active on port 3000'));`,
        },
      ]);
    }

    const { encrypted_token, ...safeConn } = conn;
    return safeConn;
  }

  /**
   * Disconnect GitHub account
   */
  public static async disconnectAccount(studentId: string): Promise<boolean> {
    return await db.deleteGitHubConnection(studentId);
  }

  /**
   * List repositories for student
   */
  public static async listRepositories(
    studentId: string,
    filters?: { language?: string; visibility?: string }
  ): Promise<GitHubRepository[]> {
    let repos = await db.getGitHubRepositories(studentId);
    if (filters?.language) {
      repos = repos.filter((r) => r.language.toLowerCase() === filters.language!.toLowerCase());
    }
    if (filters?.visibility) {
      repos = repos.filter((r) => r.visibility.toLowerCase() === filters.visibility!.toLowerCase());
    }
    return repos;
  }

  /**
   * Get single repository with ownership check
   */
  public static async getRepository(repoId: string, studentId: string): Promise<GitHubRepository> {
    const repo = await db.getGitHubRepositoryById(repoId, studentId);
    if (!repo) {
      throw new NotFoundError(`GitHub repository with ID '${repoId}' not found`);
    }
    return repo;
  }

  /**
   * Link GitHub repository to Phase 10 Project Builder
   */
  public static async linkProject(
    repoId: string,
    studentId: string,
    projectId: string
  ): Promise<GitHubRepository> {
    const repo = await this.getRepository(repoId, studentId);
    // Real verified project ownership check
    const project = await ProjectService.getProject(projectId, studentId);

    const updated: GitHubRepository = {
      ...repo,
      linked_project_id: project.id,
      updated_at: new Date().toISOString(),
    };

    await db.saveGitHubRepository(updated);
    logger.info('Linked GitHub repository to Project Builder project', { repoId, projectId, studentId });
    return updated;
  }

  /**
   * Synchronize repository
   */
  public static async syncRepository(repoId: string, studentId: string): Promise<GitHubRepository> {
    const repo = await this.getRepository(repoId, studentId);
    const updated: GitHubRepository = {
      ...repo,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await db.saveGitHubRepository(updated);
    return updated;
  }

  /**
   * File Tree & Contents
   */
  public static async getRepositoryFiles(repoId: string, studentId: string): Promise<GitHubRepositoryFile[]> {
    await this.getRepository(repoId, studentId);
    return await db.getGitHubRepositoryFiles(repoId, studentId);
  }

  public static async getFileContent(
    repoId: string,
    filePath: string,
    studentId: string
  ): Promise<GitHubRepositoryFile> {
    await this.getRepository(repoId, studentId);
    const file = await db.getGitHubRepositoryFileByPath(repoId, filePath, studentId);
    if (!file) {
      throw new NotFoundError(`File '${filePath}' not found in repository`);
    }
    return file;
  }

  /**
   * Commits, Issues, Pull Requests
   */
  public static async getCommits(repoId: string, studentId: string): Promise<GitHubCommit[]> {
    await this.getRepository(repoId, studentId);
    return await db.getGitHubCommits(repoId, studentId);
  }

  public static async getIssues(repoId: string, studentId: string): Promise<GitHubIssue[]> {
    await this.getRepository(repoId, studentId);
    return await db.getGitHubIssues(repoId, studentId);
  }

  public static async getPullRequests(repoId: string, studentId: string): Promise<GitHubPullRequest[]> {
    await this.getRepository(repoId, studentId);
    return await db.getGitHubPullRequests(repoId, studentId);
  }
}
