# Phase 5 Profile Context Architecture

```
Browser (wizard, profile manager, module panels)
   │  Bearer: Firebase ID token (firebase mode) or JWT (legacy)
   ▼
/api/v1/profile/me/*  ──►  StudentProfileService  ──►  validation.ts / completion.ts
                                   │  per-student lock, profile_version, If-Match
                                   ▼
                          ProfilePersistence (snapshot | supabase)
                                   │
                                   ├─► applyCanonicalProfile → existing onboarding stores (read by older modules)
                                   └─► EventBus STUDENT_PROFILE_UPDATED
```

## API (all act on the signed-in student only; no student id in any path or body)

| Method | Path | Purpose |
|---|---|---|
| GET | `/profile/me` | full profile + completion; `ETag` = profile_version; `no-store` |
| GET | `/profile/me/completion` | completion report |
| GET / PATCH | `/profile/me/{identity,academic,experience,career,learning}` (`preferences` = learning) | read / partial update; `If-Match` optional |
| GET / PUT | `/profile/me/skills` | read / replace the list |
| GET | `/profile/me/context/:module` | minimised context for one module |
| GET | `/profile/me/recommendations/:module` | profile-based recommendations with reasons |
| GET | `/profile/me/onboarding` | registration progress |
| PUT | `/profile/me/onboarding/steps/:step` | save `{data}` or `{skip:true}` (steps 3 and 4 only) |
| POST | `/profile/me/onboarding/complete` | completes only when required data exists |

## Module contexts (`moduleContext.ts`)

Each module gets only what it needs. Contexts used for AI (`tutor`, `agent`, `doubts`, `notes`, `flashcards`, `quiz`,
`lab`, `coding`, `career`, …) carry no name, email, phone, institution, CGPA or Firebase uid (tested). The `resume`
context carries contact details on purpose, because a resume needs them; it is not sent to the model by default.
`community` respects the student's privacy setting.

## Front end

`useStudentProfile` (react-query key `['profile','me']`). After a save, `applyProfileUpdate` invalidates dependent
queries, fires `profile:updated` on `window`, and refreshes the auth student. `StudentContext`, `ProfilePage` and every
`ProfileRecommendationsPanel` listen for it, so open pages update without a reload.
