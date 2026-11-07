// server/services/externalIntegrationRegistry.ts
// Extensible provider-based architecture for External Platform & Social Career Integration

import {
  ExternalProviderId,
  ExternalProviderInfo,
  ProviderCapabilities,
  ExternalAccountConnection,
  ExternalActivity,
  ExternalProfile,
  ExternalJob,
} from '../models/externalIntegrationTypes';
import { GitHubService } from './githubService';
import { logger } from '../core/logging';

export interface ExternalProvider {
  getInfo(): ExternalProviderInfo;
  getCapabilities(): ProviderCapabilities;
  initiateAuth(studentId: string, redirectUri?: string): Promise<{ auth_url: string; state: string }>;
  connectAccount(studentId: string, payload: { code?: string; username?: string; profile_url?: string }): Promise<Partial<ExternalAccountConnection>>;
  syncData(studentId: string, connection: ExternalAccountConnection): Promise<{
    activities: ExternalActivity[];
    profile?: Partial<ExternalProfile>;
    jobs?: ExternalJob[];
  }>;
}

// 1. LinkedIn Provider
export class LinkedInProviderImpl implements ExternalProvider {
  getInfo(): ExternalProviderInfo {
    return {
      id: 'linkedin',
      name: 'LinkedIn',
      display_name: 'LinkedIn Professional Network',
      category: 'CAREER_PROFESSIONAL',
      description: 'Synchronize verified education, professional headline, and skills from your LinkedIn profile.',
      icon_name: 'Linkedin',
      official_url: 'https://www.linkedin.com',
      authentication_method: 'OAUTH2',
      oauth_supported: true,
      api_supported: true,
      capabilities: {
        profile: true,
        activity: true,
        statistics: false,
        jobs: true,
        applications: false,
        repositories: false,
        code_submissions: false,
        sync: true,
      },
      rate_limits: { max_requests_per_minute: 60, sync_interval_hours: 6 },
      privacy_requirements: [
        'Requires explicit OAuth authorization',
        'Never stores account passwords',
        'Read-only access to standard profile and email fields',
      ],
      enabled: true,
    };
  }

  getCapabilities(): ProviderCapabilities {
    return this.getInfo().capabilities;
  }

  async initiateAuth(_studentId: string, _redirectUri?: string): Promise<never> {
    // No OAuth app is registered for this provider; the made-up authorization URL that used to be returned was removed.
    throw new Error(`${this.getInfo().name} does not offer sign-in here.`);
  }

  async connectAccount(_studentId: string, _payload: { code?: string; username?: string; profile_url?: string }): Promise<never> {
    // Linking goes through ExternalIntegrationService.connectPlatform, which never marks an unverified account CONNECTED.
    throw new Error(`${this.getInfo().name} cannot be connected through the provider registry.`);
  }

  async syncData(_studentId: string, _connection: ExternalAccountConnection): Promise<never> {
    // No live client exists for this provider; the hand-written sample activity that used to be returned here was removed.
    throw new Error(`Live sync with ${this.getInfo().name} is not available, so no data was imported.`);
  }
}

// 2. Indeed Provider
export class IndeedProviderImpl implements ExternalProvider {
  getInfo(): ExternalProviderInfo {
    return {
      id: 'indeed',
      name: 'Indeed',
      display_name: 'Indeed Job Platform',
      category: 'CAREER_PROFESSIONAL',
      description: 'Discover software engineering internships and campus job alerts with authorized career feeds.',
      icon_name: 'Briefcase',
      official_url: 'https://www.indeed.com',
      authentication_method: 'PUBLIC_PROFILE_URL',
      oauth_supported: false,
      api_supported: true,
      capabilities: {
        profile: false,
        activity: false,
        statistics: false,
        jobs: true,
        applications: true,
        repositories: false,
        code_submissions: false,
        sync: true,
      },
      rate_limits: { max_requests_per_minute: 30, sync_interval_hours: 12 },
      privacy_requirements: [
        'Uses authorized RSS/Job feeds and manual JD entry',
        'No direct scraping violating Indeed terms',
      ],
      enabled: true,
    };
  }

  getCapabilities(): ProviderCapabilities {
    return this.getInfo().capabilities;
  }

  async initiateAuth(): Promise<never> {
    // No OAuth app is registered for this provider; the made-up authorization URL that used to be returned was removed.
    throw new Error(`${this.getInfo().name} does not offer sign-in here.`);
  }

  async connectAccount(_studentId: string, _payload: { username?: string; profile_url?: string }): Promise<never> {
    // Linking goes through ExternalIntegrationService.connectPlatform, which never marks an unverified account CONNECTED.
    throw new Error(`${this.getInfo().name} cannot be connected through the provider registry.`);
  }

