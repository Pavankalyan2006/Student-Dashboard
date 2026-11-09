// Phase 5: copies student profiles from the JSON snapshot store into the Supabase (Postgres)
// profile tables. Read-only towards the snapshot: it never writes or deletes snapshot data.
//
//   Dry run (default; validates and reports, writes nothing):
//     SUPABASE_DB_URL=... npx tsx scripts/migrate/snapshot-to-supabase.ts
//   Apply (one transaction per student; safe to re-run, rows are upserted):
//     SUPABASE_DB_URL=... npx tsx scripts/migrate/snapshot-to-supabase.ts --apply
//   Options: --snapshot <path> (default DATA_SNAPSHOT_PATH or ./data/runtime/db-snapshot.json)
//            --include-demo (also copy the seeded demo accounts std_demo_1 / std_01j8k9x2p4)
//
// Take a database backup before --apply. The connection string is read from the environment
// only and is never printed.
import { db } from '../../server/db/database';
import { registerPersistentSource, restoreSnapshot } from '../../server/db/persistence';
import { onboardingStores } from '../../server/services/onboardingService';
import { studentProfileStores, readCanonicalProfile } from '../../server/services/studentProfile/profileCache';
import { SupabaseProfilePersistence } from '../../server/services/studentProfile/supabaseProfileStore';
import type { StudentAccountRow } from '../../server/services/studentProfile/persistence';

const DEMO_IDS = new Set(['std_demo_1', 'std_01j8k9x2p4']);

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

export interface MigrationReport {
  students_found: number;
  eligible: number;
  skipped_demo: number;
  problems: Array<{ student_id: string; problem: string }>;
  migrated: number;
  verified: number;
}

export async function migrateSnapshotToSupabase(opts: { dbUrl?: string; apply: boolean; includeDemo: boolean }): Promise<MigrationReport> {
  const report: MigrationReport = { students_found: 0, eligible: 0, skipped_demo: 0, problems: [], migrated: 0, verified: 0 };
  const students = Array.from(((db as any).students as Map<string, any>).values()).filter((s) => s.role === 'STUDENT');
  report.students_found = students.length;

  // Pre-flight checks: the Postgres unique constraints would reject these, so report them first.
  const byEmail = new Map<string, string[]>();
  const byUid = new Map<string, string[]>();
  const rows: Array<{ account: StudentAccountRow; id: string }> = [];
  for (const s of students) {
    if (!opts.includeDemo && DEMO_IDS.has(s.id)) {
      report.skipped_demo++;
      continue;
    }
    const email = String(s.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      report.problems.push({ student_id: s.id, problem: 'missing or invalid email' });
      continue;
    }
    byEmail.set(email, [...(byEmail.get(email) || []), s.id]);
    if (s.firebase_uid) byUid.set(s.firebase_uid, [...(byUid.get(s.firebase_uid) || []), s.id]);
    rows.push({
      id: s.id,
      account: {
        id: s.id,
        firebase_uid: s.firebase_uid || null,
        email,
        auth_provider: s.auth_provider === 'firebase' ? 'firebase' : 'legacy',
        email_verified: Boolean(s.email_verified),
        role: s.role,
        account_status: s.status || (s.is_active === false ? 'SUSPENDED' : 'ACTIVE'),
        created_at: s.created_at || new Date().toISOString(),
      },
    });
  }
  const dupes = new Set<string>();
  for (const [email, ids] of byEmail) if (ids.length > 1) ids.forEach((id) => (dupes.add(id), report.problems.push({ student_id: id, problem: `duplicate email ${email.replace(/^(.).*@/, '$1***@')}` })));
  for (const [, ids] of byUid) if (ids.length > 1) ids.forEach((id) => (dupes.add(id), report.problems.push({ student_id: id, problem: 'duplicate firebase_uid' })));
  const eligible = rows.filter((r) => !dupes.has(r.id) && readCanonicalProfile(r.id));
  report.eligible = eligible.length;
  if (!opts.apply) return report;

  if (!opts.dbUrl) throw new Error('SUPABASE_DB_URL is not set');
  const store = new SupabaseProfilePersistence(opts.dbUrl);
  try {
    for (const r of eligible) {
      const profile = readCanonicalProfile(r.id)!;
      try {
        await store.commit(r.account, profile, null);
        report.migrated++;
        const back = await store.load(r.id);
        if (
          back &&
          back.profile.skills.skills.length === profile.skills.skills.length &&
          back.profile.experience.projects.length === profile.experience.projects.length &&
          back.profile.academic.current_semester === profile.academic.current_semester
        ) {
          report.verified++;
        } else {
          report.problems.push({ student_id: r.id, problem: 'read-back did not match' });
        }
      } catch (err: any) {
        report.problems.push({ student_id: r.id, problem: `not migrated: ${err?.code || err?.message || 'error'}` });
      }
    }
  } finally {
    await store.close();
  }
  return report;
}

export function loadSnapshotStores(snapshotPath?: string): boolean {
  if (snapshotPath) process.env.DATA_SNAPSHOT_PATH = snapshotPath;
  registerPersistentSource(
    'db',
    db as unknown as Record<string, any>,
    Object.keys(db).filter((k) => {
      const v = (db as any)[k];
      return (v instanceof Map || v instanceof Set || Array.isArray(v)) && k !== 'structuredLogs';
    })
  );
  registerPersistentSource('onboarding', onboardingStores as unknown as Record<string, any>);
  registerPersistentSource('studentProfile', studentProfileStores as unknown as Record<string, any>);
  return restoreSnapshot();
}

async function main() {
  const apply = process.argv.includes('--apply');
  await db.initialize();
  const restored = loadSnapshotStores(arg('--snapshot'));
  if (!restored) console.warn('No snapshot was restored; only seeded records are present.');
  const report = await migrateSnapshotToSupabase({ dbUrl: process.env.SUPABASE_DB_URL, apply, includeDemo: process.argv.includes('--include-demo') });
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', ...report }, null, 2));
  process.exit(report.problems.length && apply ? 2 : 0);
}

if (process.argv[1] && /snapshot-to-supabase\.ts$/.test(process.argv[1])) {
  main().catch((err) => {
    console.error(`Migration failed: ${err?.code || err?.message || err}`);
    process.exit(1);
  });
}
