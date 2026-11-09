# Database Architecture (Phase 5 update)

Two interchangeable profile stores behind `ProfilePersistence` (`server/services/studentProfile/persistence.ts`):

| Store | When | Authority | Failure behaviour |
|---|---|---|---|
| `snapshot` (default) | no Supabase config | in-memory Maps flushed to the JSON snapshot with `saveSnapshotStrict()` on every profile save | flush fails → records rolled back → 503 |
| `supabase` | `PROFILE_STORE=supabase` / `SUPABASE_DB_URL` | Postgres; in-memory records are a cache filled on first access (`hydrate`) | transaction fails → nothing applied → 503 |

All other platform data (courses, notes, labs, …) stays in the snapshot store as before.

Postgres tables (migration `supabase/migrations/20261109000000_phase5_student_profiles.sql`):
`students`, `student_academic_profiles`, `student_subjects`, `student_skills`, `student_projects`, `student_experience`,
`student_certifications`, `student_career_preferences`, `student_learning_preferences`, `student_onboarding_progress`.
Unique: `students.firebase_uid` (partial), `lower(students.email)`. Check constraints mirror the API validation.
No password column. RLS: own-row read for `authenticated`, nothing for `anon`, writes only through the backend.
Concurrency: `students.profile_version`, checked in the same statement that updates it.
Details: PHASE_5_STUDENT_PROFILE_SCHEMA.md, PHASE_5_SUPABASE_INTEGRATION.md.
