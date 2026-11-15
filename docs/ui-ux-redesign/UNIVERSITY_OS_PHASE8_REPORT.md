# University OS: Phase 8 (Testing and QA) and final summary

Phase 8 is the brief's testing phase. Each item below was checked by running the application, locally and on the live site (https://btechplatform.vercel.app), not only by reading code. The second half of this report is the final summary the brief asks for in Part 19, covering Phases 0 to 8.

## Results at a glance

| Brief check | How it was checked | Result |
|---|---|---|
| Complete application testing | Full automated suite | 1,170 passed. The 10 Postgres tests that are normally skipped were also run against a local Postgres 16, and all passed. |
| No broken imports or TypeScript errors | `tsc --noEmit`, production build | Clean |
| Every route | All 231 client routes, as a new student, at 1366 px and 390 px (462 page loads) | 0 crashes, 0 not-found screens, 0 blank pages, 0 server errors, 0 failed API calls |
| All navigation | All 64 sidebar links are among those routes | All open their page |
| Responsive layouts | Same sweep at phone width (390 px) | No page scrolls sideways |
| Authentication | Every one of the 942 API routes called without a token | 882 refuse with 401. 60 are public by design: sign-in, health checks and shared catalogues with no student data |
| Administrative permissions | All 42 administrator routes called as a student | All refuse with 403 |
| Student data isolation | Cross-student tests for every new module, plus 3 new tests | Another student can't read, change or delete any of it |
| Database migrations | Migration, row-level security and Postgres state-store tests on a local Postgres | 10 of 10 pass |
| Data persists | Records created in new modules, server restarted, records read back | Code review, competition event, research idea, reminder settings and AI memory switch all survived |
| AI provider configuration | AI features called with no provider reachable | Clear messages such as "AI unavailable. No AI provider is configured", and nothing invented or saved. Live, with Gemini configured, answers cite their sources |
| File processing | Live PDF upload (Phase 6/7 check) and upload validation tests | Live PDF text, metadata and page citations work. Wrong types and oversized files are refused |
| Code execution security | Sandbox isolation tests; production setting | Code runs only in a Linux namespace (no network, host files hidden, runs as `nobody`). Where that isn't available, as on Vercel, running is refused with a message |
| Existing features have not regressed | Live click-through of every control on 57 pages, at desktop and phone width | No page errors, no server errors, no broken links (details below) |

## What was run

### 1. Automated tests

- `npm test`: 1,170 passed, 10 skipped, in 84 files. This includes the new `src/tests/phase8_isolation.test.ts`.
- The 10 skipped tests need a Postgres server (`PHASE5_PG_URL`). They were run separately against a local Postgres 16 and all passed:
  - `phase5_supabase_pg.test.ts`: migrations, row-level security and the profile store.
  - `vercel_pg_state.test.ts`: the Postgres state store used on Vercel.
- `tsc --noEmit` is clean. `npm run build` passes (Vite app plus the Vercel API bundle).

### 2. Every route, desktop and phone

New script: `scripts/audit/phase8-route-sweep.cjs`.

- It registers a student, completes onboarding, and opens every route handled by `src/App.tsx` at 1366 px and 390 px.
- For each load it records page errors, console errors, API responses of 400 or more, a not-found or error screen, a blank page, and content wider than the window.
- **Result over 462 loads:**
  - Nothing crashed, showed a not-found screen, came up blank or overflowed.
  - No API call failed.
  - The only console messages were images from outside sites (course thumbnails, avatars), which this test machine's network blocks.
- **Aliases:** routes such as `/interviews` and `/mock-interview` intentionally open the same page as `/mock-interviews`.

### 3. Sign-in and permissions

New script: `scripts/audit/phase8-permission-sweep.cjs`. It reads all routes from `server/api/routes` and calls each one twice.

- **Without a token:** 882 of 942 routes answer 401. The other 60 are public on purpose:
  - sign-in, health and certificate verification
  - the GitHub sign-in callback
  - shared catalogues with no student data: courses, coding and DSA problems, community posts, the job board and interview question types
  - two text helpers that run nothing
- **As a student:** all 42 administrator routes answer 403.
- **AI limiter note:** the AI rate limiter (40 a minute per address) runs before the sign-in check. A signed-out caller can be told "too many requests" before "sign in". The script waits and retries, and every AI route then answered 401.

### 4. Student data isolation

- **Already covered:** each module's own tests already check another student's access, for:
  - code review, previous papers, Competition Hub (feed, teams, participation)
  - research (ideas, papers, ask-a-paper, experiments)
  - AI Brain, briefing, Knowledge Graph, agents, AI memory
  - search, notes, documents, system design
