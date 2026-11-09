# Phase 6 Privacy and Security Report

Synthetic students only. Each "PASS" names the check that proves it.

## 1. Isolation and protection

| Requirement | Result | Evidence |
|---|---|---|
| Student accounts isolated | PASS | Stage 1: B cannot read A's notes, goals (404), saved code, datasets, applications, profile, feedback; Phase 2–5 isolation suites |
| Private profiles not publicly exposed | PASS | `profile_visibility` PRIVATE persists; community question view has no email/phone/CGPA |
| Documents protected | PASS | B asking about A's document → 403; Phase 3 document tests |
| Uploaded datasets private | PASS | B's dataset list excludes A's |
| RAG collections isolated | PASS | 403 above; Phase 3 KB tests |
| Community permissions | PASS | B editing A's question → 403 |
| OAuth tokens secure | PASS (Phase 3: AES-256-GCM token vault); live GitHub OAuth BLOCKED |
| AI credentials server-side | PASS | Gemini key only in server env, sent in a header, redacted from errors (Phase 5); no `VITE_GEMINI_*` |
| Feedback not public | PASS | Own entries only, no list-all route, no admin page; tests in `phase6_pilot.test.ts` |
| Profile skills merge does not leak | PASS | P6-002 isolation test |
| Live Supabase RLS | NOT TESTED live (passes on local PostgreSQL 16) |

## 2. Ways to report a concern

- In app: **Pilot Feedback > Privacy or security concern** (`/pilot-feedback`). The owner's export lists these first.
- Directly to the owner (contact given in the participant information sheet).
- A confirmed cross-student exposure or credential leak stops the pilot (PHASE_6_STUDENT_PILOT_PLAN.md §11).

## 3. Data collected

| Data | Required? | Why |
|---|---|---|
| Name, email, password (hashed or held by Firebase) | Yes | Account |
| Terms/privacy consent timestamps | Yes | Record of consent |
| College, degree, branch, semester, year, graduation year | Yes | Personalisation |
| Phone, photo, CGPA, achievements | No | Only if the student chooses |
| Pilot feedback | No | Voluntary. Contact details are stripped from free text |
| Analytics | No | Opt-in only |
| Request logs (route, status, duration, student id) | Operational | Reliability. No content, passwords or tokens |

Feedback is not used beyond improving the platform during the pilot. Any other use needs fresh permission.

## 4. Open items

| Item | Risk | Plan |
|---|---|---|
| No self-service account deletion | Students rely on the owner to delete their account | The owner deletes at pilot end (§5). A self-service delete is a Phase 7 candidate |
| The existing admin delete path (`DELETE /api/v1/admin/students/:id`) has not been verified to remove every related record (notes, documents, vectors, feedback) | Incomplete deletion | Verify before relying on it; until then use a fresh pilot snapshot per stage and delete the snapshot + vault at the end |
| Profile data export (Settings > Download My Data) does not include pilot feedback | Incomplete export | Feedback is visible and withdrawable on its own page; add it to the export in Phase 7 |
| Legacy mode: no password reset, no email verification | Account recovery | Use Firebase mode for Stage 2 |
| Cross-origin refusal returns 500 (P6-009) | Noise only | P4 |

## 5. Retention and deletion procedure

| Data | Retention | Deletion |
|---|---|---|
| Pilot feedback | `PILOT_FEEDBACK_RETENTION_DAYS` (default 90) | Automatic, or the student withdraws at any time |
| Pilot accounts and learning data | End of the pilot + 30 days, unless a student asks to keep their account | Stop the pilot server, then delete the pilot snapshot file, the pilot vault folder and (if used) the pilot Supabase project. Delete the Firebase users from the Firebase console |
| Backups | Same as the data | Delete the dated backup folders with the snapshot |
| Server logs | Pilot + 30 days | Delete the log files on the pilot host |
| Feedback exports | Kept only as long as the analysis needs; pseudonymous | Delete with the pilot data; never commit them to the repository |

A student who withdraws mid-pilot: withdraw feedback on the page, and the owner deletes the account (Firebase console +
admin delete, verified per §4) within 3 working days.
