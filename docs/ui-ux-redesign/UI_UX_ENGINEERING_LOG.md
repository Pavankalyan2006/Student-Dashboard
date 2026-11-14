# UI/UX Engineering Log

## 2026-11-14

1. Inventoried the frontend (see `UI_UX_AUDIT_REPORT.md`): 128 pages, 174 literal routes, 2,805 hex colour classes, 17 hue families, no tokens.
2. Removed the Pilot Feedback page. Checked the backend first: `/api/v1/pilot-feedback/*` is also used by the owner export script and tests, so it stays. Old URLs redirect via `lib/retiredRoutes.ts` (applied on first load, back/forward and in-app navigation). Removed the Settings link and the walkthrough scripts' visits. Updated the student guide.
3. Footer name. Traced the source: the auth store's `student.name` comes from `/auth/me` / Firebase bootstrap and is synced from `identity.full_name` on save (`profileCache.ts:280`); `applyProfileUpdate` refreshes it. Built `studentName.ts` on that, never on storage.
4. Design approach decision: remap Tailwind colour names in `@theme` instead of rewriting each page, then codemod hex classes onto names. This reaches every page at once and keeps future edits token-based.
5. Shell rebuilt (sidebar, header, footer, AppShell). Fixed double active highlighting and duplicated Mock Interviews entry.
6. Screenshot review of 41 nav routes at 1440 px found: a dozen hero gradient styles (unified to `hero-brand`), five all-dark pages (converted with a token-level script, then checked tab by tab; fixed a decorative blur blob that covered GATE's progress label and leftover pastel-on-white text), a saturated onboarding banner on the dashboard (made compact), and a dashboard right rail ~3,000 px longer than the left (re-laid out).
7. Contrast pass: darkened `slate-500` and the sidebar group label to clear AA.
8. Tests: rewrote `navigation.test.ts` for the new groups (including a check that every nav href is a route in `App.tsx`), added `ui_redesign_shell.test.ts`. Full suite, tsc and build green.
9. Sweeps: 183 routes at 1440 px (no runtime errors, no horizontal overflow); responsive sweep at 7 widths (see report).

## Decisions worth knowing

- Code editors, the System Design canvas and live interview panes stay dark (tool convention).
- No dark mode added; the existing theme preference still saves but is not applied (unchanged).
- Students can no longer withdraw old pilot feedback from the UI; the API still allows it.