  async syncData(_studentId: string): Promise<never> {
    // No live client exists for this provider; the hand-written sample activity that used to be returned here was removed.
    throw new Error(`Live sync with ${this.getInfo().name} is not available, so no data was imported.`);
  }
}

// 3. LeetCode Provider
export class LeetCodeProviderImpl implements ExternalProvider {
  getInfo(): ExternalProviderInfo {
    return {
      id: 'leetcode',
      name: 'LeetCode',
      display_name: 'LeetCode Coding Profile',
      category: 'CODING_COMPETITIVE',
      description: 'Import verified problem solving counts, contest rating, and difficulty metrics via public profile.',
      icon_name: 'Code2',
      official_url: 'https://leetcode.com',
      authentication_method: 'PUBLIC_PROFILE_URL',
      oauth_supported: false,
      api_supported: true,
      capabilities: {
        profile: true,
        activity: true,
        statistics: true,
        jobs: false,
        applications: false,
        repositories: false,
        code_submissions: true,
        sync: true,
      },
      rate_limits: { max_requests_per_minute: 20, sync_interval_hours: 4 },
      privacy_requirements: [
        'Public user profile and GraphQL metrics only',
        'Never stores account passwords or bypasses anti-bot mechanisms',
      ],
      enabled: true,
    };
  }

  getCapabilities(): ProviderCapabilities {
    return this.getInfo().capabilities;
  }

  async initiateAuth(): Promise<never> {
    // No OAuth app is registered for this provider; the made-up authorization URL that used to be returned was removed.
    throw new Error(`${this.getInfo().name} does not offer sign-in here.`);
  }

  async connectAccount(_studentId: string, _payload: { username?: string; profile_url?: string }): Promise<never> {
    // Linking goes through ExternalIntegrationService.connectPlatform, which never marks an unverified account CONNECTED.
    throw new Error(`${this.getInfo().name} cannot be connected through the provider registry.`);
  }

  async syncData(_studentId: string, _connection: ExternalAccountConnection): Promise<never> {
    // No live client exists for this provider; the hand-written sample activity that used to be returned here was removed.
    throw new Error(`Live sync with ${this.getInfo().name} is not available, so no data was imported.`);
  }
}

// 4. GitHub Provider (Reuses Existing GitHubService)
export class GitHubProviderImpl implements ExternalProvider {
  getInfo(): ExternalProviderInfo {
    return {
      id: 'github',
      name: 'GitHub',
      display_name: 'GitHub Code Repositories',
      category: 'DEVELOPER_TOOLS',
      description: 'Reuses the existing platform GitHub integration for commit tracking, repos, and technology evidence.',
      icon_name: 'Github',
      official_url: 'https://github.com',
      authentication_method: 'OAUTH2',
      oauth_supported: true,
      api_supported: true,
      capabilities: {
        profile: true,
        activity: true,
        statistics: true,
        jobs: false,
        applications: false,
        repositories: true,
        code_submissions: true,
        sync: true,
      },
      rate_limits: { max_requests_per_minute: 60, sync_interval_hours: 2 },
      privacy_requirements: [
        'Uses existing secure GitHub OAuth integration with AES-256 token encryption',
        'Read-only repository access',
      ],
      enabled: true,
    };
  }

  getCapabilities(): ProviderCapabilities {
    return this.getInfo().capabilities;
  }

  async initiateAuth(_studentId: string, _redirectUri?: string): Promise<never> {
    // No OAuth app is registered for this provider; the made-up authorization URL that used to be returned was removed.
    throw new Error(`${this.getInfo().name} does not offer sign-in here.`);
  }

  async connectAccount(_studentId: string, _payload: { username?: string }): Promise<never> {
    // Linking goes through ExternalIntegrationService.connectPlatform, which never marks an unverified account CONNECTED.
    throw new Error(`${this.getInfo().name} cannot be connected through the provider registry.`);
  }

  async syncData(_studentId: string, _connection: ExternalAccountConnection): Promise<never> {
    // No live client exists for this provider; the hand-written sample activity that used to be returned here was removed.
    throw new Error(`Live sync with ${this.getInfo().name} is not available, so no data was imported.`);
  }
}

// 5. HackerRank Provider
export class HackerRankProviderImpl implements ExternalProvider {
  getInfo(): ExternalProviderInfo {
    return {
      id: 'hackerrank',
      name: 'HackerRank',
      display_name: 'HackerRank Problem Solving',
      category: 'CODING_COMPETITIVE',
      description: 'Import domain star badges (Problem Solving, Python, Java) and verified certificates.',
      icon_name: 'Award',
      official_url: 'https://www.hackerrank.com',
      authentication_method: 'PUBLIC_PROFILE_URL',
      oauth_supported: false,
      api_supported: true,
      capabilities: {
        profile: true,
        activity: true,
        statistics: true,
        jobs: false,
        applications: false,
        repositories: false,
        code_submissions: true,
        sync: true,
      },
      rate_limits: { max_requests_per_minute: 20, sync_interval_hours: 6 },
      privacy_requirements: ['Public user profile stats only', 'Never stores credentials'],
      enabled: true,
    };
  }

