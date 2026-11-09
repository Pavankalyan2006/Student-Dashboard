-- Phase 5: central student profile schema for Supabase Postgres.
--
-- Identity: Firebase Auth is the only credential store. This schema holds NO passwords and NO
-- tokens. students.firebase_uid is set by the backend from a verified Firebase ID token.
--
-- Access model: the Node backend connects with a server-only connection (service role / postgres
-- role, which bypasses RLS) and scopes every statement by the verified student id. RLS is still
-- enabled on every table and denies anon completely, so a leaked anon key exposes nothing. The
-- 'authenticated' policies below only matter if Supabase third-party auth (Firebase) is enabled
-- later for direct client reads; they map the JWT 'sub' (Firebase uid) to the owning student.
--
-- Idempotent: safe to run twice. Rollback: supabase/rollback/20261109000000_phase5_student_profiles.down.sql

create table if not exists public.students (
  id text primary key,
  firebase_uid text,
  email text not null,
  full_name text not null check (char_length(full_name) between 2 and 100),
  display_name text check (display_name is null or char_length(display_name) <= 60),
  phone text check (phone is null or phone ~ '^\+?[0-9 ()-]{7,20}$'),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https?://'),
  auth_provider text not null default 'firebase' check (auth_provider in ('legacy', 'firebase')),
  email_verified boolean not null default false,
  role text not null default 'STUDENT' check (role in ('STUDENT', 'SUPER_ADMIN')),
  account_status text not null default 'ACTIVE' check (account_status in ('ACTIVE', 'SUSPENDED', 'PENDING', 'DISABLED')),
  terms_accepted_at timestamptz,
  privacy_accepted_at timestamptz,
  profile_version integer not null default 0 check (profile_version >= 0),
  last_profile_update timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists students_firebase_uid_key on public.students (firebase_uid) where firebase_uid is not null;
create unique index if not exists students_email_lower_key on public.students (lower(email));

create table if not exists public.student_academic_profiles (
  student_id text primary key references public.students (id) on delete cascade,
  university text check (university is null or char_length(university) <= 150),
  college text check (college is null or char_length(college) <= 150),
  degree text check (degree is null or char_length(degree) <= 60),
  department text check (department is null or char_length(department) <= 120),
  branch text check (branch is null or char_length(branch) <= 120),
  specialization text check (specialization is null or char_length(specialization) <= 120),
  academic_year smallint check (academic_year between 1 and 6),
  current_semester smallint check (current_semester between 1 and 12),
  admission_year smallint check (admission_year between 1990 and 2100),
  expected_graduation_year smallint check (expected_graduation_year between 1990 and 2100),
  academic_status text,
  cgpa numeric(4, 2) check (cgpa is null or cgpa >= 0),
  cgpa_scale numeric(4, 2) check (cgpa_scale is null or cgpa_scale in (4, 5, 10)),
  previous_qualifications text[] not null default '{}',
  academic_achievements text[] not null default '{}',
  updated_at timestamptz not null default now(),
  check (cgpa is null or cgpa <= coalesce(cgpa_scale, 10)),
  check (admission_year is null or expected_graduation_year is null or expected_graduation_year >= admission_year)
);

create table if not exists public.student_subjects (
  id bigint generated always as identity primary key,
  student_id text not null references public.students (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  position smallint not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists student_subjects_unique_name on public.student_subjects (student_id, lower(name));

create table if not exists public.student_skills (
  id bigint generated always as identity primary key,
  student_id text not null references public.students (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  category text not null check (category in ('PROGRAMMING_LANGUAGE','FRONTEND','BACKEND','DATABASE','AI_ML','CLOUD','DEVELOPER_TOOLS','TESTING','OTHER')),
  proficiency text not null check (proficiency in ('BEGINNER','INTERMEDIATE','ADVANCED','EXPERT')),
  created_at timestamptz not null default now()
);
create unique index if not exists student_skills_unique_name on public.student_skills (student_id, lower(name));
create index if not exists student_skills_category_idx on public.student_skills (category);

create table if not exists public.student_projects (
  id text primary key,
  student_id text not null references public.students (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text not null default '' check (char_length(description) <= 2000),
  technologies text[] not null default '{}',
  project_url text check (project_url is null or project_url ~ '^https?://'),
  github_url text check (github_url is null or github_url ~ '^https?://'),
  demo_url text check (demo_url is null or demo_url ~ '^https?://'),
  status text,
  position smallint not null default 0,
  updated_at timestamptz not null default now()
);
create index if not exists student_projects_student_idx on public.student_projects (student_id);

create table if not exists public.student_experience (
  id text primary key,
  student_id text not null references public.students (id) on delete cascade,
  kind text not null check (kind in ('INTERNSHIP','WORK','RESEARCH','VOLUNTEER','OTHER')),
  organization text not null check (char_length(organization) between 1 and 120),
  role text not null check (char_length(role) between 1 and 120),
  start_date text check (start_date is null or start_date ~ '^\d{4}-\d{2}(-\d{2})?$'),
  end_date text check (end_date is null or end_date ~ '^\d{4}-\d{2}(-\d{2})?$'),
  is_current boolean not null default false,
  description text check (description is null or char_length(description) <= 2000),
  updated_at timestamptz not null default now()
);
create index if not exists student_experience_student_idx on public.student_experience (student_id);

create table if not exists public.student_certifications (
  id text primary key,
  student_id text not null references public.students (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 150),
  issuer text,
  issue_date text check (issue_date is null or issue_date ~ '^\d{4}-\d{2}(-\d{2})?$'),
  credential_url text check (credential_url is null or credential_url ~ '^https?://'),
  updated_at timestamptz not null default now()
);
create index if not exists student_certifications_student_idx on public.student_certifications (student_id);

create table if not exists public.student_career_preferences (
  student_id text primary key references public.students (id) on delete cascade,
  target_roles text[] not null default '{}',
  career_interests text[] not null default '{}',
  preferred_industries text[] not null default '{}',
  preferred_locations text[] not null default '{}',
  internship_interests text[] not null default '{}',
  placement_goals text,
  higher_education_interests text[] not null default '{}',
  competitive_exams text[] not null default '{}',
  gate_paper text,
  short_term_goals text,
  long_term_goals text,
  achievements text[] not null default '{}',
  research_interests text[] not null default '{}',
  github_url text check (github_url is null or github_url ~ '^https?://'),
  linkedin_url text check (linkedin_url is null or linkedin_url ~ '^https?://'),
  portfolio_url text check (portfolio_url is null or portfolio_url ~ '^https?://'),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_learning_preferences (
  student_id text primary key references public.students (id) on delete cascade,
  preferred_languages text[] not null default '{}',
  explanation_style text check (explanation_style is null or explanation_style in ('QUICK_OVERVIEW','STANDARD','DEEP_DIVE','ELI5')),
  learning_style text check (learning_style is null or learning_style in ('VISUAL','READING','HANDS_ON','VIDEO','DISCUSSION','MIXED')),
  difficulty text check (difficulty is null or difficulty in ('FOUNDATIONAL','INTERMEDIATE','ADVANCED','ADAPTIVE')),
  learning_interests text[] not null default '{}',
  weekly_study_hours numeric(5, 2) check (weekly_study_hours is null or weekly_study_hours between 0 and 112),
  preferred_study_days text[] not null default '{}',
  daily_study_minutes integer check (daily_study_minutes is null or daily_study_minutes between 0 and 960),
  preferred_study_time text,
  revision_preference text,
  notify_in_app boolean not null default true,
  notify_email_digest text not null default 'NONE' check (notify_email_digest in ('NONE','DAILY','WEEKLY')),
  notify_study_reminders boolean not null default true,
  notify_revision_reminders boolean not null default true,
  notify_deadline_reminders boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.student_onboarding_progress (
  student_id text primary key references public.students (id) on delete cascade,
  current_step smallint not null default 1 check (current_step between 1 and 7),
  completed_steps smallint[] not null default '{}',
  skipped_steps smallint[] not null default '{}',
  completed boolean not null default false,
  completed_at timestamptz,
  started_at timestamptz not null default now(),
  last_saved_at timestamptz not null default now(),
  check (completed = false or completed_at is not null)
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
create schema if not exists auth;

-- Maps the caller's Firebase uid (JWT sub) to the owning student id. SECURITY DEFINER so the
-- lookup itself is not subject to the students policy; it only ever returns the caller's own id.
create or replace function public.current_student_id() returns text
language sql stable security definer set search_path = public as $$
  select s.id from public.students s
  where s.firebase_uid is not null and s.firebase_uid = (auth.jwt() ->> 'sub')
  limit 1
$$;
revoke all on function public.current_student_id() from public;

do $$
declare t text;
begin
  foreach t in array array['students','student_academic_profiles','student_subjects','student_skills',
    'student_projects','student_experience','student_certifications','student_career_preferences',
    'student_learning_preferences','student_onboarding_progress']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- students: a signed-in student may read only their own account row. No client insert/update/
-- delete: identity, firebase_uid, role and status are server-managed.
drop policy if exists students_select_own on public.students;
create policy students_select_own on public.students for select to authenticated
  using (firebase_uid is not null and firebase_uid = (auth.jwt() ->> 'sub'));

do $$
declare t text;
begin
  foreach t in array array['student_academic_profiles','student_subjects','student_skills',
    'student_projects','student_experience','student_certifications','student_career_preferences',
    'student_learning_preferences','student_onboarding_progress']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_owner_select', t);
    execute format('create policy %I on public.%I for select to authenticated using (student_id = public.current_student_id())', t || '_owner_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_owner_write', t);
    execute format('create policy %I on public.%I for all to authenticated using (student_id = public.current_student_id()) with check (student_id = public.current_student_id())', t || '_owner_write', t);
  end loop;
end $$;

-- Onboarding progress completion is server-controlled even for direct clients.
drop policy if exists student_onboarding_progress_owner_write on public.student_onboarding_progress;
