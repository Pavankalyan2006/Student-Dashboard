// server/services/jobAggregationService.ts
// Multi-Source Job Aggregation Engine with Source Adapters, Deduplication, Notification Dispatch, and Freshness Tracking

import { createHash } from 'crypto';
import https from 'https';
import http from 'http';
import { db } from '../db/database';
import { logger } from '../core/logging';
import { JobAiService } from './jobAiService';
import {
  JobListing,
  JobSourceConfig,
  JobSyncRun,
  StudentJobAlert,
} from '../models/jobDiscoveryTypes';

export interface RawJobPayload {
  external_id?: string;
  title: string;
  organization: string;
  source_id: string;
  source_name: string;
  source_type: any;
  source_url: string;
  application_url?: string;
  category: 'GOVERNMENT' | 'PRIVATE';
  subcategory: string;
  location: string;
  remote_eligible?: boolean;
  employment_type?: any;
  experience_label?: string;
  minimum_qualification?: string;
  required_skills?: string[];
  salary_text?: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  publication_date?: string;
  application_deadline?: string;
  notification_number?: string;
  official_notification_pdf_url?: string;
  age_limit_max?: number;
  total_vacancies?: number;
}

export class JobAggregationService {
  /**
   * Helper to perform reliable HTTPS GET requests with timeouts
   */
  private static async fetchJson(url: string, timeoutMs = 4000): Promise<any> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, { headers: { 'User-Agent': 'BTech-AI-JobsDiscovery/1.0' } }, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          return reject(new Error(`HTTP status ${res.statusCode} from ${url}`));
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON response from ${url}`));
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(timeoutMs, () => {
        req.destroy();
        reject(new Error(`Request timed out after ${timeoutMs}ms for ${url}`));
      });
    });
  }

  /**
   * Normalizes a raw payload into a JobListing. Fields the source did not supply stay empty: no default location,
   * experience, qualification or skills are invented, and "freshers friendly" is never assumed.
   */
  public static normalizeJob(raw: RawJobPayload): JobListing {
    const pubDate = raw.publication_date || new Date().toISOString().split('T')[0];
    // A hash of the whole identity: the old 16-character base64 prefix made "Synthetic Research Org" and
    // "Synthetic Remote Co" (any two names sharing 12 leading characters) collide and overwrite each other.
    const identity = raw.external_id ? `ext:${raw.external_id}` : `${raw.organization}\u0000${raw.title}`;
    const id = `job_${raw.source_id}_${createHash('sha256').update(identity).digest('hex').slice(0, 20)}`;

    // Ensure valid HTTPS URLs
    let appUrl = raw.application_url || raw.source_url;
    if (!appUrl.startsWith('http')) {
      appUrl = 'https://' + appUrl;
    }

    return {
      id,
      external_job_id: raw.external_id,
      source_id: raw.source_id,
      source_name: raw.source_name,
      source_type: raw.source_type || 'AUTHORIZED_FEED',
      source_url: raw.source_url,
      application_url: appUrl,
      title: raw.title.trim(),
      organization: raw.organization.trim(),
      category: raw.category,
      subcategory: raw.subcategory,
      employment_type: raw.employment_type || 'FULL_TIME',
      work_arrangement: raw.remote_eligible ? 'REMOTE' : 'ONSITE',
      location: raw.location || '',
      country: 'India',
      remote_eligible: Boolean(raw.remote_eligible),
      experience_label: raw.experience_label,
      minimum_qualification: raw.minimum_qualification,
      required_skills: raw.required_skills || [],
      preferred_skills: [],
      salary_text: raw.salary_text,
      salary_min: raw.salary_min,
      salary_max: raw.salary_max,
      salary_currency: 'INR',
      description: raw.description,
      publication_date: pubDate,
      application_deadline: raw.application_deadline,
      last_verified_at: new Date().toISOString(),
      retrieved_at: new Date().toISOString(),
      status: 'ACTIVE',
      verification_status: raw.category === 'GOVERNMENT' ? 'OFFICIAL_GOVERNMENT_SOURCE' : 'AUTHORIZED_JOB_PROVIDER',
      is_freshers_friendly: false,
      notification_number: raw.notification_number,
      official_notification_pdf_url: raw.official_notification_pdf_url,
      age_limit_max: raw.age_limit_max,
      total_vacancies: raw.total_vacancies,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Public software jobs from the Remotive API. A listing missing its title, company or URL is skipped, and a
   * failed request returns no jobs and the error: there is no cached or sample fallback.
   */
  public static async fetchRemotiveJobs(sourceConfig: JobSourceConfig): Promise<{ jobs: RawJobPayload[]; error?: string }> {
    let data: any;
    try {
      data = await this.fetchJson('https://remotive.com/api/remote-jobs?category=software-dev&limit=10', 5000);
    } catch (err: any) {
      logger.warn(`Remotive API fetch failed: ${err.message}`);
      return { jobs: [], error: `Remotive could not be reached: ${err.message}` };
    }
    if (!data || !Array.isArray(data.jobs)) return { jobs: [], error: 'Remotive answered without a job list' };
    const rawList: RawJobPayload[] = data.jobs
      .filter((j: any) => typeof j.title === 'string' && j.title.trim() && typeof j.company_name === 'string' && j.company_name.trim() && typeof j.url === 'string' && /^https:\/\//.test(j.url))
      .slice(0, 8)
      .map((j: any) => ({
        external_id: String(j.id),
        title: j.title,
        organization: j.company_name,
        source_id: sourceConfig.id,
        source_name: 'Remotive Public Tech API',
        source_type: 'PUBLIC_JOB_API',
        source_url: j.url,
        application_url: j.url,
        category: 'PRIVATE' as const,
        subcategory: 'SOFTWARE_DEVELOPMENT',
        location: typeof j.candidate_required_location === 'string' ? j.candidate_required_location : '',
        remote_eligible: true,
        employment_type: 'FULL_TIME',
        salary_text: typeof j.salary === 'string' && j.salary.trim() ? j.salary : undefined,
        description: typeof j.description === 'string' ? j.description.replace(/<[^>]*>/g, '').substring(0, 1500) : '',
        required_skills: Array.isArray(j.tags) ? j.tags.filter((t: any) => typeof t === 'string').slice(0, 6) : [],
        publication_date: typeof j.publication_date === 'string' ? j.publication_date.split('T')[0] : undefined,
      }));
    return { jobs: rawList };
  }

  /** Sources with a working adapter. Every other source is a link to an official portal and is not synced. */
  public static readonly ADAPTERS: Record<string, (s: JobSourceConfig) => Promise<{ jobs: RawJobPayload[]; error?: string }>> = {
    src_remotive_api: (s) => JobAggregationService.fetchRemotiveJobs(s),
  };

  /**
   * Main synchronization runner across configured and enabled sources
   */
  public static async syncSources(manualTriggerBy?: string): Promise<{
    sync_runs: JobSyncRun[];
    total_added: number;
    total_updated: number;
    total_duplicates_skipped: number;
  }> {
    const sources = await db.getJobSources();
    const enabledSources = sources.filter((s) => s.enabled);
    const syncRuns: JobSyncRun[] = [];

    let totalAdded = 0;
    let totalUpdated = 0;
    let totalDuplicatesSkipped = 0;

    for (const source of enabledSources) {
      const startTime = new Date().toISOString();
      let rawList: RawJobPayload[] = [];
      let sourceError: string | undefined;

      const adapter = this.ADAPTERS[source.id];
      if (!adapter) {
        source.health_status = 'NOT_CONFIGURED';
        await db.updateJobSource(source);
        continue;
      }
      try {
        const res = await adapter(source);
        rawList = res.jobs;
        sourceError = res.error;
      } catch (err: any) {
        sourceError = err.message;
        logger.error(`Error syncing source ${source.name}:`, err);
      }

      // Normalize
      const normalizedJobs: JobListing[] = rawList.map((raw) => this.normalizeJob(raw));

      // Batch save with deduplication
      const saveRes = await db.saveJobListingsBatch(normalizedJobs);

      totalAdded += saveRes.added;
      totalUpdated += saveRes.updated;
      totalDuplicatesSkipped += saveRes.duplicates;

      // Update source configuration statistics
      source.last_attempted_sync = startTime;
      source.last_successful_sync = sourceError ? source.last_successful_sync : new Date().toISOString();
      source.health_status = sourceError ? (rawList.length ? 'DEGRADED' : 'UNAVAILABLE') : 'HEALTHY';
      source.last_error = sourceError;
      source.records_retrieved_last_run = rawList.length;
      source.new_records_last_run = saveRes.added;
      source.updated_records_last_run = saveRes.updated;
      source.duplicates_ignored_last_run = saveRes.duplicates;
      await db.updateJobSource(source);

      // Create sync run record
      const run: JobSyncRun = {
        id: `sync_${Date.now()}_${source.id}`,
        source_id: source.id,
        source_name: source.name,
        started_at: startTime,
        completed_at: new Date().toISOString(),
        status: sourceError ? (rawList.length ? 'PARTIAL' : 'FAILED') : 'SUCCESS',
        records_retrieved: rawList.length,
        records_added: saveRes.added,
        records_updated: saveRes.updated,
        duplicates_skipped: saveRes.duplicates,
        errors: sourceError ? [sourceError] : undefined,
      };
      await db.recordJobSyncRun(run);
      syncRuns.push(run);

      // Trigger student alerts & notifications for genuinely new jobs
      if (saveRes.added > 0) {
        await this.dispatchNotificationsForNewJobs(normalizedJobs.slice(0, saveRes.added));
      }
    }

    return {
      sync_runs: syncRuns,
      total_added: totalAdded,
      total_updated: totalUpdated,
      total_duplicates_skipped: totalDuplicatesSkipped,
    };
  }

  /**
   * Dispatches notifications to students whose active alerts match newly added jobs
   */
  private static async dispatchNotificationsForNewJobs(newJobs: JobListing[]): Promise<void> {
    const students = await db.getAllStudents();

    for (const student of students) {
      const alerts = await db.getStudentJobAlerts(student.id);
      const activeAlerts = alerts.filter((a) => a.is_active);

      if (activeAlerts.length === 0) continue;

      for (const job of newJobs) {
        for (const alert of activeAlerts) {
          // Check category match
          if (alert.category && alert.category !== 'ALL' && alert.category !== job.category) {
            continue;
          }
          // Check subcategory match
          if (alert.subcategories.length > 0 && !alert.subcategories.includes(job.subcategory)) {
            continue;
          }
          // Check keywords
          if (alert.keywords.length > 0) {
            const hasKeyword = alert.keywords.some((kw) =>
              job.title.toLowerCase().includes(kw.toLowerCase()) ||
              job.required_skills.some((s) => s.toLowerCase().includes(kw.toLowerCase()))
            );
            if (!hasKeyword) continue;
          }

          // Match found! Dispatch notification
          try {
            await db.createNotification({
              student_id: student.id,
              type: 'info',
              title: `New Job Opportunity: ${job.title}`,
              message: `${job.organization} announced openings matching your alert "${alert.title}". Deadline: ${job.application_deadline || 'Open'}.`,
              link: `/career/jobs?id=${job.id}`,
            });
            alert.last_triggered_at = new Date().toISOString();
            await db.saveStudentJobAlert(alert);
            break; // One notification per job per student
          } catch (err) {
            logger.warn('Failed to dispatch job alert notification', { error: err instanceof Error ? err.message : String(err) });
          }
        }
      }
    }
  }
}
