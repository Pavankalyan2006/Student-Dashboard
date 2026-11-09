# Phase 6 Pilot Environment

**Nothing was deployed or published.** This file is the configuration the owner approves before Stage 2. A hosted staging
server, if wanted, is prepared here but must not be created without explicit owner approval.

## 1. What exists today

| Item | Status |
|---|---|
| One Express + Vite app (`server.ts`), production build served by the same server | Works locally. Stage 1 ran it with `NODE_ENV=production` on port 3611 |
| Data store | JSON snapshot (`DATA_SNAPSHOT_PATH`) or Supabase Postgres (`SUPABASE_DB_URL`) for the profile |
| Auth | Legacy email/password (default) or Firebase (`AUTH_PROVIDER=firebase`) |
| AI | Gemini, server side only. **No key configured** |
| File storage | Local vault (`STORAGE_LOCAL_PATH`) |
| Error logging | Structured JSON logs to stdout (request id, path, status, duration). No passwords, tokens or prompt text |

## 2. Pilot configuration (separate from any production)

| Requirement | How |
|---|---|
| Separate database | `DATA_SNAPSHOT_PATH=/srv/pilot/data/pilot-snapshot.json` on a path used only by the pilot. If Supabase is used: a **new, separate Supabase project** for the pilot, then `PROFILE_STORE=supabase` and `SUPABASE_DB_URL` |
| Separate env vars | A `pilot.env` file outside the repository with new `JWT_SECRET` and `JWT_REFRESH_SECRET` (each `openssl rand -hex 32`). The server refuses to start in production with the published defaults |
| Firebase test config | The same Firebase project is acceptable for a 3–5 person pilot; a separate Firebase project is better for Stage 3. Set `AUTH_PROVIDER=firebase`, `FIREBASE_PROJECT_ID`, the `VITE_FIREBASE_*` build values, enable Email/Password, add the pilot host to Authorised domains, and set `REQUIRE_EMAIL_VERIFICATION=true` |
| Supabase isolation | RLS is in `supabase/migrations`. Client access is read-only, and all writes go through the backend |
| Gemini limits | New key, server only (`GEMINI_API_KEY`); `GEMINI_TIMEOUT_MS=30000`; `AI_MAX_PROMPT_CHARS=200000`; set a **budget alert and quota cap** in Google AI Studio / Cloud console. The old exposed key must stay revoked |
| Synthetic accounts | Only `@example.test` emails, created by `scripts/pilot/phase6-synthetic-journeys.cjs` / `phase6-ui-walkthrough.cjs`. Run them against the pilot server before Stage 2 opens, then start from a fresh snapshot so no synthetic data mixes with participants |
| Error logging | Keep stdout logs on the pilot host for the pilot plus 30 days; they hold request ids and student ids but no content |
| Backup and recovery | Snapshot store: copy `pilot-snapshot.json` and the vault folder daily (`cp --archive` to a dated folder), then do a restore drill once before Stage 2 by starting a second server on the copy. Supabase: enable daily backups (paid plans) or `pg_dump -Fc` daily |
| Test file storage | `STORAGE_LOCAL_PATH=/srv/pilot/vault`, outside the repository; `MAX_UPLOAD_SIZE_BYTES=26214400` |
| External API limits | Paper search and job feeds use public APIs with their own limits; GitHub OAuth only if `GITHUB_CLIENT_ID/SECRET` are set for a pilot OAuth app |
| Feedback | `PILOT_FEEDBACK_ENABLED=true`, `PILOT_FEEDBACK_RETENTION_DAYS=90`; the owner keeps `PILOT_EXPORT_SALT` private |
| CORS | Same-origin works on any host (P6-003). Set `CORS_ORIGINS` only if a separate front-end origin is used |

Never put Firebase Admin credentials, `SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` or JWT secrets in
the repository, a `VITE_*` variable or a Docker build argument.

## 3. Example: local pilot server

```bash
npm ci && npm run build
set -a; . /srv/pilot/pilot.env; set +a     # secrets live outside the repo
NODE_ENV=production PORT=3611 \
DATA_SNAPSHOT_PATH=/srv/pilot/data/pilot-snapshot.json STORAGE_LOCAL_PATH=/srv/pilot/vault \
PILOT_FEEDBACK_ENABLED=true npx tsx server.ts
```

Smoke test before every stage (synthetic only):

```bash
BASE=http://localhost:3611 node scripts/pilot/phase6-synthetic-journeys.cjs > stage-check.json
BASE=http://localhost:3611 node scripts/pilot/phase6-ui-walkthrough.cjs ./stage-check-ui
```

## 4. Hosted staging (prepared, NOT created)

If students cannot reach a local machine, the existing `Dockerfile` / `docker-compose.yml` can run the same
configuration on a host the owner chooses. Needed: HTTPS, the env above as runtime secrets (not build args, except the
public `VITE_FIREBASE_*` values), a persistent volume for `/srv/pilot`, and the host added to Firebase authorised domains.
**Do not create or publish it without explicit owner approval.**

## 5. Stage 1 environment actually used

Container, Node 22, `NODE_ENV=production`, port 3611, fresh secrets, `DATA_SNAPSHOT_PATH=/tmp/p6/pilot-snapshot.json`,
`AUTH_PROVIDER=legacy`, no Gemini key, no outbound access to OpenAlex/Remotive/GitHub, `PILOT_FEEDBACK_ENABLED=true`.
