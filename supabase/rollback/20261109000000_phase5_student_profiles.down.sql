-- Rollback for 20261109000000_phase5_student_profiles.sql.
-- WARNING: drops the Phase 5 profile tables and their data. Take a backup first
-- (pg_dump --data-only -t 'public.student*' ...). The JSON snapshot store is unaffected, so
-- setting PROFILE_STORE=snapshot returns the application to the pre-Supabase state.
begin;
drop table if exists public.student_onboarding_progress;
drop table if exists public.student_learning_preferences;
drop table if exists public.student_career_preferences;
drop table if exists public.student_certifications;
drop table if exists public.student_experience;
drop table if exists public.student_projects;
drop table if exists public.student_skills;
drop table if exists public.student_subjects;
drop table if exists public.student_academic_profiles;
drop function if exists public.current_student_id();
drop table if exists public.students;
commit;
