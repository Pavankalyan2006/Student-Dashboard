# Project Architecture (Phase 5 update)

Unchanged: one Express + Vite application (`server.ts`), React 19 front end, snapshot persistence, server-side Gemini.
No second application was created.

Added in Phase 5:

- `server/auth/firebaseAdmin.ts`: Firebase ID token verification (optional provider, authoritative when configured).
- `server/services/studentProfile/`: the central student profile (types, cache over existing stores, validation,
  completion, module contexts, recommendations, identity/registration, snapshot and Postgres persistence).
- `server/api/routes/profileMe.ts`: the profile context API.
- `supabase/`: migration and rollback. `scripts/migrate/snapshot-to-supabase.ts`.
- Front end: `src/lib/firebase.ts`, `src/lib/analytics.ts`, `src/features/profile/{api,hooks,components}`,
  new 7-step `OnboardingPage`, `DashboardProfileSummary`, recommendations panel on module landing pages (`App.tsx`).

Data flow and module wiring: PHASE_5_PROFILE_CONTEXT_ARCHITECTURE.md, PHASE_5_PROFILE_PROPAGATION_REPORT.md.
