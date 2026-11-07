// server/services/externalIntegrationService.ts
// Comprehensive business logic for External Platform Connections, Data Synchronization, Skill Evidence, and Career Consistency

import {
  ExternalProviderId,
  ExternalAccountConnection,
  ExternalActivity,
  ExternalProfile,
  ExternalAchievement,
  ExternalSkillEvidence,
  ExternalJob,
  CareerConsistencyReport,
} from '../models/externalIntegrationTypes';
import { ExternalIntegrationRegistry } from './externalIntegrationRegistry';
import { GitHubService } from './githubService';
import { NotFoundError, ValidationError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';
import { githubVerification } from './platformVerification';

export class ExternalIntegrationService {
  // In-memory collections keyed by student_id and connection_id
  private static connections: Map<string, ExternalAccountConnection> = new Map();
  private static activities: Map<string, ExternalActivity[]> = new Map();
  private static profiles: Map<string, ExternalProfile[]> = new Map();
  /** Job descriptions a student imported, keyed by job id; each one belongs to one student. */
  private static jobs: Map<string, ExternalJob & { student_id?: string }> = new Map();

  /**
   * List all connected external accounts for student
   */
  public static async listConnections(studentId: string): Promise<ExternalAccountConnection[]> {
    return Array.from(this.connections.values()).filter((c) => c.student_id === studentId);
  }

  /**
   * Get single connection
   */
  public static async getConnection(studentId: string, connectionId: string): Promise<ExternalAccountConnection> {
    const conn = this.connections.get(connectionId);
    if (!conn || conn.student_id !== studentId) {
      throw new NotFoundError(`External connection '${connectionId}' not found`);
    }
    return conn;
  }

  /**
   * Saves a platform link. Status is CONNECTED only when ownership is verified (GitHub OAuth or access token through the
   * GitHub module); every other link is LINKED: saved, not verified, nothing imported. No scopes are invented.
   */
  public static async connectPlatform(
    studentId: string,
    providerId: ExternalProviderId,
    payload: { username?: string; profile_url?: string; code?: string }
  ): Promise<ExternalAccountConnection> {
    const provider = ExternalIntegrationRegistry.get(providerId);
    if (!provider) {
      throw new ValidationError(`Unsupported external provider: '${providerId}'`);
    }
    const info = provider.getInfo();
    if (payload?.code !== undefined) {
      throw new ValidationError(`${info.name} sign-in (OAuth) is not available here. Save your public profile link instead.`);
    }
    const username = typeof payload?.username === 'string' ? payload.username.trim() : '';
    if (!/^[A-Za-z0-9_.-]{1,60}$/.test(username)) {
      throw new ValidationError('Enter your username on that platform (letters, digits, "_", "-" or ".", up to 60 characters).');
    }
    let profileUrl: string | undefined;
    if (payload?.profile_url) {
      let u: URL;
      try { u = new URL(String(payload.profile_url)); } catch { throw new ValidationError('profile_url must be a web address'); }
      const official = new URL(info.official_url).hostname.replace(/^www\./, '');
      if (u.protocol !== 'https:' || !(u.hostname === official || u.hostname.endsWith('.' + official))) {
        throw new ValidationError(`profile_url must be an https link on ${official}`);
      }
      profileUrl = u.toString();
    }

    let status: ExternalAccountConnection['status'] = 'LINKED';
    let scopes: string[] = [];
    let displayName = `${info.name} (${username})`;
    if (providerId === 'github') {
      const gh = await githubVerification(studentId, username);
      if (gh.verified) {
        const conn = await (await import('../db/database')).db.getGitHubConnection(studentId);
        status = 'CONNECTED';
        scopes = conn?.scopes || [];
        displayName = `GitHub (@${gh.username})`;
      }
    }

    const now = new Date().toISOString();
    const connectionId = `conn_${providerId}_${studentId}`;
    const newConnection: ExternalAccountConnection = {
      id: connectionId,
      student_id: studentId,
      provider: providerId,
      display_name: displayName,
      username,
      profile_url: profileUrl || '',
      status,
      scopes,
      connected_at: now,
      last_synced_at: undefined,
      sync_status: 'IDLE',
      created_at: now,
      updated_at: now,
    };
    this.connections.set(connectionId, newConnection);
    logger.info(`External platform ${status === 'CONNECTED' ? 'connected (verified)' : 'linked (not verified)'} for student ${studentId}: ${providerId}`);
    return newConnection;
  }

  /**
   * Disconnect an external account
   */
  public static async disconnectPlatform(studentId: string, connectionId: string): Promise<boolean> {
    const conn = await this.getConnection(studentId, connectionId);
    conn.status = 'DISCONNECTED';
    conn.updated_at = new Date().toISOString();
    return true;
  }

  /**
   * Trigger data synchronization with external provider
   */
  public static async syncConnection(studentId: string, connectionId: string): Promise<ExternalAccountConnection> {
    const conn = await this.getConnection(studentId, connectionId);
    const provider = ExternalIntegrationRegistry.get(conn.provider);
    if (!provider) throw new ValidationError(`Provider '${conn.provider}' not registered`);

    conn.sync_status = 'IN_PROGRESS';
    try {
      // Only GitHub has a real data source in this platform (repositories the student imported).
      // The other providers have no live API client, and their adapters return sample data, so
      // syncing them must report that nothing was imported rather than invent solved problems.
      if (conn.provider !== 'github') {
        throw new Error(
          `Live sync with ${provider.getInfo().name} is not available yet, so no data was imported. ` +
            `Your profile link is saved.`
        );
      }

      const syncResult = await this.syncGitHubFromImportedRepos(studentId, conn);

      // Append new activities
      const existingActs = this.activities.get(studentId) || [];
      this.activities.set(studentId, [...syncResult.activities, ...existingActs].slice(0, 50));
      conn.error_status = undefined;

      conn.sync_status = 'SUCCESS';
      conn.status = 'SYNCED';
      conn.last_synced_at = new Date().toISOString();
      conn.updated_at = new Date().toISOString();
    } catch (err: any) {
      conn.sync_status = 'ERROR';
      conn.error_status = err.message || 'Synchronization failed';
    }

    return conn;
  }

  /** GitHub sync from the repositories the student actually imported; no invented commits or badges. */
  private static async syncGitHubFromImportedRepos(
    studentId: string,
    conn: ExternalAccountConnection
  ): Promise<{ activities: ExternalActivity[] }> {
    const { GitHubService } = await import('./githubService');
    const repos = await GitHubService.listRepositories(studentId, {});
    const list: any[] = Array.isArray(repos) ? repos : (repos as any)?.items || [];
    return {
      activities: list.length
        ? [
            {
              id: `act_gh_${Date.now()}`,
              student_id: studentId,
              provider: 'github',
              activity_type: 'PROFILE_SYNC',
              title: `Synchronized ${list.length} imported repositor${list.length === 1 ? 'y' : 'ies'}`,
              description: list.slice(0, 3).map((r: any) => r.full_name || r.name).join(', '),
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
    };
  }

  /**
   * Get recent aggregated activities across all connected platforms
   */
  public static async listActivities(studentId: string): Promise<ExternalActivity[]> {
    return this.activities.get(studentId) || [];
  }

  /**
   * Aggregate unified skill evidence from internal and external sources
   */
  public static async getAggregatedSkillEvidence(_studentId: string): Promise<ExternalSkillEvidence[]> {
    // No external provider imports skill evidence yet, so there is none to show. (Earlier versions returned
    // hand-written Kaggle/LeetCode evidence for the demo account.)
    return [];
  }

  /**
   * Check Career Profile Consistency across Resume, GitHub, LinkedIn, and Projects
   */
  public static async checkProfileConsistency(_studentId: string): Promise<CareerConsistencyReport> {
    // No cross-source comparison engine exists, so no score or matches are claimed.
    return {
      overall_consistency_score: null,
      matched_items: [],
      recommendations: ['Profile consistency checks are not available yet.'],
    };
  }

  /**
   * Searches the job descriptions this student imported. There is no live job feed: nothing is listed that the student
   * did not add (earlier versions showed invented postings, and every student's imports, to everyone).
   */
  public static async searchJobs(studentId: string, query?: string, location?: string): Promise<ExternalJob[]> {
    const all = Array.from(this.jobs.values()).filter((j) => j.student_id === studentId);
    const q = (query || '').toLowerCase();
    const loc = (location || '').toLowerCase();
    return all.filter((j) => {
      const matchQ = !q || j.title.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q) || j.required_skills.some((x) => x.toLowerCase().includes(q));
      const matchLoc = !loc || (j.location || '').toLowerCase().includes(loc);
      return matchQ && matchLoc;
    });
  }

  /**
   * Import job description text manually or from URL
   */
  public static async importJob(
    studentId: string,
    data: Partial<ExternalJob> & { company?: string }
  ): Promise<ExternalJob & { company?: string }> {
    const company = String(data.company_name || data.company || '').trim();
    const title = String(data.title || '').trim();
    const description = String(data.description || '').trim();
    if (!title || !company || !description) {
      throw new ValidationError('Job Title, Company Name, and Description are required');
    }
    if (title.length > 200 || company.length > 200 || description.length > 20000) {
      throw new ValidationError('Title and company must be at most 200 characters, description at most 20,000');
    }
    if (data.job_url) {
      let u: URL;
      try { u = new URL(String(data.job_url)); } catch { throw new ValidationError('job_url must be a web address'); }
      if (!['http:', 'https:'].includes(u.protocol)) throw new ValidationError('job_url must start with http:// or https://');
    }
    // Skills are only those the student listed or catalogue skills named in the description.
    let required = Array.isArray(data.required_skills) ? data.required_skills.map(String).filter(Boolean).slice(0, 30) : [];
    if (!required.length) {
      const { skillMatches } = await import('./careerService');
      const { db } = await import('../db/database');
      required = (await db.getSkills()).filter((sk) => skillMatches(sk.name, [description])).map((sk) => sk.name);
    }

    const jobId = `job_imp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newJob: ExternalJob & { company?: string } = {
      id: jobId,
      title,
      company_name: company,
      company: company,
      location: data.location ? String(data.location).slice(0, 200) : '',
      is_remote: typeof data.is_remote === 'boolean' ? data.is_remote : false,
      employment_type: data.employment_type || 'INTERNSHIP',
      experience_level: data.experience_level || 'INTERN',
      salary_range: data.salary_range,
      source: 'MANUAL_IMPORT',
      job_url: data.job_url,
      deadline: data.deadline,
      description,
      required_skills: required,
      preferred_skills: Array.isArray(data.preferred_skills) ? data.preferred_skills.map(String).slice(0, 30) : [],
      posted_at: new Date().toISOString(),
    };

    this.jobs.set(jobId, { ...(newJob as ExternalJob), student_id: studentId });
    logger.info(`Job description imported by student ${studentId}: ${newJob.title} at ${company}`);
    return newJob;
  }

  /**
   * Compares an imported job's required skills with the skills on the student's profile and the student's projects.
   * fit_score = share of the job's listed skills found on the profile; null when the job lists no skills.
   */
  public static async analyzeJob(studentId: string, jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job || (job as any).student_id !== studentId) throw new NotFoundError(`Job '${jobId}' not found`);
    const { skillMatches } = await import('./careerService');
    const { db } = await import('../db/database');
    const mine = (await db.getStudentSkills(studentId)).map((s) => s.skill_name);
    const required = job.required_skills || [];
    const matched = required.filter((r) => skillMatches(r, mine));
    const missing = required.filter((r) => !matched.includes(r));
    const projects = await db.getProjects(studentId);
    const relevant = [];
    for (const p of projects) {
      const techs = (await db.getProjectTechnologies(p.id).catch(() => [])).map((t: any) => String(t.technology || ''));
      const hits = required.filter((r) => skillMatches(r, techs));
      if (hits.length) relevant.push({ title: p.title, relevance_note: `Uses ${hits.join(', ')}` });
    }
    return {
      job_id: job.id,
      title: job.title,
      company: job.company_name,
      fit_score: required.length ? Math.round((matched.length / required.length) * 100) : null,
      matched_skills: matched,
      skills_needing_practice: missing,
      relevant_projects: relevant.slice(0, 3),
      suggested_preparation: missing.length ? [`Skills in the posting that are not on your profile: ${missing.join(', ')}.`] : [],
      basis: 'Skills listed on the job compared with the skills on your profile; projects matched by their recorded technologies.',
    };
  }
}
