import crypto from 'crypto';
import { db } from '../db/database';
import {
  GitHubConnection,
  GitHubRepository,
  GitHubRepositoryFile,
  GitHubCommit,
  GitHubIssue,
  GitHubPullRequest,
  GitHubResumeBullet,
  GitHubInterviewQuestion,
  GitHubLearningRepo,
} from '../models/researchGitHubTypes';
import { ProjectService } from './projectService';
import { ResumeService } from './resumeService';
import { AIService } from '../ai/service';
import { isModelAvailable, parseModelJson, rethrowAi } from '../ai/modelOutput';
import { GitHubAnalysisService } from './githubAnalysisService';
import { NotFoundError, AuthorizationError, ValidationError, AppError } from '../core/exceptions';
import { logger } from '../core/logging';
import { config } from '../core/config';

export class GitHubService {
  // Key for encrypting stored GitHub tokens. Falls back to the server's JWT secret (never shipped to the
  // browser) instead of a constant published in the source code.
  private static get ENCRYPTION_KEY(): string {
    return process.env.GITHUB_TOKEN_ENCRYPTION_KEY || process.env.GITHUB_ENCRYPTION_KEY || config.jwtSecret;
  }

  /** Read-only scope: public profile and public repositories. Private repositories are not requested. */
  public static readonly OAUTH_SCOPE = 'read:user';
  private static oauthStates = new Map<string, { studentId: string; expires: number }>();

  /**
   * Helper to encrypt tokens with AES-256
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
   * Helper to decrypt tokens
   */
  public static decryptToken(encryptedString: string): string {
    try {
      const parts = encryptedString.split(':');
      if (parts.length !== 2) return encryptedString;
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        crypto.scryptSync(this.ENCRYPTION_KEY, 'salt', 32),
        iv
      );
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (err) {
      return '';
    }
  }

