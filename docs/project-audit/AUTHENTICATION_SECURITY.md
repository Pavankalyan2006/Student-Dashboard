# Authentication & Security

## Mechanism
- `POST /api/v1/auth/register|login` return a JWT (HS256, 2h) and set an httpOnly `access_token` cookie (`sameSite=lax`, `secure` in production). The SPA stores the token in `localStorage.auth_token` and sends `Authorization: Bearer`.
- `server/middleware/auth.ts` `authenticate` decodes the token on every request and rejects suspended/disabled/pending accounts; `requireAuth` guards routes; `requireRole` guards `/admin`.
- Passwords: bcrypt (10 rounds). Registration responses do not include `password_hash` (verified).
- Security headers and CSP set in `server.ts`; global rate limiter on `/api`.

## Tests (API, two synthetic students)
| Check | Result |
|-------|--------|
| Register, duplicate email, invalid email, short password | PASS |
| Wrong password → 401 | PASS |
| `/auth/me` with no token, garbage token, expired token → 401 | PASS |
| Protected `/notes` without token → 401 | PASS |
| Logout clears cookie | PASS (token itself remains valid until expiry — stateless JWT, no revocation list) |
| Student B cannot read/edit/delete A's notes, decks, cards, goals, custom courses, attached resources | PASS (after fixes) |
| Student A cannot open the demo student's seeded conversation | PASS |

## Findings
- **Fixed — CRITICAL:** published `SUPER_ADMIN` password gave full access to all student records (BUG-013).
- **Fixed — CRITICAL:** any student could modify shared catalog courses (BUG-007).
- **Fixed — HIGH:** course resources leaked across students (BUG-008).
- **Fixed — HIGH:** production could run with default JWT secrets (BUG-014).
- **Open:** logout does not revoke the bearer token (stateless JWT); token is in `localStorage` (readable by any XSS). CSP allows `'unsafe-inline'` and `'unsafe-eval'` scripts.
- **Open:** seeded demo student `student@btech.edu` has a password in source (OPEN-007).
- **Open:** admin API exists (39 endpoints) contrary to the spec's "no admin role" (OPEN-006) — needs an owner decision; not removed.
- **Not yet reviewed:** code execution sandbox (`server/execution/sandbox.ts`) and SQL lab isolation.
