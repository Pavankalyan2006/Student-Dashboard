# Design System ("Meridian")

Source of truth: the `@theme` block in `src/index.css`. Raw values for charts and inline styles: `src/styles/tokens.ts`.

## Approach

The app has 128 pages written with Tailwind palette names. Rather than hand-editing every page, the palette names are
remapped onto five deliberate hues, and the 2,722 hard-coded hex classes were codemodded onto the same names. Every page
therefore draws from one palette, and changing a token changes the whole product.

| Role | Tailwind names that resolve to it | Key value |
| --- | --- | --- |
| Neutral (text, borders, surfaces) | slate, gray, zinc, neutral | ink `slate-900` #121829, secondary `slate-600` #4C5569, muted `slate-500` #636C80, line `slate-200` #E3E6EE |
| Brand | blue, indigo | primary `blue-600` #4654E0, hover `blue-700` #3843C4, soft `blue-50` #F0F3FF |
| Accent (AI surfaces only) | violet, purple, fuchsia | `violet-600` #7951D8 |
| Info | sky, cyan, teal | `sky-600` #1F7AA2 |
| Success | emerald, green, lime | `emerald-600` #14825A |
| Warning | amber, yellow, orange | `amber-600` #C66C12 |
| Danger | red, rose, pink | `red-600` #CC342C |
| Shell | navy-600 … navy-950 | sidebar `navy-950` #091024 |
| Canvas | `bg-canvas` | #F6F7FB |

Semantic aliases for new code: `primary`, `primary-hover`, `primary-soft`, `accent`, `ink`, `ink-secondary`,
`ink-muted`, `line`, `line-strong`, `canvas`, `surface`, `success`, `warning`, `danger`, `info`
(e.g. `bg-primary`, `text-ink-muted`, `border-line`).

All text/background pairs used for body copy meet WCAG AA: `slate-900` on white 17.7:1, `slate-600` 7.5:1,
`slate-500` 5.3:1 (4.9:1 on the canvas), white on `blue-600` 5.8:1, sidebar text on navy 5.6–8.4:1.

## Typography

| Role | Face | Size / weight | Where |
| --- | --- | --- | --- |
| Display / page title | Plus Jakarta Sans | 24–28 px, 700, tracking −0.022em | `PageHeader` h1 |
| Section heading | Plus Jakarta Sans | 17 px, 600 | `PageSection`, dashboard sections |
| Card title | Inter | 15–16 px, 600 | `CardTitle`, empty states |
| Body | Inter | 14 px, 400, 1.6 line height | descriptions |
| Label / UI | Inter | 13 px, 500–600 | nav items, buttons, metric labels |
| Caption / overline | Inter | 11–12 px, 600, uppercase 0.08em | group headers, eyebrows |
| Metric | Plus Jakarta Sans | 26 px, 700, tabular numbers | `MetricCard`, `StatCard` |
| Code | JetBrains Mono | 12–13 px | `code`, `pre`, `kbd` |

`h1`–`h3` use the display face globally, so existing pages pick it up without edits.

## Spacing

Tailwind's 4 px scale, with these conventions (also as CSS variables):

| Token | Value |
| --- | --- |
| `--space-page-x` | 16 px mobile, 24 px ≥640, 32 px ≥1024 |
| `--space-page-y` | 20–32 px |
| `--space-section` | 24 px mobile, 32 px desktop (`space-y-6 lg:space-y-8`) |
| `--space-card` | 16–24 px (`p-4 sm:p-5`) |
| Component gap | 8–12 px (`gap-2`/`gap-3`) |
| Content max width | 1440 px (`<main>`), 1280 px inside `PageContainer` |

## Radius, elevation, motion

- Radius: xs 4, sm 6, md 8, lg 10 (inputs, buttons), xl 12 (cards), 2xl 14 (large panels), 3xl 16 (heroes).
- Elevation: `shadow-xs` for resting cards, `shadow-sm`/`md` on hover, `shadow-lg`+ only for menus, dialogs and the mobile drawer. All shadows are navy-tinted and low-opacity.
- Motion: `animate-page-in` (220 ms fade/rise on route change), 150–300 ms colour/width transitions with `cubic-bezier(0.22, 1, 0.36, 1)`, shimmer skeletons. Everything collapses to ~0 ms under `prefers-reduced-motion: reduce`.

## Component kit

| Component | File | Notes |
| --- | --- | --- |
| Button (primary, secondary, outline, ghost, danger, ai; sm/md/lg/icon) | `components/ui/button.tsx` | inset highlight, 1 px press, focus ring offset 2 |
| Card, StatCard, ProgressCard | `components/ui/card.tsx` | progress bars carry `role="progressbar"` |
| Badge | `components/ui/badge.tsx` | |
| Input, Tabs, Dialog, Dropdown, Tooltip, Avatar | `components/ui/*` | Radix-based |
| Alert, Progress, Skeleton, ContentSkeleton, Separator | `components/ui/feedback.tsx` | Skeleton uses the shared shimmer |
| PageContainer, PageHeader (eyebrow, icon, badge, actions), PageSection, MetricCard, EmptyState, LoadingState (skeleton), ErrorState | `components/layout/PageComponents.tsx` | |
| Hero surfaces | `.hero-brand` (dark), `.surface-hero` (light) in `index.css` | the only two hero treatments |
| Sidebar, Topbar, GlobalSearch, NotificationBell, ProfileMenu, AskAIButton | `components/navigation/*` | |
| AppShell, AppFooter, BrandMark | `components/layout/*` | |
| Toasts | sonner, styled in `AppShell` | |

Rules for new pages: start with `PageContainer` + `PageHeader`, show real numbers through `MetricCard` (use "—" when
there is no data, never a made-up figure), use `EmptyState`/`LoadingState`/`ErrorState` for the three non-happy paths,
and reserve violet for AI features.
