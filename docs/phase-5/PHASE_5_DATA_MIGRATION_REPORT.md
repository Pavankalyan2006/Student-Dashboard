# Phase 5 Data Migration Report

## In-place (snapshot store)

No data was deleted or recreated. The central service reads the existing onboarding stores, so every existing student
has a profile immediately. Older zero values (semester 0, 0 study hours) are read as "not entered", not as data.
Legacy accounts keep working; in Firebase mode they are linked on first verified Firebase sign-in, keeping all data.

## Snapshot → Supabase (`scripts/migrate/snapshot-to-supabase.ts`)

```
SUPABASE_DB_URL=... npx tsx scripts/migrate/snapshot-to-supabase.ts            # dry run (default)
SUPABASE_DB_URL=... npx tsx scripts/migrate/snapshot-to-supabase.ts --apply    # one transaction per student
  --snapshot <path>   --include-demo
```

- Read-only towards the snapshot. Demo accounts are skipped unless `--include-demo`.
- Pre-flight: invalid emails, duplicate emails (case-insensitive) and duplicate Firebase uids are reported (emails masked)
  and not migrated.
- Each student is read back and compared (skills, projects, semester). Re-running is safe (upsert).
- Exit code 2 when anything was not migrated.

## Evidence

- Local PostgreSQL 16: dry run and apply on the seeded data (1 student migrated, 1 verified).
- `phase5_supabase_pg.test.ts`: two synthetic students migrated, re-run gives the same count, no duplicates.
- `phase5_registration_profile.test.ts` Test 9: duplicate email detected, nothing written in dry run, no email in the report.
- Live Supabase run: BLOCKED (no credentials).

Rollback: `supabase/rollback/20261109000000_phase5_student_profiles.down.sql` (tested), then `PROFILE_STORE=snapshot`.
