# Component Redesign Report

| Component | File | Change |
| --- | --- | --- |
| Navigation config | `components/navigation/navConfig.ts` (new) | Ten groups (Overview, Learn, Practice, AI Labs, Assessments, Career, Projects & Research, Community, Personal Workspace, Settings), 41 entries, one per destination, aliases via `match`. `findActiveNavItem` uses longest-prefix matching. Pilot Feedback removed. |
| Sidebar | `components/navigation/Sidebar.tsx` | Rewritten: brand mark, collapsible groups (state remembered in `localStorage`, active group always open), active indicator bar, `aria-current`, real `<a href>` links (middle-click / new tab work), icon rail when collapsed with Radix tooltips, collapse state remembered, mobile drawer with fading overlay and Escape to close, student identity chip in the footer. |
| Topbar | `components/navigation/Topbar.tsx` | Group › page breadcrumb plus page title; search field with Ctrl K hint; mobile search icon; Ask AI; notifications; profile menu with first name on wide screens. `buildBreadcrumbs` is exported and tested. |
| Ask AI button | `components/navigation/AskAIButton.tsx` | Neutral dark button with violet spark; icon-only under 640 px. |
| Profile menu | `components/navigation/ProfileMenu.tsx` | Gradient initials avatar; fake `student@btech.edu` fallback removed. |
| App shell | `components/layout/AppShell.tsx` | Skip link, single content padding, 1440 px max width, route-change fade, footer, restyled toasts with close button. |
| App footer | `components/layout/AppFooter.tsx` (new) | "B.Tech AI Platform · Designed for &lt;registered name&gt;" and footer links. |
| Student name source | `components/layout/studentName.ts` (new) | Pure functions over the auth record: name only when authenticated with an id; neutral text otherwise. |
| Brand mark | `components/layout/BrandMark.tsx` (new) | SVG mark used in sidebar and footer. |
| Page kit | `components/layout/PageComponents.tsx` | PageHeader gains `eyebrow` and `icon`; new `MetricCard`; EmptyState, ErrorState restyled; LoadingState is now a skeleton; ModulePlaceholderCard no longer shows internal phases. |
| Button | `components/ui/button.tsx` | Semibold, inset highlight, press feedback, ring offset, `ai` variant brand→violet. |
| Card / StatCard / ProgressCard | `components/ui/card.tsx` | Tinted icon tile, display-face metric, accessible progress bar. |
| Feedback | `components/ui/feedback.tsx` | Shimmer skeleton, accessible progress, alert roles. |
| Retired routes | `lib/retiredRoutes.ts` (new) | Maps `/pilot-feedback` and `/feedback` to `/dashboard` on load, back/forward and in-app navigation. |
| UI store | `store/uiStore.ts` | Sidebar collapse persisted. |

## Codemods applied

1. 2,722 hex colour classes (`[#2563EB]`, `[#101828]`, …) → palette names (`blue-600`, `slate-900`, …) across 171 files.
2. 22 files of inline hex colours (charts, inline styles) → the new palette values.
3. 26 saturated hero gradients → `hero-brand`.
4. Dark-theme → light conversion for GATE, Knowledge Base, Language Learning, Semester Command Center, External Profiles (token-level: dark surfaces → white/slate-50, light text → ink, pastel accents → 600/700 shades; white text kept on saturated buttons).
5. Purple→pink gradients → brand→violet.

## Removed

- `src/features/feedback/pages/PilotFeedbackPage.tsx` (the only file in that feature on the frontend).
