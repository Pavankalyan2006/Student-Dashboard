# Phase 6 Pilot Bug Tracker

Workflow: a student reports through Pilot Feedback > Problem report (or the observer writes it down) → the owner's
anonymised export → a row here (id `P6-NNN`) → fix on a branch with a regression test → retest → status. Follow the
existing convention (`docs/phase-*/..._BUG_TRACKER.md`, ids per phase). Internal logs and participant details stay out of
this file; refer to participants only by code (P-xxxxxxxx) and to logs by request id.

Severity: **P0** critical security or data loss · **P1** core functionality broken · **P2** major feature issue ·
**P3** usability issue · **P4** minor enhancement.

All entries so far come from **Stage 1 synthetic testing**. Participant impact is "none yet" because no student has used
the platform.

| Id | Sev | Module / page | Description | Reproduction | Expected | Actual (before fix) | Root cause | Fix | Retest |
|---|---|---|---|---|---|---|---|---|---|
| P6-001 | P1 | Registration `/auth/register` | Double submit creates two accounts with one email | Send the same registration twice at once (double click, or a retry after a dropped response) | One account, duplicate 409 | 201 and 201, two student ids | Email check, then await bcrypt, then create, with no reservation in between | Email reserved synchronously after the check (`identityService.registerLegacy`) | PASS: 3 parallel → 201/409/409; API journey |
| P6-002 | P2 | Career, Resume, Jobs match, Skills, Progress, AI tools | Skills entered in registration/profile ignored | Add Python in onboarding, open Career | Roles matched on Python | "No skills recorded", 0% everywhere; new resume had no skills | Two skill stores; only the Skills module wrote the one these read | `db.getStudentSkills` merges declared profile skills read-only (`profileCache.declaredProfileSkills`) | PASS: test + journey (Backend Developer 40%) |
| P6-003 | P1 | Whole app (production build) | Blank page on any host not in `CORS_ORIGINS` | `NODE_ENV=production`, open `http://<host>:3611/register` | App loads | JS/CSS 500 "CORS origin rejected" | Module scripts send `Origin`, same-origin was not recognised | `server/core/corsPolicy.ts`: same-origin always allowed | PASS: unit test + browser run |
| P6-004 | P3 | Dashboard | "To finish: account, academic, …" right after completing registration | Complete registration, open Dashboard | Clear wording | Raw keys read as required work | Raw `incomplete_sections` keys shown | Labels and "Optional details you can still add" when registration is complete | PASS: screenshot `evidence/page-dashboard-390.png` |
| P6-005 | P3 | Registration on phones | Form below the fold | Open `/register` at 390 px | Form first | Step list filled the screen | Grid order | Step list after the form on small screens | PASS: `evidence/reg-2-academic-390.png` |
| P6-006 | P2 | Sign-in rate limit | 11th sign-in from one IP within 15 min refused | 12 different students sign in from one network | All succeed | 429 from the 11th | Successful sign-ins counted per IP | Successful login / Firebase session no longer counts; failures still do | PASS: test (12 OK, 11th wrong password → 429) |
| P6-007 | P2 | Quiz | New student has no quiz to take without AI | New account, open Quiz | A way to take a quiz | Only AI generation, which returns 503 without a key | Quiz creation UI is AI-only | Open: set the Gemini key; manual quiz builder is a Phase 7 candidate | – |
| P6-008 | P3 | Sign-in (legacy mode) | No password reset | "Forgot password?" in legacy mode | Reset email | Message that Firebase is needed | Reset relies on Firebase | Open: run the pilot in Firebase mode | – |
| P6-009 | P4 | API (cross-origin) | Refused foreign origin logged as 500 / error | Request with `Origin: https://evil.example` | 403 | 500 + error log | CORS error goes to the generic handler | Open | – |
| P6-010 | P4 | AI Tutor | Follow-up actions offered when no answer was generated | Ask without a provider | No actions | "Save key insights to Notes" etc. | Static suggestions | Open | – |
| P6-011 | P3 | Registration rate limit | 20 registrations per IP per hour | 21 students register from one lab network within an hour | – | 429 for the 21st | Spam protection counts successes | Open by choice: stagger sign-up (documented in the pilot plan) | – |
| P6-012 | P4 | Registration on phones | "Account created" toast covers the next form briefly | Create account at 390 px | – | Toast over the College field for ~3 s | Toast position | Open | – |

## Stage 2/3 reports

| Id | Sev | Module | Description | Participant impact | Screenshot/log ref (consented) | Status |
|---|---|---|---|---|---|---|
| _awaiting real student participation_ | | | | | | |