- **New in `phase8_isolation.test.ts`:** another student cannot:
  - delete or recheck a competition event
  - link or unlink ML experiments on a research project, or delete the project
  - open or delete a document
- In each case the owner's record was unchanged.

### 5. Persistence across a restart

A server with file persistence was given records in the new modules, then stopped and started again from its snapshot. Everything came back:
- the account
- a code review
- a competition event
- a research idea
- reminder categories and lead time
- the AI memory switch

On Vercel the same stores are saved to Postgres, which the Postgres state-store tests cover.

### 6. AI provider handling

With no provider reachable (the local setup):
- **AI Tutor chat** streams "AI unavailable. No AI provider is configured on the server" and marks the plan step as failed.
- **Note and quiz generation** answer 503 with "No note was saved" and "No quiz was created".
- **AI Brain** with no sources returns no answer rather than inventing one.
- **Code review** still returns its automatic checks.

On the live site, AI Brain, ask-a-paper, code review and the architecture draft were verified in earlier phases. Their answers cite pages and passages.

### 7. Code execution

- `server/execution/isolation.ts` runs student code only inside a Linux namespace:
  - no network
  - a private process and file view, with the app, home and data directories hidden
  - the `nobody` user
  - resource limits
- In production, code is refused unless that isolation exists. The sandbox tests ran in full here.
- Vercel has no such sandbox, so live code running is off and the app says so.

### 8. Live site click-through

`scripts/pilot/production-deep-click.cjs` now includes the 12 University OS pages: briefing, AI Brain, Knowledge Graph, agents, grades, Virtual Lab, previous papers, code review, Competition Hub, career roadmap, deadlines and AI memory.

- **What it does:**
  - signs up a synthetic `@example.test` student through the real form and completes onboarding
  - clicks every button, tab and link on 57 pages
  - deletes the account afterwards
- **Desktop (1366 px):** 733 clicks, with no page errors, no server errors and no links to missing pages.
- **The 62 controls it flagged were checked one by one. None is a defect:**
  - **Already selected (57):** most were tabs or filters that were already selected, so a click changes nothing.
  - **Confirm prompts:** Delete and Drop Table ask for confirmation, and the test browser dismisses the prompt.
  - **Disabled on purpose:** "Use my recent activity" is disabled until personalization is on.
  - **Empty form:** "Solve with AI Agent" won't submit an empty form.
  - **Empty canvas:** Auto-Arrange has nothing to arrange.
  - **New tab:** the Codeforces contest on the briefing opens in a new tab.
  - **Clipboard:** "Share Hub" needs clipboard access that the test browser denies. The app shows a message saying to copy by hand.
- **Phone (390 px):** 702 clicks, with the same result (see "Phone run" below).

### Phone run

The same click-through at 390 px covered 57 pages with 702 clicks. It found no page errors, no server errors and no links to missing pages. The 61 flagged controls are the same kinds as on desktop: already-selected tabs, confirm prompts, the clipboard and a disabled switch. Both synthetic accounts were deleted afterwards.

### 9. Defects found and fixed during Phases 6 to 8

| Found by | Defect | Fix |
|---|---|---|
| Live check after Phase 6 | Real text PDFs uploaded on the live site were treated as scanned, because the PDF reader's worker file was missing on Vercel | PR #22: the worker is given to pdf.js directly and shipped with the function. A scan notice is no longer indexed as page text |
| Live check after Phase 6 | Uploaded documents were given a made-up author, "Academic Faculty" | PR #22: removed |
| Live check after Phase 7 | Search matched letters inside words, so "METR-LA" found unrelated courses | PR #23: words match at word starts, two-letter words must match whole, and hyphenated terms stay together |
| Phase 8 test review | Two document tests passed only because the scan notice was indexed as content | PR #22: they now upload a real PDF built by `src/tests/helpers/minimalPdf.ts` |

Phase 8's sweeps found no new defects in the application.

---

## Final summary (brief Part 19)

The detailed reports for each phase are in `docs/ui-ux-redesign/`:
- `UNIVERSITY_OS_PHASE2_REPORT.md` (Phases 0 to 2)
- `UNIVERSITY_OS_PHASE3_REPORT.md` to `UNIVERSITY_OS_PHASE7_REPORT.md`
- this report

Pull requests: #16 (Phases 0 to 2), #17, #18, #19 (System Design Lab fixes), #20, #21, #22 and #23, all merged and checked on the live site.

### The 20 modules

