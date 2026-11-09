# Phase 5 Registration Audit

Branch `claude/project-thread-plwucf`, started from `main` after PR #5 (Phase 3) merged.
Status vocabulary: PASS / PARTIAL / BLOCKED / NOT IMPLEMENTED.

## What existed before Phase 5

| Area | Before | Problem |
|---|---|---|
| Sign-up | `LoginPage` sign-up tab + `POST /auth/register` (bcrypt + HS256 JWT) | Accepted 6-character passwords; defaulted `branch: 'CSE'`, `semester: 6` when not entered. |
| Onboarding | `OnboardingPage.tsx` (2,728 lines, 5 steps) writing `/students/me/onboarding/*` | Pre-filled skill levels, "STANDARD"/"FLEXIBLE" preferences and fixed graduation years; progress kept only in the browser. |
| Profile edit | `ProfileEditPage` posting to `/profile` | Defaults `CSE`/6/2027, a client-side "completion" score unrelated to the server. |
| Completion | `ProfileService.getCompletionBreakdown` | Fixed weights and hard-coded values. |
| Data stores | Onboarding Maps (`educationProfiles`, `skillsAssessments`, `careerGoals`, `learningPreferences`, `studyConstraints`, `portfolioProjects`, `semesterSyllabusData`) + `db.students`, persisted in the JSON snapshot | No single owner; several modules read different copies. |
| AI context | `studentContextEngine` | Fake fallback student, fixed "top skills", fabricated readiness, name and institution in prompts. |

## What Phase 5 changed (integrated, nothing duplicated)

- One registration flow: the 7-step wizard at `/register` and `/onboarding` replaced the old 5-step page; the sign-up tab now links to it.
- One profile owner: `server/services/studentProfile/` reads and writes the existing onboarding stores (no second copy) and adds `experienceEntries`, `certificationEntries`, `profileMeta`.
- Existing endpoints kept working: `/students/me/onboarding/*`, `/profile`, `/profile/completion` now return the same values as the central profile.

## Steps

| Step | Section | Required | Skippable |
|---|---|---|---|
| 1 Account and identity | identity | name, email, password (legacy) or Firebase account, terms + privacy consent | no |
| 2 Academic | academic | college, degree, branch, semester, year (semester must belong to the year), expected graduation | no |
| 3 Technical skills | skills | each skill needs a level chosen by the student | yes |
| 4 Projects and experience | experience | — | yes |
| 5 Career | career | at least one target role / interest / higher-education plan / exam | no |
| 6 Learning preferences | learning | at least one language | no |
| 7 Review and complete | — | server checks `onboarding_ready` | — |

Progress (`current_step`, `completed_steps`, `skipped_steps`) is saved on the server after every step, so a student who closes the tab resumes where they stopped (tested).

## Results

| Item | Status |
|---|---|
| 7-step registration with server-side progress and resume | PASS (API tests + browser walkthrough, `evidence/registration-review.png`) |
| Field validation with per-field messages | PASS |
| No invented defaults | PASS |
| Firebase sign-up / verification / reset in the browser | BLOCKED: web API key not provided; code path built and unit-tested with a test verifier |
| Supabase as live store | BLOCKED: credentials not provided; tested on local PostgreSQL 16 |
