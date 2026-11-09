# Phase 6 Registration Validation

Stage 1, synthetic accounts only (`@example.test`), on a production build (`NODE_ENV=production`, port 3611) with the
**legacy** provider and the **snapshot** store. Firebase and Supabase were not reachable: no web API key and no Supabase
project exist. Evidence: `evidence/stage1-api-journeys.json`, `evidence/stage1-ui-walkthrough.json`,
`src/tests/phase6_pilot.test.ts`, and the Phase 5 suites `phase5_registration_profile.test.ts` (23 tests) and
`phase5_supabase_pg.test.ts` (8 tests, local PostgreSQL 16, not re-run in this phase).

## Fields

| Group | Field | Supported | Validation checked | Result |
|---|---|---|---|---|
| Account | Full name | Yes, required | 2–100 chars | PASS (Phase 5 Test 1) |
| | Email | Yes, required | format, case-insensitive duplicate → 409 | PASS |
| | Password / confirm | Yes | 8+ chars, letter + digit, not the email, must match | PASS |
| | Phone | Optional | format | PASS (Phase 5) |
| | Account verification | Firebase email verification only | n/a | **BLOCKED** (no Firebase web key). Legacy accounts are unverified |
| | Terms and privacy consent | Yes, required (two checkboxes) | refused without them | PASS |
| Academic | University, college, degree, branch, specialization, academic year, semester, graduation year, subjects, CGPA + scale (optional) | Yes | semester/year consistency, CGPA within scale, no invented defaults | PASS (Phase 5 Test 2; browser run) |
| Technical | Languages, frameworks, databases, AI/ML, cloud, tools (as categories), proficiency per skill | Yes | proficiency is mandatory per skill | PASS (browser: the error is shown until a level is chosen) |
| Projects | Projects, description, technologies, GitHub/demo links, portfolio, internships, certifications, achievements | Yes (step 4, skippable) | URL format | PASS |
| Career | Target roles, industries, locations, internship interests, placement goals, higher-education interests, exams (GATE paper rule) | Yes | at least one direction required | PASS |
| Learning | Preferred language, interests, availability, daily/weekly time, difficulty, revision preference | Yes | preferred language required | PASS |

## Completion checklist

| # | Check | Result | How |
|---|---|---|---|
| 1 | Account creation | PASS | API (2 students) and browser on a 390×844 screen |
| 2 | Authentication | PASS (legacy) / BLOCKED (Firebase live) | login, wrong password → 401 with a clear message |
| 3 | Firebase UID mapping | PASS with a test verifier (Phase 5 Test 6) / **BLOCKED** live | |
| 4 | Supabase profile persistence | PASS on local PostgreSQL (Phase 5) / **BLOCKED** live | |
| 5 | Onboarding completion | PASS | both students; the browser run lands on `/dashboard` |
| 6 | Profile retrieval | PASS | `GET /profile/me` |
| 7 | Profile editing | PASS | semester and skills changed (PHASE_6_PROFILE_VALIDATION.md) |
| 8 | Logout | PASS | |
| 9 | Login again | PASS | |
| 10 | Persistence after refresh | PASS | browser reload on the review step returns to the review step; data kept after a full **server restart** (synthetic student: semester, branch, skills, a note, resume step) |

## Interrupted registration and retries

| Scenario | Result |
|---|---|
| Leave after step 2, come back | PASS: server-side `current_step` = 3 |
| Refresh the page on step 7 | PASS: review step shown again, finish works |
| Same step saved twice (retry after a dropped response) | PASS: one project, not two |
| "Complete" sent twice | PASS: 200 both times, one completion |
| **Registration form submitted twice at once (double click / retry)** | **FAIL before the fix: two accounts with the same email (201/201). Fixed (P6-001): 201 + 409 for each duplicate.** Regression test sends three at once |
| Server restart mid-onboarding | PASS: resumes at the saved step |
| Firebase sign-up succeeded but the database was down | PASS with a test verifier (Phase 5: idempotent bootstrap) / BLOCKED live |

## Timing (one synthetic browser run, 390×844, local server; not a student measurement)

Form loaded 1.3 s; account created 2.5 s; whole 7-step registration with typing automated 7.4 s. A real student's time
will be minutes, and Stage 2 must measure it (WF1 observation sheet).

## Usability observations from the synthetic run (not student evidence)

- On phones the 7-step list filled the first screen and pushed the form below the fold. Fixed (P6-005): the form comes
  first on small screens.
- The dashboard said "To finish: account, academic, skills, …" (raw section keys) straight after a completed
  registration. Fixed (P6-004): "Optional details you can still add: Account, Academic profile, …".
- The "Account created" toast covers the top of the academic form on phones for a few seconds (P4, open).