  /**
   * Safe fetch with optional GitHub authentication
   */
  private static async githubFetch(endpoint: string, token?: string): Promise<any> {
    const url = endpoint.startsWith('http') ? endpoint : `https://api.github.com${endpoint}`;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'BTech-Student-AI-Platform/1.0',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let res: Response;
    try {
      res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    } catch (err: any) {
      throw new AppError(`GitHub could not be reached (${err?.name === 'TimeoutError' ? 'timeout' : err?.message || 'network error'}).`, 502, 'GITHUB_UNREACHABLE');
    }
    if (!res.ok) {
      const errorText = (await res.text()).slice(0, 300);
      if (res.status === 401) throw new AppError('GitHub rejected the stored token (expired or revoked). Reconnect GitHub.', 401, 'GITHUB_TOKEN_INVALID');
      if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
        const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
        throw new AppError(`GitHub API rate limit reached${reset ? `; it resets at ${new Date(reset).toISOString()}` : ''}.`, 429, 'GITHUB_RATE_LIMITED');
      }
      if (res.status === 404) throw new AppError('GitHub returned 404 (not found, or not visible with the granted access).', 404, 'GITHUB_NOT_FOUND');
      throw new AppError(`GitHub API error ${res.status}: ${errorText}`, 502, 'GITHUB_API_ERROR');
    }
    return await res.json();
  }

  /**
   * Get student's connection status and aggregated statistics (safe: strips encrypted_token)
   */
  public static async getConnectionStatus(studentId: string): Promise<{
    is_connected: boolean;
    connection?: Omit<GitHubConnection, 'encrypted_token'> | null;
    stats: {
      total_repositories: number;
      public_repositories: number;
      private_repositories: number;
      total_stars: number;
      total_forks: number;
      total_issues: number;
      total_pull_requests: number;
      languages: string[];
      featured_count: number;
      last_synced_at?: string;
    };
  }> {
    const conn = await db.getGitHubConnection(studentId);
    const repos = await db.getGitHubRepositories(studentId);

    const languages = Array.from(
      new Set(repos.map((r) => r.language).filter(Boolean))
    );
    const totalStars = repos.reduce((acc, r) => acc + (r.stars || 0), 0);
    const totalForks = repos.reduce((acc, r) => acc + (r.forks || 0), 0);
    const totalIssues = repos.reduce((acc, r) => acc + (r.open_issues_count || 0), 0);
    const publicCount = repos.filter((r) => r.visibility === 'PUBLIC').length;
    const privateCount = repos.filter((r) => r.visibility === 'PRIVATE').length;
    const featuredCount = repos.filter((r) => r.is_featured).length;

    const stats = {
      total_repositories: repos.length,
      public_repositories: publicCount,
      private_repositories: privateCount,
      total_stars: totalStars,
      total_forks: totalForks,
      total_issues: totalIssues,
      total_pull_requests: 0,
      languages,
      featured_count: featuredCount,
      last_synced_at: conn?.last_synced_at || repos[0]?.last_synced_at || undefined,
    };

    if (!conn || !conn.is_connected) {
      return { is_connected: false, connection: null, stats };
    }

    const { encrypted_token, ...safeConn } = conn;
    return {
      is_connected: true,
      connection: safeConn,
      stats,
    };
  }

  /** OAuth is available only when the server has its own GitHub OAuth app credentials. */
  public static isOAuthConfigured(): boolean {
    return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  }

  /**
   * Starts GitHub OAuth. The state is random, stored server-side for 10 minutes and bound to the
   * student, so the callback can verify it (CSRF protection). Refuses when no OAuth app is configured
   * (earlier versions used a hard-coded client id).
   */
  public static initiateOAuth(studentId: string, _redirectUri?: string): { oauth_url: string; state: string; scope: string } {
    if (!this.isOAuthConfigured()) {
      throw new AppError('GitHub OAuth is not configured on this server (GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are not set). Use a personal access token instead.', 503, 'OAUTH_NOT_CONFIGURED');
    }
    const now = Date.now();
    for (const [k, v] of this.oauthStates) if (v.expires < now) this.oauthStates.delete(k);
    const state = crypto.randomBytes(24).toString('hex');
    this.oauthStates.set(state, { studentId, expires: now + 10 * 60 * 1000 });
    // The redirect URI is server configuration only; a client-supplied redirect is ignored.
    const redirect = encodeURIComponent(process.env.GITHUB_REDIRECT_URI || `http://localhost:${config.port}/api/v1/github/callback`);
    return {
      oauth_url: `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(process.env.GITHUB_CLIENT_ID!)}&redirect_uri=${redirect}&scope=${encodeURIComponent(this.OAUTH_SCOPE)}&state=${state}&allow_signup=false`,
      state,
      scope: this.OAUTH_SCOPE,
    };
  }

  /** Verifies and consumes an OAuth state. Returns the student it was issued to. */
  public static consumeOAuthState(state: string | undefined): string {
    const entry = state ? this.oauthStates.get(state) : undefined;
    if (state) this.oauthStates.delete(state);
    if (!entry || entry.expires < Date.now()) {
      throw new AppError('Invalid or expired OAuth state. Start the GitHub connection again.', 400, 'OAUTH_STATE_INVALID');
    }
    return entry.studentId;
  }

  /** Completes OAuth: verifies the state, exchanges the code for a token on the server and connects. */
  public static async completeOAuth(state: string | undefined, code: string | undefined) {
    const studentId = this.consumeOAuthState(state);
    if (!code) throw new AppError('GitHub did not return an authorization code.', 400, 'OAUTH_CODE_MISSING');
    let tokenRes: any;
    try {
      const r = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'BTech-Student-AI-Platform/1.0' },
        body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code }),
        signal: AbortSignal.timeout(15000),
      });
      tokenRes = await r.json();
    } catch (err: any) {
      throw new AppError(`GitHub could not be reached to finish sign-in (${err?.message || 'network error'}).`, 502, 'GITHUB_UNREACHABLE');
    }
    if (!tokenRes?.access_token) {
      throw new AppError(`GitHub did not issue a token (${tokenRes?.error || 'unknown error'}). Nothing was connected.`, 400, 'OAUTH_EXCHANGE_FAILED');
    }
    const user = await this.githubFetch('/user', tokenRes.access_token);
    return { studentId, connection: await this.connectAccount(studentId, user.login, tokenRes.access_token, 'OAUTH', String(tokenRes.scope || this.OAUTH_SCOPE).split(/[ ,]+/).filter(Boolean)) };
  }

  /**
   * Stores a GitHub connection from verified API data. With a token (OAuth or PAT) GitHub has confirmed
   * the account; with only a username the record is a public profile and is labelled as unverified.
   */
  public static async connectAccount(
    studentId: string,
    githubUsername: string,
    token?: string,
    connectionType?: 'OAUTH' | 'PAT' | 'PUBLIC_USERNAME',
    scopes?: string[]
  ): Promise<Omit<GitHubConnection, 'encrypted_token'>> {
    const now = new Date().toISOString();
    const type = connectionType || (token ? 'PAT' : 'PUBLIC_USERNAME');
    const username = String(githubUsername || '').trim();
    if (!token && !/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
      throw new ValidationError('Enter a valid GitHub username.');
    }

    const ghProfile = token ? await this.githubFetch('/user', token) : await this.githubFetch(`/users/${encodeURIComponent(username)}`);
    const login = ghProfile.login;
    const repoList: any[] = [];
    for (let page = 1; page <= 10; page++) {
      const batch = token
        ? await this.githubFetch(`/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner`, token)
        : await this.githubFetch(`/users/${encodeURIComponent(login)}/repos?per_page=100&page=${page}&sort=updated`);
      if (!Array.isArray(batch)) break;
      repoList.push(...batch);
      if (batch.length < 100) break;
    }

    const existing = await db.getGitHubConnection(studentId);
    const conn: GitHubConnection = {
      id: existing?.id || `gh_conn_${Date.now()}`,
      student_id: studentId,
      github_user_id: String(ghProfile.id),
      username: login,
      name: ghProfile.name || login,
      avatar_url: ghProfile.avatar_url || '',
      bio: ghProfile.bio || '',
      company: ghProfile.company || undefined,
      location: ghProfile.location || undefined,
      public_repos: typeof ghProfile.public_repos === 'number' ? ghProfile.public_repos : undefined,
      followers: typeof ghProfile.followers === 'number' ? ghProfile.followers : undefined,
      following: typeof ghProfile.following === 'number' ? ghProfile.following : undefined,
      profile_url: ghProfile.html_url || `https://github.com/${login}`,
      // Only a real token is stored (encrypted). A public-username link has no token at all.
      encrypted_token: token ? this.encryptToken(token) : '',
      scopes: token ? scopes || [] : [],
      connection_type: type,
      sync_status: 'SYNCED',
      sync_error: undefined,
      is_connected: true,
      last_synced_at: now,
      last_sync_attempt_at: now,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    await db.saveGitHubConnection(conn);

    // Upsert by GitHub's repository id (no duplicates), and drop repositories that no longer exist upstream.
    const seen = new Set<string>();
    const before = await db.getGitHubRepositories(studentId);
    for (const r of repoList) {
      // Ids are per student: two students linking the same public account must not overwrite each other.
      const prev = before.find((x) => x.external_repo_id === String(r.id));
      const id = prev?.id || `gh_repo_${studentId}_${r.id}`;
      seen.add(id);
      const repoRecord: GitHubRepository = {
        ...(prev || {}),
        id,
        student_id: studentId,
        github_connection_id: conn.id,
        external_repo_id: String(r.id),
        owner: r.owner?.login || login,
        name: r.name,
        full_name: r.full_name,
        description: r.description || '',
        visibility: r.private ? 'PRIVATE' : 'PUBLIC',
        default_branch: r.default_branch || 'main',
        language: r.language || '',
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        open_issues_count: r.open_issues_count || 0,
        url: r.html_url,
        clone_url: r.clone_url,
        topics: r.topics || [],
        license: r.license?.name || undefined,
        is_fork: Boolean(r.fork),
        is_starred: prev?.is_starred || false,
        is_featured: prev?.is_featured || false,
        analysis_status: prev?.analysis_status || 'NOT_ANALYZED',
        last_synced_at: now,
        created_at: r.created_at || now,
        updated_at: r.updated_at || now,
      } as GitHubRepository;
      await db.saveGitHubRepository(repoRecord);
    }
    for (const old of before) {
      if (!seen.has(old.id)) await db.deleteGitHubRepository?.(old.id, studentId);
    }

    const { encrypted_token, ...safeConn } = conn;
    return safeConn;
  }

  /** Links a public GitHub username. Clearly not a verified connection: there is no token. */
  public static async connectPublicUsername(studentId: string, username: string) {
    return this.connectAccount(studentId, username, undefined, 'PUBLIC_USERNAME');
  }

  /**
   * Connect via GitHub Personal Access Token (PAT)
   */
  public static async connectWithToken(
    studentId: string,
    token: string,
    customUsername?: string
  ): Promise<Omit<GitHubConnection, 'encrypted_token'>> {
    if (!token || token.trim().length === 0) {
      throw new ValidationError('A valid GitHub Personal Access Token is required');
    }

    try {
      const user = await this.githubFetch('/user', token.trim());
      return await this.connectAccount(studentId, user.login || customUsername || '', token.trim(), 'PAT');
    } catch (err: any) {
      if (err?.code === 'GITHUB_RATE_LIMITED' || err?.code === 'GITHUB_UNREACHABLE') throw err;
      // Do not create a connection with an invented profile when GitHub did not accept the token.
      logger.warn(`GitHub token validation failed: ${err.message}`);
      throw new ValidationError(
        'GitHub did not accept this token (or GitHub could not be reached), so no account was connected. Check the token and try again.'
      );
    }
  }

  /**
   * Disconnect GitHub account
   */
  /** Removes the connection, its stored token and the repository data that was synced from GitHub. */
  public static async disconnectAccount(studentId: string): Promise<boolean> {
    const removed = await db.deleteGitHubConnection(studentId);
    for (const r of await db.getGitHubRepositories(studentId)) {
      await db.deleteGitHubRepository(r.id, studentId);
    }
    return removed;
  }

  /**
   * Full Synchronize: Refresh profile and repositories
   */
  public static async syncAll(studentId: string): Promise<{
    connection: Omit<GitHubConnection, 'encrypted_token'>;
    synced_repos_count: number;
  }> {
    const conn = await db.getGitHubConnection(studentId);
    if (!conn) {
      throw new NotFoundError('No connected GitHub account found for this student');
    }

    const token = conn.encrypted_token ? this.decryptToken(conn.encrypted_token) : '';
    if (conn.encrypted_token && !token) {
      await db.saveGitHubConnection({ ...conn, sync_status: 'PERMISSION_EXPIRED', sync_error: 'The stored token could not be decrypted (encryption key changed). Reconnect GitHub.', last_sync_attempt_at: new Date().toISOString() });
      throw new AppError('The stored GitHub token cannot be used. Reconnect GitHub.', 401, 'GITHUB_TOKEN_INVALID');
    }
    let updated;
    try {
      updated = await this.connectAccount(studentId, conn.username, token || undefined, conn.connection_type || (token ? 'PAT' : 'PUBLIC_USERNAME'), conn.scopes);
    } catch (err: any) {
      // A failed sync is recorded as failed; the previous successful sync time is kept unchanged.
      await db.saveGitHubConnection({
        ...conn,
        sync_status: err?.code === 'GITHUB_TOKEN_INVALID' ? 'PERMISSION_EXPIRED' : 'SYNC_FAILED',
        sync_error: String(err?.message || 'Sync failed'),
        last_sync_attempt_at: new Date().toISOString(),
      });
      throw err;
    }
    const repos = await db.getGitHubRepositories(studentId);

    logger.info(`Synchronized GitHub account for student ${studentId}: ${repos.length} repositories.`);
    return {
      connection: updated,
      synced_repos_count: repos.length,
    };
  }

  /**
   * List repositories with filters and sorting
   */
  public static async listRepositories(
    studentId: string,
    filters?: {
      language?: string;
      visibility?: string;
      is_featured?: boolean;
      search?: string;
      sort?: 'updated' | 'stars' | 'forks' | 'name';
    }
  ): Promise<GitHubRepository[]> {
    let repos = await db.getGitHubRepositories(studentId);

    if (filters?.language && filters.language !== 'ALL') {
      repos = repos.filter((r) => r.language?.toLowerCase() === filters.language!.toLowerCase());
    }
    if (filters?.visibility && filters.visibility !== 'ALL') {
      repos = repos.filter((r) => r.visibility?.toLowerCase() === filters.visibility!.toLowerCase());
    }
    if (filters?.is_featured !== undefined) {
      repos = repos.filter((r) => Boolean(r.is_featured) === filters.is_featured);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      repos = repos.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q) ||
          r.language.toLowerCase().includes(q) ||
          r.topics?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    const sortField = filters?.sort || 'updated';
    repos.sort((a, b) => {
      if (sortField === 'stars') return (b.stars || 0) - (a.stars || 0);
      if (sortField === 'forks') return (b.forks || 0) - (a.forks || 0);
      if (sortField === 'name') return a.name.localeCompare(b.name);
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

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
   * Retrieve README content safely
   */
  public static async getReadme(
    repoId: string,
    studentId: string
  ): Promise<{ repo_id: string; name: string; content: string; path: string }> {
    const repo = await this.getRepository(repoId, studentId);
    if (repo.readme_content) {
      return {
        repo_id: repo.id,
        name: 'README.md',
        content: repo.readme_content,
        path: 'README.md',
      };
    }

    // Try finding README in repository files
    const readmeFile = await db.getGitHubRepositoryFileByPath(repoId, 'README.md', studentId);
    const content =
      readmeFile?.content ||
      `# ${repo.name}\n\n${repo.description || 'No detailed README provided in this repository.'}\n\n- **Primary Language:** ${repo.language}\n- **Default Branch:** ${repo.default_branch}\n- **Clone URL:** \`${repo.clone_url}\``;

    return {
      repo_id: repo.id,
      name: 'README.md',
      content,
      path: 'README.md',
    };
  }

  /**
   * Synchronize single repository
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
   * Toggle Featured Project status & save portfolio metadata
   */
  public static async toggleFeatured(
    repoId: string,
    studentId: string,
    isFeatured?: boolean,
    metadata?: Partial<GitHubRepository['featured_metadata']>
  ): Promise<GitHubRepository> {
    const repo = await this.getRepository(repoId, studentId);
    const newFeatured = isFeatured !== undefined ? isFeatured : !repo.is_featured;

    const updated: GitHubRepository = {
      ...repo,
      is_featured: newFeatured,
      featured_metadata: newFeatured
        ? {
            title: metadata?.title || repo.name,
            role: metadata?.role || 'Lead Developer',
            custom_description: metadata?.custom_description || repo.description,
            tech_stack: metadata?.tech_stack || [repo.language, ...(repo.topics || [])].filter(Boolean),
            key_features: metadata?.key_features || ['Clean modular architecture', 'Version controlled workflows'],
            challenges_solved: metadata?.challenges_solved || 'Architected and implemented project core modules.',
            lessons_learned: metadata?.lessons_learned,
            demo_url: metadata?.demo_url || undefined,
            resume_bullets: metadata?.resume_bullets || [],
          }
        : repo.featured_metadata,
      updated_at: new Date().toISOString(),
    };

    await db.saveGitHubRepository(updated);
    logger.info(`Toggled featured status for repository ${repoId}: ${newFeatured}`);
    return updated;
  }

  /**
   * List all featured repositories
   */
  public static async listFeatured(studentId: string): Promise<GitHubRepository[]> {
    return await this.listRepositories(studentId, { is_featured: true });
  }

  /**
   * Update student's private personal notes on a repository
   */
  public static async updatePersonalNotes(
    repoId: string,
    studentId: string,
    notes: string
  ): Promise<GitHubRepository> {
    const repo = await this.getRepository(repoId, studentId);
    const updated: GitHubRepository = {
      ...repo,
      personal_notes: notes,
      updated_at: new Date().toISOString(),
    };
    await db.saveGitHubRepository(updated);
    return updated;
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
   * Aggregate programming language statistics across all student repositories
   */
  public static async getLanguagesSummary(studentId: string): Promise<{
    languages: { name: string; repo_count: number; percentage: number; color: string }[];
    total_repos_counted: number;
    total_repositories?: number;
    primary_language: string;
  }> {
    const repos = await db.getGitHubRepositories(studentId);
    const langCounts: Record<string, number> = {};

    for (const r of repos) {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    }

    const totalCounted = Object.values(langCounts).reduce((a, b) => a + b, 0);

    const colorPalette: Record<string, string> = {
      TypeScript: '#3178C6',
      JavaScript: '#F7DF1E',
      Python: '#3776AB',
      Java: '#B07219',
      'C++': '#F34B7D',
      C: '#555555',
      Go: '#00ADD8',
      Rust: '#DEA584',
      HTML: '#E34C26',
      CSS: '#563D7C',
      SQL: '#E38C00',
    };

    const languages = Object.entries(langCounts)
      .map(([name, count]) => ({
        name,
        repo_count: count,
        percentage: totalCounted > 0 ? Math.round((count / totalCounted) * 100) : 0,
        color: colorPalette[name] || '#6366F1',
      }))
      .sort((a, b) => b.repo_count - a.repo_count);

    return {
      languages,
      total_repositories: repos.length,
      total_repos_counted: repos.length,
      primary_language: languages[0]?.name || 'None',
    };
  }

  /**
   * AI-Assisted Resume Bullet Points Generation
   * Grounded in real repository details without hallucinations
   */
  public static async generateResumeBullets(
    repoId: string,
    studentId: string,
    roleContext?: string
  ): Promise<{ bullets: GitHubResumeBullet[]; repository_name: string; tech_stack: string[] }> {
    const repo = await this.getRepository(repoId, studentId);
    const files = await db.getGitHubRepositoryFiles(repoId, studentId);
    const commits = await db.getGitHubCommits(repoId, studentId);

    const detectedTechs = Array.from(
      new Set([repo.language, ...(repo.topics || [])].filter(Boolean))
    );

    // Defensive prompt injection containment
    const prompt = `You are a technical career coach. Formulate 3-4 impactful, action-driven resume bullet points for an engineering student resume based STRICTLY on this verified GitHub repository:
<REPO_SOURCE_UNTRUSTED>
Repository: ${repo.name}
Description: ${repo.description}
Primary Language: ${repo.language}
Role Context: ${roleContext || 'Software Developer'}
Topics: ${(repo.topics || []).join(', ')}
Total Commits: ${commits.length}
Key Files: ${files.slice(0, 5).map((f) => f.path).join(', ')}
</REPO_SOURCE_UNTRUSTED>

Rules:
1. Start each bullet point with a strong action verb (e.g. Engineered, Architected, Implemented, Designed).
2. Highlight technical architecture and clean design.
3. NEVER fabricate metrics or claim production deployments if not verified.
4. Output strictly a JSON array of objects: [{ "bullet": string, "technologies": string[], "context": string }]`;

    // Bullets come only from the model and are drafts for the student to check; without a model nothing is
    // generated (the old fallback wrote claims such as "Architected ... with defensive error handling").
    if (!isModelAvailable()) {
      throw new AppError('Resume bullet generation needs the AI provider, which is not available right now. Nothing was generated.', 503, 'AI_UNAVAILABLE');
    }
    let generatedBullets: any[] = [];
    try {
      const response = await AIService.generate([{ role: 'user', content: prompt }], 'student_learning_agent', 0.3);
      const parsed = parseModelJson<any>(response, 'Resume bullet generation');
      if (!Array.isArray(parsed) || parsed.length === 0) throw new AppError('Resume bullet generation: the AI did not return bullets.', 502, 'AI_BAD_OUTPUT');
      generatedBullets = parsed.filter((b: any) => b && typeof b.bullet === 'string');
    } catch (err: any) {
      rethrowAi(err, 'Resume bullet generation');
    }

    const bullets: GitHubResumeBullet[] = generatedBullets.map((b, i) => ({
      id: `rb_${Date.now()}_${i}`,
      bullet: b.bullet,
      context: b.context || 'Project Highlight',
      technologies: Array.isArray(b.technologies) ? b.technologies.map(String) : detectedTechs,
      // AI drafts are not verified facts: the student must review them before adding them to a resume.
      verified: false,
    }));

    return {
      bullets,
      repository_name: repo.name,
      tech_stack: detectedTechs,
    };
  }

  /**
   * Export repository project & verified bullet points to student's active Resume
   */
  public static async exportToResume(
    repoId: string,
    studentId: string,
    optionsOrBullets?:
      | { bullets?: string[]; title?: string; tech_stack?: string[]; resume_id?: string }
      | string[],
    targetResumeId?: string
  ): Promise<{
    success: boolean;
    resume_id: string;
    project_id: string;
    title: string;
    bullets_count: number;
    message: string;
  }> {
    const repo = await this.getRepository(repoId, studentId);

    const student = await db.getStudentById(studentId);

    let customBullets: string[] | undefined;
    let customTitle: string | undefined;
    let customTech: string[] | undefined;
    let resumeId = targetResumeId;

    if (Array.isArray(optionsOrBullets)) {
      customBullets = optionsOrBullets;
    } else if (optionsOrBullets && typeof optionsOrBullets === 'object') {
      customBullets = optionsOrBullets.bullets;
      customTitle = optionsOrBullets.title;
      customTech = optionsOrBullets.tech_stack;
      resumeId = optionsOrBullets.resume_id || resumeId;
    }

    // Find student's active resume or create one. A resume id from the request must belong to this student.
    const resumes = await ResumeService.listResumes(studentId);
    if (resumeId && !resumes.some((r) => r.id === resumeId)) {
      throw new NotFoundError(`Resume '${resumeId}' not found`);
    }
    if (!resumeId) {
      if (resumes.length === 0) {
        const newResume = await ResumeService.createResume(studentId, {
          title: `${student?.name || 'Engineering'} Software Engineer Resume`,
          target_role: 'Software Development Engineer',
        });
        resumeId = newResume.resume.id;
      } else {
        resumeId = resumes[0].id;
      }
    }

    const existingProjects = await db.getResumeProjects(resumeId);

    // Only bullets the student chose are exported. Without them the repository description is used as is.
    const bullets = (customBullets || []).map((b) => String(b).trim()).filter(Boolean).slice(0, 8);

    const projectTitle = customTitle || repo.name;
    const projectTech = customTech || [repo.language, ...(repo.topics || [])].filter(Boolean);

    const newProject = {
      id: `rprj_gh_${Date.now()}`,
      resume_id: resumeId,
      title: projectTitle,
      description_override: repo.description,
      highlighted_features: bullets,
      technologies: projectTech,
      order_index: existingProjects.length,
    };

    existingProjects.push(newProject as any);
    await db.saveResumeProjects(resumeId, existingProjects);

    logger.info(`Exported GitHub repo ${repo.name} to resume ${resumeId} for student ${studentId}`);
    return {
      success: true,
      resume_id: resumeId,
      project_id: newProject.id,
      title: projectTitle,
      bullets_count: bullets.length,
      message: `Added ${projectTitle} to your resume${bullets.length ? ` with ${bullets.length} bullet(s)` : ' (no bullets; add them in the resume editor)'}.`,
    };
  }

  /**
   * Project Interview Questions & Model Answers Generation
   */
  public static async generateInterviewPrep(
    repoId: string,
    studentId: string
  ): Promise<{ questions: GitHubInterviewQuestion[]; repo_name: string; generated_at: string }> {
    const repo = await this.getRepository(repoId, studentId);
    const files = await db.getGitHubRepositoryFiles(repoId, studentId);

    // Practice questions about the student's own repository. They are templates, not claims: there is no
    // "model answer" describing what the student did, because only the student knows that.
    const testFiles = files.filter((f) => /test|spec/i.test(f.path)).map((f) => f.path);
    const lang = repo.language || 'the main language';
    const mk = (n: number, question: string, category: GitHubInterviewQuestion['category'], points: string[], rel: string[]): GitHubInterviewQuestion => ({
      id: `iq_${n}_${repoId}`,
      question,
      answer: `Answer from your own work on ${repo.name}. Cover: ${points.join('; ')}.`,
      category,
      key_points: points,
      relevant_files: rel,
    });
    const questions: GitHubInterviewQuestion[] = [
      mk(1, `Can you explain the high-level architecture of your ${repo.name} project?`, 'ARCHITECTURE', ['main components and how they talk to each other', 'where data is stored', 'which parts you wrote yourself'], files.slice(0, 3).map((f) => f.path)),
      mk(2, `Why did you choose ${lang} for ${repo.name}, and what trade-offs did that bring?`, 'TRADEOFFS', ['alternatives you considered', 'what the choice made easier', 'what it made harder'], []),
      mk(3, testFiles.length ? `How do the tests in ${repo.name} (for example ${testFiles[0]}) check edge cases?` : `${repo.name} has no test files in the synced tree. How would you test it?`, 'TESTING', ['which behaviour is tested', 'edge cases', 'what is not tested yet'], testFiles.slice(0, 5)),
      mk(4, `What was the most difficult problem you solved in ${repo.name}?`, 'CHALLENGES', ['the problem', 'how you found the cause', 'how you verified the fix'], []),
      mk(5, `If you had two more weeks, what would you improve or scale in ${repo.name}?`, 'PERFORMANCE', ['the current bottleneck or gap', 'your proposed change', 'how you would measure the result'], []),
    ];

    return {
      questions,
      repo_name: repo.name,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Learning & Open Source Repository Discovery
   */
  public static async searchLearningRepositories(
    queryOrParams?: string | { query?: string; topic?: string; language?: string },
    topicArg?: string,
    languageArg?: string
  ): Promise<{ total_count: number; items: GitHubLearningRepo[] }> {
    let query: string | undefined;
    let topic: string | undefined;
    let language: string | undefined;

    if (typeof queryOrParams === 'object' && queryOrParams !== null) {
      query = queryOrParams.query;
      topic = queryOrParams.topic;
      language = queryOrParams.language;
    } else {
      query = queryOrParams;
      topic = topicArg;
      language = languageArg;
    }

    const curatedLearningRepos: GitHubLearningRepo[] = [
      {
        id: 'lr_1',
        name: 'fastapi',
        full_name: 'tiangolo/fastapi',
        description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production',
        language: 'Python',
        stars: 76000,
        stargazers_count: 76000,
        url: 'https://github.com/tiangolo/fastapi',
        html_url: 'https://github.com/tiangolo/fastapi',
        topic: 'Backend Development',
        learning_focus: 'Async API design, Pydantic validation, and clean RESTful patterns.',
        difficulty: 'INTERMEDIATE',
      },
      {
        id: 'lr_2',
        name: 'javascript-algorithms',
        full_name: 'trekhleb/javascript-algorithms',
        description: 'Algorithms and data structures implemented in JavaScript with explanations and links to further readings',
        language: 'JavaScript',
        stars: 185000,
        stargazers_count: 185000,
        url: 'https://github.com/trekhleb/javascript-algorithms',
        html_url: 'https://github.com/trekhleb/javascript-algorithms',
        topic: 'DSA & Algorithms',
        learning_focus: 'Data structures, Big-O complexity, and dynamic programming.',
        difficulty: 'BEGINNER',
      },
      {
        id: 'lr_3',
        name: 'developer-roadmap',
        full_name: 'kamranahmedse/developer-roadmap',
        description: 'Interactive roadmaps, guides and other educational content to help developers grow in their careers.',
        language: 'TypeScript',
        stars: 290000,
        stargazers_count: 290000,
        url: 'https://github.com/kamranahmedse/developer-roadmap',
        html_url: 'https://github.com/kamranahmedse/developer-roadmap',
        topic: 'Career & System Design',
        learning_focus: 'Full-stack engineering pathways, protocols, and architectural fundamentals.',
        difficulty: 'BEGINNER',
      },
      {
        id: 'lr_4',
        name: 'system-design-primer',
        full_name: 'donnemartin/system-design-primer',
        description: 'Learn how to design large-scale systems. Prep for the system design interview.',
        language: 'Python',
        stars: 275000,
        stargazers_count: 275000,
        url: 'https://github.com/donnemartin/system-design-primer',
        html_url: 'https://github.com/donnemartin/system-design-primer',
        topic: 'System Design',
        learning_focus: 'Load balancing, caching, sharding, and high-availability distributed systems.',
        difficulty: 'ADVANCED',
      },
      {
        id: 'lr_5',
        name: 'spring-petclinic',
        full_name: 'spring-projects/spring-petclinic',
        description: 'A sample Spring Boot application demonstrating standard Java enterprise patterns.',
        language: 'Java',
        stars: 7200,
        stargazers_count: 7200,
        url: 'https://github.com/spring-projects/spring-petclinic',
        html_url: 'https://github.com/spring-projects/spring-petclinic',
        topic: 'Enterprise Backend',
        learning_focus: 'Spring Boot, JPA, Hibernate, MVC, and dependency injection.',
        difficulty: 'INTERMEDIATE',
      },
      {
        id: 'lr_6',
        name: 'pytorch-tutorial',
        full_name: 'yunjey/pytorch-tutorial',
        description: 'PyTorch Tutorial for Deep Learning Researchers with beginner to advanced examples.',
        language: 'Python',
        stars: 27000,
        stargazers_count: 27000,
        url: 'https://github.com/yunjey/pytorch-tutorial',
        html_url: 'https://github.com/yunjey/pytorch-tutorial',
        topic: 'AI & Machine Learning',
        learning_focus: 'Feedforward neural networks, CNNs, RNNs, and model training loops.',
        difficulty: 'INTERMEDIATE',
      },
    ];

    let results = curatedLearningRepos;

    if (language && language !== 'ALL') {
      results = results.filter((r) => r.language.toLowerCase() === language.toLowerCase());
    }
    if (topic && topic !== 'ALL') {
      const queryWords = topic.toLowerCase().replace(/[-_&]/g, ' ').split(/\s+/).filter(Boolean);
      results = results.filter((r) => {
        const repoTopic = r.topic.toLowerCase();
        if (repoTopic.includes(topic.toLowerCase())) return true;
        return queryWords.some((word) => repoTopic.includes(word));
      });
    }
    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.topic.toLowerCase().includes(q) ||
          r.full_name?.toLowerCase().includes(q)
      );
    }

    return {
      total_count: results.length,
      items: results,
      // This list is curated in the code, not fetched from GitHub; star counts are approximate snapshots.
      source: 'CURATED_LIST',
      source_note: 'Curated learning repositories. Star counts are approximate and not live GitHub data.',
    } as any;
  }

  /**
   * File Tree & Contents
   */
  public static async getRepositoryFiles(repoId: string, studentId: string): Promise<GitHubRepositoryFile[]> {
    const repo = await this.getRepository(repoId, studentId);
    const cached = await db.getGitHubRepositoryFiles(repoId, studentId);
    if (cached.length > 0) return cached;
    // Fetch the real file tree from GitHub (no contents) and cache it.
    try {
      const token = await this.getStoredToken(studentId);
      const tree = await this.githubFetch(
        `/repos/${repo.full_name}/git/trees/${encodeURIComponent(repo.default_branch || 'main')}?recursive=1`,
        token
      );
      const files: GitHubRepositoryFile[] = (tree?.tree || []).slice(0, 2000).map((t: any) => ({
        path: t.path,
        name: String(t.path).split('/').pop() || t.path,
        type: t.type === 'tree' ? 'dir' : 'file',
        size: t.size || 0,
        sha: t.sha,
      }));
      if (files.length) await db.saveGitHubRepositoryFiles(repoId, files);
      return files;
    } catch (err: any) {
      logger.info(`GitHub file tree unavailable for ${repo.full_name}: ${err.message}`);
      return [];
    }
  }

  /** Decrypted token of the student's stored GitHub connection, if any. */
  private static async getStoredToken(studentId: string): Promise<string | undefined> {
    const conn = await db.getGitHubConnection(studentId);
    if (!conn?.encrypted_token) return undefined;
    try {
      return this.decryptToken(conn.encrypted_token) || undefined;
    } catch {
      return undefined;
    }
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
    const repo = await this.getRepository(repoId, studentId);
    const cached = await db.getGitHubCommits(repoId, studentId);
    if (cached.length > 0) return cached;
    // Fetch real commit history from GitHub and cache it.
    try {
      const token = await this.getStoredToken(studentId);
      const raw = await this.githubFetch(`/repos/${repo.full_name}/commits?per_page=30`, token);
      const commits: GitHubCommit[] = (Array.isArray(raw) ? raw : []).map((c: any) => ({
        id: c.sha,
        repository_id: repoId,
        sha: c.sha,
        message: c.commit?.message || '',
        author_name: c.commit?.author?.name || c.author?.login || 'unknown',
        author_email: c.commit?.author?.email,
        date: c.commit?.author?.date || '',
        committed_at: c.commit?.author?.date,
        url: c.html_url,
        changed_files_count: Array.isArray(c.files) ? c.files.length : 0,
      }));
      if (commits.length) await db.saveGitHubCommits(repoId, commits);
      return commits;
    } catch (err: any) {
      logger.info(`GitHub commits unavailable for ${repo.full_name}: ${err.message}`);
      return [];
    }
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
