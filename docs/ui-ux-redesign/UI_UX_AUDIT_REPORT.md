# UI/UX Audit Report

Date: 2026-11-14. Branch: `claude/project-thread-lyg4zq`. Baseline: `main` at `b10beec`.

This is the inventory taken before the redesign, and what each finding led to.

## 1. What the frontend is

| Area | Finding |
| --- | --- |
| Stack | React 19, Vite 8, Tailwind CSS 4 (`@import "tailwindcss"`), Radix primitives (dialog, dropdown, tabs, tooltip, avatar, popover), lucide-react icons, recharts, sonner toasts, zustand stores, TanStack Query. |
| Routing | Hand-written router in `src/App.tsx`: 174 literal paths plus regex matches for detail pages, all rendered inside `AppShell`. |
| Size | 128 page components, about 112,000 lines of TSX. |
| Shared UI | `src/components/ui/*` (button, card, badge, input, tabs, dialog, dropdown, tooltip, feedback) and `src/components/layout/PageComponents.tsx` (PageHeader, EmptyState, LoadingState, ErrorState). Only 34 files used the page components; most pages hand-built their own headers and cards. |
| Styling | No design tokens in practice. Pages used 2,805 hard-coded hex colour classes (`text-[#101828]`, `bg-[#2563EB]`, …) plus Tailwind's default palette across 17 hue families (slate, gray, blue, indigo, purple, violet, emerald, green, amber, yellow, orange, red, rose, pink, cyan, sky, teal). |
| Auth / profile | Signed-in student comes from `/auth/me` (legacy) or the Firebase session bootstrap, held in `useAuthStore`. The record's `name` is synced from the central profile's `identity.full_name` (`server/services/studentProfile/profileCache.ts`), and `applyProfileUpdate` refreshes the auth store after every profile save. |

## 2. Findings

| # | Finding | Severity | Action |
| --- | --- | --- | --- |
| A1 | Sidebar footer showed the development label "Phase 1 Foundation" to every student. | High (brief 1B) | Replaced with the signed-in student's registered name; app footer added with "Designed for &lt;name&gt;". |
| A2 | Pilot Feedback page linked from the sidebar (Profile group) and from Settings → Privacy & Data. | High (brief 1A) | Page, route, sidebar entry and settings link removed; old URLs redirect to the dashboard; API and records kept. |
| A3 | Student-facing placeholder page showed "Phase N Roadmap", "Scheduled for Phase N", "Module Foundation Ready", `status: foundation_verified`, "Schema verified", API route and "RBAC Verified". | Medium | Rewritten without internal labels. (No sidebar route reaches it today; it is a fallback.) |
| A4 | Seeded demo notification read "Welcome to Phase 1 foundation…". | Low | Text changed in the seed. |
| A5 | Seven flat sidebar groups in capitals, 44 entries, "Mock Interviews" listed twice (`/interviews` and `/mock-interviews`, same page), many decorative badges ("Command", "Spaced", "150+", "Sim", "Verified", "Tracker"). | Medium | Ten task-based groups, one entry per destination, badges limited to AI/RAG. |
| A6 | Active state used `startsWith`, so `/community/questions` lit both "Community Hub" and "Q&A Forum", and `/profile/settings` lit "Student Profile" and "Settings". | Medium | Longest-prefix matching; exactly one active item. |
| A7 | Breadcrumbs were raw URL slugs ("Workspace › Profile › External"), with ids shown verbatim on detail pages. | Low | Breadcrumbs derive from the navigation tree; ids become "Details". |
| A8 | About a dozen different saturated hero gradients (blue→indigo→purple, purple→pink, slate→indigo→purple, amber→slate …). | Medium | One `hero-brand` treatment applied to 26 heroes. |
| A9 | Five modules rendered as fully dark pages inside a light app: GATE Preparation, Knowledge Base, Language Learning, Semester Command Center overview, External Profiles. | High (consistency) | Converted to the light system. Code editors and the System Design canvas stay dark on purpose. |
| A10 | Two radius scales in use (`rounded-xl` 1,650×, `rounded-2xl` 778×, `rounded-3xl` 70×) spanning 12–24 px. | Low | Radius scale tightened to 6–16 px so all cards agree. |
| A11 | Heavy shadows (`shadow-xl`/`2xl`, coloured shadows) on ordinary cards. | Low | Elevation scale softened and navy-tinted. |
| A12 | Main content double-padded: `<main>` padded and `PageContainer` padded again. | Low | Shell pads once; `PageContainer` handles vertical rhythm only. |
| A13 | No skip link, no global focus ring, no reduced-motion handling. | Medium | Added. |
| A14 | Profile menu showed `student@btech.edu` when the email was missing. | Low | Fallback removed. |
| A15 | Dashboard put 15 widgets in a single right rail, about 3,000 px longer than the left column on desktop. | Medium | Re-laid out (see page report). |

## 3. Things checked and left as they are

- Dashboard numbers (streak, mastery, course progress) come from `/dashboard`; earlier audits removed fabricated values and none were reintroduced.
- Course thumbnails, avatars and some icons are remote images; they do not load inside the test container (no outbound access) and show alt text there. They load on the live site.
- Admin pages (`src/features/admin`) are not reachable by students and were not restyled beyond the shared palette.
- The theme setting in Settings saves a preference but the app has no dark mode; that is unchanged.
