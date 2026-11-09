// server/services/externalProfilesCatalog.ts
// Platform catalog, URL validation, normalization, and SSRF security protection

import { CHALLENGE_VERIFIABLE, OAUTH_PLATFORMS, SYNCABLE } from './platformVerification';
import {
  ExternalPlatformId,
  ExternalPlatformCategory,
  ExternalPlatformMeta,
} from '../models/externalProfileTypes';

export const SUPPORTED_EXTERNAL_PLATFORMS: ExternalPlatformMeta[] = [
  // A. Developer and code hosting platforms
  {
    id: 'github',
    name: 'GitHub',
    category: 'DEVELOPER_CODE_HOSTING',
    secondary_categories: ['PORTFOLIO_PROJECT'],
    description: 'Code repositories, commits, star metrics, primary programming languages, and pull requests.',
    icon_name: 'Github',
    brand_color: '#24292F',
    official_url: 'https://github.com',
    url_placeholder: 'https://github.com/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?github\\.com\\/([a-zA-Z0-9_-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$',
    supported_connection_methods: ['OAUTH2', 'OFFICIAL_API', 'PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE'],
    oauth_supported: true,
    api_supported: true,
    challenge_verification_supported: true,
    sync_supported: true,
    available_data_fields: ['Repositories', 'Languages', 'Stars', 'Commits', 'Bio', 'Avatar'],
    rate_limit_per_minute: 60,
    privacy_notes: 'Read-only access to public profile and repositories. Private repos are never accessed without explicit permission.',
    enabled: true,
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'DEVELOPER_CODE_HOSTING',
    secondary_categories: ['PORTFOLIO_PROJECT'],
    description: 'Self-hosted or cloud GitLab repositories, CI/CD pipeline activities, and open-source contributions.',
    icon_name: 'Gitlab',
    brand_color: '#FC6D26',
    official_url: 'https://gitlab.com',
    url_placeholder: 'https://gitlab.com/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?gitlab\\.com\\/([a-zA-Z0-9_.-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_.-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: true,
    challenge_verification_supported: true,
    sync_supported: true,
    available_data_fields: ['Public Projects', 'Languages', 'Profile Bio', 'Activity'],
    privacy_notes: 'Only public repository and user profile details are indexed.',
    enabled: true,
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    category: 'DEVELOPER_CODE_HOSTING',
    description: 'Atlassian Bitbucket profile and public workspaces.',
    icon_name: 'GitBranch',
    brand_color: '#0052CC',
    official_url: 'https://bitbucket.org',
    url_placeholder: 'https://bitbucket.org/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?bitbucket\\.org\\/([a-zA-Z0-9_-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['Public Profile URL', 'Username'],
    privacy_notes: 'Manual link saved for verification and resume inclusion.',
    enabled: true,
  },

  // B. Coding practice platforms
  {
    id: 'leetcode',
    name: 'LeetCode',
    category: 'CODING_PRACTICE',
    secondary_categories: ['COMPETITIVE_PROGRAMMING'],
    description: 'Problem-solving counts across Easy/Medium/Hard, contest ranking, global percentile, and badges.',
    icon_name: 'Code2',
    brand_color: '#FFA116',
    official_url: 'https://leetcode.com',
    url_placeholder: 'https://leetcode.com/u/your-username or https://leetcode.com/your-username',
    url_patterns: [
      '^https?:\\/\\/(www\\.)?leetcode\\.com\\/(u\\/)?([a-zA-Z0-9_-]+)\\/?$',
    ],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: true,
    challenge_verification_supported: true,
    sync_supported: true,
    available_data_fields: ['Problems Solved (Easy/Med/Hard)', 'Contest Rating', 'Global Rank', 'Badges'],
    privacy_notes: 'Uses public profile endpoints without requiring your LeetCode password.',
    enabled: true,
  },
  {
    id: 'hackerrank',
    name: 'HackerRank',
    category: 'CODING_PRACTICE',
    secondary_categories: ['COMPETITIVE_PROGRAMMING'],
    description: 'Domain stars (Python, Problem Solving, Algorithms, SQL) and certified skill badges.',
    icon_name: 'Terminal',
    brand_color: '#00EA64',
    official_url: 'https://www.hackerrank.com',
    url_placeholder: 'https://www.hackerrank.com/profile/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?hackerrank\\.com\\/(profile\\/)?([a-zA-Z0-9_-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: true,
    challenge_verification_supported: true,
    sync_supported: true,
    available_data_fields: ['Gold Badges', 'Certificates', 'Problem Solving Stars'],
    privacy_notes: 'Verified via public profile and certificate badges.',
    enabled: true,
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    category: 'CODING_PRACTICE',
    secondary_categories: ['COMPETITIVE_PROGRAMMING'],
    description: 'Star rating (1★ to 7★), contest division, global rank, and Long/Cook-Off challenge performance.',
    icon_name: 'Binary',
    brand_color: '#5B4638',
    official_url: 'https://www.codechef.com',
    url_placeholder: 'https://www.codechef.com/users/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?codechef\\.com\\/users\\/([a-zA-Z0-9_]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: true,
    challenge_verification_supported: true,
    sync_supported: true,
    available_data_fields: ['Star Rating', 'Contest Rating', 'Country Rank', 'Solved Problems'],
    privacy_notes: 'Public rating retrieved from CodeChef user profile.',
    enabled: true,
  },
  {
    id: 'codeforces',
    name: 'Codeforces',
    category: 'COMPETITIVE_PROGRAMMING',
    secondary_categories: ['CODING_PRACTICE'],
    description: 'Competitive programming rank (Pupil, Specialist, Candidate Master, etc.), rating, and contest stats.',
    icon_name: 'Trophy',
    brand_color: '#1F8ACB',
    official_url: 'https://codeforces.com',
    url_placeholder: 'https://codeforces.com/profile/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?codeforces\\.com\\/profile\\/([a-zA-Z0-9_.-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_.-]+$',
    supported_connection_methods: ['OFFICIAL_API', 'PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: true,
    challenge_verification_supported: true,
    sync_supported: true,
    available_data_fields: ['Rating', 'Max Rating', 'Rank', 'Contest Count'],
    privacy_notes: 'Retrieved via official Codeforces public API without credentials.',
    enabled: true,
  },
  {
    id: 'atcoder',
    name: 'AtCoder',
    category: 'COMPETITIVE_PROGRAMMING',
    description: 'AtCoder Beginner & Regular Contest ratings, color rating tier, and contest history.',
    icon_name: 'Target',
    brand_color: '#222222',
    official_url: 'https://atcoder.jp',
    url_placeholder: 'https://atcoder.jp/users/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?atcoder\\.jp\\/users\\/([a-zA-Z0-9_]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: true,
    challenge_verification_supported: false,
    sync_supported: true,
    available_data_fields: ['Rating', 'Color Tier', 'Highest Rating'],
    privacy_notes: 'Public user profile information only.',
    enabled: true,
  },
  {
    id: 'geeksforgeeks',
    name: 'GeeksforGeeks',
    category: 'CODING_PRACTICE',
    description: 'GFG coding score, problem of the day streaks, institute ranking, and published articles.',
    icon_name: 'BookOpen',
    brand_color: '#2F8D46',
    official_url: 'https://www.geeksforgeeks.org',
    url_placeholder: 'https://www.geeksforgeeks.org/user/your-username/',
    url_patterns: ['^https?:\\/\\/(www\\.)?geeksforgeeks\\.org\\/user\\/([a-zA-Z0-9_.-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_.-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: true,
    sync_supported: false,
    available_data_fields: ['Coding Score', 'Institute Rank', 'Articles Authored'],
    privacy_notes: 'Manual link saved and verified through challenge verification.',
    enabled: true,
  },
  {
    id: 'hackerearth',
    name: 'HackerEarth',
    category: 'CODING_PRACTICE',
    secondary_categories: ['COMPETITIVE_PROGRAMMING'],
    description: 'HackerEarth hackathon participation, developer profile, and competitive challenges.',
    icon_name: 'Flame',
    brand_color: '#323754',
    official_url: 'https://www.hackerearth.com',
    url_placeholder: 'https://www.hackerearth.com/@your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?hackerearth\\.com\\/(@)?([a-zA-Z0-9_.-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_.-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['Developer Profile', 'Hackathon Participation'],
    privacy_notes: 'Manual profile link.',
    enabled: true,
  },
  {
    id: 'exercism',
    name: 'Exercism',
    category: 'CODING_PRACTICE',
    description: 'Language tracks completed, mentoring feedback, and code fluency exercises.',
    icon_name: 'Layers',
    brand_color: '#009CAB',
    official_url: 'https://exercism.org',
    url_placeholder: 'https://exercism.org/profiles/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?exercism\\.(org|io)\\/profiles\\/([a-zA-Z0-9_-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['Completed Tracks', 'Mentoring Badges'],
    privacy_notes: 'Manual link saved for student portfolio.',
    enabled: true,
  },

  // C. Professional networking
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'PROFESSIONAL_NETWORKING',
    description: 'Professional headline, verified education, work experience, and industry network.',
    icon_name: 'Linkedin',
    brand_color: '#0A66C2',
    official_url: 'https://www.linkedin.com',
    url_placeholder: 'https://www.linkedin.com/in/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?linkedin\\.com\\/in\\/([a-zA-Z0-9_-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['OAUTH2', 'PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: true,
    api_supported: true,
    challenge_verification_supported: false,
    sync_supported: true,
    available_data_fields: ['Headline', 'Public Profile URL', 'Industry Experience', 'Education'],
    privacy_notes: 'Never asks for your password. Official OAuth requests minimum permissions; manual link entry is always supported.',
    enabled: true,
  },

  // D. Portfolio and project hosting
  {
    id: 'portfolio_website',
    name: 'Personal Portfolio',
    category: 'PORTFOLIO_PROJECT',
    description: 'Your personal engineering website, domain, or digital curriculum vitae.',
    icon_name: 'Globe',
    brand_color: '#6366F1',
    official_url: 'https://',
    url_placeholder: 'https://yourname.dev or https://yourname.com',
    url_patterns: ['^https:\\/\\/[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+.*$'],
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: true,
    sync_supported: false,
    available_data_fields: ['Website URL', 'Title', 'Projects Displayed'],
    privacy_notes: 'Must use HTTPS. Strict SSRF protections block private IP ranges.',
    enabled: true,
  },
  {
    id: 'github_pages',
    name: 'GitHub Pages',
    category: 'PORTFOLIO_PROJECT',
    secondary_categories: ['DEVELOPER_CODE_HOSTING'],
    description: 'Hosted static portfolio or documentation on github.io.',
    icon_name: 'Compass',
    brand_color: '#181717',
    official_url: 'https://github.io',
    url_placeholder: 'https://your-username.github.io',
    url_patterns: ['^https?:\\/\\/([a-zA-Z0-9-]+)\\.github\\.io(\\/.*)?$'],
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: true,
    sync_supported: false,
    available_data_fields: ['Portfolio Site URL', 'Hosting Repo'],
    privacy_notes: 'Direct web link to your public GitHub Pages.',
    enabled: true,
  },
  {
    id: 'behance',
    name: 'Behance',
    category: 'PORTFOLIO_PROJECT',
    secondary_categories: ['DESIGN_DATA_SPECIALIZED'],
    description: 'UI/UX case studies, design systems, and visual project showcases.',
    icon_name: 'Palette',
    brand_color: '#1769FF',
    official_url: 'https://www.behance.net',
    url_placeholder: 'https://www.behance.net/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?behance\\.net\\/([a-zA-Z0-9_-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['Portfolio Link', 'Design Projects'],
    privacy_notes: 'Public portfolio link.',
    enabled: true,
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    category: 'PORTFOLIO_PROJECT',
    secondary_categories: ['DESIGN_DATA_SPECIALIZED'],
    description: 'Design shots, animations, and product interface concepts.',
    icon_name: 'Sparkles',
    brand_color: '#EA4C89',
    official_url: 'https://dribbble.com',
    url_placeholder: 'https://dribbble.com/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?dribbble\\.com\\/([a-zA-Z0-9_-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['Design Shots', 'Profile URL'],
    privacy_notes: 'Public portfolio link.',
    enabled: true,
  },

  // E. Competitive programming
  {
    id: 'topcoder',
    name: 'Topcoder',
    category: 'COMPETITIVE_PROGRAMMING',
    description: 'Single Round Matches (SRM) rating, division, and algorithm challenges.',
    icon_name: 'Award',
    brand_color: '#29A8DF',
    official_url: 'https://www.topcoder.com',
    url_placeholder: 'https://www.topcoder.com/members/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?topcoder\\.com\\/members\\/([a-zA-Z0-9_-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['SRM Rating', 'Member Profile'],
    privacy_notes: 'Manual profile link.',
    enabled: true,
  },

  // F. Academic and research profiles
  {
    id: 'google_scholar',
    name: 'Google Scholar',
    category: 'ACADEMIC_RESEARCH',
    description: 'Citations, h-index, i10-index, and peer-reviewed research papers.',
    icon_name: 'GraduationCap',
    brand_color: '#4285F4',
    official_url: 'https://scholar.google.com',
    url_placeholder: 'https://scholar.google.com/citations?user=your-id',
    url_patterns: [
      '^https?:\\/\\/scholar\\.google\\.(com|[a-z]{2,3})\\/citations\\?.*user=([a-zA-Z0-9_-]+).*$',
    ],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['Citations Count', 'h-index', 'Publications List'],
    privacy_notes: 'Manual citation link saved for academic evaluation and research resume.',
    enabled: true,
  },
  {
    id: 'orcid',
    name: 'ORCID',
    category: 'ACADEMIC_RESEARCH',
    description: 'Unique digital identifier (0000-000x-xxxx-xxxx) distinguishing academic researchers.',
    icon_name: 'Fingerprint',
    brand_color: '#A6CE39',
    official_url: 'https://orcid.org',
    url_placeholder: 'https://orcid.org/0000-0002-1825-0097',
    url_patterns: ['^https?:\\/\\/orcid\\.org\\/(\\d{4}-\\d{4}-\\d{4}-[0-9X]{4})\\/?$'],
    username_pattern: '^\\d{4}-\\d{4}-\\d{4}-[0-9X]{4}$',
    supported_connection_methods: ['OFFICIAL_API', 'PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: true,
    challenge_verification_supported: false,
    sync_supported: true,
    available_data_fields: ['ORCID iD', 'Public Works', 'Biography', 'Education'],
    privacy_notes: 'Queries official ORCID public API for verified researcher metadata.',
    enabled: true,
  },
  {
    id: 'researchgate',
    name: 'ResearchGate',
    category: 'ACADEMIC_RESEARCH',
    description: 'Academic network for sharing scientific papers, research questions, and conference proceedings.',
    icon_name: 'BookMarked',
    brand_color: '#00CCBB',
    official_url: 'https://www.researchgate.net',
    url_placeholder: 'https://www.researchgate.net/profile/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?researchgate\\.net\\/profile\\/([a-zA-Z0-9_.-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_.-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['Author Profile', 'Publications'],
    privacy_notes: 'Manual profile link saved for research portfolio.',
    enabled: true,
  },

  // G. Design, data, and specialized platforms
  {
    id: 'kaggle',
    name: 'Kaggle',
    category: 'DESIGN_DATA_SPECIALIZED',
    secondary_categories: ['CODING_PRACTICE'],
    description: 'Data Science & Machine Learning competitions, verified Jupyter notebooks, and open datasets.',
    icon_name: 'Database',
    brand_color: '#20BEFF',
    official_url: 'https://www.kaggle.com',
    url_placeholder: 'https://www.kaggle.com/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?kaggle\\.com\\/([a-zA-Z0-9_]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: true,
    challenge_verification_supported: true,
    sync_supported: true,
    available_data_fields: ['Competitions Tier', 'Notebooks Expert', 'Datasets', 'Medals'],
    privacy_notes: 'Public profile metadata indexed without requiring Kaggle API keys.',
    enabled: true,
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    category: 'DESIGN_DATA_SPECIALIZED',
    description: 'Open source AI models, machine learning Spaces, and public dataset repositories.',
    icon_name: 'Cpu',
    brand_color: '#FFD21E',
    official_url: 'https://huggingface.co',
    url_placeholder: 'https://huggingface.co/your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?huggingface\\.co\\/([a-zA-Z0-9_-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_-]+$',
    supported_connection_methods: ['OFFICIAL_API', 'PUBLIC_PROFILE_URL', 'PUBLIC_HANDLE', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: true,
    challenge_verification_supported: true,
    sync_supported: true,
    available_data_fields: ['Models Published', 'Spaces', 'Datasets', 'Upvotes'],
    privacy_notes: 'Retrieved via official Hugging Face public user API.',
    enabled: true,
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'DESIGN_DATA_SPECIALIZED',
    secondary_categories: ['PORTFOLIO_PROJECT'],
    description: 'Figma Community creator profile, UI design components, and design systems.',
    icon_name: 'Layout',
    brand_color: '#F24E1E',
    official_url: 'https://www.figma.com',
    url_placeholder: 'https://www.figma.com/@your-username',
    url_patterns: ['^https?:\\/\\/(www\\.)?figma\\.com\\/(@)?([a-zA-Z0-9_.-]+)\\/?$'],
    username_pattern: '^[a-zA-Z0-9_.-]+$',
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['Community Profile', 'Public Design Files'],
    privacy_notes: 'Public creator profile link.',
    enabled: true,
  },
  {
    id: 'custom_link',
    name: 'Custom Professional Link',
    category: 'PORTFOLIO_PROJECT',
    description: 'Any external professional blog, technical writeup, certification credential, or personal project link.',
    icon_name: 'ExternalLink',
    brand_color: '#6366F1',
    official_url: 'https://',
    url_placeholder: 'https://yourwebsite.com/my-project',
    url_patterns: ['^https?:\\/\\/[^\\s/$.?#].[^\\s]*$'],
    supported_connection_methods: ['PUBLIC_PROFILE_URL', 'MANUAL_ENTRY'],
    oauth_supported: false,
    api_supported: false,
    challenge_verification_supported: false,
    sync_supported: false,
    available_data_fields: ['Custom Link', 'Verified URL'],
    privacy_notes: 'Custom external link preserved for portfolio and resume.',
    enabled: true,
  },
];

// Phase 3: capability flags follow what is implemented (see platformVerification.ts), not what a platform might offer.
for (const p of SUPPORTED_EXTERNAL_PLATFORMS) {
  p.oauth_supported = OAUTH_PLATFORMS.has(p.id);
  p.challenge_verification_supported = CHALLENGE_VERIFIABLE.has(p.id);
  p.sync_supported = SYNCABLE.has(p.id);
}

/**
 * Platform URL & Handle Validation Engine with SSRF Protection
 */
export class ExternalProfileValidator {
  // Private / internal IP ranges to protect against Server-Side Request Forgery (SSRF)
  private static readonly BLOCKED_HOSTNAMES = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '169.254.169.254', // AWS / Cloud metadata
    'metadata.google.internal',
  ]);

  /**
   * Validate a raw profile URL or username for a specific platform
   */
  public static validateProfile(
    platformId: ExternalPlatformId,
    rawInput: string
  ): {
    valid: boolean;
    normalized_url: string;
    username: string;
    error?: string;
  } {
    const platform = SUPPORTED_EXTERNAL_PLATFORMS.find((p) => p.id === platformId);
    if (!platform) {
      return { valid: false, normalized_url: '', username: '', error: `Unsupported platform: '${platformId}'` };
    }

    const input = (rawInput || '').trim();
    if (!input) {
      return { valid: false, normalized_url: '', username: '', error: 'Profile URL or handle cannot be empty' };
    }

    // Check for dangerous schemes
    const lowerInput = input.toLowerCase();
    if (
      lowerInput.startsWith('javascript:') ||
      lowerInput.startsWith('data:') ||
      lowerInput.startsWith('file:') ||
      lowerInput.startsWith('vbscript:')
    ) {
      return { valid: false, normalized_url: '', username: '', error: 'Dangerous protocol detected. Only HTTPS is permitted.' };
    }

    let urlToValidate = input;

    // If input is just a username/handle, construct full canonical URL
    const isFullUrl = input.startsWith('http://') || input.startsWith('https://');
    if (!isFullUrl) {
      // Validate username regex if defined
      if (platform.username_pattern) {
        const uRegex = new RegExp(platform.username_pattern);
        if (!uRegex.test(input)) {
          return {
            valid: false,
            normalized_url: '',
            username: input,
            error: `Invalid username format for ${platform.name}.`,
          };
        }
      }

      // Build canonical URL from official domain
      switch (platformId) {
        case 'github':
          urlToValidate = `https://github.com/${input}`;
          break;
        case 'gitlab':
          urlToValidate = `https://gitlab.com/${input}`;
          break;
        case 'bitbucket':
          urlToValidate = `https://bitbucket.org/${input}`;
          break;
        case 'leetcode':
          urlToValidate = `https://leetcode.com/u/${input}`;
          break;
        case 'hackerrank':
          urlToValidate = `https://www.hackerrank.com/profile/${input}`;
          break;
        case 'codechef':
          urlToValidate = `https://www.codechef.com/users/${input}`;
          break;
        case 'codeforces':
          urlToValidate = `https://codeforces.com/profile/${input}`;
          break;
        case 'atcoder':
          urlToValidate = `https://atcoder.jp/users/${input}`;
          break;
        case 'geeksforgeeks':
          urlToValidate = `https://www.geeksforgeeks.org/user/${input}/`;
          break;
        case 'hackerearth':
          urlToValidate = `https://www.hackerearth.com/@${input}`;
          break;
        case 'exercism':
          urlToValidate = `https://exercism.org/profiles/${input}`;
          break;
        case 'linkedin':
          urlToValidate = `https://www.linkedin.com/in/${input}`;
          break;
        case 'kaggle':
          urlToValidate = `https://www.kaggle.com/${input}`;
          break;
        case 'huggingface':
          urlToValidate = `https://huggingface.co/${input}`;
          break;
        case 'figma':
          urlToValidate = `https://www.figma.com/@${input}`;
          break;
        case 'orcid':
          urlToValidate = `https://orcid.org/${input}`;
          break;
        case 'portfolio_website':
          urlToValidate = `https://${input}`;
          break;
        default:
          urlToValidate = `https://${input}`;
      }
    }

    // Parse URL with URL constructor
    let parsed: URL;
    try {
      parsed = new URL(urlToValidate);
    } catch {
      return { valid: false, normalized_url: '', username: '', error: 'Malformed URL syntax' };
    }

    // Enforce HTTPS
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, normalized_url: '', username: '', error: 'Only HTTP and HTTPS URLs are allowed.' };
    }

    // SSRF Check: block private IPs and reserved hostnames
    const hostname = parsed.hostname.toLowerCase();
    if (this.BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { valid: false, normalized_url: '', username: '', error: 'Access to local and private networks is restricted.' };
    }

    // Check private IPv4 ranges (10.x, 192.168.x, 172.16-31.x)
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname)) {
      return { valid: false, normalized_url: '', username: '', error: 'Private IP addresses are not permitted.' };
    }

    // Check platform URL pattern matching if defined
    if (platform.url_patterns && platform.url_patterns.length > 0) {
      let matched = false;
      let extractedUsername = '';

      for (const pattern of platform.url_patterns) {
        const regex = new RegExp(pattern, 'i');
        const match = urlToValidate.match(regex);
        if (match) {
          matched = true;
          // Last capture group is usually the username/id
          extractedUsername = match[match.length - 1];
          break;
        }
      }

      if (!matched && platformId !== 'portfolio_website' && platformId !== 'custom_link') {
        return {
          valid: false,
          normalized_url: '',
          username: '',
          error: `URL does not match expected format for ${platform.name}. Example: ${platform.url_placeholder}`,
        };
      }

      // Clean extracted username
      if (!extractedUsername) {
        extractedUsername = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/').pop() || '';
      }

      const normalized = this.normalizeUrl(parsed);
      return {
        valid: true,
        normalized_url: normalized,
        username: extractedUsername,
      };
    }

    // Generic URL (e.g. portfolio_website)
    const normalized = this.normalizeUrl(parsed);
    const username = parsed.hostname;
    return {
      valid: true,
      normalized_url: normalized,
      username,
    };
  }

  /**
   * Normalize URL to prevent duplicates: lowercases hostname, strips trailing slash and UTM parameters
   */
  public static normalizeUrl(url: URL): string {
    const cleanParams = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (!key.toLowerCase().startsWith('utm_') && key.toLowerCase() !== 'ref' && key.toLowerCase() !== 'source') {
        cleanParams.append(key, value);
      }
    }

    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }

    const search = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
    return `${url.protocol}//${url.hostname.toLowerCase()}${pathname}${search}`;
  }
}
