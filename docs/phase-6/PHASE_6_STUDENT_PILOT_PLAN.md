# Phase 6 Student Pilot Plan

**Status: DRAFT, awaiting owner approval.** No student has been invited or registered. Participant numbers below are
targets, not results.

## 1. Objectives

1. Confirm that students can register, complete onboarding and keep a correct profile without help.
2. Find real usability problems in the ten core workflows (see PHASE_6_FEEDBACK_FRAMEWORK.md, section 4).
3. Confirm that no student can see another student's private data during real use.
4. Measure real page and API timings, error rates and AI response times under pilot use.
5. Collect structured, voluntary feedback and turn evidenced problems into fixes.

## 2. Stages

| Stage | Who | Target size | Starts when | Ends when |
|---|---|---|---|---|
| 1 Internal | Synthetic accounts (`@example.test`) | 2 API students + 1 browser student per run | Done 2026-11-09 | Done: PHASE_6_COMPLETION_REPORT.md |
| 2 Small pilot | Consenting B.Tech students | 3–5 | Owner approves this plan and the environment, and the readiness-gate owner actions are done | Exit criteria in section 11 |
| 3 Expanded pilot | Consenting B.Tech students | 10–20 | Stage 2 meets its success criteria and has no open P0/P1 | Exit criteria in section 11 |
| 4 Review | Owner + engineering | n/a | Stage 3 ends | Refinements merged and regression green |

## 3. Participant eligibility

- Currently enrolled in a B.Tech (or equivalent engineering) programme, 18 or older.
- Has read the participant information sheet and given consent (section 9). Consent can be withdrawn at any time.
- Uses their own email address. No shared accounts.
- Not required: any specific branch, semester, grade or skill level. Do not select by CGPA.
- Stage 2 should include at least one student who mainly uses a phone.

## 4. Duration

- Stage 2: 1 week of use (a 45-minute guided first session, then free use), plus 1 week to fix P0/P1 issues.
- Stage 3: 2 weeks of use.
- Feedback window: open during the stage and for 3 days after it.

## 5. Test environment

A separate pilot server, never production. It runs locally or on a host the owner approves (PHASE_6_PILOT_ENVIRONMENT.md).
Separate secrets, a separate data snapshot or a separate Supabase project, a Gemini key with a spending cap, and
`PILOT_FEEDBACK_ENABLED=true`. **Nothing is deployed or published without explicit owner approval.**

## 6. Supported browsers and devices

| | Supported in the pilot | Tested in Stage 1 |
|---|---|---|
| Chrome / Edge (current) | Yes | Chromium (Playwright) at 390×844 and 1366×900 |
| Firefox, Safari (current) | Yes, best effort | NOT TESTED |
| Android phone (Chrome) | Yes | Emulated width only, no real device |
| iPhone (Safari) | Best effort | NOT TESTED |
| Laptop / desktop ≥ 1280 px | Yes | 1366×900 |

## 7. Student onboarding process

1. The owner sends each consenting student the pilot address, the participant information sheet and
   `docs/student-guides/STUDENT_QUICK_START_GUIDE.md`. **Invitations are sent by the owner only.** This repository
   contains no invite automation.
2. The student registers at `/register` (7 steps, about 2–5 minutes) using STUDENT_REGISTRATION_GUIDE.md.
3. A 45-minute guided session: the student tries the tasks they choose from the ten workflows. Nobody must do all of them.
   The observer notes which tasks were attempted, time taken and difficulties, using the observation sheet in
   PHASE_6_FEEDBACK_FRAMEWORK.md. Do not record screens without separate consent.
4. Free use for the rest of the stage.
5. Feedback at `/pilot-feedback` (also in the sidebar under Profile and in Settings).

## 8. Feedback collection

- In app: the Pilot Feedback page (survey, problem report, privacy/security concern). It is private, voluntary and
  can be withdrawn.
- Observer notes: one sheet per session, kept with a participant code (P-xxxxxxxx), not the student's name.
- The owner exports pseudonymous results with `scripts/pilot/export-feedback.cjs`.

## 9. Privacy requirements

- Written consent before registration (participant information sheet: purpose, what is collected, retention,
  withdrawal, contact).
- Collect only what the platform needs. CGPA, phone and photo stay optional.
- No production data. No real student data in the repository, test fixtures or reports.
- Feedback is deleted after `PILOT_FEEDBACK_RETENTION_DAYS` (default 90). Accounts are deleted at the end of the pilot
  unless the student asks to keep theirs (see PHASE_6_PRIVACY_REPORT.md, section 5).
- Analytics only with the student's opt-in (Settings > Privacy & Data > Usage analytics).

## 10. Support procedure

| Need | Route | Target response |
|---|---|---|
| Can't sign in / forgot password | Firebase mode: "Forgot password?" on the sign-in page. Legacy mode: no reset exists, so the student contacts the owner | 1 working day |
| Something broke | Pilot Feedback > Problem report (module, page, steps) | P0/P1 same day, others weekly |
| Privacy or security concern | Pilot Feedback > Privacy or security concern, or contact the owner directly | Same day |
| Withdraw from the pilot | Tell the owner. Feedback can be withdrawn on the Pilot Feedback page at any time | 3 working days |

P0 (security or data loss) pauses the pilot until it is fixed and re-tested.

## 11. Success and exit criteria

Success criteria are fixed **before** results are collected in PHASE_6_SUCCESS_CRITERIA.md.

Stage 2 exits (and Stage 3 may start) when all of these hold:
- No open P0 or P1.
- Every participant who started registration completed it, or the reason is understood and fixed.
- No cross-student data exposure was observed or reported.
- Each core workflow (WF1, WF2, WF4, WF8, WF10) was completed by at least one participant without help.

Stop immediately (any stage) on: a confirmed cross-student data exposure, a credential/key leak, data loss without
recovery, or a participant withdrawing consent for the whole pilot.
