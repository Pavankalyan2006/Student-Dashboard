// Applies the SQL files in supabase/migrations/ to the configured Postgres database once each.
//
// Used on Vercel so a deploy brings the schema with it. Every migration file is idempotent
// on its own; this runner also records what it applied in public.app_schema_migrations and
// takes a transaction-scoped advisory lock, so two cold starts at the same moment do not race.
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { logger } from '../core/logging';
import { pgSslFor } from './pgSsl';

export function migrationsDir(): string | null {
  const candidates = [
    process.env.MIGRATIONS_DIR,
    path.resolve(process.cwd(), 'supabase/migrations'),
  ].filter(Boolean) as string[];
  return candidates.find((d) => fs.existsSync(d)) || null;
}

export async function runMigrations(connectionString: string): Promise<string[]> {
  const dir = migrationsDir();
  if (!dir) {
    logger.warn('No supabase/migrations directory found; skipping schema migrations');
    return [];
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 8000, statement_timeout: 60000, ...pgSslFor(connectionString) } as pg.ClientConfig);
  await client.connect();
  const applied: string[] = [];
  try {
    await client.query(
      'create table if not exists public.app_schema_migrations (name text primary key, applied_at timestamptz not null default now())'
    );
    await client.query('alter table public.app_schema_migrations enable row level security');
    for (const file of files) {
      await client.query('begin');
      try {
        await client.query('select pg_advisory_xact_lock(727274002)');
        const done = await client.query('select 1 from public.app_schema_migrations where name = $1', [file]);
        if (done.rowCount) {
          await client.query('commit');
          continue;
        }
        await client.query(fs.readFileSync(path.join(dir, file), 'utf8'));
        await client.query('insert into public.app_schema_migrations (name) values ($1) on conflict do nothing', [file]);
        await client.query('commit');
        applied.push(file);
        logger.info(`Applied database migration ${file}`);
      } catch (err) {
        await client.query('rollback').catch(() => undefined);
        logger.error(`Database migration ${file} failed: ${(err as any)?.code || ''} ${(err as any)?.message || ''}`);
        throw err;
      }
    }
  } finally {
    await client.end().catch(() => undefined);
  }
  return applied;
}
