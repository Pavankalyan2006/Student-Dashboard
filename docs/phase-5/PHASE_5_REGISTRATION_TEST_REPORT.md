# Phase 5 Registration Test Report

Run on 2026-11-09. `npx tsc --noEmit`: 0 errors. `npm run build`: passes.
Full suite: **955 passed, 8 skipped** (the Postgres suite, which needs `PHASE5_PG_URL`). With a local PostgreSQL 16
server the Postgres suite passes 8/8.

## `src/tests/phase5_registration_profile.test.ts` (23 tests, HTTP, synthetic Students A and B)

| # | Spec test | What is checked | Result |
|---|---|---|---|
| 1 | Registration validation | invalid email, weak passwords, mismatch, duplicate (case-insensitive) 409; no invented academics | PASS |
| 2 | Onboarding flow | early completion refused; resume at step 3; required steps not skippable; complete; per-field errors (semester/year, CGPA scale); skill level mandatory; GATE paper rule | PASS |
| 3 | Isolation and protected fields | protected fields 400; A/B profile, notes, goals isolated; 401 without auth | PASS |
| 4 | Dynamic completion | drops when skills removed; legacy endpoint matches | PASS |
| 5 | Propagation | semester change → dashboard, semester overview, tutor context, recommendations; `If-Match` stale → 409 | PASS |
| 6 | Firebase bootstrap | parallel → one student; idempotent; unprovisioned 401; verified-only linking; takeover refused; consent required; Firebase down → 503 | PASS (test verifier) |
| 7 | Store failure | section save and step save return 503 and leave data and progress unchanged | PASS (found bug P5-001) |
| 8 | AI safety | key redaction; AI contexts without contact details or grades | PASS |
| 9 | Migration pre-flight | duplicate email reported, masked, nothing written | PASS |

## `src/tests/phase5_supabase_pg.test.ts` (8 tests, local PostgreSQL 16)

Migration applied twice; commit + load round trip; stale write 409 with row unchanged; uid takeover refused; RLS own rows
only; client writes refused; anon refused; migration script copies and re-runs safely; rollback then re-apply. **8/8 PASS.**

## Browser walkthrough (`scripts/audit/phase5-registration-ui.cjs`, Chromium, legacy mode)

Account → academics → skills (saving without a level shows the error; choosing one continues) → skip projects → career →
learning → review → complete → dashboard shows the academic card, Courses shows "Your subject" recommendations.
Screenshots: `evidence/registration-review.png`, `evidence/courses-recommendations.png`. No page errors (only blocked
external font requests in this container).

## Not tested (and why)

- Live Firebase sign-up, verification email, password reset: no web API key.
- Live Supabase: no credentials.
- Gemini responses: no key; AI paths are covered with the stub model.

## Bugs

| Id | Severity | Found by | Fix |
|---|---|---|---|
| P5-001 | P2 | Test 7 | A rolled-back learning save left `0` study hours in the schedule store, which then counted as "entered" in completion. Zero is now read as not entered. |
| P5-002 | P2 | PG test design | Migration relied on Supabase default grants and let clients write their own rows without backend validation. Explicit grants added; client access is read-only. |