| # | Brief module | Where it lives | Status |
|---|---|---|---|
| 1 | My AI Brain | `/ai-brain` (new) | Done. Answers only from the student's own notes, documents and papers, with citations |
| 2 | AI Agent Control Center | `/agents` (new) | Done. Shows which agent did what, per-student agent switches and the tool log |
| 3 | Knowledge Graph | `/knowledge-graph` (new) | Done. Mastery needs at least 3 correct answers at 70% or better |
| 4 | Daily AI Briefing | `/briefing` (new) | Done. Built from the student's own deadlines, tasks, flashcards, gaps and attendance, plus live Codeforces |
| 5 | Academic Intelligence | Grades & CGPA (What-if), Attendance, Semester Command Center | Done (extended) |
| 6 | Previous Papers Intelligence | `/previous-papers` (new) | Done for text and text PDFs. Scanned papers need OCR (not configured) |
| 7 | Smart Notebook | Notes | Already in place; it is part of AI Brain and search |
| 8 | Virtual University Lab | `/virtual-lab` (new, 6 in-browser simulators) plus Lab Assistant, DSA and SQL labs | Done |
| 9 | Developer Workspace | Coding Lab | Already in place. Running code needs the isolated sandbox (off on Vercel) |
| 10 | Code Review Intelligence | `/code-review` (new) | Done. Automatic checks plus AI review, with secrets redacted |
| 11 | Architecture Studio | System Design Lab, Architecture Studio tab | Done (extended) |
| 12 | Cybersecurity Lab | Not built | Left out at the owner's request |
| 13 | Career Roadmap Generator | `/career/roadmap` | Done (extended). Progress comes only from recorded activity |
| 14 | AI Interview Arena | Mock Interviews | Done (extended with project and communication rounds) |
| 15 | Student Digital Portfolio | Portfolio showcase | Done (extended). New sections start private |
| 16 | Hackathon & Competition Hub | `/competitions` (new) | Done. Only Codeforces is verified automatically; other events are added by the student with a source link |
| 17 | Opportunity Intelligence | Jobs Discovery and Applications | Done (extended) |
| 18 | Research Intelligence | Research | Done (extended). Metadata from PDFs with page sources, DOI check, ask-a-paper |
| 19 | Research Idea Lab | Research → Ideas | Done. The overlap check against OpenAlex never claims novelty |
| 20 | AI Model Playground | AI/ML Lab plus Research → ML Experiments | Partly done. Built-in datasets and real metrics; no GPU or deep-learning backend |

### 1. New pages

`/briefing`, `/ai-brain`, `/knowledge-graph`, `/agents`, `/virtual-lab`, `/previous-papers`, `/code-review`, `/competitions`.

### 2. Enhanced pages

