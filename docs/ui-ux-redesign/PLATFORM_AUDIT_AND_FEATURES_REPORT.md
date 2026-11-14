# Platform Audit and New Features

Date: 2026-11-14. Requested by the owner after PR #12, the personal AI agent.

## What the owner asked for

- Explore the whole platform and fix what is broken, outdated, insecure or slow, before adding anything new.
- Learn from leading platforms: ChatGPT, Claude, Gemini, Perplexity, Coursera, Udemy, Khan Academy, GitHub,
  LeetCode, GeeksforGeeks and HackerRank. Add only features that genuinely help and do not duplicate a module.
- Keep everything personal to the signed-in student and backed by real data, with real integrations and source
  attribution.

## 1. What leading platforms do, and where this platform stood

| Pattern | Seen in | Before this change | Now |
| --- | --- | --- | --- |
| Answers with checkable sources | Perplexity, Gemini, ChatGPT search | The AI Tutor answered without sources. Research searched papers but did not answer questions. | **Discover** (new) |
| Activity heatmap and streaks | GitHub, LeetCode | Only a dashboard streak, and its "longest streak" was made up (always at least 5). | **Learning Analytics** (new). The streak is fixed. |
| Error log: retry what you got wrong | Khan Academy mastery, LeetCode, test-prep apps | Each quiz had its own review. Nothing collected mistakes across quizzes and GATE. | **Mistake Notebook** (new) |
| Skill-gap and role roadmap | Coursera career paths, LinkedIn Learning | Built (`/skills`, `/career/skill-gap`, `/career/roadmap`) but missing from the sidebar, so students could not find them. Skill Gap always opened on SDE. | In the sidebar. Skill Gap opens on the student's own target role. |
| Achievements, certificates, bookmarks | Coursera, Udemy | Built but hidden. Achievements crashed on open. | In the sidebar. Achievements fixed. |
| Course catalogue, AI tutor, coding, DSA daily challenge, spaced-repetition flashcards, mock interviews, GATE, resume, jobs, projects, GitHub, community | All of the above | Already present | Unchanged; no duplicate modules added |

## 2. Audit findings and fixes

| # | Area | Finding | Fix |
| --- | --- | --- | --- |
| A1 | Security | The global API rate limit never applied. It checked `req.path` for `/api`, but it is mounted with `app.use('/api', …)`, which strips that prefix, so every request was skipped. | The limiter checks the full URL. Limit: 600 requests per minute per student (configurable with `API_RATE_LIMIT_PER_MINUTE`). Test suites skip it unless they opt in. |
| A2 | Security / cost | The AI rate limiter (40 per minute) was defined but never used, so AI generation calls had no specific limit. | Applied to every AI generation POST (`/ai/*`, `/discover/*`, and `…/generate`, `/explain`, `/chat` and similar). |
| A3 | Dependencies | `npm audit` (production): 21 issues (7 high). | `npm audit fix` without breaking upgrades, plus an override that pins DOMPurify to 3.4.18 (used by the code editor). Now 16 issues (4 high). The 4 remaining high ones are all inside Firebase / gRPC and need a major Firebase upgrade (listed under "Still open"). |
| A4 | Real data | The dashboard's longest streak was `max(current, 5)`, a made-up number. | Computed from the student's own active days. |
| A5 | Real data | A GATE attempt with no recorded time was saved as 45 s (in a test) or 60 s (in practice). | Saved as 0. The page shows "Time not recorded". |
| A6 | Bug | The Achievements page crashed (`filter is not a function`). The page expected a list, but the API returns `{ all, earned }`. Badge icons also showed raw names such as "GraduationCap". | The client merges the two lists into earned and locked badges. The page shows an icon and the real goal, for example "1 × quiz completed". |
| A7 | Discoverability | Skills Profile, Skill Gap Analysis, Career Roadmap, Achievements, Certificates and Bookmarks worked but had no sidebar entry. | Added to the sidebar, so the command palette finds them too. |
| A8 | Personalisation | Skill Gap always opened on "Software Development Engineer". | It opens on the student's target role from their profile. A role in the URL still wins. |
| A9 | Performance | All 110 pages were in one 4.5 MB JavaScript file (1 MB gzipped), downloaded on first visit. | Pages load when first opened. The main file is now 1.0 MB (290 KB gzipped), about 72 % less. If a tab is open during a deploy, it reloads itself once instead of failing to load a page. |
| A10 | Rendering | `MarkdownContent` loaded the KaTeX renderer without the math parser, so `$…$` showed as raw text in GATE explanations, quiz text and elsewhere. | `remark-math` added. Formulas render. |

