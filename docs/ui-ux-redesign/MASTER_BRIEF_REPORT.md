# Master Development Brief: implementation report

Date: 2026-11-14. Branch `claude/project-thread-lyg4zq`. Earlier work on this brief is in PRs #9 to #14 (design system, Pilot Feedback removal, footer name, shared AI context, Discover, Analytics, Mistakes, Grades, Attendance), all merged and verified live.

This report covers what this PR adds and states plainly what was not built and why.

## 1. Features implemented and improved

| Area | What changed |
| --- | --- |
| AI Memory (`/ai-memory`) | New page. Shows the exact lines every AI request receives. Two switches: "Personalise AI answers" (off means the AI gets nothing about the student) and "Use my recent activity". Up to 20 notes the student asks the AI to remember, which are added to every AI request. Conversation history with delete. |
| Deadlines (`/deadlines`) | New page. One timeline of semester exams and assignments, slip tests, goals, study plans, project milestones, saved applications and the GATE date. It groups items as overdue, next 7 days, next 3 weeks and later. It flags exams on the same or back-to-back days and weeks with 3 or more deadlines, and suggests when to start preparing. Dates can be added (saved to the semester calendar) and exported as an `.ics` file. |
| Coding contests | Upcoming rated rounds from the official Codeforces API, with attribution. One click adds a contest to Deadlines. When Codeforces is unreachable the page says so and shows no contests. |
| Portfolio Showcase (`/portfolio`) | New page built on the existing portfolio data: skills, projects (platform and onboarding), certificates with verify links, earned achievements and featured GitHub repositories. Sharing is off by default. When on, it gives a random link (`/showcase/<link>`) that works without sign-in and shows only the ticked sections. Name display is optional, a new link can be made at any time, and it prints to PDF. |
| Personalised chip | Shows when personalisation is off and links to AI Memory. |
| Semester calendar | New events keep only known fields, within limits. |

## 2. The brief's 10 modules: built, extended or not built

| # | Module | Decision |
| --- | --- | --- |
| 1 | AI Command Center | **Already exists.** The AI Tutor (`/ai-agent`) runs tools across modules, and the command palette (Ctrl K) jumps to any page. A second hub would duplicate them. |
| 2 | Personal Knowledge Graph | **Not built.** Weak concepts are already found from real results in Mistake Notebook and Learning Analytics. A graph needs reliable links between notes, courses and topics, and the data has no such links today. |
| 3 | Research Intelligence Center | **Already exists.** Research (`/research`) has papers, literature review, gaps and citations. Discover (`/discover`) gives cited answers from Wikipedia, OpenAlex and the student's own notes. |
| 4 | AI Workflow Automation | **Not built.** It needs a scheduler that runs while the student is away, and the Vercel serverless deployment has none configured. AI Tutor tools already ask for confirmation before consequential actions. |
| 5 | Collaborative Study Rooms | **Not built.** Live rooms need persistent real-time connections, which Vercel serverless functions do not keep. Community Q&A, Discussions and Shared Resources cover asynchronous study together. |
| 6 | Portfolio and Achievement Showcase | **Built**, by extending the existing portfolio data (section 1). |
| 7 | Scholarships and Competitions | **Competitions built** from the official Codeforces API. **Scholarships not built:** there is no reliable public scholarship API, and listing schemes by hand would go stale or be wrong. |
| 8 | Academic Calendar and Deadline Intelligence | **Built**, by extending the semester calendar (section 1). |
| 9 | Offline Learning Center | **Not built** as a module. A service worker that caches the app can serve stale code after a deploy, which the lazy-loaded pages are sensitive to. Offline use is covered in part by the `.ics` export and print-to-PDF. |
| 10 | Personal AI Memory Center | **Built** (section 1). |

## 3. UI and UX changes

- Three new pages use the shared design system (PageHeader, MetricCard, PageSection, Button), with loading, empty, error and success states.
- New sidebar entries: Overview → Deadlines; Workspace → Portfolio Showcase and AI Memory.
- The public showcase is a standalone page with no app chrome. It is marked `noindex`.
- All three pages were checked at 1440 px and 390 px with no horizontal overflow.
- Labelled controls: the switches use `role="switch"` and `aria-checked`, and the delete buttons name the item they delete.

## 4. Backend and database changes

- New services:
  - `server/services/aiMemoryService.ts`
  - `server/services/deadlineMath.ts` (pure, shared with the page)
  - `server/services/deadlineService.ts`
  - `server/services/showcaseService.ts`
