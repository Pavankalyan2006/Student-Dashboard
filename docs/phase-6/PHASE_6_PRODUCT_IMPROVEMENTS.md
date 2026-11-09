# Phase 6 Product Improvements

Every change below is backed by a **Stage 1 synthetic** observation, not by student evidence. No improvement was made
from student feedback, because none exists yet. No feature was added because it sounded attractive. The one new feature
(pilot feedback) is the collection instrument the spec requires (section 9), and no suitable module existed for it.

| # | Observed problem | Evidence | Expected improvement | Affected modules | Change (minimal) | Tests | Regression | Outcome |
|---|---|---|---|---|---|---|---|---|
| 1 | Duplicate accounts on double submit (P6-001) | Journey run: 201/201 for one email | One account per email under retries | Registration | Synchronous email reservation in `identityService.registerLegacy` | `phase6_pilot` P6-001 | full suite | Fixed |
| 2 | Profile skills ignored by career/resume/jobs/skills (P6-002) | Career "no skills recorded" after onboarding with Python | Profile is the single source of skills | Career, Resume, Jobs match, Skills, Progress, Portfolio, AI tools | Read-only merge in `db.getStudentSkills`, provider in `profileCache` | `phase6_pilot` P6-002 (×2) | full suite | Fixed |
| 3 | Blank page on non-allowlisted host (P6-003) | Browser: JS/CSS 500 | App loads on the pilot host | All pages | `server/core/corsPolicy.ts`, used by `server.ts` | `phase6_pilot` P6-003 | browser sweep 92/92 | Fixed |
| 4 | Misleading completion text (P6-004) | Dashboard screenshot | Clear optional/required wording | Dashboard | `DashboardProfileSummary` labels | tsc, browser | sweep | Fixed |
| 5 | Mobile registration form below the fold (P6-005) | 390 px screenshot | Form visible first | Registration | grid `order` classes in `OnboardingPage` | browser registration run | sweep | Fixed |
| 6 | Group sign-in lockout on one IP (P6-006) | Journey run hit 429 on repeated runs | Only failures limited | Auth | `forgiveAuthAttempt` after a successful login / Firebase session | `phase6_pilot` P6-006 | full suite | Fixed |
| 7 | No way to collect private feedback or privacy concerns | Spec §9, §16; no module existed | Voluntary, private, withdrawable feedback | New: Pilot Feedback; Settings; Sidebar | `pilotFeedbackService`, route, page, export script | `phase6_pilot` feedback (×5), browser submit/withdraw | full suite | Added |

## Deliberately not changed

| Candidate | Why not now |
|---|---|
| Manual quiz builder (P6-007) | The fix may simply be the Gemini key. Decide after Stage 2 shows whether students want to write their own quizzes |
| More analytics events | No evidence yet of which questions they answer |
| Toast position, AI follow-up actions, CORS 403 (P6-009/010/012) | P4. Wait for student evidence that they matter |
| Registration rate limit (P6-011) | Spam protection; the operational workaround is documented |

## Stage 2/3 improvements

_Awaiting real student participation._ Each future row must cite the feedback export or observer sheet it comes from.
