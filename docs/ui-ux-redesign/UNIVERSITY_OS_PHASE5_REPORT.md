# Personal AI University OS: Phase 5 (Career and professional development) report

Date: 2026-11-15. Branch `claude/project-thread-lyg4zq`. This follows PR #18 (Phase 4) and PR #19 (System Design Lab fixes).

## Phase 5 scope against the brief

| Brief module | What this PR does |
| --- | --- |
| Career Roadmap Generator (13) | Extends **Career Roadmap**. Adds the 6 missing tracks, lets a student hold several goals, compare them and drop one, and counts progress only from real activity. A goal is never picked for the student. |
| AI Interview Arena (14) | Extends **Mock Interviews**. Adds **project-based** and **communication** interviews, delivery and time measures on every answer, and a first-to-latest comparison for each interview type. |
| Student Digital Portfolio (15) | Extends **Portfolio Showcase**. Adds privacy switches for Education, Research projects and Competition results, plus an Export resume link. New sections start private. |
| Hackathon and Competition Hub (16) | New **Competition Hub** page. Verified contests, events the student adds with their source, participation history, submissions, self-reported results, teams with join codes and team task boards. |
| Opportunity Intelligence (17) | Extends the **Application tracker**. Adds Interested, Preparing and Closed statuses and 10 opportunity types, with a type filter. Jobs Discovery already keeps a source and verification status on every listing. |

## Deliverables

### 1. New page: Competition Hub (`/competitions`, Career → Competition Hub)

**Discover**
- **Verified coding contests** come from the Codeforces public API, labelled Verified, with the time the list was fetched.
  - When Codeforces cannot be reached, the page says so and lists nothing in their place.
- **Events you added**: the student adds a hackathon, innovation challenge, research competition, technical event or project showcase.
  - The web page it came from is required (http/https only).
  - Each event is labelled "Added by you", with the source's site and the date the student last checked it.
  - After 14 days the event shows a warning that it may have changed. "I checked it again" resets the date.
  - The hub never fills in dates, eligibility or prizes. Empty fields show "Not entered".
- **Coming up** lists registration deadlines and start dates, taken only from the contest feed and from what the student entered.
- **Filter by kind.**

**My participation**
- Status for each event: Interested, Registered, Participated or Withdrawn.
- Team link, project submission (title, description, repository and demo links) and result (outcome, rank, note and proof link).
- Results are labelled self-reported. A proof link is encouraged.

**Teams**
- **Create:** a team has a name, an optional event and the creator's display name in the team.
- **Join:** with an 8-character join code that avoids look-alike characters.
- **Privacy:** members see each other only by the display name they chose, never by account name or email. Only the owner sees the join code.
- **Owner controls:**
  - Rename the team.
  - Make a new code; the old code stops working.
  - Remove a member; the code changes, so a removed member cannot rejoin with it.
- **Leaving:**
  - When the owner leaves, the longest-standing member becomes owner and the code changes.
  - An empty team is deleted.
- **Shared work:** a task board (To do, Doing, Done) with assignee and due date, and a team project with description, repository and demo links.

### 2. Enhanced pages

- **Career Roadmap (`/career/roadmap`)**
  - **Goals:** a new student chooses goals from all 19 tracks. Before, the page silently generated a Software Development Engineer roadmap.
  - **Several goals at once:** each goal is a tab. "Add a career goal" adds another, and "Remove this goal" drops one.
  - **Compare my goals:** shows, for each goal, the steps backed by activity, the steps still to do and the next step. It links to the role-requirements comparison in Career Explore.
  - **Activity-backed progress:** each step shows "Done" or "Not yet" with the activity behind it. Progress counts only those steps.
  - **Self-marking:** the old tick is now "Mark for myself". It is shown, but it does not change progress.
- **Mock Interviews**
  - **Project-Based Interview:**
    - Asks about architecture, the student's own part, decisions and testing, using only the projects they created in Projects.
    - Without a model, it uses three question angles per project.
    - A student with no project is told to add one first.
  - **Communication Practice:**
    - 6 catalogue questions: explaining to a non-technical listener, summarising work, explaining a trade-off, explaining a failure, teaching a concept, and asking clarifying questions.
    - Rubric: clarity, structure, relevance and audience.
  - **Every answer** now records word and sentence counts, filler words, signposts, STAR parts found and pace (when the answer was timed), with short notes.
  - **Every report** has a "Delivery and time" panel that compares time used with time planned. It states that these counts are not a measure of confidence or ability.
  - **Analytics:** each interview type shows first score, latest score and the change. The score trajectory is now sorted by date and covers the last 10 sessions.
- **Portfolio Showcase**
  - **New switches:** Education (branch and semester), Research projects and Hackathon and competition results.
  - **Defaults:** Research and Competitions start off for everyone, including existing shared portfolios, so nothing new is published without the student choosing it. Education starts on, because it was always shown before.
  - **Competition results** come from the Competition Hub. They show the proof link, or "Self-reported" when there is none.
  - **Export my resume:** a new button that opens the Resume builder.