  getCapabilities(): ProviderCapabilities {
    return this.getInfo().capabilities;
  }

  async initiateAuth(): Promise<never> {
    // No OAuth app is registered for this provider; the made-up authorization URL that used to be returned was removed.
    throw new Error(`${this.getInfo().name} does not offer sign-in here.`);
  }

  async connectAccount(_studentId: string, _payload: { username?: string; profile_url?: string }): Promise<never> {
    // Linking goes through ExternalIntegrationService.connectPlatform, which never marks an unverified account CONNECTED.
    throw new Error(`${this.getInfo().name} cannot be connected through the provider registry.`);
  }

  async syncData(_studentId: string, _connection: ExternalAccountConnection): Promise<never> {
    // No live client exists for this provider; the hand-written sample activity that used to be returned here was removed.
    throw new Error(`Live sync with ${this.getInfo().name} is not available, so no data was imported.`);
  }
}

// 6. CodeChef Provider
export class CodeChefProviderImpl implements ExternalProvider {
  getInfo(): ExternalProviderInfo {
    return {
      id: 'codechef',
      name: 'CodeChef',
      display_name: 'CodeChef Competitive Contests',
      category: 'CODING_COMPETITIVE',
      description: 'Sync official star rating, division, contest participation, and problem solving history.',
      icon_name: 'Trophy',
      official_url: 'https://www.codechef.com',
      authentication_method: 'PUBLIC_PROFILE_URL',
      oauth_supported: false,
      api_supported: true,
      capabilities: {
        profile: true,
        activity: true,
        statistics: true,
        jobs: false,
        applications: false,
        repositories: false,
        code_submissions: true,
        sync: true,
      },
      rate_limits: { max_requests_per_minute: 20, sync_interval_hours: 6 },
      privacy_requirements: ['Public contest rating and problem submission logs only'],
      enabled: true,
    };
  }

  getCapabilities(): ProviderCapabilities {
    return this.getInfo().capabilities;
  }

  async initiateAuth(): Promise<never> {
    // No OAuth app is registered for this provider; the made-up authorization URL that used to be returned was removed.
    throw new Error(`${this.getInfo().name} does not offer sign-in here.`);
  }

  async connectAccount(_studentId: string, _payload: { username?: string; profile_url?: string }): Promise<never> {
    // Linking goes through ExternalIntegrationService.connectPlatform, which never marks an unverified account CONNECTED.
    throw new Error(`${this.getInfo().name} cannot be connected through the provider registry.`);
  }

  async syncData(_studentId: string, _connection: ExternalAccountConnection): Promise<never> {
    // No live client exists for this provider; the hand-written sample activity that used to be returned here was removed.
    throw new Error(`Live sync with ${this.getInfo().name} is not available, so no data was imported.`);
  }
}

// 7. GeeksforGeeks Provider
export class GeeksforGeeksProviderImpl implements ExternalProvider {
  getInfo(): ExternalProviderInfo {
    return {
      id: 'geeksforgeeks',
      name: 'GeeksforGeeks',
      display_name: 'GeeksforGeeks Practice & Articles',
      category: 'CODING_COMPETITIVE',
      description: 'Sync practice score, coding streaks, and campus leaderboards via public profile.',
      icon_name: 'Binary',
      official_url: 'https://www.geeksforgeeks.org',
      authentication_method: 'PUBLIC_PROFILE_URL',
      oauth_supported: false,
      api_supported: true,
      capabilities: {
        profile: true,
        activity: true,
        statistics: true,
        jobs: false,
        applications: false,
        repositories: false,
        code_submissions: true,
        sync: true,
      },
      rate_limits: { max_requests_per_minute: 20, sync_interval_hours: 6 },
      privacy_requirements: ['Public practice score and institute ranking only'],
      enabled: true,
    };
  }

  getCapabilities(): ProviderCapabilities {
    return this.getInfo().capabilities;
  }

  async initiateAuth(): Promise<never> {
    // No OAuth app is registered for this provider; the made-up authorization URL that used to be returned was removed.
    throw new Error(`${this.getInfo().name} does not offer sign-in here.`);
  }

  async connectAccount(_studentId: string, _payload: { username?: string; profile_url?: string }): Promise<never> {
    // Linking goes through ExternalIntegrationService.connectPlatform, which never marks an unverified account CONNECTED.
    throw new Error(`${this.getInfo().name} cannot be connected through the provider registry.`);
  }