## 3. New features

### Discover (`/discover`, Learn group)

- The student asks a question. The server searches three sources at the same time:
  - **Wikipedia**, through the MediaWiki Action API. It is free and needs no key. Each card names the source and its licence (CC BY-SA 4.0).
  - **OpenAlex** scholarly works, through the existing `ResearchProviderService`.
  - **The student's own notes**, ranked by keyword match with titles weighted higher.
- The AI writes a 120–250-word answer that may use only those sources, with `[n]` after each claim.
  - Any citation that points to a source not in the list is removed before the answer is shown.
  - If no source is found, no answer is written.
  - If the AI is unavailable, the sources are still shown with a plain message. The provider's "AI unavailable" notice is never shown as if it were an answer.
- Each citation is a chip that scrolls to its source card. External links open in a new tab.
- The page shows which providers were searched and which were unreachable.
- Buttons:
  - **Save to notes** saves the answer and its full source list as a real note.
  - **Learn it with the AI Tutor** opens the tutor with the answer as context.
- Quick topics come from the student's subjects. Recent questions are stored per student in this browser.
- Files: `server/services/discoverService.ts`, `server/api/routes/discover.ts`, `src/features/discover/`.

### Learning Analytics (`/analytics`, Overview group)

- A GitHub-style calendar of the last 12 months of activity.
- Current and longest streak, active days, the last 30 days compared with the 30 before, and focus minutes from the Focus Timer.
- Activity per module. Each bar links to its module.
- When the student studies, by weekday and by hour, in their own time zone (sent as `tz`).
- Built only from records the platform already stores for the student:
  - activity log
  - quiz attempts
  - code submissions
  - mock interviews
  - GATE attempts
  - notes
  - AI Tutor conversations
- An activity is never counted twice, and a day with no records shows zero.
- Files: `server/services/learningAnalyticsService.ts`, `GET /api/v1/learning/analytics`, `src/features/analytics/`.

### Mistake Notebook (`/mistakes`, Assessments group)

- Every quiz or GATE question the student answered wrongly, until they get it right. Unanswered questions are not counted.
- Filter by open, fixed or all, and by topic. Each card shows how many times it was missed.
- **Try again** without seeing the answer. The correct answer and explanation come back only after the student commits.
  - GATE retries are recorded as real GATE practice attempts.
  - Quiz retries are recorded in the activity log (`MISTAKE_REVIEWED`), so they persist and appear in Learning Analytics.
- A mistake is marked fixed only when the latest answer, given after the last wrong one, is correct.
- **Ask the AI Tutor why** sends the question, the student's answer and the correct answer to the tutor.
- Only questions in the student's own notebook can be retried.
- Files: `server/services/mistakeNotebookService.ts`, `GET /api/v1/learning/mistakes`, `POST /api/v1/learning/mistakes/retry`, `src/features/mistakes/`.

All three pages are personalised automatically, because every AI call carries the student's context (PR #12). The "Personalised" chip on these pages shows the context for the matching module.

## 4. Verification

**Automated checks**
- `tsc`: 0 errors.
- `vitest`: 1036 passed, 10 skipped.
- `npm run build`: OK.

**New tests** in `src/tests/discover_analytics.test.ts`:
- Analytics:
  - local-day bucketing
  - zero-filled calendar
  - real current and longest streaks
  - time zones
  - no guessing when there is no data
  - the dashboard streak no longer reports 5
- Discover:
  - citation cleaning
  - note ranking
  - Wikipedia parsing and licence
  - no answer without sources
  - sources kept when the AI fails
  - the "AI unavailable" notice is never used as an answer
- Mistake Notebook:
  - status rules
  - end-to-end wrong answer, then wrong retry, then correct retry marks it fixed
  - another student's question cannot be retried
- Rate limiter:
  - it really limits when mounted under `/api`
  - AI request detection

**Production build, run locally**, as the seeded student:
- All 51 sidebar pages at 1440 px and at 390 px:
  - 0 page errors
  - 0 crashes
  - every page has a heading
  - 0 horizontal overflow
  - no "Recommended for you"
