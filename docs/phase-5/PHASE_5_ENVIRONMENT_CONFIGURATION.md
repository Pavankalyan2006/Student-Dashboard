# Phase 5 Environment Configuration

See `.env.example`. Nothing secret is committed. No `.env` file with real or invented values exists in the repository.

| Variable | Where | Secret? | Purpose |
|---|---|---|---|
| `AUTH_PROVIDER` | server | no | `legacy` (default) or `firebase` |
| `FIREBASE_PROJECT_ID` | server | no | `otp-project-846a9`; verifies ID tokens |
| `GOOGLE_APPLICATION_CREDENTIALS` | server | **yes (file)** | optional; never commit the JSON |
| `REQUIRE_EMAIL_VERIFICATION` | server | no | unverified accounts stay incomplete |
| `VITE_FIREBASE_API_KEY` | browser (build) | no, public identifier — **not provided; must be set** | Firebase web SDK |
| `VITE_FIREBASE_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID`, `_MEASUREMENT_ID` | browser (build) | no | values given by the owner, in `.env.example` |
| `PROFILE_STORE` | server | no | `snapshot` (default) or `supabase` |
| `SUPABASE_URL` | server | no | project URL |
| `SUPABASE_DB_URL` | server | **yes** | Postgres connection string |
| `SUPABASE_SERVICE_ROLE_KEY` | server | **yes** | not used today; server only if ever added |
| `SUPABASE_ANON_KEY` | — | no | not needed (browser only talks to this backend) |
| `GEMINI_API_KEY` | server | **yes** | new key required; the previously exposed key must stay revoked |
| `GEMINI_TIMEOUT_MS`, `AI_MAX_PROMPT_CHARS` | server | no | request timeout, prompt size limit (413) |

Docker: the `VITE_FIREBASE_*` values are build args (`docker build --build-arg VITE_FIREBASE_API_KEY=...`).
Never pass server secrets as build args.

Startup fails fast with a clear message for invalid `AUTH_PROVIDER` / `PROFILE_STORE` values, Firebase mode without a
project id, and Supabase mode without a DB URL.

Gemini hardening in this phase: key sent in the `x-goog-api-key` header (not the URL), secrets redacted from error text,
prompt size limit, timeout, token usage counters without prompt text, and minimised student context.
