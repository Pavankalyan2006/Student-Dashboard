# API Inventory (Phase 5 additions and changes)

Base `/api/v1`. Errors: `{success:false, error:{code, message, details?, request_id}}`.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/auth/config` | public | `{provider, email_verification_required, profile_store}` |
| POST | `/auth/firebase/session` | Firebase ID token | find / link / create; 201 created, 200 existing; 409 `ACCOUNT_LINK_REQUIRES_VERIFIED_EMAIL`; 503 `FIREBASE_UNAVAILABLE` |
| POST | `/auth/register` | public | stronger password rules, consent fields; 409 `PASSWORD_AUTH_DISABLED` in Firebase mode |
| POST | `/auth/login`, `/auth/refresh`, `/auth/change-password` | — | 409 `PASSWORD_AUTH_DISABLED` in Firebase mode |
| GET | `/profile/me` | student | ETag = profile_version |
| GET | `/profile/me/completion` | student | |
| GET/PATCH | `/profile/me/identity` `/academic` `/experience` `/career` `/learning` `/preferences` | student | `If-Match` → 409 on stale |
| GET/PUT | `/profile/me/skills` | student | whole list |
| GET | `/profile/me/context/:module` | student | minimised module context |
| GET | `/profile/me/recommendations/:module` | student | courses, coding, dsa, sql, ml, system_design, gate, interview, planner, career, jobs, placement |
| GET | `/profile/me/onboarding` | student | |
| PUT | `/profile/me/onboarding/steps/:step` | student | `{data}` or `{skip:true}` |
| POST | `/profile/me/onboarding/complete` | student | 400 until required data exists |
| GET | `/dashboard` | student | adds `student_profile` |
| GET | `/semester/overview` | student | adds `academic_context` |
| GET/PATCH | `/profile`, GET `/profile/completion` | student | now backed by the central profile |

New error codes: `PROFILE_STORE_UNAVAILABLE` (503), `FIREBASE_UNAVAILABLE` (503), `PASSWORD_AUTH_DISABLED` (409),
`ACCOUNT_LINK_REQUIRES_VERIFIED_EMAIL` (409), `AI_INPUT_TOO_LARGE` (413).
