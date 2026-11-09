# Phase 3 Security Report

How it was tested:

- code review of each Phase 3 module;
- two-student isolation probes, where student B tries to read and change student A's records;
- the unauthenticated route sweep;
- unit tests with stubbed external services.

All Phase 3 test students and data are synthetic.

## Critical findings (P0), all fixed

| Id | Module | Finding | Fix |
|---|---|---|---|
| P3-012 | Projects | PATCH spread the request body, so a student could set `student_id` and give a project to someone else, or change `id`, `slug` or progress. | Fields are whitelisted. Owner and progress are set by the server. |
| P3-019 | GitHub | The callback connected any username (`?username=…`) with no OAuth. The OAuth `state` was never checked. A client id was hard-coded. The scope allowed writes. A random fake token was stored. | `state` is stored, checked and expires. The code is exchanged on the backend. The scope is `read:user`. With no app configured the route answers 503. |
| P3-020 | GitHub | Export to resume did not check who owned the `resume_id`, so it could write into another student's resume. | The owner is checked; another student's resume answers 404. |
| P3-067 | Connected Platforms | Every request used the demo student's id, so all students shared one set of profiles. | All 13 routes use `req.user.userId`. Probe: B cannot read or disconnect A's profile. |
| P3-068 | Connected Platforms | Profiles showed CONNECTED or VERIFIED with no check, and a client could send an "OAuth verified" claim. | The client claim is ignored. CONNECTED requires backend verification. |
| P3-069 | Connected Platforms | Adapters returned invented stats and always passed verification. | The adapters were removed or changed to refuse. Link-only platforms say so. |
| P3-076 | Jobs | Hand-written "verified" listings with invented notification numbers, salaries and deadlines. | Deleted, and removed from old snapshots at start-up. |
| P3-084 | Connected Platforms | The demo login had invented OAuth and VERIFIED profiles. | Seed removed; start-up cleanup. |

The full list, including the 39 P1 findings, is in `PHASE_3_BUG_TRACKER.md`.

## Controls checked

| Area | Result | Evidence |
|---|---|---|
| Student identity | Every Phase 3 route uses the JWT identity. Client `student_id`, `owner` and `oauth_verified` fields are ignored. | create probes, `projects`, `platforms_phase3` |
| Isolation | B gets 404 or an empty list for A's interviews, projects, Git lab, papers, documents, RAG answers, career, resumes, applications, placement plans and platform profiles. | batch 1 to 4 probes, `integration` |
| Unauthenticated access | 859 routes; 800 answer 401; the 59 open routes serve catalogues, health checks and auth. | `batch5-unauth-sweep.txt` |
| GitHub tokens | Encrypted with AES-256-CBC on the backend and removed from every response. Never sent to the browser, logged or put in a URL. No password is ever asked for. | `github_workspace_master` |
| GitHub scope | `read:user` only. | `githubService.ts` |
| Third-party passwords | No form or API accepts a platform password. | code review |
| Server-side requests | Challenge checks fetch only public https addresses. Private, loopback and link-local addresses are refused after DNS resolution. Redirects are not followed. Size and time are capped. | `platformVerification.ts`, `platforms_phase3` |
| Git lab | Commands run in an in-memory simulator; nothing executes on the host. Chained commands and commands other than git are refused. | `git_lab` |
| Uploads | Executables are refused. Content is hashed and duplicates are detected. Extracted text is stored as data. | `documents_workspace_master`, batch 2 |
| Prompt injection | Document text and job descriptions are wrapped in `<<<…>>>` and marked as untrusted data in the model prompt. In extractive mode the text is only quoted. | `knowledge_base_master`, `rag_retrieval`, `jobs_discovery_master` |
| Links | `javascript:` and other non-http links are refused for applications and projects. | batch 4 |
| Automatic actions | Nothing is sent to employers or third parties without the student acting. | code review |
| JWT secrets | `config.ts` refuses the default secrets in production. | code review |

## Open items

| Id | Severity | Item |
|---|---|---|
| P3-091 | P3 | If `GITHUB_TOKEN_ENCRYPTION_KEY` is not set, the token key falls back to the JWT secret. Set a separate key in production. |
| P3-096 | P4 | `/mock-interviews/questions` is public and includes reference answers. It is the study bank. The keyword score is labelled self-practice, so revealing the answers does not unlock anything. |
| P3-088 | P4 | Placement company logos load from a third-party CDN, which tells that CDN about page views. |
| — | Note | `admin.ts` routes were on `main` before Phase 3. Phase 3 added no admin role. |

## Not tested here

- Live GitHub OAuth (no app credentials and no network).
- A provider-backed model under real prompt-injection attempts. Only a stubbed model was used.
- Load or rate-limit testing.
