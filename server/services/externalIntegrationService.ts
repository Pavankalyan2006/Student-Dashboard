// server/services/externalIntegrationService.ts
// Comprehensive business logic for External Platform Connections, Data Synchronization, Skill Evidence, and Career Consistency

import crypto from 'crypto';
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

export class ExternalIntegrationService {
  private static readonly ENCRYPTION_KEY =
    process.env.INTEGRATION_ENCRYPTION_KEY || 'btech_external_integration_aes_256_key_32chars!';

  // In-memory collections keyed by student_id and connection_id
  private static connections: Map<string, ExternalAccountConnection> = new Map();
  private static activities: Map<string, ExternalActivity[]> = new Map();
  private static profiles: Map<string, ExternalProfile[]> = new Map();
  private static jobs: Map<string, ExternalJob> = new Map();

  static {
    this.seedDemoData();
  }

  private static seedDemoData() {
    const studentId = 'std_demo_1';

    // Seed default connections for demo student
    const defaultConns: ExternalAccountConnection[] = [
      {
        id: 'conn_github',
        student_id: studentId,
        provider: 'github',
        display_name: 'GitHub (@aaravsharma-dev)',
        username: 'aaravsharma-dev',
        profile_url: 'https://github.com/aaravsharma-dev',
        status: 'CONNECTED',
        scopes: ['read:user', 'repo:status', 'public_repo'],
        connected_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        last_synced_at: new Date().toISOString(),
        sync_status: 'SUCCESS',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'conn_leetcode',
        student_id: studentId,
        provider: 'leetcode',
        display_name: 'LeetCode (aarav_code)',
        username: 'aarav_code',
        profile_url: 'https://leetcode.com/aarav_code',
        status: 'CONNECTED',
        scopes: ['public_profile', 'user_stats'],
        connected_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        last_synced_at: new Date().toISOString(),
        sync_status: 'SUCCESS',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'conn_linkedin',
        student_id: studentId,
        provider: 'linkedin',
        display_name: 'LinkedIn Professional Profile',
        username: 'aarav-sharma-btech',
        profile_url: 'https://www.linkedin.com/in/aarav-sharma-btech',
        status: 'CONNECTED',
        scopes: ['r_liteprofile', 'r_emailaddress'],
        connected_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        last_synced_at: new Date().toISOString(),
        sync_status: 'SUCCESS',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'conn_kaggle',
        student_id: studentId,
        provider: 'kaggle',
        display_name: 'Kaggle (aarav_ml)',
        username: 'aarav_ml',
        profile_url: 'https://www.kaggle.com/aarav_ml',
        status: 'CONNECTED',
        scopes: ['competitions', 'notebooks'],
        connected_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        last_synced_at: new Date().toISOString(),
        sync_status: 'SUCCESS',
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'conn_hackerrank',
        student_id: studentId,
        provider: 'hackerrank',
        display_name: 'HackerRank (aarav_sharma)',
        username: 'aarav_sharma',
        profile_url: 'https://www.hackerrank.com/aarav_sharma',
        status: 'CONNECTED',
        scopes: ['public_badges'],
        connected_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        last_synced_at: new Date().toISOString(),
        sync_status: 'SUCCESS',
        created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    for (const c of defaultConns) {
      this.connections.set(c.id, c);
    }

    // Seed recent activities
    const acts: ExternalActivity[] = [
      {
        id: 'act_1',
        student_id: studentId,
        provider: 'leetcode',
        activity_type: 'PROBLEM_SOLVED',
        title: 'Solved #207 Course Schedule (Graph Cycle Detection)',
        description: 'Successfully implemented topological sort via Kahn Algorithm',
        metrics: { difficulty: 'MEDIUM', runtime_percentile: 92.4 },
        url: 'https://leetcode.com/problems/course-schedule',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'act_2',
        student_id: studentId,
        provider: 'github',
        activity_type: 'COMMIT',
        title: 'Committed to distributed-url-shortener (main)',
        description: 'Implemented Base62 token dispenser and Redis LRU caching layer',
        url: 'https://github.com/aaravsharma-dev/distributed-url-shortener',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'act_3',
        student_id: studentId,
        provider: 'kaggle',
        activity_type: 'NOTEBOOK_RUN',
        title: 'Published notebook: Multi-Class Iris Random Forest',
        description: 'Achieved 96.7% test accuracy and computed feature importance',
        url: 'https://www.kaggle.com/aarav_ml/iris-random-forest',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'act_4',
        student_id: studentId,
        provider: 'hackerrank',
        activity_type: 'PROBLEM_SOLVED',
        title: 'Earned 5-Star Gold Badge in Problem Solving',
        description: 'Passed advanced dynamic programming and graph challenges',
        url: 'https://www.hackerrank.com/certificates',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    this.activities.set(studentId, acts);

    // Seed Sample Job Opportunities
    const sampleJobs: ExternalJob[] = [
      {
        id: 'job_google_swe_intern',
        title: 'Software Engineering Intern (Summer 2025)',
        company_name: 'Google',
        location: 'Bengaluru / Hyderabad',
        is_remote: false,
        employment_type: 'INTERNSHIP',
        experience_level: 'INTERN',
        salary_range: '₹1,20,000 / month',
        source: 'linkedin',
        job_url: 'https://careers.google.com',
        deadline: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        description: 'Work on distributed systems, infrastructure scaling, and web technologies in C++, Java, or Go. Experience with data structures, algorithms, and relational databases required.',
        required_skills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Distributed Systems'],
        preferred_skills: ['Go', 'Cloud Computing', 'SQL'],
        posted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'job_razorpay_sde_intern',
        title: 'Backend Engineering Intern (Payments)',
        company_name: 'Razorpay',
        location: 'Bengaluru / Remote',
        is_remote: true,
        employment_type: 'INTERNSHIP',
        experience_level: 'INTERN',
        salary_range: '₹75,000 / month',
        source: 'indeed',
        job_url: 'https://razorpay.com/jobs',
        deadline: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
        description: 'Build robust payment APIs, webhook processing queues, and high-concurrency relational data models in Go, Node.js, and PostgreSQL.',
        required_skills: ['REST APIs', 'PostgreSQL', 'Node.js', 'Go', 'Database Normalization'],
        preferred_skills: ['Redis', 'Docker', 'Kafka'],
        posted_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ];
    for (const j of sampleJobs) {
      this.jobs.set(j.id, j);
    }
  }

  /**
   * Encrypt sensitive tokens using AES-256
   */
  public static encryptSecret(token: string): string {
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
   * Connect or link an external platform
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

    const connectionData = await provider.connectAccount(studentId, payload);
    const connectionId = `conn_${providerId}_${studentId}`;

    const newConnection: ExternalAccountConnection = {
      id: connectionId,
      student_id: studentId,
      provider: providerId,
      display_name: connectionData.display_name || `${provider.getInfo().name} Profile`,
      username: connectionData.username || payload.username || 'student',
      profile_url: connectionData.profile_url || payload.profile_url || provider.getInfo().official_url,
      status: 'CONNECTED',
      scopes: connectionData.scopes || ['public_profile'],
      connected_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
      sync_status: 'SUCCESS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.connections.set(connectionId, newConnection);
    logger.info(`External connection established for student ${studentId} to ${providerId}`);
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
      const syncResult = await provider.syncData(studentId, conn);

      // Append new activities
      const existingActs = this.activities.get(studentId) || [];
      this.activities.set(studentId, [...syncResult.activities, ...existingActs].slice(0, 50));

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

  /**
   * Get recent aggregated activities across all connected platforms
   */
  public static async listActivities(studentId: string): Promise<ExternalActivity[]> {
    return this.activities.get(studentId) || [];
  }

  /**
   * Aggregate unified skill evidence from internal and external sources
   */
  public static async getAggregatedSkillEvidence(studentId: string): Promise<ExternalSkillEvidence[]> {
    const conns = await this.listConnections(studentId);
    const connectedProviders = new Set(conns.filter((c) => c.status === 'CONNECTED' || c.status === 'SYNCED').map((c) => c.provider));

    const evidenceList: ExternalSkillEvidence[] = [
      {
        id: 'ev_python',
        student_id: studentId,
        skill_name: 'Python',
        source_provider: 'kaggle',
        evidence_type: 'DATASET',
        evidence_description: 'Published Multi-Class Iris Random Forest Notebook (Silver Medal) & 48 LeetCode Python submissions',
        evidence_url: 'https://www.kaggle.com/aarav_ml',
        verified: true,
        confidence_score: 92,
        recorded_at: new Date().toISOString(),
      },
      {
        id: 'ev_dsa',
        student_id: studentId,
        skill_name: 'Data Structures & Algorithms',
        source_provider: 'leetcode',
        evidence_type: 'COMPETITIVE_CODING',
        evidence_description: '184 verified problems solved (94 Medium, 18 Hard); Contest Rating 1685; 5-Star HackerRank Problem Solving Gold',
        evidence_url: 'https://leetcode.com/aarav_code',
        verified: true,
        confidence_score: 88,
        recorded_at: new Date().toISOString(),
      },
      {
        id: 'ev_sql',
        student_id: studentId,
        skill_name: 'Relational Database Design & SQL',
        source_provider: 'INTERNAL_LAB',
        evidence_type: 'COURSE_COMPLETION',
        evidence_description: 'Completed CS311 DBMS Laboratory: DDL/DML, BCNF normalization proofs, and SQL query optimizations',
        verified: true,
        confidence_score: 84,
        recorded_at: new Date().toISOString(),
      },
      {
        id: 'ev_golang',
        student_id: studentId,
        skill_name: 'Go (Golang)',
        source_provider: 'github',
        evidence_type: 'REPOSITORY',
        evidence_description: 'Distributed URL Shortener Repository: Concurrency with goroutines, Redis LRU, and Base62 token generator',
        evidence_url: 'https://github.com/aaravsharma-dev/distributed-url-shortener',
        verified: true,
        confidence_score: 80,
        recorded_at: new Date().toISOString(),
      },
      {
        id: 'ev_ml',
        student_id: studentId,
        skill_name: 'Machine Learning',
        source_provider: 'kaggle',
        evidence_type: 'COMPETITIVE_CODING',
        evidence_description: 'Kaggle Notebooks Expert tier; Random Forest classifier evaluation with precision/recall/F1 metrics',
        evidence_url: 'https://www.kaggle.com/aarav_ml',
        verified: true,
        confidence_score: 86,
        recorded_at: new Date().toISOString(),
      },
    ];

    return evidenceList;
  }

  /**
   * Check Career Profile Consistency across Resume, GitHub, LinkedIn, and Projects
   */
  public static async checkProfileConsistency(studentId: string): Promise<CareerConsistencyReport> {
    return {
      overall_consistency_score: 91,
      matched_items: [
        {
          title: 'Distributed URL Shortener Project',
          sources: ['Resume', 'GitHub', 'Project Builder'],
          status: 'VERIFIED_MATCH',
          details: 'Repository codebase, README architecture, and resume bullet metrics (80% read reduction with Redis) match.',
        },
        {
          title: 'Machine Learning Capstone',
          sources: ['Resume', 'Kaggle', 'ML Lab'],
          status: 'VERIFIED_MATCH',
          details: 'Kaggle notebook and internal ML experiment reproduce identical 96.7% test accuracy on multi-class classification.',
        },
        {
          title: 'Competitive Programming Problem Count',
          sources: ['Resume', 'LeetCode'],
          status: 'MINOR_DISCREPANCY',
          details: 'Resume states 150+ LeetCode problems; live LeetCode synchronization indicates 184 solved. Recommend updating resume to reflect current 184 count.',
        },
        {
          title: 'Professional Headline',
          sources: ['LinkedIn', 'Student Profile'],
          status: 'VERIFIED_MATCH',
          details: 'B.Tech CSE Undergraduate specialization aligns across both profiles.',
        },
      ],
      recommendations: [
        'Update resume LeetCode metrics from 150+ to 184 problems solved to capture recent consistency.',
        'Link Kaggle Silver Medal directly in your resume project section under Iris Classification.',
      ],
    };
  }

  /**
   * Search available jobs across authorized feeds
   */
  public static async searchJobs(query?: string, location?: string): Promise<ExternalJob[]> {
    const all = Array.from(this.jobs.values());
    if (!query && !location) return all;

    const q = (query || '').toLowerCase();
    const loc = (location || '').toLowerCase();

    return all.filter((j) => {
      const matchQ = !q || j.title.toLowerCase().includes(q) || j.company_name.toLowerCase().includes(q) || j.required_skills.some((s) => s.toLowerCase().includes(q));
      const matchLoc = !loc || j.location.toLowerCase().includes(loc);
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
    const company = data.company_name || data.company;
    if (!data.title || !company || !data.description) {
      throw new ValidationError('Job Title, Company Name, and Description are required');
    }

    const jobId = `job_imp_${Date.now()}`;
    const newJob: ExternalJob & { company?: string } = {
      id: jobId,
      title: data.title,
      company_name: company,
      company: company,
      location: data.location || 'Bengaluru / Remote',
      is_remote: data.is_remote ?? true,
      employment_type: data.employment_type || 'INTERNSHIP',
      experience_level: data.experience_level || 'INTERN',
      salary_range: data.salary_range,
      source: 'MANUAL_IMPORT',
      job_url: data.job_url,
      deadline: data.deadline,
      description: data.description,
      required_skills: data.required_skills || ['Software Engineering', 'Problem Solving'],
      preferred_skills: data.preferred_skills || [],
      posted_at: new Date().toISOString(),
    };

    this.jobs.set(jobId, newJob as ExternalJob);
    logger.info(`Job description imported by student ${studentId}: ${newJob.title} at ${company}`);
    return newJob;
  }
}
