// server/ai/externalIntegrationTools.ts
// AI Tool definitions for Social Media, Career, Coding & External Platform Integration

import { ToolRegistry } from './tools';
import { ExternalIntegrationService } from '../services/externalIntegrationService';
import { ExternalIntegrationRegistry } from '../services/externalIntegrationRegistry';

export function registerExternalIntegrationTools(): void {
  // 1. Get student connected platforms
  ToolRegistry.register({
    name: 'get_connected_platforms',
    description: 'Retrieve all external platforms connected by the student (LinkedIn, LeetCode, GitHub, HackerRank, CodeChef, Kaggle) and their sync status.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 4000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      const connections = await ExternalIntegrationService.listConnections(context.studentId);
      return connections.map((c) => ({
        provider: c.provider,
        display_name: c.display_name,
        username: c.username,
        status: c.status,
        last_synced_at: c.last_synced_at,
        profile_url: c.profile_url,
      }));
    },
  });

  // 2. Trigger data synchronization
  ToolRegistry.register({
    name: 'sync_platform_data',
    description: 'Trigger data refresh for a connected external platform (LeetCode stats, GitHub repos, LinkedIn headline, or Kaggle notebooks).',
    parameters: {
      connection_id: { type: 'string', description: 'Connection ID to synchronize', required: true },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 10000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await ExternalIntegrationService.syncConnection(context.studentId, params.connection_id);
    },
  });

  // 3. Get external coding activity & stats
  ToolRegistry.register({
    name: 'get_external_coding_activity',
    description: 'Aggregate verified problem solving counts, contest ratings, and recent submissions from LeetCode, HackerRank, CodeChef, and GeeksforGeeks.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      const activities = await ExternalIntegrationService.listActivities(context.studentId);
      return activities.filter((a) =>
        ['leetcode', 'hackerrank', 'codechef', 'geeksforgeeks'].includes(a.provider)
      );
    },
  });

  // 4. Get aggregated skill evidence
  ToolRegistry.register({
    name: 'get_external_skill_evidence',
    description: 'Retrieve verified skill evidence combining coursework, projects, GitHub repositories, and competitive coding stats.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 5000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (_params, context) => {
      return await ExternalIntegrationService.getAggregatedSkillEvidence(context.studentId);
    },
  });

  // 5. Analyze profile consistency
  ToolRegistry.register({
    name: 'analyze_external_profile_consistency',
    description: 'Cross-check consistency between Student Profile, Resume bullet metrics, GitHub repositories, LinkedIn headline, and LeetCode problem counts without false accusations.',
    parameters: {},
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'AI_GENERATION',
    handler: async (_params, context) => {
      return await ExternalIntegrationService.checkProfileConsistency(context.studentId);
    },
  });

  // 6. Search external jobs
  ToolRegistry.register({
    name: 'search_external_jobs',
    description: 'Search software engineering internship and campus job opportunities from authorized feeds.',
    parameters: {
      query: { type: 'string', description: 'Role or skill query (e.g. SDE Intern, Go, Python)' },
      location: { type: 'string', description: 'Location filter' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 6000,
    confirmationRequired: false,
    category: 'READ_ONLY',
    handler: async (params) => {
      return await ExternalIntegrationService.searchJobs(params.query, params.location);
    },
  });

  // 7. Import job description
  ToolRegistry.register({
    name: 'import_job_description',
    description: 'Import a job description for automatic verified skill matching against student evidence.',
    parameters: {
      title: { type: 'string', description: 'Job title', required: true },
      company_name: { type: 'string', description: 'Company name', required: true },
      description: { type: 'string', description: 'Job description text', required: true },
      job_url: { type: 'string', description: 'Link to posting' },
      deadline: { type: 'string', description: 'Application deadline' },
    },
    permissions: ['STUDENT', 'SUPER_ADMIN'],
    timeoutMs: 8000,
    confirmationRequired: false,
    category: 'MUTATION',
    handler: async (params, context) => {
      return await ExternalIntegrationService.importJob(context.studentId, params);
    },
  });
}
