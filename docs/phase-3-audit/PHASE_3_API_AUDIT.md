# Phase 3 API Audit

Every route is mounted under `/api/v1` by `server/api/router.ts`.

## Phase 3 route files

"Signed in" means the route needs a valid JWT and takes the student id from it.

| Route file | Routes needing sign-in | Open routes | Open routes are |
|---|---|---|---|
| `mockInterviews.ts` | 23 | 4 | types, roles, the question bank and one question |
| `projects.ts` | 42 | 0 | |
| `github.ts` | 30 | 1 | the OAuth callback (state is checked; it redirects) |
| `gitLab.ts` (new) | 13 | 0 | |
| `research.ts` | 34 | 0 | |
| `knowledgeBase.ts` | 26 | 0 | |
| `documents.ts` | 32 | 0 | |
| `career.ts` | 12 | 0 | |
| `resumes.ts` | 23 | 0 | |
| `learningModules.ts` (includes applications) | 82 | 3 | SQL preview, SQL challenges, system-design problems |
| `placements.ts` | 37 | 0 | |
| `externalProfiles.ts` | 13 | 2 | platform list, URL format check |
| `externalIntegrations.ts` | 11 | 1 | provider list |
| `jobsDiscovery.ts` | 10 | 5 | job list, stats, categories, sources, one job |

The open Phase 3 routes return catalogue data only, with no student records. Analysing a job description now requires
sign-in (it used to be open).

## Unauthenticated sweep

`scripts/audit/phase3-unauth-sweep.cjs` reads every route file and calls each route with no token
(`evidence/batch5-unauth-sweep.txt`).

**Result: 859 routes. 800 answer 401. 59 answer without a token.** The 59 open routes are:

- health checks and auth (login, register, refresh, logout);
- catalogue reads for courses, coding, DSA, community, languages and search;
- certificate verification;
- the Phase 3 catalogue routes in the table above.

None of them returns another student's data.

## Identity

Every Phase 3 route takes the student id from `req.user.userId`, never from the body, query or path.

| Ignored client field | Where | Test |
|---|---|---|
| `student_id` | project PATCH | `projects` |
| `progress` | project PATCH | `projects` |
| `oauth_verified` | platform link | `platforms_phase3` |
| `owner` / `student_id` | resume project import | `resume_phase3` |

The P0 bug P3-067 was the reverse case: `externalProfiles.ts` fell back to `std_demo_1`, so every student shared one set
of linked profiles. Each create probe now checks that student B cannot read or change student A's records in that
module.

## Error contract

| Case | Status | Body |
|---|---|---|
| Not signed in | 401 | `AUTHENTICATION_REQUIRED` |
| Bad input | 400 | `VALIDATION_ERROR` with a message |
| Another student's record | 404 | Not found (existence is not revealed) |
| Wrong state, e.g. a report before the interview is completed | 409 | `CONFLICT` |
| No AI provider | 503 | `AI_UNAVAILABLE`; nothing saved |
| External service unreachable | 502 or 503, or a FAILED status on the record | the reason, with no invented data |

`externalProfiles.ts` used to turn every error into a 500, including the 404 from the ownership check. It now keeps
the status of typed errors (afd0ce7).

## Results

- **Phase 3 HTTP probes:** 228 checks, all passing. Batch 1 to 4 create and verify, integration 13/13, demo account
  6/6, end-to-end extras 15/15. See `PHASE_3_TEST_CASES.md`.
- **Phase 1 and 2 probes, rerun on the final build:** 0 failures. Phase 1 API checks 59/59; Phase 2 batches 1, 2 and 5
  create and verify all pass (`evidence/batch5-regression.txt`).