- New routes, all under `/api/v1`:
  - `GET/PATCH /ai-memory/me`
  - `POST /ai-memory/me/notes`
  - `DELETE /ai-memory/me/notes[/:id]`
  - `GET /deadlines/me?tz=`
  - `GET /deadlines/contests`
  - `GET/PUT /showcase/me`
  - `POST /showcase/me/new-link`
  - `GET /showcase/public/:link` (the only one without sign-in)
- New persisted stores `aiMemory` and `showcase`, registered with the existing state store (Supabase `app_state_entries` in production). No schema migration is needed.
- `server/ai/personalization.ts` reads the AI Memory switches and notes for every AI request and for the context summary.

## 5. Security improvements

1. **AI tools sent personal data to the AI provider.**
   - `get_student_profile` returned name, email, username, college and account id.
   - `get_student_context` returned name, account id, institution, school marks, entrance rank, family and financial context, and persona text that embeds the name.
   - Both now return study fields only, and return nothing when personalisation is off.
2. **Search showed other students' items.** `GET /search` needed no sign-in and returned the titles of another student's documents and projects. It now requires sign-in and returns only the searcher's own documents and projects. The AI document-search tool had the same gap and now searches only the student's own documents.
3. **Semester events stored any field sent.** A request could store arbitrary fields and values. Only known fields are kept now, each with a length or format limit.
4. **AI Memory notes are cleaned.** Emails, phone numbers and links are removed before a note is saved, so they never reach an AI prompt.
5. **Public showcase protections.**
   - Opt-in only, with a 72-bit random link that can be replaced.
   - Served with `no-store` and `noindex`.
   - Never includes email, phone, college or ids. The name is optional.
   - Shows public repositories only.
6. **Identity comes from the signed-in session.** Every new private route uses `req.user` from the verified session, never an id the client sends.

## 6. Tests and results

- `npm test`: **71 files passed, 2 skipped; 1,069 tests passed, 10 skipped, 0 failed.**
- `npm run build`: succeeded. `tsc --noEmit`: clean.
- New file `src/tests/ai_memory_deadlines_isolation.test.ts` (17 tests):
  - Note cleaning, limits and ownership.
  - The AI context includes the notes, and is empty when personalisation is off; it never contains the name or email.
  - `forModel` strips identity and school data.
  - Deadline grouping, clashes, busy weeks, suggested start and `.ics` output.
  - Codeforces parsing, and the failure path shows no invented contests.
  - **Two real accounts over HTTP**, registered against the running app:
    - Unauthenticated requests get 401.
    - Student B cannot see or delete A's AI notes, events, deadlines or grades.
    - Each student's AI context holds only their own notes.
    - Showcase links work only while enabled, stop working when replaced, and never contain email or ids.
    - Search returns no other student's documents or projects.
- Updated `ai.test.ts` and `student_onboarding_intelligence.test.ts`. They previously asserted that email and id **were** in AI tool results; they now assert that they are absent.
- Browser check with Playwright on the seeded demo account, desktop and mobile:
  - AI Memory: a note was added and the email inside it was removed. The note appeared in "What the AI receives". The off switch emptied the context.
  - Deadlines: two minor exams added on back-to-back days were flagged, and the `.ics` file downloaded.
  - Showcase: the share link opened in a signed-out browser without the email, and showed "not shared" after sharing was turned off.
  - No page errors. The only console errors were requests to external hosts this test machine blocks (Google Fonts and Codeforces).
- **Not verified yet:** live Codeforces data, because this machine cannot reach codeforces.com. It is checked on the live site after merge.

## 7. GitHub status

Committed to `claude/project-thread-lyg4zq` and opened as a pull request against `main`. No force-push, and no one else's work was changed.

## 8. Deployment and live verification

**Not deployed.** The brief gives no deployment authorization, so the PR is left for the owner to merge. After the merge, Vercel deploys as usual, and these are checked on the live site: AI Memory, Deadlines (including live Codeforces contests), the showcase link, and the search fix.

## 9. Remaining issues

- Not built: Knowledge Graph, Workflow Automation, Study Rooms, Scholarships and the Offline Center, for the reasons in section 2.
- Each student's state is one JSON entry in the state store; very large accounts would be better served by real tables.
- Earlier open items: four high `npm audit` findings in Firebase/gRPC need a major upgrade; two dollar amounts in one sentence can render as maths.
- Codeforces is the only contest source with an official public API. CodeChef, LeetCode and HackerRank have none, so they are not included.
