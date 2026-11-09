# Phase 5 Authentication Report

| Check | Result |
|---|---|
| Passwords: 8+ chars, letter + digit, not equal to the email (legacy and Firebase sign-up form) | PASS |
| Duplicate email (case-insensitive) → 409 | PASS |
| Rate limits on login / register / Firebase session (disabled only inside vitest unless `AUTH_RATE_LIMIT_IN_TESTS`) | PASS |
| Firebase ID token verified server-side on every request; never logged | PASS (test verifier) |
| Firebase mode refuses old JWTs and password endpoints (one provider) | PASS |
| Account linking only with a verified email; a linked account cannot be taken by another Firebase identity | PASS |
| Unprovisioned Firebase user cannot reach student APIs | PASS |
| Email verification banner; `REQUIRE_EMAIL_VERIFICATION` keeps unverified accounts incomplete | PASS |
| Password reset (Firebase email); "Forgot password?" on sign-in and Settings | Built; BLOCKED for live check (no web API key) |
| No OTP flow: none was added, so no "OTP sent" message can appear without the provider | PASS |
| Students cannot change role, firebase_uid, email, verification or version through any profile route | PASS (Test 3) |
| Demo one-click sign-in hidden in Firebase mode | PASS |
| CSP allows Firebase scripts/frames only (`googletagmanager`, `apis.google.com`, `*.firebaseapp.com`) | PASS |
| Live Firebase sign-up / sign-in / verification | BLOCKED (awaiting web API key) |
