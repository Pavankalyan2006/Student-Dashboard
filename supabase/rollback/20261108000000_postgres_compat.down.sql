-- Rollback for 20261108000000_postgres_compat.sql. Run only on a non-Supabase server, after rolling back
-- the Phase 5 migration (its policies depend on these). Never run this on Supabase.
drop function if exists auth.jwt();
drop role if exists authenticated;
drop role if exists anon;
