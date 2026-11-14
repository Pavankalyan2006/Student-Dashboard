# Personal AI Agent: One Student Context Across the Platform

Date: 2026-11-14. Requested by the owner after the "Recommended for you" panel removal.

## What the owner asked for

There should be no repeated suggestion box. Instead, the whole platform should behave as one personal AI assistant
for each registered student:
- It uses the information the student gave at registration and in their profile.
- That information comes from one backend source.
- It is applied on every page and in every AI answer.
- It updates as soon as the profile or activity changes.
- It never uses hardcoded or fake data.

## What was found

The central profile (`server/services/studentProfile/`) already held the student's data. However, only two parts of
the platform read it: the AI Tutor orchestrator (`server/ai/orchestration/master.ts`) and the job AI. Around 30 other
AI services generated answers with no knowledge of the student:
- notes, quizzes, flashcards, doubts
- mock interviews, GATE, coding, DSA, SQL, ML and System Design
- placements, career and resume
- research, projects, documents, knowledge base, languages

Forms also opened on fixed values such as "Operating Systems", "Software Development Engineer", GATE paper "CS" and
20 hours.

## What was built

### 1. One student context for every AI call (backend)

- `server/core/requestContext.ts`:
  - An AsyncLocalStorage request context.
  - It is set right after authentication, in `server/app.ts`, for every API request.
  - It records which student the request serves.
- `server/ai/personalization.ts`:
  - Builds a short "student context" block from the central profile:
    - academic: degree, branch, year, semester, current subjects
    - skills and proficiency
    - learning language, style and level
    - target roles, goals and competitive exams
  - Adds the student's live state from their records: current course and lesson, recent activity, weak areas from
    their results, and what is still planned today.
  - Adds module-specific detail where it changes the answer:
    - study availability for the planner
    - projects, experience and industries for interviews, career and jobs
- `AIService.generate` and `AIService.stream` append this block automatically.
  - Every AI feature that serves a signed-in student now answers for that student.
  - None of the 30 services had to change.
  - The block is added once, even when a caller already includes it.
- The block is rebuilt on every request, so a profile edit or a finished activity applies to the very next AI answer.
- Privacy: the block never contains the student's name, email, phone, college, university, marks or any id. A test
  checks this.
- Switch: `AI_PERSONALIZATION=off` disables it.

### 2. Pages start from the student's own data (no suggestion boxes)

| Page | Before | Now |
| --- | --- | --- |
| Quiz generator | Medium difficulty, empty topic | Difficulty from the student's level; one-click topics from their subjects and interests |
| Notes generator | Intermediate level | Level from profile; one-click topics from their subjects |
| Flashcards AI generator | "Computer Science", intermediate | First profile subject, profile level, subject quick-picks |
| Doubt Solver | Fixed "Database Management Systems", fixed list | Student's subjects listed first and preselected |
| Mock interview setup | "Software Development Engineer", intermediate | Student's target role (catalogue match or custom), profile level |
| Study Planner | New plan 20 hours; empty subject | New plan uses the student's weekly study hours; subject field suggests their subjects |
| Jobs | Empty search | One-click search for the student's target roles |
| GATE | Every new student on paper CS, 18 h, fixed days | Paper from the student's GATE choice or branch (CS, EC, EE, ME, CE, DA…), their weekly hours and study days; new planner tasks use their paper (was always "CS") |
| Courses | Branch/semester from the account record | Subjects the student listed rank first, then branch and semester from the central profile |

The quick-pick chips sit inside the form field they fill ("Your subjects: OS, DBMS"). They are not a separate panel.

### 3. "Personalised" chip in the top bar

The chip shows exactly what the assistant knows about the student on the current page. These are the same lines
the AI receives, from `GET /api/v1/profile/me/ai-context?page=`. It links to "Update my profile" and "Ask my AI
tutor", and it refreshes when the profile is saved.

## Verification

### End to end, local

Two students registered through the API with different profiles:
- **Asha:** CSE, semester 5, Backend Developer, English, advanced.
- **Ravi:** ECE, semester 3, Embedded Engineer, GATE EC, Telugu, foundational.

| Check | Asha | Ravi |
| --- | --- | --- |
| AI context lines | Her subjects, Python, deep-dive, Backend Developer, her goal | His subjects, C, Telugu, simple explanations, Embedded Engineer, GATE EC |
| GATE workspace | Paper CS, 14 h | Paper EC, 8 h |
| First courses | Operating Systems… | Digital Electronics, Signals and Systems… |
| Quiz topic picks | Her subjects | Signals and Systems, Digital Electronics |
| Doubt subject | Her subject | Signals and Systems |
| "Recommended for you" anywhere | No | No |
| Footer | Designed for Asha Rao | Designed for Ravi Kumar |

**Profile change:** Asha changed her subjects to Computer Networks through the API. On the very next request and page
load, the context lines, the chip, the quiz picks and the doubt subject all showed Computer Networks. In-app saves also
refresh the chip and forms without a reload, through the existing profile cache invalidation. An AI chat request was logged with
`personalized: true`.

### Tests

- `src/tests/ai_personalization.test.ts`:
  - the content of the context
  - no personal identifiers
  - module-specific detail
  - an empty profile gives no context
  - path-to-module mapping
  - the block is added once
  - `AIService` passes the block to the model for both generate and stream
  - the middleware is wired after authentication
- `src/tests/profile_personalization_pages.test.ts`:
  - profile defaults
  - level mapping
  - GATE paper from choice or branch
  - subject ranking for courses
  - every listed form reads the profile
  - the chip is present and the old panel is absent

## Notes

- The earlier "Recommended for you" screenshot came from a browser tab opened before PR #11 went live. The live
  bundle no longer contains that panel. A hard refresh (Ctrl+Shift+R) clears it.
- Recommendation endpoints are kept on the backend. They are not shown as panels.
