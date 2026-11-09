// Postgres persistence for the in-memory data store, for serverless hosting (Vercel).
//
// The file snapshot in persistence.ts assumes one long-running process with a writable disk.
// On Vercel every function instance has its own memory and a throwaway disk, so student data
// written on one instance would be invisible to the next and lost on the next cold start.
//
// This module keeps the same registered sources but stores them in Postgres, one row per
// Map entry (arrays and Sets are one row each). It:
//   - loads every row on cold start and merges it over the seed data (same rule as the file snapshot);
//   - before each API request, pulls rows other instances changed since the last sync (by revision);
//   - after each successful mutating request, writes only the entries that changed, BEFORE the
//     response is sent, so a student never sees "saved" for data that is not in the database.
// Concurrent writes to the same entry from two instances resolve last-write-wins per entry.
import pg from 'pg';
import { logger } from '../core/logging';
import { encodeValue, decodeValue, getRegisteredSources } from './persistence';

const { Pool } = pg;

const WHOLE = '__whole__';

export const STATE_SCHEMA_SQL = `
create sequence if not exists public.app_state_rev;
create table if not exists public.app_state_entries (
  source text not null,
  key text not null,
  entry_key text not null,
  value jsonb,
  deleted boolean not null default false,
  rev bigint not null default nextval('public.app_state_rev'),
  updated_at timestamptz not null default now(),
  primary key (source, key, entry_key)
);
create index if not exists app_state_entries_rev_idx on public.app_state_entries (rev);
alter table public.app_state_entries enable row level security;
revoke all on public.app_state_entries from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on public.app_state_entries from anon';
    execute 'revoke all on sequence public.app_state_rev from anon';
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on public.app_state_entries from authenticated';
    execute 'revoke all on sequence public.app_state_rev from authenticated';
  end if;
end $$;
`;

interface Row {
  source: string;
  key: string;
  entry_key: string;
  value: unknown;
  deleted: boolean;
  rev: string;
}

function id(source: string, key: string, entryKey: string): string {
  return `${source}\u0000${key}\u0000${entryKey}`;
}

/** Simple async mutex so sync and save never interleave inside one instance. */
class Lock {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.tail.then(fn, fn);
    this.tail = next.catch(() => undefined);
    return next;
  }
}

export class PgStatePersistence {
  private pool: pg.Pool;
  private lastSaved = new Map<string, string>();
  private localRev = 0n;
  private lock = new Lock();
  private loaded = false;
  /** Revisions this instance wrote; sync skips them so live objects are not swapped under a request. */
  private ownRevs = new Set<string>();

