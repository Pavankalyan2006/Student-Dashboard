# Phase 6 Product Analytics Report

**No analytics data exists.** Firebase Analytics has never run: the web API key is missing, and analytics is opt-in per
student. No usage figures appear in this report, and none were estimated.

## 1. Implementation (inspected: `src/lib/analytics.ts`)

| Safeguard | Status |
|---|---|
| Loads only when Firebase is configured, a measurement id is set, the browser supports it **and** the student opted in (Settings > Privacy & Data > Usage analytics, off by default) | PASS (code review) |
| Fixed allow-list of event names; unknown events are dropped | PASS |
| Parameter allow-list (`method`, `step_count`, `course_id`, `lesson_id`, `quiz_id`, `score_band`); strings over 64 chars or containing `@` dropped | PASS |
| Never sends passwords, OTPs, tokens, documents, AI conversation text or profile details | PASS (nothing in the allow-list can carry them) |
| Failures never break the product flow | PASS |
| Live event delivery to Firebase | **BLOCKED** (no web API key) |

## 2. Event coverage against the spec

| Spec event | Implemented | Fired from |
|---|---|---|
| Registration started | No | – |
| Registration completed | Yes (`registration_completed`) | `authStore` |
| Onboarding completed | Yes (`onboarding_completed`) | `OnboardingPage` |
| Login completed | Yes (`login_completed`) | `authStore` |
| Course opened | No (`course_enrolled` is allowed but never fired) | – |
| Lesson completed | Allowed, never fired | – |
| AI Tutor used | No | – |
| Quiz completed | Allowed, never fired | – |
| Coding submission, project created, resume exported, application saved, learning goal completed | No | – |

Only 3 of the 13 suggested events are actually sent. Adding the rest is listed for Phase 7. They were not added here
because no pilot evidence yet shows which ones answer real questions, and each needs the same allow-list review.

## 3. Pilot analysis rules

- Analytics exists only for students who opted in, so it is a biased subset. Always report it next to the opt-in count.
- Use the Firebase pseudonymous app-instance id only. Never join analytics with emails or names.
- Keep **actual analytics** (Firebase), **server timings** (request logs) and **self-reported feedback** (Pilot Feedback
  export) in separate tables. Never merge them into one "usage" number.
- Server request logs (method, path, status, duration, request id, student id) are the only usage data that does not need
  opt-in. They are operational logs: use them for reliability and performance only.

## 4. Stage 2/3 results

| Event | Count | Opted-in participants |
|---|---|---|
| _awaiting real student participation and a configured Firebase web key_ | | |
