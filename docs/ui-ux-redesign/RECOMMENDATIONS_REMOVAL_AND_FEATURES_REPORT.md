# Recommendation Panels Removed, New Workspace Features, End-to-End Sweep

Date: 2026-11-14. All results below are from actual runs.

## 1. "Recommended for you" removed from pages

The recommendations still exist as backend operations; only the student-facing panels are gone.

| Where | What was removed | Notes |
| --- | --- | --- |
| 14 module landing pages (Courses, Coding Lab, DSA Lab, SQL Lab, ML Lab, System Design, GATE, Mock Interviews, Career, Jobs, Placements, Study Planner, plus the `/coding-lab` and `/dsa-lab` aliases) | The "Recommended for you" panel that `App.tsx` injected above the page | `ProfileRecommendationsPanel` and the unused `useProfileRecommendations` hook were deleted |
| Unified Progress | "Targeted Resource Recommendations" panel | The page no longer calls `getRecommendations()`; the "observations" card now spans the full width |
| Dashboard | "Recommended Next Steps" card (`RecommendedLearning.tsx` deleted) | |
| Dashboard, coding widget | A hard-coded "Recommended Practice: Two Sum" card | Replaced with a "Continue practising" link to the Coding Lab |
| Dashboard, career widget | "Recommended Next Skill", which fell back to a fixed "System Design & APIs" | Now shows the real count of tracked skills and how many are still building evidence |
| Career Dashboard | "Recommended Next Actions" | |
| Research | "Recommended Topics for B.Tech" (a fixed list of four topics) | |
| Mock Interviews | "Recommended Next Step" banner | The track list is now titled "Popular Practice Tracks" |
| Goal detail | "Recommended Platform Resources for this Goal" | The page no longer calls `getGoalRecommendations()` |
| Study Planner | An "AI Recommendation" card with a fixed text, and per-task recommendation lines | The card now shows **Planned Time Today** (sum of open tasks' minutes) and opens the Focus Timer |
| System Design analytics | Fixed fallback "weak concepts" shown when the student had none | Shows only the student's own weak concepts, or an explanation |
| Quiz, Coding Lab | Catalog headings that said "Recommended" | Renamed "Quiz Catalog & Topic Practice" and "Practice Problems" |

Kept on purpose: feedback that is the result of the student's own work (quiz result next steps, interview report
improvement plan, skill-gap analysis, weak-area actions), because those are the output of that feature, not a
"for you" panel.

Backend kept: `GET /api/v1/profile/me/recommendations/:module`, the community recommendations and goal
recommendation endpoints, and their API clients. A test asserts the endpoint and client still exist.

## 2. New features

| Feature | How it works | Data |
| --- | --- | --- |
| Command palette (Ctrl+K or /) | Page names match instantly as you type (name, group, URL words), then content results from the search API. Empty box shows your recent pages. Arrow keys, Enter, Esc. The internal "API: GET /api/v1/search" label was removed. | Sidebar config; existing search API |
| Pin pages to the sidebar | Star next to the page title in the top bar. Pinned pages appear in a "Pinned" group at the top of the sidebar (max 8). | Stored in this browser under the student's id |
| Recent pages | The last 6 sidebar pages you opened, shown in the palette. Sub-pages count as their sidebar page. | Same per-student storage |
| Keyboard shortcuts | `?` lists them; `/` search; `[` collapse sidebar; `g` then `d/c/n/f/s/p/a/j` jumps to Dashboard, Courses, Notes, Flashcards, Study Planner, Progress, AI Tutor, Jobs. Ignored while typing. | — |
| Focus Timer (`/focus`, Personal Workspace) | Pomodoro timer with 25/5, 50/10 and 15/3 presets, a progress ring, tab-title countdown and a chime. Link a session to one of today's study planner tasks and mark it done. Shows focus today, last 7 days (bar chart), streak and open planner tasks. | Planner tasks from `/study-planner/today`; finished sessions stored per student in this browser |
| Profile checklist actions | "Add …" buttons in the profile completion card now scroll to and focus the form, even when that tab is already open (previously the click did nothing visible). | — |

## 3. End-to-end sweep

Script: a local version of `scripts/pilot/production-deep-click.cjs`. It signs in through the real login form, and on
every sidebar page clicks every visible button, tab and in-app link in the main content (fresh page per click).
It records uncaught errors, API 400/404/422/5xx, error toasts, error screens and "dead" clicks.

| Run | Pages | Controls clicked | Server errors (API 5xx/404) | Error screens | Uncaught app errors |
| --- | --- | --- | --- | --- | --- |
| Baseline (`main`) | 37 | 555 | 0 | 0 | 0 (*) |
| This branch, changed and missing pages | 11 | 153 | 0 | 0 | 0 (*) |

(*) The only page errors were "WebSocket closed without opened", which comes from the Vite dev server's hot-reload
socket under parallel load. It is not part of the production bundle.

Dead clicks (47 in the baseline) were reviewed one by one. Nearly all were the tab or filter that was already selected,
buttons that open a native confirm or file dialog (which the script dismisses), or submit buttons blocked by required
fields. Fixed: the profile checklist buttons (above); delete-quiz and profile sub-tabs got accessible names/state.
Error toasts were expected (a wrong answer in the doubt-solver practice quiz; clipboard blocked in headless Chrome).

Responsive: the changed pages (Focus, Progress, Study Planner, Dashboard, Career, Research, Mock Interviews, Goals,
Quiz, Profile) at 360, 390, 768 and 1024 px: 0 elements past the viewport on all 40 pairs.

## 4. Tests

New: `workspace_shortcuts.test.ts` (page search, pins, recents, per-student isolation, shortcuts),
`focus_timer.test.ts` (route, stored-data validation, daily totals, streak, summary, formatting).
Extended: `ui_redesign_shell.test.ts` (no recommendation panels on any of the listed pages, backend endpoint kept).
