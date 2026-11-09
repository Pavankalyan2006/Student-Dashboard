# Phase 3 Component Audit

For each module, this lists the components inspected, what was wrong, and how each was left. Bug ids refer to
`PHASE_3_BUG_TRACKER.md`.

States: **Working** (it already worked, and a test or probe now confirms it), **Repaired** (it was broken and is now
fixed), **Implemented** (it was missing and was built), **Limited** (it needs a provider or network that this
environment does not have).

## 1. Mock Interviews

| Component | State | Notes |
|---|---|---|
| Setup modal (type, role, difficulty) | Repaired | The DSA/CODING type now asks coding questions. |
| Session workspace | Repaired | Questions do not repeat. A question already answered cannot be answered again. |
| Scoring | Repaired | Fixed scores have been replaced by a keyword check labelled as such. Junk answers score 0. AI scoring runs only when a model is present. |
| Report and history | Repaired | Requesting a report before completion returns 409. The canned observations are gone. Duration comes from answer timings. Data is isolated per student. |
| Demo seed interviews | Repaired | The seeded interview with invented scores is no longer created, and the startup cleanup removes it from old snapshots. |
| Orphan pages under `placements/pages` | Removed | They were unrouted duplicates. |

## 2. Projects

| Component | State | Notes |
|---|---|---|
| Create and edit project | Repaired | The repository URL is validated. No description is invented. PATCH ignores `student_id` and `progress`. |
| Modules and tasks | Working | Progress is computed from the tasks. |
| AI planning, architecture and docs | Limited | Each returns 503 without a model. The canned output has been removed. |

## 3. GitHub

| Component | State | Notes |
|---|---|---|
| OAuth start and callback | Repaired | Without an app, OAuth returns 503, with no hard-coded client id. A callback carrying only a username no longer connects an account. Live OAuth is blocked here. |
| Personal access token connect | Repaired | A token is verified before anything is saved. It is encrypted on the backend and removed from every response. |
| Profile, repositories, sync | Limited | The code paths are tested with mocked GitHub responses. The demo account's seeded connection and repositories were removed. |

## 4. Git

| Component | State | Notes |
|---|---|---|
| Git practice lab | Implemented | A simulated repository: no command ever reaches the host. 12 exercises, with conflicts, hints and a locked solution. Progress is saved per student. |

## 5. Research

| Component | State | Notes |
|---|---|---|
| Paper search | Repaired | Live OpenAlex results when reachable. Otherwise a curated list labelled `CURATED`, never presented as live. |
| Saved papers, notes, status | Repaired | Ids are assigned by the server. Duplicates are not created. Data is isolated per student. |
| AI analysis, gaps, literature review | Limited | Each returns 503 without a model. Invented analyses were removed. |

## 6. Knowledge Base and 7. RAG

| Component | State | Notes |
|---|---|---|
| Upload and extraction | Repaired | Base64 text used to be stored as-is (P3-032). Duplicates are detected. Executables are refused. |
| Index persistence | Repaired | Vectors used to be lost on restart (P3-033). |
| Retrieval | Repaired | Hash collisions are guarded by a shared-word check. Results are filtered by student, document and collection. |
| Answering | Repaired | Extractive cited passages without a model, `NO_SOURCES` when nothing matches, and untrusted-text markers for the model. |
| UI labels | Repaired | The UI says "word matching" rather than "AI embeddings". Confidence is labelled as retrieval similarity. |

## 8. Career

| Component | State | Notes |
|---|---|---|
| Profile and target role | Repaired | A new student gets no invented alignment or role. Bad values are rejected. |
| Skill gap and roadmap | Repaired | The roadmap is built from the role's learning path. Steps can be completed. Data persists. |
| AI advice | Limited | Returns 503 without a model. |

## 9. Resume

| Component | State | Notes |
|---|---|---|
| Create page | Implemented | Creating a resume used to be impossible from the UI. |
| Editor (education, skills, projects) | Repaired | Projects are imported from the student's own projects only, and never twice. |
| Preview and PDF export | Repaired | The printed PDF used to include the app sidebar and topbar (P3-093). |
| Analysis | Repaired | A labelled checklist replaces the invented ATS score. |
| AI helpers | Limited | Return 503 without a model. |

## 10. Applications Tracker

| Component | State | Notes |
|---|---|---|
| Tracker CRUD and timeline | Repaired | `javascript:` links and unknown statuses are refused. No location or deadline is invented. Data is isolated. |
| Demo applications | Repaired | Seeded Google, Microsoft and Amazon applications are no longer created, and the startup cleanup removes them. |
| JD comparison | Repaired | Declared skills no longer count as evidence (P3-082). |
| Jobs discovery | Repaired | The hand-written "verified" listings were deleted. Only the Remotive adapter remains, and it reports FAILED when unreachable. |
| Auto-apply | Not present | Nothing is ever sent to an employer. |

## 11. Placement Prep

| Component | State | Notes |
|---|---|---|
| Question bank and practice | Working | 36 questions. Empty answers are refused. Scores and time spent are real. |
| Improvement plan | Repaired | Requires a real role. An unknown role returns 404. Data is isolated. |
| AI coach, STAR helper | Limited | Return 503 without a model. |
| Company logos | Open | Loaded from a CDN that is blocked here (P3-088). |

## 12. Connected Platforms

| Component | State | Notes |
|---|---|---|
| Profile routes | Repaired | **P0 (P3-067):** every student used to share the demo student's profiles. Routes now use the authenticated id. |
| Status | Repaired | A link is saved as LINKED. CONNECTED requires verification (an OAuth or token check, or a challenge). A failed sync becomes FAILED, with the reason. |
| Verification challenge | Implemented | A code is checked against the GitHub bio or the Codeforces API. Tested with mocked responses only. |
| Integrations Center | Repaired | The seeded connections and activity were removed. Buttons read "Save X link". Sync covers GitHub only. |
| Two link stores | Open | P3-090: documented. Settings lists both. |

## Responsive check

14 pages covering all 12 modules were rendered in Chromium at 390, 768 and 1366 px: 42 checks, all passing
(`batch5-responsive.txt`, with screenshots in `evidence/resp-*.png`). On every page:

- nothing scrolls horizontally;
- there is one `h1` and a `main` landmark;
- no button lacks a label;
- no API call returns 5xx.

The only console errors were on Placements: 4 blocked CDN logos (P3-088).
