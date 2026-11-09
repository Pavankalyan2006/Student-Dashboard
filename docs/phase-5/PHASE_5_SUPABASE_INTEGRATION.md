# Phase 5 Supabase Integration

**Status: BLOCKED (awaiting owner configuration).** No Supabase credentials were provided and none were invented.
The schema, RLS, store and migration script were tested against a local PostgreSQL 16 server
(`src/tests/phase5_supabase_pg.test.ts`, 8 tests, run with `PHASE5_PG_URL`).

## How the app uses Supabase

- `PROFILE_STORE=supabase` (or `SUPABASE_DB_URL` set) makes Postgres the authoritative profile store.
- The backend connects with `pg` using `SUPABASE_DB_URL` (server only). Reason: one profile save touches up to 10 tables
  and must be one transaction with a version check; the REST client cannot do that.
- Write order: Postgres first (transaction), then the in-memory records. On failure nothing changes and the API returns
  `503 PROFILE_STORE_UNAVAILABLE` (tested with failure injection).
- `profile_version` + `If-Match` gives optimistic concurrency (stale write → 409).
- The browser never talks to Supabase. No anon key, service-role key or DB URL is in frontend code or `VITE_*` variables.

## Files

- `supabase/migrations/20261109000000_phase5_student_profiles.sql` (idempotent; applied twice in tests)
- `supabase/rollback/20261109000000_phase5_student_profiles.down.sql`
- `server/services/studentProfile/supabaseProfileStore.ts`
- `scripts/migrate/snapshot-to-supabase.ts` (see PHASE_5_DATA_MIGRATION_REPORT.md)

## RLS

RLS enabled on all 10 tables; `anon` has no access. A signed-in student (Supabase JWT `sub` = Firebase uid) can **read**
only their own rows; all writes go through the backend, which validates them. `public.current_student_id()` maps the JWT
`sub` to the student id. Tested: own rows only, other student's rows invisible, `role` update / inserts / cross-student
deletes refused, anon refused.

## Owner steps

1. Create the project; Database > Connection string (session pooler) → `SUPABASE_DB_URL` on the server.
2. Back up, then `psql "$SUPABASE_DB_URL" -f supabase/migrations/20261109000000_phase5_student_profiles.sql`.
3. Optional, for direct client reads: Authentication > Third-party auth > add Firebase project `otp-project-846a9`.
4. Dry run then apply the data migration script.
5. Set `PROFILE_STORE=supabase` and restart. `PROFILE_STORE=snapshot` returns to the previous store.
