// Phase 5: Supabase schema, row-level security and the Postgres-backed profile store, tested
// against a LOCAL PostgreSQL server (not a Supabase project; no Supabase credentials exist yet).
//
// Skipped unless PHASE5_PG_URL points at a disposable local server, e.g.
//   PHASE5_PG_URL=postgres://postgres@127.0.0.1:55432/postgres npx vitest run src/tests/phase5_supabase_pg.test.ts
// The test creates its own database, adds a small shim for what Supabase provides (the anon /
// authenticated roles and auth.jwt()), applies the migration twice, and drops the database after.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { db } from '../../server/db/database';
import { IdentityService } from '../../server/services/studentProfile/identityService';
import { StudentProfileService } from '../../server/services/studentProfile/studentProfileService';
import { readCanonicalProfile } from '../../server/services/studentProfile/profileCache';
import { SupabaseProfilePersistence } from '../../server/services/studentProfile/supabaseProfileStore';
import type { StudentAccountRow } from '../../server/services/studentProfile/persistence';
import { migrateSnapshotToSupabase } from '../../scripts/migrate/snapshot-to-supabase';

const ADMIN_URL = process.env.PHASE5_PG_URL;
const MIGRATION = fs.readFileSync(path.resolve('supabase/migrations/20261109000000_phase5_student_profiles.sql'), 'utf8');
const ROLLBACK = fs.readFileSync(path.resolve('supabase/rollback/20261109000000_phase5_student_profiles.down.sql'), 'utf8');

// What a Supabase project already has: API roles and auth.jwt() reading the request's JWT claims.
const SUPABASE_SHIM = `
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
end $$;
create schema if not exists auth;
create or replace function auth.jwt() returns jsonb language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.jwt() to anon, authenticated;
grant usage on schema public to anon;
`;

