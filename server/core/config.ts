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
};

