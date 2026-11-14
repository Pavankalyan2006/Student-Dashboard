# GitHub Changelog — UI/UX redesign

Branch `claude/project-thread-lyg4zq`, from `main` at `b10beec`. Opened as a pull request; nothing was pushed to `main`.

## Student-facing

- Pilot Feedback page removed from the app. `/pilot-feedback` and `/feedback` open the dashboard.
- Footer now reads "Designed for &lt;your registered name&gt;"; the "Phase 1 Foundation" label is gone. Signed-out pages never show a name.
- New sidebar: ten groups (Overview, Learn, Practice, AI Labs, Assessments, Career, Projects & Research, Community, Personal Workspace, Settings), collapsible, remembers its state, icon rail with tooltips, mobile drawer.
- New header with section › page breadcrumbs and page title; search, Ask AI, notifications, profile.
- One colour palette, type scale, radius and shadow scale across all pages.
- Dashboard re-laid out into balanced sections.
- GATE Preparation, Knowledge Base, Language Learning, Semester Command Center and External Profiles now use the light theme like the rest of the app.
- No internal roadmap phases or API/status labels in student pages.

## Not changed

- No backend API was removed or changed. `/api/v1/pilot-feedback/*` and the stored feedback remain; `scripts/pilot/export-feedback.cjs` still works.
- Only one server line changed: the seeded demo notification's text.
- No new dependencies. Fonts: Plus Jakarta Sans added to the existing Google Fonts request.

## Files

260 files changed. New: `navConfig.ts`, `AppFooter.tsx`, `BrandMark.tsx`, `studentName.ts`, `retiredRoutes.ts`,
`ui_redesign_shell.test.ts`, `docs/ui-ux-redesign/*`. Deleted: `features/feedback/pages/PilotFeedbackPage.tsx`.
The walkthrough scripts in `scripts/pilot/` no longer visit `/pilot-feedback`.

## Checks before push

- `npx tsc --noEmit`: 0 errors.
- `npx vitest run`: 64 files passed, 2 skipped; 981 tests passed, 10 skipped.
- `npm run build`: succeeds (existing large-chunk warning unchanged).
- Secret scan of the staged diff: no keys or passwords.

## Recommendation panels removed and workspace features (2026-11-14)

- Removed every student-facing recommendation panel ("Recommended for you" on 14 module pages, plus Progress,
  Dashboard, Career, Research, Mock Interviews, Goal detail, Study Planner). Backend recommendation endpoints kept.
- Replaced hard-coded suggestions with real figures or removed them.
- Added: command palette with page jump and recent pages, pin pages to the sidebar, keyboard shortcuts, Focus Timer.
- Details and sweep results: `RECOMMENDATIONS_REMOVAL_AND_FEATURES_REPORT.md`.
