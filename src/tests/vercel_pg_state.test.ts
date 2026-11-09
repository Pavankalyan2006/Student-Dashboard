// Postgres state store used on Vercel: rows survive a cold start, deletes propagate, and an
// unchanged store writes nothing. Needs a local Postgres: PHASE5_PG_URL=postgres://... (see Phase 5 docs).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import pg from 'pg';
import { PgStatePersistence } from '../../server/db/pgStatePersistence';
import { registerPersistentSource } from '../../server/db/persistence';

const ADMIN_URL = process.env.PHASE5_PG_URL;

describe.skipIf(!ADMIN_URL)('Vercel: Postgres state store', () => {
  const dbName = `vercel_state_test_${Date.now()}`;
  let admin: pg.Client;
  let url: string;
  const target = { items: new Map<string, any>(), log: [] as string[] };
  const opened: PgStatePersistence[] = [];
  const open = () => {
    const s = new PgStatePersistence(url);
    opened.push(s);
    return s;
  };

  beforeAll(async () => {
    admin = new pg.Client({ connectionString: ADMIN_URL });
    await admin.connect();
    await admin.query(`create database ${dbName}`);
    const u = new URL(ADMIN_URL!);
    u.pathname = `/${dbName}`;
    url = u.toString();
    registerPersistentSource('vercelTest', target as any, ['items', 'log']);
  });

  afterAll(async () => {
    for (const s of opened) await s.close().catch(() => undefined);
    await admin.query(`drop database if exists ${dbName} with (force)`);
    await admin.end();
  });

  it('stores changes and restores them on a cold start', async () => {
    const a = open();
    await a.ensureSchema();
    await a.ensureSchema(); // idempotent
    await a.load();
    target.items.set('s1', { name: 'Asha', nested: new Map([['k', 1]]) });
    target.log.push('created');
    expect(await a.save()).toBeGreaterThan(0);
    expect(await a.save()).toBe(0); // nothing changed, nothing written

    target.items.clear();
    target.log = [];
    const cold = open();
    await cold.load();
    expect(target.items.get('s1').name).toBe('Asha');
    expect(target.items.get('s1').nested).toBeInstanceOf(Map);
    expect(target.log).toEqual(['created']);
    expect(await cold.save()).toBe(0); // a restore does not rewrite every row
  });

  it('propagates a delete from one instance to another', async () => {
    const a = open();
    await a.load();
    const b = open();
    await b.load();
    target.items.delete('s1');
    expect(await b.save()).toBe(1);
    target.items.set('s1', { name: 'stale copy' }); // what instance A still holds in memory
    await a.sync();
    expect(target.items.has('s1')).toBe(false);
  });
});
