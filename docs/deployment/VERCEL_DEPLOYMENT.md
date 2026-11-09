# Deploying to Vercel (production)

The whole platform runs on Vercel: the React app is served from Vercel's CDN (`dist/`), and
the Express API runs as one serverless function (`api/index.ts`). Firebase handles sign-in,
Supabase Postgres stores all data, Gemini answers AI requests.

## How it works on Vercel

| Piece | Where it lives |
| --- | --- |
| Frontend | `npm run build` → `dist/`, served by Vercel. `vercel.json` sends unknown paths to `index.html` (SPA routing). |
| API | `api/index.ts` wraps `server/app.ts`. `vercel.json` rewrites `/api/*` and `/health*` to it. |
| Student profiles | Supabase tables from `supabase/migrations/` (`PROFILE_STORE=supabase`). |
| Everything else (notes, chats, progress, uploads, labs) | `public.app_state_entries` in the same database (`STATE_STORE=postgres`, `server/db/pgStatePersistence.ts`). |
| Schema | Applied automatically on cold start by `server/db/migrations.ts` (recorded in `public.app_schema_migrations`). Set `RUN_DB_MIGRATIONS=false` to manage it yourself. |

Why the state store: the server keeps its data in memory. On a normal server that memory is
saved to `data/runtime/db-snapshot.json`, but every Vercel instance has its own memory and a
throwaway disk. The Postgres state store loads all rows on cold start, pulls rows changed by
other instances before each API request, and writes the changed rows **before** a successful
response is sent. Two instances writing the very same record at the same moment resolve
last-write-wins for that record.

All new tables have row level security on and grant nothing to `anon`/`authenticated`; only
the server connection (the `postgres` role) reads them.

## One-time setup

1. **Supabase connection string.** Supabase dashboard → your project → **Connect** →
   **Transaction pooler** (port 6543). Vercel has no IPv6, so the direct
   `db.<ref>.supabase.co:5432` address does not work from Vercel. Append `?sslmode=no-verify`
   (encrypted; Supabase's certificate is not from a public CA).
2. **Firebase.** Console → Authentication → Sign-in method: Email/Password enabled.
   Authentication → Settings → **Authorized domains**: add your `*.vercel.app` domain and any
   custom domain, or sign-in pop-ups/redirects are refused.
3. **Vercel project.** vercel.com → Add New → Project → import the GitHub repo. Framework
   preset "Other"; build, output and install settings come from `vercel.json`.
4. **Environment variables.** Settings → Environment Variables → import the env file (see the
   variable list in `.env.example`, section "Vercel"). `VITE_*` values are compiled into the
   browser bundle and must only be public Firebase identifiers. Server secrets
   (`GEMINI_API_KEY`, `SUPABASE_DB_URL`, `FIREBASE_SERVICE_ACCOUNT_BASE64`, `JWT_*`) never get a
   `VITE_` prefix.
5. **Region.** Settings → Functions → Function Region: pick the region closest to your
   Supabase project (every API request talks to the database).
6. Deploy. Then set `APP_URL` and `CORS_ORIGINS` to the real URL and redeploy.

## Checking a deployment

- `GET /health` → `{"status":"ok"}`; `GET /health/ready` → database component `connected`.
- Function logs show `Applied database migration …` on the first cold start, then
  `Restored N persisted record(s) from Postgres state store` and
  `Data persistence: Postgres state store`.
- Sign up with a real email, verify it from the email link, finish onboarding, ask the AI Tutor
  a question, upload a small file, then redeploy and check everything is still there.

## Limits on Vercel

- **Uploads:** Vercel rejects request bodies over 4.5 MB; uploads are base64 JSON, so files
  must be under ~3 MB (`MAX_UPLOAD_SIZE_BYTES=3000000`). File bytes are stored in Postgres.
- **Running student code** (Python/Java/C/C++ in the coding modules) is refused: it needs an
  isolated Linux sandbox Vercel does not provide. Keep `CODE_SANDBOX_ALLOW_UNISOLATED=false`;
  turning it on would let student programs read the function's secrets. SQL Lab works (sql.js).
- **Function time:** 60 s per request (`vercel.json`), Gemini calls time out at 30 s.
- **Cold starts:** the first request after idle loads seed data and all stored rows (~1–3 s).
- **Rate limits** are per instance (in memory), so they are looser than on one server.

## Running elsewhere

`npm start` / the Dockerfile still work as before (file snapshot). To use Postgres for state
on a normal server too, set `STATE_STORE=postgres` and `SUPABASE_DB_URL` (or `STATE_DB_URL`).