- **Internships / Applications**
  - **New statuses:** Interested, Preparing and Closed.
  - **Opportunity types:** internship, job, scholarship, fellowship, research internship, graduate programme, open-source programme, startup programme, entrepreneurship and international, with a type filter.
  - **Board:** the kanban now shows Saved, Interested, Preparing, Applied, Assessment, Interview and Offer.
  - **Applied count:** it no longer counts Interested or Preparing.

### 3. Navigation

- Career → Competition Hub (`/competitions`; `/hackathons` also opens it).

### 4. APIs

All routes need sign-in, and identity comes from the verified session.

- `GET /api/v1/competitions/feed`: verified contests, the student's events, tracked items and upcoming dates.
- `POST /api/v1/competitions/events`, `PATCH|DELETE /api/v1/competitions/events/:id`, `POST /api/v1/competitions/events/:id/recheck`
- `GET /api/v1/competitions/participation`
- `PUT|DELETE /api/v1/competitions/participation/:ref`, where `:ref` is `cf:<contest id>` or `ev:<event id>`.
- `PUT /api/v1/competitions/participation/:ref/submission`, `PUT /api/v1/competitions/participation/:ref/result`
- `GET|POST /api/v1/competitions/teams`, `POST /api/v1/competitions/teams/join`, `GET|PATCH /api/v1/competitions/teams/:id`
- `POST /api/v1/competitions/teams/:id/code`, `POST /api/v1/competitions/teams/:id/leave`, `DELETE /api/v1/competitions/teams/:id/members/:member`
- `POST /api/v1/competitions/teams/:id/tasks`, `PATCH|DELETE /api/v1/competitions/teams/:id/tasks/:taskId`
- **Changed:**
  - Career roadmap responses now include `steps[].evidence`, `verified_progress` and `self_marked_done`.
  - `PATCH /career/roadmaps/:id/steps/:stepId` now rejects an unknown status (400). Before, it stored any value.
  - `POST /mock-interviews/sessions` accepts `PROJECT` and `COMMUNICATION`. Answers include `delivery`, and reports include `delivery_summary`.
  - Interview analytics include `first_score`, `latest_score` and `change` for each type.
  - `PUT /showcase/me` accepts the three new sections.
  - `POST|PATCH /applications` accept `opportunity_type` and the new statuses.

### 5. Database and migrations

There are no migrations.

- One new persisted store, `competitions`, registered with the existing state store. It holds events and participations by student, and teams by id.
- **Limits:**
  - 100 events and 200 tracked items per student.
  - 20 teams per student.
  - 8 members and 100 tasks per team.
- The 6 new career tracks are seed data in `server/db/seedCareerTracks.ts`. Restoring a snapshot merges with the seeds, so they appear on existing deployments.

### 6. AI integrations

- **Project-based interview:** the model gets the student's project titles, descriptions and technologies only (no name, email or college). It is told to ask only about those projects and not to invent details.
- **Communication practice:** the model is told to judge clarity and structure, not trivia.
- **Without a model:** both new types still work from the catalogue and from the project templates.
- **Delivery measures** are counts from the answer text and never come from the AI.
- No new AI routes, so the rate limiter is unchanged.

### 7. Security and validation

- **Ownership:**
  - Events, participation and results belong to the student.
  - Another student gets 404 for them, and for a team they are not in, so team ids cannot be probed.
- **Links:** every stored link must be http or https. A `javascript:` link is refused.
- **Teams:**
  - Join codes are random.
  - Only the owner sees the code and can rename the team, change the code or remove members.
  - Member responses carry opaque keys (`me`, `m1`, `m2` and so on), not account ids.
  - Tasks can be assigned only to members.
- **Contest references** are resolved only from the live Codeforces list or the student's own events, so a client cannot inject an event title.
- **Portfolio:** new sections are private by default.

### 8. Tests

- `src/tests/competition_hub.test.ts` (9 tests):
  - Ordering and deadline helpers, join codes, link checks and navigation.
  - **Over HTTP with three accounts and a stubbed Codeforces response:**
    - 401s and the verified feed with its source.
    - Event validation: source required, `javascript:` refused, end before start refused.
    - Cross-account 404s and tracking a contest.
    - Submission, result validation and self-reported results.
    - Teams: join by code, display names only, code hidden from members, tasks, owner-only actions, removal changing the code, deleting an empty team and handing ownership over.
- `src/tests/phase5_career.test.ts` (12 tests):
  - All 17 brief tracks are present, and the new tracks' course ids exist.
  - Step evidence rules.
  - Delivery measures and session summary.
  - The new interview types exist.
  - **Over HTTP:**
    - No goal is chosen for a new student, and several goals can be held.
    - A self-marked tick does not count, and an unknown status gets 400.
    - Another student cannot read a roadmap.
    - A created project verifies the project step.
    - A project interview is refused without a project and grounded in the student's project, with delivery recorded.
    - Communication practice works.
    - New portfolio sections default to private.
    - Scholarships can be tracked through the new statuses, and another student is refused.
