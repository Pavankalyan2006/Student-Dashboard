# Deployment Verification Report

Status: **DEPLOYED and verified on https://btechplatform.vercel.app** (2026-11-14).

- PR #9 was merged into `main` by the owner. Vercel's production deploy picked it up; the live bundle (`/assets/index-DNcODEcH.js`) contains the new shell.
- Before the merge: GitHub CI was green on the PR head, and the Vercel preview build for the branch reported Ready. The preview URL itself is not reachable from the test container, so it was not browsed.

## Live retest (signed in through the real login form as the demo student)

| Check | Result |
| --- | --- |
| Footer on every sidebar page | "Designed for Aarav Sharma" on all 41 pages (the demo account's registered name) |
| `/pilot-feedback` | Lands on `/dashboard` |
| `/feedback` | Lands on `/dashboard` |
| Any link to `/pilot-feedback` in the page | None on any of the 41 pages |
| Runtime errors (uncaught page errors) | 0 across 43 page loads |
| Horizontal overflow at 1440 px | 0 px on every page |

Pages checked: every sidebar entry (Overview, Learn, Practice, AI Labs, Assessments, Career, Projects & Research,
Community, Personal Workspace, Settings).

## Not re-run live

- The name-change flow was verified locally (see `UI_UX_REGRESSION_TEST_REPORT.md`), not on production, to avoid editing the shared demo account.
- The older production scripts (`production-deep-click.cjs`, `production-ui-walkthrough.cjs`, `phase6-synthetic-journeys.cjs`) were not re-run in this pass; they need the Firebase service account from the project's env file and create and delete test users.
