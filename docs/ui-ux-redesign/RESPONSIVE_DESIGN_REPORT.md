# Responsive Design Report

## Method

Script: a Playwright sweep (local server, seeded demo student) that loads each route at each width, waits for the
network to settle, and records horizontal overflow (`scrollWidth − innerWidth`), uncaught page errors and the footer
text. A second script lists the elements that stick out past the viewport for any failing pair.

- Routes: 183 (41 sidebar destinations + 142 other literal routes from `App.tsx`).
- Widths: 360, 390, 430, 768, 1024, 1366, 1920 px.
- Page loads: 1,281.

## Result of the first sweep (after the redesign PR #9)

- Uncaught page errors: **0**.
- Footer showed "Designed for &lt;name&gt;" on every load.
- Horizontal overflow on 31 of 1,281 loads, coming from 11 components:

| Component | Widths | Cause | Fix |
| --- | --- | --- | --- |
| Skill Gap role selector | 360, 390 | select + button row could not wrap | `flex-wrap` |
| Technical Preparation tabs | 360–430 | four long tab labels in one row | horizontal scroll, labels no-wrap |
| Semester Calendar / Study Stream controls | 360–430 | filter + action row could not wrap | `flex-wrap` |
| Semester exam tabs (slip tests, minors, end-sem) | 360 | three long tabs | horizontal scroll |
| Dashboard GitHub widget | 768 | inner 2-column grid inside a grid cell | single column |
| Dashboard module grid | 768–1024 | grid items without `min-width: 0` | `[&>*]:min-w-0` |
| Dashboard streak days | 1024 | seven fixed 28 px tiles in a narrow rail | 7-column grid with shrinkable tiles |
| Exam Preparation actions | 768, 1024 | three buttons in a fixed row | `flex-wrap` |
| Note card header | 1024 | fixed 200 px course label + actions | label truncates, actions don't shrink |
| Placement readiness header | 1024 | title and gauge forced side by side | wraps |

## After the fixes

Every failing page/width pair was re-run: **0 px overflow** on all of them. The full test suite still passes
(981 tests).

## Layout behaviour by breakpoint

| Width | Shell |
| --- | --- |
| < 1024 px | Sidebar becomes a drawer (menu button, overlay, Escape to close); header keeps title, search icon, Ask AI (icon only under 640 px), notifications, avatar; breadcrumb trail hidden under 640 px. |
| ≥ 1024 px | Fixed sidebar, 272 px or 76 px icon rail with tooltips; collapse is remembered. |
| ≥ 1280 px | First name shown beside the avatar. |
| All | Content max 1440 px; page padding 16 / 24 / 32 px; footer stacks under 768 px. |

## Limits

- Overflow is measured on the first screen state of each route. Dialogs, other tabs and filled-in forms were checked only where screenshots were taken (GATE tabs, dashboard, community, profile).
- Editors (Monaco, System Design canvas) are usable on tablets and up; on phones they work but are cramped, as before.
