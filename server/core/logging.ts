export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  status?: number;
  durationMs?: number;
  error?: {
    code?: string;
    message: string;
  } | any;
  context?: Record<string, unknown>;
  [key: string]: any;
}

class StructuredLogger {
  private format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  public info(message: string, context: Partial<LogEntry> = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...context,
    };
    console.log(this.format(entry));
  }

  public warn(message: string, context: Partial<LogEntry> = {}) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      ...context,
    };
    console.warn(this.format(entry));
  }

  public error(message: string, error?: Error | unknown, context: Partial<LogEntry> = {}) {
    const errObj = error instanceof Error ? { message: error.message, code: (error as any).code } : undefined;
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error: errObj,
      ...context,
    };
    console.error(this.format(entry));
  }

  public debug(message: string, context: Partial<LogEntry> = {}) {
    if (process.env.NODE_ENV !== 'production') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        ...context,
      };
      console.debug(this.format(entry));
    }
  }
}

export const logger = new StructuredLogger();
