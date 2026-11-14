# UI/UX Regression Test Report

All results are from actual runs on 2026-11-14.

## Automated

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | 0 errors |
| `npx vitest run` | 64 files passed, 2 skipped; 981 tests passed, 10 skipped (same skips as `main`) |
| `npm run build` | Succeeds; the large-chunk warning existed before |
| GitHub CI on PR #9 | Green |
| Vercel preview build for PR #9 | Ready |

New or changed tests:

- `src/tests/navigation.test.ts`: the ten groups; every primary module is in the sidebar; no duplicate destinations; **every nav href is a route that `App.tsx` renders**; GATE in Assessments and Placement in Career; one active item with the most specific match; breadcrumb labels.
- `src/tests/ui_redesign_shell.test.ts`: no feedback entry in navigation; the page file and its route are gone; old URLs (with a trailing slash or query) resolve to `/dashboard`; footer text for signed-in, signed-out and nameless students; the footer follows a name change; no phase or internal status labels in shell files; the footer reads the auth store, not browser storage.
- `src/tests/phase6_pilot.test.ts` (unchanged) still passes, which confirms the pilot feedback API is intact.

## Browser checks (local)

| Scenario | Result |
| --- | --- |
| Two newly registered students | Each footer shows only that student's own name |
| Change full name in Profile → Account → Save | Footer changes from "Asha Rao" to "Asha Rao Kumar" without a reload, and still shows the new name after a reload |
| Signed-out public page | No footer name shown; the other student's name is not on the page |
| `/pilot-feedback`, `/feedback` | Land on `/dashboard` |
| 183 routes × 7 widths | 0 page errors; overflow fixed (see responsive report) |
| GATE: all six tabs | Rendered in the light theme, no errors |
| Mobile drawer, collapsed rail, tooltips | Work (screenshots in `screenshots/`) |

## Live site (after merge)

See `DEPLOYMENT_VERIFICATION_REPORT.md`. Signed in as the demo student, all 41 sidebar pages loaded with no errors and no overflow, and every page showed the right footer name. Both retired URLs land on the dashboard.

## Not covered

- Not every button, form, upload and download was clicked in this pass. The previous all-controls sweep (`scripts/pilot/production-deep-click.cjs`, 1,313 clicks) predates the redesign. The redesign changed classes and layout, not handlers, but that script should be re-run against production.
- AI features were not exercised (no AI key locally).
