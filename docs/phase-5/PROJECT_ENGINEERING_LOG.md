# Phase 5 Engineering Log

Branch `claude/project-thread-plwucf` from `main` after PR #5 (Phase 3). Baseline: tsc 0, vitest 932/932.
Conventions: PASS / PARTIAL / BLOCKED / NOT IMPLEMENTED; bug ids `P5-NNN`; synthetic students only; no AI key (stub model).

## Resume here
Owner configuration is the next step (Firebase web API key, Supabase project). Postgres suite:
`PHASE5_PG_URL=postgres://postgres@127.0.0.1:55432/postgres npx vitest run src/tests/phase5_supabase_pg.test.ts`
(start a local PG 16 first). Browser walkthrough: `node scripts/audit/phase5-registration-ui.cjs <outdir>` against a dev server on :3311.

## Entries
- 2026-11-09 Audit: two sign-up paths, 5-step onboarding with invented defaults, completion from fixed numbers, AI context
  with fake fallbacks and names. Confirmed no Gemini key in the repository or its history.
- Central profile service over the existing stores; validation, completion, versioning, events; Firebase verification
  and session bootstrap; Supabase schema/RLS/store. Commit f3f0768.
- AI context minimised (no name/institution/CGPA); Gemini key moved to header, redaction, size limit, usage counters. f6ce8a0.
- Recommendations, dashboard/semester context, notification preferences, real completion in older endpoints. 7cf11c2.
- Front end: 7-step wizard (replaces the old page), Firebase sign-in, profile manager, panels, settings, CSP. fdcbe7e.
- Tests: 23 HTTP tests + 8 local Postgres tests. Found and fixed P5-001 (rollback left 0 study hours counted as entered)
  and P5-002 (migration relied on default grants; client writes allowed). c194030.
- Env template, Docker build args, config validation, browser walkthrough evidence. f28572d.
- Final: tsc 0, vitest 955 passed + 8 skipped (PG), build passes.

# Phase 6 Engineering Log

Branch `claude/project-thread-nu6v6r` from `main` after PR #6. Baseline: tsc 0; vitest 955 passed, 8 skipped (PG).
Reports: `docs/phase-6/`. Student guides: `docs/student-guides/`. Scripts: `scripts/pilot/`.

## Resume here
Stage 2 (3–5 real students) waits for owner approval of the pilot plan and environment, a Firebase web API key, and a new
Gemini key. No student has been invited. Before Stage 2, run both `scripts/pilot/phase6-*.cjs` against the pilot server,
then start it on a fresh snapshot.

## Entries (2026-11-09)
- Batch 1: read the Phase 5 reports; 9 of the 10 named reports never existed (recorded as missing). Readiness gate written.
- Batch 2–4: Stage 1 with synthetic accounts on a production build (port 3611). API journeys (10 workflows) and a browser
  walkthrough (registration on a 390 px screen plus 46 pages at 2 widths).
- Found and fixed: P6-001 concurrent duplicate registration; P6-002 profile skills not reaching career/resume/jobs/skills;
  P6-003 production build blank on non-allowlisted hosts (same-origin CORS); P6-004 dashboard completion wording;
  P6-005 registration form below the fold on phones; P6-006 successful sign-ins counted against the shared-IP limit.
- Added the private pilot feedback module (service, route, page, sidebar/settings links, export script).
- Final Stage 1: API 64 PASS, 6 BLOCKED (AI key, jobs feed, live paper search), 0 FAIL; UI 92/92 page loads clean;
  profile data survives a server restart.