- Mistake Notebook: the GATE retry was graded and showed the correct answer and explanation, with formulas rendered.
- Discover:
  - A real call found the student's own note. Wikipedia and OpenAlex were reported as unreachable from the test machine, and the AI was not configured locally.
  - A separate check with a stubbed reply confirmed that citation chips link to their source cards.

**Not checkable from the test machine:** its network blocks Wikipedia and OpenAlex, and it has no AI key. Live answers will be checked on the production site after the merge.

## 5. Still open

- **Firebase SDK major upgrade.** It would clear the last 4 high `npm audit` items. All of them are in gRPC/Firestore code paths that the browser app does not use for sign-in. It needs a separate tested upgrade.
- **Currency in Markdown.** With the math parser on, two dollar amounts in one sentence (for example "$5 and $10") can render as a formula.

## 6. Follow-up: B.Tech academic tools

Requested later the same day: "add more features and new pages … which the B.Tech student will get help from". The audit
showed that no page tracked grades or attendance, two things every B.Tech student checks every week. Both pages
are now in the Overview group.

### Grades & CGPA (`/grades`, also `/cgpa`)

- The student enters each semester's subjects, credits and grades from their own grade card.
- Grade scales:
  - O / A+ / A / B+ / B / C / P / F (10-point)
  - AA / AB / BB / BC / CC / CD / DD / FF (10-point)
  - typed grade points (0–10) for any other university
- SGPA and CGPA are credit-weighted. A subject whose result is still awaited is left out instead of guessed.
- A failed grade is listed as a backlog.
- **Target CGPA planner** shows the average SGPA needed over the remaining semesters, or says plainly that the
  target cannot be reached and suggests the highest reachable one. The page states its one assumption: the
  remaining credits follow the student's own average credits per semester so far.
- An SGPA-by-semester chart is included. In the current semester, subject names can be added from the student's
  profile subjects.
- The page converts CGPA to a percentage only if the university's own formula is known, so it shows no
  percentage now. Formulas differ between universities, and a wrong one would mislead the student.

### Attendance (`/attendance`)

- Each subject has **Present / Absent** buttons, one tap per class.
- Each subject shows its percentage and either:
  - "You can miss N more classes and stay at 75% or above", or
  - "Attend the next N classes in a row to get back to 75%".
- The minimum is editable (default 75%). If the minimum cannot be reached any more, the page says so.
- Shows overall attendance and lists the subjects below the minimum.

### How it is stored

- `server/services/academicRecordsService.ts` keeps one record per student. It is registered with the state
  store (`academicRecords`), so on Vercel it is saved to Supabase like the rest of the platform.
- `server/services/academicMath.ts` holds the calculations. They are pure, and the server and the pages share
  them, so the numbers update as the student types and match what is saved.
- API:
  - `GET /api/v1/academics/me`
  - `PUT /api/v1/academics/me` (validated: grades must be on the chosen scale, a semester cannot be listed twice,
    attended classes cannot exceed classes held)
  - `POST /api/v1/academics/me/attendance/:subjectId/mark`
- Grades and attendance are **not** added to the AI's student context, because PR #12 keeps marks out of
  what the AI receives.

### Verification

- **Unit tests:** `src/tests/academic_records.test.ts` (6 tests) covers:
  - each grade scale
  - credit-weighted SGPA and CGPA
  - backlogs
  - reachable and unreachable targets
  - classes you can miss or must attend
  - input validation
  - per-student separation
  - sidebar links
- **Browser check (production build, run locally):**
  - Two semesters entered (A+ 4 credits and B 3 credits gave SGPA 7.71; an F in semester 2 gave CGPA 4.91 and
    1 backlog). The values survived a page reload.
  - A target of 8 needed SGPA 9.03 over the next 6 semesters, which matches the hand calculation.
  - Attendance at 20 of 30 said "attend the next 10". After two Present taps it read 22 of 32 (68.75%) and
    "attend the next 8", and this survived a reload.
- **All 53 sidebar pages** at 1440 px and 390 px: 0 page errors, 0 crashes, 0 horizontal overflow.
- **Automated checks:** `vitest` 1042 passed, 10 skipped. `tsc` and the build both pass.
