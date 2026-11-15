# University OS: Phase 7 (Cross-platform intelligence)

Phase 7 covers brief Part 8 ("Advanced student experience"). It extends the existing search box, Daily Briefing, notification settings and AI tools. No new dashboard or "Recommended for you" panel was added.

## What changed

### Global search (Ctrl+K)

**Before:** the search box only looked through a fixed list of items written into the app's seed data. Course entries pointed to the general `/courses` page, and a student's own notes, research, previous papers, code and AI chats could not be found.

**Now** (`server/services/globalSearchService.ts`, same `GET /search` endpoint): every search reads live data. It covers:

| Category | What is searched | Who can see it |
|---|---|---|
| Courses | the live course catalogue (each result links to its own course page) | shared |
| Subjects & topics | the student's knowledge graph (syllabus subjects and topics with their state) | only the student |
| Notes | title, description, content, tags | only the student |
| Documents | title and description, then the text of each page. A match inside the file opens that page (`/documents/:id/page/N`) | only the student |
| Projects | title, description, problem statement, domain, tags | only the student |
| Research | research projects, saved papers (authors, abstract, notes) and ideas | only the student |
| Previous papers | paper title, subject, exam and question text | only the student |
| Code | code-review files and summaries, and ML Lab workspace files | only the student |
| AI chats | conversation titles and messages | only the student |
| Opportunities | application tracker entries and Competition Hub events the student added | only the student |
| Community | the existing community index | shared |

How results are matched and shown:

- **Matching:** every word typed must appear in the item. Title matches rank above content matches.
  - A word matches at the start of a word in the item, so "pag" finds "paging" but "metr" does not match inside "symmetric".
  - Two-letter words, such as "os", must match a whole word.
  - Hyphenated terms such as "METR-LA" stay together.
  - Live checking showed that the first version matched letters anywhere inside words, so "METR-LA" returned unrelated courses. This was fixed in a follow-up.
- **Each result shows:**
  - where it came from, such as "Your documents · page 2"
  - where the words matched
  - a passage around the match
  - "only you can see this" for private items
- **Category counts:** each category chip shows how many results it has.
- **Failed sources:** a source that fails is named under the results, so missing results are not a silent gap.

### Recommendations

**Before:** `RecommendationService` returned the same four hard-coded items to every student, such as "Attention Is All You Need" and a "Distributed Storage Node" task. These were served by `/learning/recommendations` and the AI tool `get_recommendations`.

**Now:**

- **At most three next activities:**
  - from the Daily Briefing, which is built from the student's own deadlines, planned tasks, due flashcards, open mistakes, knowledge-graph gaps and attendance
  - plus the next step without evidence on an active career roadmap
- **Each one shows:** why it is suggested and which record it came from.
- **Dismissing:** dismissing or postponing an item in the briefing removes it here too, and "add to plan" changes it. There is only one place to dismiss, not a second list.
- **New students:** a student with no records gets an empty list.
- **No new panel:** recommendations are shown where they already lived, in the Daily Briefing and through the AI tools.

### Notification intelligence

- **The brief's 8 categories:** upcoming assignments, examination dates, study reminders, project deadlines, revision activities, saved opportunity deadlines, team updates and interview sessions (`server/services/notificationCategories.ts`). Each one is switched on or off under Settings → Notifications → Reminders.
- **Reminder lead time:** the student chooses 1, 2, 3, 5, 7 or 14 days.
- **Built from recorded dates only:**
  - semester calendar and slip tests
  - project milestones
  - study planner tasks for today
  - due flashcards
  - application deadlines, interview dates and assessment dates
  - Competition Hub registration dates the student added
  - team tasks assigned to the student
- **Sent once:** each reminder carries a key, so it is sent only once. That key was being dropped when a notification was stored; this is fixed.
- **Older switches still apply:** for example, turning off "exam reminders" also silences exam dates.
- **When reminders are checked:** at most once an hour, when the student opens notifications.
- **Delivery:** reminders appear in the app. Email delivery is not connected on this deployment, and the settings page says so.

## Already in place (not rebuilt)

- **Activity versus mastery:** the Knowledge Graph (Phase 2) separates activity (learning, practiced) from demonstrated mastery, which needs at least 3 correct answers at 70% or better. Each topic shows the rule that set its state.
- **Productivity:** the Daily Briefing already sends items to the Study Planner ("add to plan" with minutes and date). Deadlines, goals and study plans already feed the briefing.

## Not done, and why

- **Email or push delivery:** no email or push provider is configured.
- **Calendar sync:** Google Calendar and similar are not connected.
- **Typo-tolerant or semantic search:** search is word-based, so a typo finds nothing. Semantic search would need a vector index across all of a student's stores.

## Testing

- **`src/tests/phase7_cross_platform.test.ts` (10 tests):**
  - search matching and snippets, including word-start matching, whole two-letter words and hyphenated terms
  - reminder building for all 8 categories, including the lead time, closed applications, finished team tasks and the goal exclusion
  - category switches and older switches
  - search over HTTP: notes and document pages are found with page links, another student sees nothing, and signed-out requests get 401
  - course results link to their own course page
  - a new student gets no made-up recommendations
  - category and lead-time settings are saved, and an invalid lead time is rejected
  - a milestone reminder is not sent when its category is off, and is sent only once
- **Full suite:** 1,167 passed and 10 skipped (after the matching follow-up). `tsc` is clean and the build passes.
- **Browser check:** searching "paging tlb" found the student's research project, their note, the OS course and page 2 of their uploaded PDF, each with its source. The reminder settings rendered, there were no page errors, and a new student's recommendations were empty.

- **Live check after merge:**
  - A PDF uploaded on the live site was read, and the import found its title, 3 authors, year and 2 references.
  - Ask-a-paper answered from page 2 with the quoted passage.
  - Search found the PDF's page 2, and course results opened their own pages.
  - Recommendations showed 3 study-planner items, each with its source.
  - All test data was deleted afterwards.

Screenshots: `screenshots/global-search.png`, `screenshots/reminder-settings.png`.

## Next phase

- Phase 8 (QA).
