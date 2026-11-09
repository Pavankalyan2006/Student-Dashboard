# Phase 6 Profile Validation

Synthetic students A and B, Stage 1. The central profile (`server/services/studentProfile/`, `/api/v1/profile/me/*`) is the
authoritative source. Phase 5 tests cover the basics. This file records what Phase 6 re-checked and what it found.

## Sections

| Section | Read / edit | Result |
|---|---|---|
| Identity (name, display name, phone, photo URL, consents) | `/profile/me`, Profile > Edit | PASS (Phase 5). Profile photo upload: NOT TESTED in Phase 6 |
| Academic | PATCH `/profile/me/academic` | PASS |
| Skills | PUT `/profile/me/skills` | PASS |
| Projects / experience / certifications | PATCH `/profile/me/experience` | PASS (Phase 5) |
| Career goals | PATCH `/profile/me/career` | PASS (Phase 5) |
| Learning preferences | PATCH `/profile/me/learning` | PASS (Phase 5) |
| Profile visibility | Settings > Privacy & Data (`/profile/privacy`) | PASS: set to PRIVATE, persists after sign-out and sign-in |
| Completion | computed from filled fields only | PASS: dynamic (Phase 5 Test 4); drops when skills are removed |

## Semester change (spec example): semester 5 → 6

| Expectation | Result |
|---|---|
| Student Profile shows the new semester | PASS |
| Semester Command Center reflects it | PASS (`semester_number` 6) |
| Subject recommendations refresh | PASS (`/profile/me/recommendations/courses` is computed on each request from the profile) |
| AI Tutor uses the new context | PASS (`/profile/me/context/tutor` has `semester: 6`). The answer itself is BLOCKED (no AI key) |
| Historical records unchanged | PASS: a note written in semester 5 is unchanged |

## Adding a programming skill (spec example)

| Expectation | Before Phase 6 | After the P6-002 fix |
|---|---|---|
| Career recommendations consider it | **FAIL**: "Your profile has no skills recorded yet", 0% for every role | PASS: Backend Developer 40% from Python + PostgreSQL |
| Resume suggestions consider it | **FAIL**: a new resume had no skills | PASS: Python and PostgreSQL are pre-filled |
| Mock Interview may use it | context includes skills (`/profile/me/context/interview`) | PASS (context); interview generation BLOCKED (no AI key) |
| Jobs Discovery may consider it | job match read the Skills store | PASS (same fix). No live listings to match (BLOCKED) |
| Skills profile (`/skills/profile`) | **FAIL**: empty | PASS: listed as `STUDENT_DECLARED`, confidence `NOT_ASSESSED`. Unified Progress reads the same function (not separately re-tested) |

**Root cause (P6-002):** registration and Student Profile save skills in the onboarding store. Career, resume, job match,
progress, portfolio and several AI tools read a second store (`db.getStudentSkills`) that only the Skills module wrote.
**Fix:** `db.getStudentSkills` merges the profile's declared skills as read-only `STUDENT_DECLARED / NOT_ASSESSED` entries,
unless the Skills store already has a skill with that name. Nothing is copied or duplicated, so removing a skill from the
profile removes it everywhere. Tests: `phase6_pilot.test.ts` (P6-002, including no leak to another student).

## Privacy of profile fields in public content

| Check | Result |
|---|---|
| A community question viewed by B contains no email, phone or CGPA of A | PASS |
| AI contexts exclude contact details and grades | PASS (Phase 5 Test 8) |
| Private profile hidden from others (`profile_visibility: PRIVATE`) | PASS (existing ProfileService rule, Phase 4/5 tests) |