  constructor(connectionString: string, poolOptions: Partial<pg.PoolConfig> = {}) {
    this.pool = new Pool({
      connectionString,
      max: 3,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 10000,
      statement_timeout: 20000,
      ...poolOptions,
    } as pg.PoolConfig);
    // Never log the connection string.
    this.pool.on('error', (err) => logger.error(`State store pool error: ${(err as any)?.code || 'unknown'}`));
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async ensureSchema(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('begin');
      await client.query('select pg_advisory_xact_lock(727274001)');
      await client.query(STATE_SCHEMA_SQL);
      await client.query('commit');
    } catch (err) {
      await client.query('rollback').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  private apply(rows: Row[], skipOwn: boolean): number {
    const sources = getRegisteredSources();
    const byName = new Map(sources.map((s) => [s.name, s]));
    let applied = 0;
    for (const row of rows) {
      const rev = BigInt(row.rev);
      if (rev > this.localRev) this.localRev = rev;
      if (skipOwn && this.ownRevs.delete(row.rev)) continue;
      const source = byName.get(row.source);
      if (!source || !source.keys.includes(row.key)) continue;
      const rid = id(row.source, row.key, row.entry_key);
      const json = row.deleted ? null : JSON.stringify(row.value);
      if (skipOwn && json === null && !this.lastSaved.has(rid)) continue;
      const current = source.target[row.key];
      if (row.entry_key === WHOLE) {
        if (json === null) continue;
        source.target[row.key] = decodeValue(row.value);
      } else if (current instanceof Map) {
        const mapKey = JSON.parse(row.entry_key);
        if (json === null) current.delete(mapKey);
        else current.set(mapKey, decodeValue(row.value));
      } else {
        continue;
      }
      if (json === null) this.lastSaved.delete(rid);
      else this.lastSaved.set(rid, json);
      applied++;
    }
    return applied;
  }

  /** Cold start: merge every stored row over the seeded in-memory data. */
  async load(): Promise<number> {
    return this.lock.run(async () => {
      const r = await this.pool.query<Row>(
        'select source, key, entry_key, value, deleted, rev::text as rev from public.app_state_entries order by rev'
      );
      const n = this.apply(r.rows, false);
      this.loaded = true;
      logger.info(`Restored ${n} persisted record(s) from Postgres state store`);
      return n;
    });
  }

  /** Pulls entries other instances changed since our last sync. Cheap when nothing changed. */
  async sync(): Promise<number> {
    if (!this.loaded) return 0;
    return this.lock.run(async () => {
      const head = await this.pool.query<{ rev: string | null }>(
        'select max(rev)::text as rev from public.app_state_entries'
      );
      const max = head.rows[0]?.rev ? BigInt(head.rows[0].rev) : 0n;
      if (max <= this.localRev) return 0;
      const r = await this.pool.query<Row>(
        'select source, key, entry_key, value, deleted, rev::text as rev from public.app_state_entries where rev > $1 order by rev',
        [this.localRev.toString()]
      );
      return this.apply(r.rows, true);
    });
  }

  /** Computes the changed entries and writes them in one transaction. */
  async save(): Promise<number> {
    if (!this.loaded) return 0;
    return this.lock.run(async () => {
      const upserts: { source: string; key: string; entry_key: string; value: string }[] = [];
      const deletes: { source: string; key: string; entry_key: string }[] = [];
      const seen = new Set<string>();
      for (const source of getRegisteredSources()) {
        for (const key of source.keys) {
          const value = source.target[key];
          if (value instanceof Map) {
            for (const [k, v] of value) {
              const entryKey = JSON.stringify(k);
              const rid = id(source.name, key, entryKey);
              seen.add(rid);
              const json = JSON.stringify(encodeValue(v));
              if (json === undefined) continue;
              if (this.lastSaved.get(rid) !== json) upserts.push({ source: source.name, key, entry_key: entryKey, value: json });
            }
          } else if (value !== undefined) {
            const rid = id(source.name, key, WHOLE);
            seen.add(rid);
            const json = JSON.stringify(encodeValue(value));
            if (json !== undefined && this.lastSaved.get(rid) !== json) {
              upserts.push({ source: source.name, key, entry_key: WHOLE, value: json });
            }
          }
        }
      }
      for (const rid of this.lastSaved.keys()) {
        if (seen.has(rid)) continue;
        const [source, key, entry_key] = rid.split('\u0000');
        deletes.push({ source, key, entry_key });
      }
      if (upserts.length === 0 && deletes.length === 0) return 0;

      const client = await this.pool.connect();
      try {
        await client.query('begin');
        // Chunk so a first save of all seed data stays under parameter/size limits.
        const CHUNK = 500;
        const written: string[] = [];
        for (let i = 0; i < upserts.length; i += CHUNK) {
          const batch = upserts.slice(i, i + CHUNK);
          const r = await client.query<{ rev: string }>(
            `insert into public.app_state_entries (source, key, entry_key, value, deleted)
             select x.source, x.key, x.entry_key, x.value::jsonb, false
             from jsonb_to_recordset($1::jsonb) as x(source text, key text, entry_key text, value text)
             on conflict (source, key, entry_key) do update
               set value = excluded.value, deleted = false,
                   rev = nextval('public.app_state_rev'), updated_at = now()
             returning rev::text as rev`,
            [JSON.stringify(batch)]
          );
          for (const row of r.rows) written.push(row.rev);
        }
        for (let i = 0; i < deletes.length; i += CHUNK) {
          const batch = deletes.slice(i, i + CHUNK);
          const r = await client.query<{ rev: string }>(
            `update public.app_state_entries e
               set value = null, deleted = true, rev = nextval('public.app_state_rev'), updated_at = now()
             from jsonb_to_recordset($1::jsonb) as x(source text, key text, entry_key text)
             where e.source = x.source and e.key = x.key and e.entry_key = x.entry_key and e.deleted = false
             returning e.rev::text as rev`,
            [JSON.stringify(batch)]
          );
          for (const row of r.rows) written.push(row.rev);
        }
        await client.query('commit');
        for (const rev of written) this.ownRevs.add(rev);
      } catch (err) {
        await client.query('rollback').catch(() => undefined);
        logger.error(`State store save failed: ${(err as any)?.code || 'unknown'}`);
        throw err;
      } finally {
        client.release();
      }
      for (const u of upserts) this.lastSaved.set(id(u.source, u.key, u.entry_key), JSON.stringify(JSON.parse(u.value)));
      for (const d of deletes) this.lastSaved.delete(id(d.source, d.key, d.entry_key));
      return upserts.length + deletes.length;
    });
  }
}
