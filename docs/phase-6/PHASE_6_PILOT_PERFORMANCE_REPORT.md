# Phase 6 Pilot Performance Report

**No pilot usage has happened, so nothing here is a pilot measurement.** The figures are from one Stage 1 synthetic
run on 2026-11-09: a production build, a local server in a container, headless Chromium on the same machine, a snapshot
store and no AI provider. They show the shape of the system, not what students will experience over a real network.

## Phase 5 baseline

No Phase 5 performance or load report exists (see the readiness gate), so there is **no baseline to compare with**.
Stage 1 below becomes the first baseline, and Stage 2 should be compared with it.

## Stage 1 measurements

| Metric | Value | Source |
|---|---|---|
| Page load (navigation to network idle), 390×844 | median 1.06 s, p90 1.31 s, max 2.05 s (46 pages) | `evidence/stage1-ui-walkthrough.json` |
| Page load, 1366×900 | median 0.96 s, p90 1.09 s, max 1.80 s (46 pages) | same |
| Registration, account created (browser) | 2.5 s after the form loaded at 1.3 s | same |
| `POST /auth/register` | p50 167 ms, max 437 ms (n=4, bcrypt hashing) | `evidence/stage1-api-journeys.json` |
| `POST /auth/login` | p50 121 ms (n=3) | same |
| Onboarding step save | p50 127 ms, max 199 ms (n=14) | same |
| Profile reads / context | 2–14 ms | same |
| Code execution (Python, `print(sum(range(10)))`) | 116 ms request, 38 ms execution | same |
| ML training (Decision Tree, 60 rows) | 14 ms | same |
| Document upload (text) / RAG retrieval answer | 7 ms / 8 ms (extractive, no AI) | same |
| Quiz submission | 9 ms | same |
| AI response time | **BLOCKED** (no Gemini key; the "unavailable" stream took 428 ms) | same |
| Error rate | 0 unexpected 5xx in 70 API checks and 92 page loads | both |
| Failed logins / failed registrations | only the intended negative tests (wrong password 401, duplicates 409) | same |
| Database failures | none (snapshot store) | server log |

## Bottlenecks found

| Finding | Effect | Status |
|---|---|---|
| The per-IP login limit counted successful sign-ins | In a campus lab behind one IP, the 11th student signing in within 15 minutes is refused | Fixed (P6-006) |
| The registration limit is 20 per IP per hour and counts successes | A Stage 3 group of 20 registering from one lab network within an hour reaches it | Open (P6-011): stagger registration or register before the session; kept as spam protection |
| Snapshot store writes the whole JSON file after changes | Fine for 3–20 students. Not measured under concurrency | Re-measure in Stage 2; use Supabase for larger groups |

## How to measure during Stage 2/3

- Server logs already record `durationMs` and status for every request. At the end of each week, summarise p50/p95 per
  route and the 5xx count from the pilot host logs.
- Run `scripts/pilot/phase6-ui-walkthrough.cjs` against the pilot host from a student-like network once per week.
- AI response time: from the server logs of `/ai/*` routes once a Gemini key is set.

| Week | Route group | p50 | p95 | 5xx | Requests |
|---|---|---|---|---|---|
| _awaiting real student participation_ | | | | | |
