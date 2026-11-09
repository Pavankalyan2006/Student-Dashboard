# Phase 5 Firebase Integration

Project: `otp-project-846a9` (authDomain `otp-project-846a9.firebaseapp.com`).
**Status: BLOCKED for live use.** The Firebase web API key was not provided, so no sign-in against the real project was
attempted. Everything below is implemented and tested with a test token verifier. Nothing here claims a live integration.

## Design

- **One authoritative provider.** `AUTH_PROVIDER=firebase` (or `FIREBASE_PROJECT_ID` set) makes Firebase the only sign-in.
  Without it the existing email/password provider keeps working unchanged. In Firebase mode, old JWTs and the password
  endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/change-password`) return `409 PASSWORD_AUTH_DISABLED`.
- **Browser** (`src/lib/firebase.ts`, `src/store/authStore.ts`): `createUserWithEmailAndPassword`, `sendEmailVerification`,
  `signInWithEmailAndPassword`, `sendPasswordResetEmail`, `onIdTokenChanged` (fresh token on every API call),
  local persistence. Error codes are turned into plain messages (`describeFirebaseError`).
- **Backend** (`server/auth/firebaseAdmin.ts`): `verifyIdToken` with the Admin SDK, initialised once under a named app.
  Only the project id is needed; no service-account file. Network failures → `503 FIREBASE_UNAVAILABLE`.
- **Session bootstrap** `POST /api/v1/auth/firebase/session` (bearer = ID token), idempotent:
  1. find the student by `firebase_uid` → return it;
  2. else an account with the same email: link only if Firebase says the email is **verified**
     (`409 ACCOUNT_LINK_REQUIRES_VERIFIED_EMAIL` otherwise), clear the old password hash;
  3. else create the student (name + consent required).
  Parallel first calls for one uid share one in-flight promise (no duplicate accounts; tested).
- The backend never trusts a student id from the browser; it comes from the verified token.
- A Firebase token for an account that is not provisioned yet reaches only the bootstrap endpoint.

## Analytics

`src/lib/analytics.ts`: off until the student opts in (Settings > Privacy > Usage analytics). Only whitelisted events and
parameters; values containing `@` are dropped. No name, email, answers or documents.

## What the owner must do

1. Firebase console > Project settings > Your apps > copy the web API key into `VITE_FIREBASE_API_KEY` (build time).
2. Authentication > Sign-in method: enable Email/Password. Authentication > Settings > Authorized domains: add the site domain.
3. Backend: `AUTH_PROVIDER=firebase`, `FIREBASE_PROJECT_ID=otp-project-846a9`.
4. Restrict the web API key to the site's HTTP referrers in Google Cloud console.
5. Existing password accounts are linked the first time the student signs up in Firebase with the same, verified email.

## Tests (`src/tests/phase5_registration_profile.test.ts`, Test 6)

Parallel bootstrap → one student; repeat → 200 `created:false`; unprovisioned token → 401; unverified link → 409 and no change;
verified link keeps the student's data and disables the old password; a second Firebase identity cannot take the account;
Firebase unavailable → 503, nothing created.