- **Academics:** Grades & CGPA (What-if); Deadlines (Codeforces and export).
- **Engineering:** System Design Lab (Architecture Studio, plus the PR #19 fixes).
- **Career:** Career Roadmap, Mock Interviews, Portfolio and Applications.
- **Research:** Papers, Ideas and ML Experiments.
- **AI:** AI Memory.
- **Search and settings:** global search (Ctrl+K), and Settings → Notifications → Reminders.

### 3. Navigation

- A new "Personal Intelligence" sidebar section holds Briefing, AI Brain, Knowledge Graph, Agents and AI Memory.
- The other new pages sit in their existing sections: Academics, Engineering and Career.
- All 64 sidebar links are tested.

### 4. New components

These are listed per phase in the phase reports. The main ones:
- **Personal Intelligence:** briefing item rows, the Knowledge Graph view, the AI Brain answer with citations.
- **Labs and engineering:** the virtual lab simulators, the code review findings view, the diagram editor.
- **Career:** Competition Hub panels.
- **Research:** paper provenance, ask-a-paper, the idea workspace, the overlap result and the experiments panel.
- **Shared:** global search results with sources, and reminder category settings.

### 5. New API endpoints

- **Personal intelligence:** `/briefing/me`, `/ai-brain/me`, `/knowledge-graph/me`, `/agents/me/*`, `/previous-papers/me`.
- **Engineering:** `/code-review/me`, `/system-design/*/propose`.
- **Career:** `/competitions/*`.
- **Research:**
  - `/research/papers/:id/ask`
  - `/research/ideas/:id` and `/novelty-check`
  - `/research/:id/experiments`
- **Search and notifications:**
  - `/search`, now live and per student
  - `/notifications/categories`
  - `/notifications/preferences`, which now holds categories and lead time

All of them require sign-in, as checked by the permission sweep.

### 6. Database migrations

- No new SQL migrations were needed.
- The new data is kept in stores registered with the existing state store: `agentActivity`, `briefing`, `previousPapers`, `codeReview` and `competitions`. On Vercel these are saved in the Supabase `app_state_entries` table, and the restart test above confirms they persist.
- The existing Supabase migration (`supabase/migrations/20261109000000_phase5_student_profiles.sql`) and its row-level security were tested against Postgres.

### 7. AI integrations

- **Provider:** the existing provider configuration (Gemini on the live site) is used throughout.
- **Grounded answers:** AI Brain, ask-a-paper and Document AI answer from the student's own sources with page citations. Quotes that are not on the page are removed.
- **Interpretation is labelled:** the AI's own reading is marked as interpretation.
- **When the provider fails:** the student sees the failure, never substitute content.
- **Privacy:** the student's name, email, college and marks are never sent to the AI.

### 8. Agent workflows

- **Routing:** AI Tutor requests are routed by intent to the matching agent.
- **Switches:** each student can turn agents off.
- **Logging:** every tool call is logged per student and shown on `/agents`.
- **Approval:** tools that change records need the student's explicit approval (`confirmed: true`, otherwise 409). Agents can never pass it themselves.

### 9. Security improvements

- **Isolation and permissions:**
  - Per-student isolation on every new store.
  - Administrator routes are locked to `SUPER_ADMIN`.
  - Agents need approval for actions that change records.
- **Uploads and code:**
  - Uploads are validated by type and size.
  - Secrets are redacted before code is sent to the AI.
  - Code runs only in an isolated sandbox.
- **No invented data:** nothing is made up for student records, citations, DOIs, authors, vacancies or results.

### 10. Testing results

See "Results at a glance" above.

### 11. Known limitations

- **No sandbox on Vercel:** running student code and training models need an isolated sandbox, which the Vercel deployment does not have. Both are off there, and the app says so.
- **No OCR:** scanned PDFs and scanned previous papers need OCR, which is not configured.
- **Email and push:** these reminders need a provider; reminders appear in the app only.
- **No calendar sync:** Google Calendar is not connected. Deadlines can be exported as an `.ics` file.
- **Search:** search is by words, not meaning, so a typo finds nothing.
- **Competitions:** only Codeforces is verified automatically.
- **No scheduler:** the briefing and reminders are computed when the student opens them.
- **Cybersecurity Lab:** not built.
- Smaller limits are listed in each phase report.

### 12. Required environment variables

No new variables were added in Phases 0 to 8. The deployment uses the existing ones:
- **AI:** `AI_PROVIDER`, `GEMINI_API_KEY` and `GEMINI_MODEL`.
- **Database:** `SUPABASE_DB_URL` and `STATE_STORE=postgres` on Vercel.
- **Sign-in:** the Firebase variables, `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- **Limits:** `MAX_UPLOAD_SIZE_BYTES`, and `CODE_SANDBOX_ALLOW_UNISOLATED`, which is left unset or false.

### 13. External services

- **Required:** Gemini (AI), Supabase Postgres (data) and Firebase (sign-in). All are configured on the live site.
- **Optional:** Codeforces API (contests) and OpenAlex (paper lookup and overlap check). Both are public, need no keys, and both work live.
- **Not configured:** OCR, email or push delivery, calendar sync, and a code or GPU sandbox.

### 14. Run locally

```
npm ci
PORT=3100 DATA_PERSISTENCE=off AUTH_PROVIDER=legacy \
  JWT_SECRET=<32+ chars> JWT_REFRESH_SECRET=<32+ chars> npm run dev
npm test        # add PHASE5_PG_URL=postgresql://... to run the Postgres tests
npx tsc --noEmit
```

QA scripts against a running server:
```
BASE=http://localhost:3100 node scripts/audit/phase8-permission-sweep.cjs
BASE=http://localhost:3100 ROUTES=/briefing,/code-review node scripts/audit/phase8-route-sweep.cjs
```

For the permission sweep, set `API_RATE_LIMIT_PER_MINUTE` high on the server.

### 15. Documentation

- Phase reports: `docs/ui-ux-redesign/UNIVERSITY_OS_PHASE2_REPORT.md` to `UNIVERSITY_OS_PHASE8_REPORT.md`.
- Screenshots: `docs/ui-ux-redesign/screenshots/`.

## Files in this PR

- `scripts/audit/phase8-route-sweep.cjs` (new): route sweep at desktop and phone width.
- `scripts/audit/phase8-permission-sweep.cjs` (new): checks that signed-out and student callers are refused where they should be.
- `scripts/pilot/production-deep-click.cjs` and `production-ui-walkthrough.cjs`: now include the 12 University OS pages.
- `src/tests/phase8_isolation.test.ts` (new): 3 cross-student tests.
- `docs/ui-ux-redesign/UNIVERSITY_OS_PHASE8_REPORT.md` (this report).