describe.skipIf(!ADMIN_URL)('Phase 5: Supabase schema, RLS and Postgres profile store (local Postgres)', () => {
  const dbName = `phase5_test_${Date.now()}`;
  let admin: pg.Client;
  let url: string;
  let store: SupabaseProfilePersistence;
  const uidA = `fb_uid_a_${Date.now()}`;
  const uidB = `fb_uid_b_${Date.now()}`;
  let A: StudentAccountRow;
  let B: StudentAccountRow;

  const asStudent = async (uid: string | null, sql: string, params: unknown[] = []) => {
    const c = new pg.Client({ connectionString: url });
    await c.connect();
    try {
      await c.query('begin');
      await c.query(uid ? 'set local role authenticated' : 'set local role anon');
      if (uid) await c.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify({ sub: uid, role: 'authenticated' })]);
      const r = await c.query(sql, params);
      await c.query('rollback');
      return r;
    } catch (err) {
      await c.query('rollback').catch(() => {});
      throw err;
    } finally {
      await c.end();
    }
  };

  const makeStudent = async (label: string, uid: string, academic: Record<string, unknown>): Promise<StudentAccountRow> => {
    const s = await IdentityService.registerLegacy({
      name: `Phase Five PG ${label}`,
      email: `p5.pg.${label.toLowerCase()}.${Date.now()}@example.test`,
      password: 'Phase5Pass1',
      accept_terms: true,
      accept_privacy: true,
    });
    await StudentProfileService.updateSection(s.id, 'academic', academic);
    await StudentProfileService.updateSection(s.id, 'skills', { skills: [{ name: `Skill ${label}`, category: 'OTHER', proficiency: 'BEGINNER' }] });
    await StudentProfileService.updateSection(s.id, 'experience', { projects: [{ title: `Project ${label}` }] });
    return {
      id: s.id,
      firebase_uid: uid,
      email: s.email,
      auth_provider: 'firebase',
      email_verified: true,
      role: 'STUDENT',
      account_status: 'ACTIVE',
      created_at: new Date().toISOString(),
    };
  };

  beforeAll(async () => {
    admin = new pg.Client({ connectionString: ADMIN_URL });
    await admin.connect();
    await admin.query(`create database ${dbName}`);
    const u = new URL(ADMIN_URL!);
    u.pathname = `/${dbName}`;
    url = u.toString();
    const c = new pg.Client({ connectionString: url });
    await c.connect();
    await c.query(SUPABASE_SHIM);
    await c.query(MIGRATION);
    await c.query(MIGRATION); // idempotent: a second run must not fail or duplicate anything
    await c.end();
    store = new SupabaseProfilePersistence(url);

    await db.initialize();
    A = await makeStudent('A', uidA, { college: 'PG College A', branch: 'CSE', degree: 'B.Tech', current_semester: 3, academic_year: 2, subjects: ['Data Structures'] });
    B = await makeStudent('B', uidB, { college: 'PG College B', branch: 'ECE', degree: 'B.Tech', current_semester: 5, academic_year: 3 });
  });

  afterAll(async () => {
    await store?.close();
    await admin?.query(`drop database if exists ${dbName} with (force)`);
    await admin?.end();
  });

  it('commits both students in one transaction each and loads them back unchanged', async () => {
    const pa = readCanonicalProfile(A.id)!;
    const pb = readCanonicalProfile(B.id)!;
    await store.commit(A, pa, null);
    await store.commit(B, pb, null);
    const la = await store.load(A.id);
    expect(la).not.toBeNull();
    expect(la!.profile.academic).toMatchObject({ college: 'PG College A', current_semester: 3, subjects: ['Data Structures'] });
    expect(la!.profile.skills.skills).toEqual(pa.skills.skills);
    expect(la!.profile.experience.projects.map((p) => p.title)).toEqual(['Project A']);
    expect(la!.profile.account.profile_version).toBe(pa.account.profile_version);
    expect(await store.findIdByFirebaseUid(uidB)).toBe(B.id);
    expect(await store.findIdByEmail(A.email.toUpperCase())).toBe(A.id);
  });

  it('rejects a stale write (optimistic concurrency) and leaves the stored row unchanged', async () => {
    const pa = structuredClone(readCanonicalProfile(A.id)!);
    const stale = pa.account.profile_version - 1;
    pa.academic.college = 'Stale Write College';
    pa.account.profile_version += 1;
    await expect(store.commit(A, pa, stale)).rejects.toMatchObject({ statusCode: 409 });
    const la = await store.load(A.id);
    expect(la!.profile.academic.college).toBe('PG College A');
  });

  it('never lets one Firebase identity take over another student row', async () => {
    const pb = readCanonicalProfile(B.id)!;
    await expect(store.commit({ ...B, firebase_uid: uidA }, pb, null)).rejects.toBeTruthy();
  });

  it('RLS: a signed-in student reads only their own rows', async () => {
    const own = await asStudent(uidA, 'select student_id from public.student_skills');
    expect(own.rows.length).toBeGreaterThan(0);
    expect(own.rows.every((r) => r.student_id === A.id)).toBe(true);
    const students = await asStudent(uidA, 'select id from public.students');
    expect(students.rows.map((r) => r.id)).toEqual([A.id]);
    const other = await asStudent(uidA, 'select * from public.student_academic_profiles where student_id = $1', [B.id]);
    expect(other.rows).toHaveLength(0);
    const bView = await asStudent(uidB, 'select college from public.student_academic_profiles');
    expect(bView.rows.map((r) => r.college)).toEqual(['PG College B']);
  });

  it('RLS: direct client writes are refused, including to their own rows and server-managed fields', async () => {
    await expect(asStudent(uidA, `update public.students set role = 'ADMIN' where id = $1`, [A.id])).rejects.toThrow(/permission denied/);
    await expect(
      asStudent(uidA, `insert into public.student_skills (student_id, name, category, proficiency) values ($1, 'X', 'OTHER', 'EXPERT')`, [A.id])
    ).rejects.toThrow(/permission denied|row-level security/);
    await expect(asStudent(uidA, `delete from public.student_projects where student_id = $1`, [B.id])).rejects.toThrow(/permission denied/);
  });

  it('RLS: the anonymous role sees nothing', async () => {
    await expect(asStudent(null, 'select * from public.students')).rejects.toThrow(/permission denied/);
  });

  it('the snapshot migration script copies every eligible student and is safe to re-run', async () => {
    const first = await migrateSnapshotToSupabase({ dbUrl: url, apply: true, includeDemo: false });
    expect(first.problems.filter((p) => p.student_id === A.id || p.student_id === B.id)).toEqual([]);
    expect(first.verified).toBe(first.migrated);
    const again = await migrateSnapshotToSupabase({ dbUrl: url, apply: true, includeDemo: false });
    expect(again.migrated).toBe(first.migrated);
    const c = new pg.Client({ connectionString: url });
    await c.connect();
    const n = await c.query('select count(*)::int as n from public.students where id = any($1)', [[A.id, B.id]]);
    await c.end();
    expect(n.rows[0].n).toBe(2);
  });

  it('the rollback script removes the Phase 5 tables and the migration can be applied again', async () => {
    const c = new pg.Client({ connectionString: url });
    await c.connect();
    try {
      await store.close();
      await c.query(ROLLBACK);
      const gone = await c.query(`select count(*)::int as n from information_schema.tables where table_schema='public' and table_name like 'student%'`);
      expect(gone.rows[0].n).toBe(0);
      await c.query(MIGRATION);
      const back = await c.query(`select count(*)::int as n from information_schema.tables where table_schema='public' and table_name like 'student%'`);
      expect(back.rows[0].n).toBe(10);
    } finally {
      await c.end();
      store = new SupabaseProfilePersistence(url);
    }
  });
});
