# Phase 3 External Integrations

This environment has no outbound access to GitHub, Codeforces, OpenAlex, Remotive or jsDelivr, no AI provider key and
no GitHub OAuth app. Because the services could not be reached, **no live integration is claimed as passing.** For
each one, this report gives what the code does, what was tested, and what is still needed.

| Integration | Behaviour after Phase 3 | Tested here | Live status | Needed to test live |
|---|---|---|---|---|
| **GitHub OAuth** | `state` is stored and checked. The code is exchanged on the backend. Scope `read:user`. The token is encrypted on the backend and never returned. Answers 503 when no app is configured. | Start without an app (503), a forged callback (refused), token stripping, state expiry | **BLOCKED** | `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_REDIRECT_URI`, `GITHUB_TOKEN_ENCRYPTION_KEY`, a test account and network |
| **GitHub token connect** | The token is checked with `GET /user` before anything is saved. A failure saves nothing. | Invalid or unreachable token, so nothing is connected | **BLOCKED** | network and a test token |
| **GitHub repository sync** | Imports public repositories, reports `imported_repositories`, and refuses a token for a different username. | Unit tests with mocked responses | **BLOCKED** | as above |
| **Profile verification: GitHub bio** | The student puts a one-time code in their bio, and the backend fetches the public profile. | Mocked API, success and failure | **BLOCKED** | network |
| **Profile verification: Codeforces** | The code goes in the Codeforces profile and is checked with the public API. | Mocked API. The live attempt failed honestly: the profile shows FAILED with the reason. | **BLOCKED** | network |
| **Link-only platforms** (LeetCode, Kaggle, LinkedIn, HackerRank and others) | Saved as LINKED with a validated URL. No stats are shown and nothing is reported as verified. | Probes | Works as a link | none |
| **Portfolio** | Built from the student's real GitHub data and resume. Nothing is invented. | Unit tests | Works locally | |
| **OpenAlex (papers)** | Live search when reachable. Otherwise a curated list labelled `CURATED`, with a note. | Fallback path | **BLOCKED** (fallback works) | network; `OPENALEX_API_KEY` is optional |
| **Remotive (jobs)** | The only job adapter. When unreachable, sync reports FAILED or UNAVAILABLE and adds no jobs. Every other source is labelled link only or not configured. | Unit tests with mocked `fetchJson`; the live failure path | **BLOCKED** | network |
| **AI provider** (Gemini or OpenAI) | `AI_PROVIDER` with `GEMINI_API_KEY` or `OPENAI_API_KEY`. Without one, every AI step answers 503 `AI_UNAVAILABLE` and saves nothing. | Stubbed model in unit tests; 503 on every AI route over HTTP | **BLOCKED** | an API key |
| **jsDelivr (company logos)** | Placement page images. | Blocked: 4 console errors (P3-088) | **BLOCKED** | network |

## What was removed

These were taken out because the spec forbids invented data and fake connections:

- invented OAuth connections, verified profiles and stats on the demo account (P3-084);
- adapters that invented LeetCode, Kaggle and LinkedIn stats (P3-069);
- hand-written "verified" job listings and the fallback "cached" jobs (P3-076);
- canned AI answers in every Phase 3 module.

## How to run the live checks

1. Set the variables listed above in `.env`.
2. Start the server: `npm run dev`.
3. Connect GitHub from `/github`.
4. Verify a Codeforces profile from `/profile/external`.
5. Sync jobs from `/jobs`.
6. Ask a Knowledge Base question with a model configured.
7. Rerun `scripts/audit/phase3-rag-eval.ts` to score generated answers.