- `src/tests/mock_interviews_master.test.ts`: the category test now expects 14 types.
- Results:
  - `npm test`: **79 files passed, 2 skipped; 1,143 tests passed, 10 skipped, 0 failed.**
  - `npm run lint` (`tsc --noEmit`): clean.
  - `npm run build`: succeeds.
- **Browser check** (Playwright, local server, two new accounts):
  - Added an event and marked it registered. It appeared under Coming up (2 dates) and in My participation.
  - Created a team, and the second account joined with the code. The owner saw both members (Asha, Ravi) and added a task assigned to Ravi.
  - Career Roadmap showed the goal picker with 19 tracks. Data Engineer and Product Manager were added, and the comparison and 13 steps showed.
  - Mock Interviews listed the Project-Based and Communication types.
  - Portfolio showed the three new switches.
  - The tracker showed the type filter.
  - At 390 px: no horizontal overflow on Competition Hub or Career Roadmap.
  - No page errors and no failed API calls.
  - The sandbox has no route to Codeforces, so the hub showed its "could not be reached" message there. The live site reaches Codeforces; the Daily Briefing already shows its rounds.

Screenshots:

- `screenshots/competition-hub.png`
- `screenshots/competition-hub-team.png`
- `screenshots/competition-hub-mobile.png`
- `screenshots/career-roadmap-goals.png`
- `screenshots/career-roadmap-mobile.png`
- `screenshots/interview-arena-types.png`
- `screenshots/portfolio-sections.png`

### 9. Known limitations

- **Only Codeforces is verified automatically.**
  - Devpost, Unstop, MLH and similar platforms have no public listing API that this app is set up to use.
  - Students add those events themselves, with the source link.
  - Scholarships, fellowships and graduate programmes likewise have no verified feed. The tracker records them with the student's own link.
- **Self-reported results:** competition results are what the student entered. A proof link helps, but the app cannot confirm a result.
- **Thresholds for roadmap evidence** are fixed, are shown on each step, and are a rule of this app, not an industry standard:
  - All lessons of a course.
  - 10 solved DSA problems.
  - 1 project.
  - 1 completed mock interview.
  - Recorded, non-self-declared evidence for the matching skill.
- **No preparation timeline:** the roadmap gives no estimated preparation time, because there is no real data to base one on.
- **Delivery measures** are text counts. For voice answers they depend on the browser's transcript. They do not measure confidence.
- **Teams** see shared work only inside the hub. There is no chat or file sharing; the team project links to the repository instead.
- **No custom portfolio address:** custom portfolio URLs or subdomains need domain infrastructure that is not set up, so the share link stays a random path.

### 10. Environment variables and external configuration

None new.

### 11. Status by feature

| Feature | Status |
| --- | --- |
| Competition Hub: verified contests, own events, participation, results, teams, tasks | Fully implemented |
| Other hackathon platforms, scholarship and fellowship feeds | Not available: no supported public API; students add them with a source link |
| Career tracks (17 from the brief), several goals, comparison, activity-backed progress | Fully implemented |
| Preparation timeline estimate | Not done (no real data to base it on) |
| Project-based and communication interviews, delivery measures, progress over time | Fully implemented; AI questions need the configured provider, otherwise catalogue and templates |
| Portfolio privacy for new sections, resume export link | Fully implemented |
| Custom portfolio URL or subdomain | Not available (needs domain infrastructure) |
| Opportunity statuses and types | Fully implemented |

## Files

- **New:**
  - `server/services/competitionHubService.ts`
  - `server/api/routes/competitions.ts`
  - `server/services/interviewDelivery.ts`
  - `server/db/seedCareerTracks.ts`
  - `src/features/competitions/pages/CompetitionHubPage.tsx`
  - the two test files
  - this report and its screenshots
- **Changed:**
  - `server/api/router.ts`
  - `server/app.ts`
  - `server/db/database.ts`: `getCourseCompletion`
  - `server/db/seedCareerResume.ts`
  - `server/db/mockInterviewCatalog.ts`
  - `server/models/mockInterviewTypes.ts`
  - `server/models/learningModulesTypes.ts`
  - `server/services/careerService.ts`
  - `server/services/mockInterviewEngineService.ts`
  - `server/services/showcaseService.ts`
  - `server/services/learningModulesService.ts`
  - `src/App.tsx`
  - `src/components/navigation/navConfig.ts`
  - `src/features/career/api/careerApi.ts`
  - `src/features/career/pages/CareerRoadmapPage.tsx`
  - `src/features/mock-interviews/` (types, dashboard, report)
  - `src/features/showcase/` (view, page)
  - `src/features/applications/pages/ApplicationTrackerPage.tsx`
  - `src/types/learningModules.ts`
  - `src/tests/mock_interviews_master.test.ts`

## Next

- **Phase 6, Research:** Research Intelligence and the paper library.
- **Phases 7 and 8:** Cross-platform, then QA.
