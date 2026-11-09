import 'dotenv/config';

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  appUrl: string;
  databaseUrl?: string;
  redisUrl?: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  corsOrigin: string;
  aiProvider: 'gemini' | 'openai' | 'mock';
  geminiApiKey?: string;
  geminiModel?: string;
  openaiApiKey?: string;
  githubClientId?: string;
  githubClientSecret?: string;
  githubRedirectUri?: string;
  githubTokenEncryptionKey?: string;
  openalexApiKey?: string;
  storageDriver: string;
  storageLocalPath: string;
  maxUploadSizeBytes: number;
  allowedUploadMimeTypes: string[];
  /** Phase 5: which provider owns student credentials. See docs/phase-5/PHASE_5_AUTHENTICATION_REPORT.md. */
  authProvider: 'legacy' | 'firebase';
  firebaseProjectId?: string;
  /** Phase 5: where the central student profile is stored. 'supabase' needs SUPABASE_DB_URL. */
  profileStore: 'snapshot' | 'supabase';
  supabaseUrl?: string;
  supabaseDbUrl?: string;
  supabaseServiceRoleConfigured: boolean;
}

export const config: ServerConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET || 'btech-ai-platform-dev-secret-key-32chars-min',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'btech-ai-platform-refresh-dev-secret-key-min',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || '*',
  aiProvider: (process.env.AI_PROVIDER as any) || 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  openaiApiKey: process.env.OPENAI_API_KEY,
  githubClientId: process.env.GITHUB_CLIENT_ID,
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  githubRedirectUri: process.env.GITHUB_REDIRECT_URI,
  githubTokenEncryptionKey: process.env.GITHUB_TOKEN_ENCRYPTION_KEY || process.env.GITHUB_ENCRYPTION_KEY,
  openalexApiKey: process.env.OPENALEX_API_KEY,
  storageDriver: process.env.STORAGE_DRIVER || 'LOCAL',
  storageLocalPath: process.env.STORAGE_LOCAL_PATH || './data/vault',
  maxUploadSizeBytes: Number(process.env.MAX_UPLOAD_SIZE_BYTES) || 25 * 1024 * 1024,
  allowedUploadMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'image/png',
    'image/jpeg',
    'application/octet-stream',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
    'text/csv',
    'application/rtf',
  ],
  // Firebase becomes the authoritative provider only when the owner configures a project for the
  // backend. Without it the existing email/password provider keeps working unchanged.
  authProvider:
    (process.env.AUTH_PROVIDER as 'legacy' | 'firebase') ||
    (process.env.FIREBASE_PROJECT_ID ? 'firebase' : 'legacy'),
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  profileStore:
    (process.env.PROFILE_STORE as 'snapshot' | 'supabase') ||
    (process.env.SUPABASE_DB_URL ? 'supabase' : 'snapshot'),
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseDbUrl: process.env.SUPABASE_DB_URL,
  supabaseServiceRoleConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
};

if (!['legacy', 'firebase'].includes(config.authProvider)) {
  throw new Error(`AUTH_PROVIDER must be 'legacy' or 'firebase' (got '${config.authProvider}').`);
}
if (!['snapshot', 'supabase'].includes(config.profileStore)) {
  throw new Error(`PROFILE_STORE must be 'snapshot' or 'supabase' (got '${config.profileStore}').`);
}
if (config.authProvider === 'firebase' && !config.firebaseProjectId) {
  throw new Error('AUTH_PROVIDER=firebase needs FIREBASE_PROJECT_ID so ID tokens can be verified.');
}
if (config.profileStore === 'supabase' && !config.supabaseDbUrl) {
  throw new Error('PROFILE_STORE=supabase needs SUPABASE_DB_URL (server-only Postgres connection string).');
}


// Refuse to run in production with the published development JWT secrets: anyone
// could otherwise forge access tokens for any account, including administrators.
if (config.nodeEnv === 'production') {
  const insecure: string[] = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) insecure.push('JWT_SECRET');
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
    insecure.push('JWT_REFRESH_SECRET');
  }
  if (insecure.length > 0) {
    throw new Error(
      `Missing or too-short ${insecure.join(' and ')} (min 32 chars). Refusing to start in production with default secrets.`
    );
  }
}