  async syncData(_studentId: string, _connection: ExternalAccountConnection): Promise<never> {
    // No live client exists for this provider; the hand-written sample activity that used to be returned here was removed.
    throw new Error(`Live sync with ${this.getInfo().name} is not available, so no data was imported.`);
  }
}

// 8. Kaggle Provider
export class KaggleProviderImpl implements ExternalProvider {
  getInfo(): ExternalProviderInfo {
    return {
      id: 'kaggle',
      name: 'Kaggle',
      display_name: 'Kaggle Data Science & ML',
      category: 'DATA_AI',
      description: 'Sync ML competitions, public notebook medals, dataset publications, and ranking tiers.',
      icon_name: 'Database',
      official_url: 'https://www.kaggle.com',
      authentication_method: 'PUBLIC_PROFILE_URL',
      oauth_supported: false,
      api_supported: true,
      capabilities: {
        profile: true,
        activity: true,
        statistics: true,
        jobs: false,
        applications: false,
        repositories: false,
        code_submissions: true,
        sync: true,
      },
      rate_limits: { max_requests_per_minute: 20, sync_interval_hours: 6 },
      privacy_requirements: ['Public user profile and competition standings only'],
      enabled: true,
    };
  }

  getCapabilities(): ProviderCapabilities {
    return this.getInfo().capabilities;
  }

  async initiateAuth(): Promise<never> {
    // No OAuth app is registered for this provider; the made-up authorization URL that used to be returned was removed.
    throw new Error(`${this.getInfo().name} does not offer sign-in here.`);
  }

  async connectAccount(_studentId: string, _payload: { username?: string; profile_url?: string }): Promise<never> {
    // Linking goes through ExternalIntegrationService.connectPlatform, which never marks an unverified account CONNECTED.
    throw new Error(`${this.getInfo().name} cannot be connected through the provider registry.`);
  }

  async syncData(_studentId: string, _connection: ExternalAccountConnection): Promise<never> {
    // No live client exists for this provider; the hand-written sample activity that used to be returned here was removed.
    throw new Error(`Live sync with ${this.getInfo().name} is not available, so no data was imported.`);
  }
}

// Registry Manager
export class ExternalIntegrationRegistry {
  private static providers: Map<ExternalProviderId, ExternalProvider> = new Map();

  static {
    this.register(new LinkedInProviderImpl());
    this.register(new IndeedProviderImpl());
    this.register(new LeetCodeProviderImpl());
    this.register(new GitHubProviderImpl());
    this.register(new HackerRankProviderImpl());
    this.register(new CodeChefProviderImpl());
    this.register(new GeeksforGeeksProviderImpl());
    this.register(new KaggleProviderImpl());
  }

  public static register(provider: ExternalProvider): void {
    const info = provider.getInfo();
    this.providers.set(info.id, provider);
    logger.info(`ExternalIntegrationRegistry: Registered provider ${info.id} (${info.name})`);
  }

  public static get(id: ExternalProviderId): ExternalProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Provider list as shown to students. Capabilities describe what this platform actually does today: only GitHub has
   * a data source (repositories imported in the GitHub module) and a sign-in (when GitHub OAuth is configured).
   * Every other provider is a saved profile link.
   */
  public static getAllProviders(): ExternalProviderInfo[] {
    return Array.from(this.providers.values()).map((p) => {
      const info = p.getInfo();
      const isGithub = info.id === 'github';
      const none = Object.fromEntries(Object.keys(info.capabilities).map((k) => [k, false])) as unknown as ProviderCapabilities;
      return {
        ...info,
        authentication_method: isGithub ? info.authentication_method : 'PUBLIC_PROFILE_URL',
        oauth_supported: isGithub,
        api_supported: isGithub,
        capabilities: isGithub ? { ...none, profile: true, repositories: true } : none,
        description: isGithub
          ? 'Uses the GitHub module: repositories you imported there, verified by GitHub sign-in or an access token.'
          : `Save a link to your ${info.name} profile. Nothing is imported from ${info.name}.`,
        rate_limits: isGithub ? info.rate_limits : undefined,
        privacy_requirements: isGithub
          ? ['GitHub sign-in or a token you provide; the token stays on the server', 'Never asks for your GitHub password']
          : ['Only the link you enter is stored', 'Never asks for your password'],
      } as ExternalProviderInfo;
    });
  }

  /** The honest capabilities from getAllProviders (the providers' own declarations overstate what exists). */
  public static getCapabilities(id: ExternalProviderId): ProviderCapabilities | undefined {
    return this.getAllProviders().find((p) => p.id === id)?.capabilities;
  }
}
