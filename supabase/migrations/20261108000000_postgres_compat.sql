-- Lets the schema migrations run on any PostgreSQL server, not only Supabase (for example Amazon RDS).
--
-- The Phase 5 migration adds row-level-security policies for Supabase's API roles (anon, authenticated)
-- and reads the caller's JWT through auth.jwt(). A Supabase project already has all three. A plain
-- PostgreSQL server has none, so this creates them only when they are missing:
--   - anon and authenticated as NOLOGIN roles: nobody can sign in with them; they only own policies.
--   - auth.jwt(), reading request.jwt.claims the same way Supabase's version does.
-- The NEXORA server connects as the table owner, so these policies never restrict it.
-- On Supabase every step below is skipped. Idempotent: safe to run twice.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;

create schema if not exists auth;

do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'auth' and p.proname = 'jwt'
  ) then
    execute $fn$
      create function auth.jwt() returns jsonb language sql stable as
        $body$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $body$
    $fn$;
    grant usage on schema auth to anon, authenticated;
    grant execute on function auth.jwt() to anon, authenticated;
  end if;
end $$;
