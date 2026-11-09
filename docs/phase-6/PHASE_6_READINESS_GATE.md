# Phase 6 Readiness Gate

Date: 2026-11-09. Branch `claude/project-thread-nu6v6r` from `main` after PR #6 (Phase 5) was merged.
Statuses: **PASS**, **FAIL**, **BLOCKED**, **NOT TESTED**. Nothing here comes from real students: no real student has
used the platform yet.

## Verdict

| Gate | Result |
|---|---|
| Stage 1 (internal testing with synthetic accounts) | **PASS**: done in this phase (see below) |
| Stage 2 (3–5 consenting students) | **BLOCKED**: needs owner approval of the pilot plan and environment, plus the four owner actions listed at the end |
| Stage 3 (10–20 students) | **BLOCKED**: needs Stage 2 to meet its exit criteria first |

No open critical security, authentication, data-loss or cross-student isolation defect is known after the Phase 6 fixes.
The real pilot is still blocked. The production sign-in (Firebase), the database (Supabase) and AI (Gemini) have never
run live, so a real pilot today would test a configuration that is not the one students would get.

## 1. Phase 5 reports requested by the spec

| Report | Exists? | Notes |
|---|---|---|
| PHASE_5_RELEASE_READINESS.md | **Missing** | Compiled in this phase from the existing reports (`docs/phase-5/PHASE_5_RELEASE_READINESS.md`), with no new Phase 5 results |
| PHASE_5_SECURITY_AUDIT.md | **Missing** | Closest: PHASE_5_AUTHENTICATION_REPORT, PHASE_5_STUDENT_ISOLATION_REPORT, Phase 1–3 security reports |
| PHASE_5_REGRESSION_REPORT.md | **Missing** | Closest: PHASE_5_REGISTRATION_TEST_REPORT (full suite 955 passed, 8 skipped) |
| PHASE_5_AUTH_SECURITY_REPORT.md | **Missing** | Closest: PHASE_5_AUTHENTICATION_REPORT |
| PHASE_5_PERFORMANCE_REPORT.md | **Missing** | No Phase 5 performance baseline exists. The older `docs/project-audit/PERFORMANCE_AUDIT.md` is from the first audit |
| PHASE_5_LOAD_TEST_REPORT.md | **Missing** | No load test was run in Phase 5 |
| PHASE_5_DATABASE_RECOVERY_REPORT.md | **Missing** | Closest: PHASE_5_DATA_MIGRATION_REPORT (rollback tested on local PostgreSQL) |
| PHASE_5_AI_QUALITY_AND_COST_REPORT.md | **Missing** | No AI key has ever been configured, so no AI quality data exists |
| PHASE_5_API_RELIABILITY_REPORT.md | **Missing** | |
| PHASE_5_COMPLETION_REPORT.md | Exists | Read in full |
| Firebase / Supabase / registration reports | Exist | PHASE_5_FIREBASE_INTEGRATION, _SUPABASE_INTEGRATION, _REGISTRATION_AUDIT, _REGISTRATION_TEST_REPORT, _AUTHENTICATION_REPORT, _STUDENT_ISOLATION_REPORT, _PROFILE_PROPAGATION_REPORT |

The Phase 5 spec this project ran was the registration/profile/Firebase/Supabase variant. The validation, load-test and
recovery reports listed above were never produced. They are recorded as missing, not invented.

## 2. The ten questions

| # | Question | Result | Evidence |
|---|---|---|---|
| 1 | Which requirements passed? | Registration (7 steps), central profile, profile API, dynamic completion, propagation, local RLS, registration reliability, security checks, Gemini hardening (code), env config, migration (local), docs | PHASE_5_COMPLETION_REPORT items 1, 4–6, 8–18 |
| 2 | Which failed? | None reported as FAIL in Phase 5. Phase 6 Stage 1 found 6 defects Phase 5 missed (P6-001 to P6-006), all fixed here | PHASE_6_PILOT_BUG_TRACKER.md |
| 3 | Which are blocked? | Live Firebase Auth (no web API key, email/password provider not confirmed); live Supabase (no project/credentials); every AI response (no Gemini key); live job listings and paper search (no outbound network in the test container) | Phase 5 completion report, Stage 1 run |
| 4 | Which tests were not performed? | Load test, performance baseline, database recovery drill, AI quality, live email verification and password reset, real-device mobile testing, accessibility with assistive technology | This table, section 1 |
| 5 | Which security issues remain? | No open P0/P1. Open: no self-service account deletion (the admin delete path is not verified for complete removal), legacy mode has no password reset, cross-origin refusals return 500 instead of 403 (P6-009) | PHASE_6_PRIVACY_REPORT.md |
| 6 | Which major features are incomplete? | Profile personalisation of notes/doubts/flashcards/quiz (tutor context only), RAG/GitHub/community feed not personalised (Phase 5 PARTIAL/NOT IMPLEMENTED); without an AI key, AI features and quiz creation do not work | PHASE_5_PROFILE_PROPAGATION_REPORT, P6-007 |
| 7 | Does the registration workflow work? | **PASS** (legacy provider, synthetic): API and phone-sized browser run, interrupted and resumed, double submit refused. **BLOCKED** for Firebase live | PHASE_6_REGISTRATION_VALIDATION.md |
| 8 | Does profile information persist? | **PASS**: across logout/login, page refresh and server restart (snapshot store). **BLOCKED** for Supabase live | PHASE_6_PROFILE_VALIDATION.md |
| 9 | Is student data isolation verified? | **PASS** for every pair checked in Stage 1 (notes, goals, saved code, datasets, documents/RAG, applications, profile skills, feedback, community edits) and the Phase 2–5 isolation suites. **NOT TESTED** against live Supabase RLS | PHASE_6_PRIVACY_REPORT.md |
| 10 | Is the local application stable enough for controlled testing? | **PASS** locally: 64 of 70 Stage 1 checks pass, and the other 6 are BLOCKED on configuration; 46 pages × 2 widths with no page error, API 5xx or overflow; full test suite green | PHASE_6_MODULE_VALIDATION_MATRIX.md |

## 3. Critical blockers fixed before any real pilot

| Id | Issue | Status |
|---|---|---|
| P6-001 | A double-submitted registration created two accounts with one email | Fixed, tested |
| P6-003 | The production build showed a blank page on any host not in `CORS_ORIGINS` | Fixed, tested |
| P6-006 | The 11th sign-in within 15 minutes from one campus IP was refused | Fixed, tested |

## 4. Owner actions before Stage 2

1. Approve `PHASE_6_STUDENT_PILOT_PLAN.md` and the environment in `PHASE_6_PILOT_ENVIRONMENT.md`.
2. Firebase: set `VITE_FIREBASE_API_KEY`, enable Email/Password, add the pilot host to authorised domains. Legacy mode has no
   password reset, so a real pilot should not run on it (P6-008).
3. Gemini: create a new key with a spending cap and set it on the server only. Without it, AI Tutor, AI flashcards and
   quiz generation are unavailable, and a new student has no quiz to take (P6-007).
4. Supabase (optional for a 3–5 student Stage 2; the snapshot store works): a separate pilot project, then
   `SUPABASE_DB_URL`. Then re-run `src/tests/phase5_supabase_pg.test.ts` against it.
5. Set `PILOT_FEEDBACK_ENABLED=true` on the pilot server and keep a private `PILOT_EXPORT_SALT`.
