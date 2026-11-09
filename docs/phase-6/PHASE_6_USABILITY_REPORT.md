# Phase 6 Usability Report

**No real student has used the platform yet.** This report has two parts: (A) what the synthetic Stage 1 walkthrough
showed, recorded as engineering observations, and (B) the method and log for Stage 2/3, which is empty until students
take part. A feature working technically is not treated as proof that it is easy to use.

## A. Stage 1 observations (synthetic browser runs at 390×844 and 1366×900)

Priority scale: 1 prevents task completion · 2 incorrect results · 3 privacy/security · 4 significant confusion · 5 minor.

| # | Observation | Where | Priority | Kind | Outcome |
|---|---|---|---|---|---|
| U1 | Production build showed a blank white page on a host not listed in `CORS_ORIGINS` | every page | 1 | Observed defect | Fixed (P6-003) |
| U2 | Without an AI key a new student has nothing to take on the Quiz page, which only creates quizzes by AI generation | `/quiz` | 1 (config-dependent) | Observed | Open (P6-007); needs the Gemini key |
| U3 | Career page said "Your profile has no skills recorded yet" after skills were entered in registration | `/career` | 2 | Observed defect | Fixed (P6-002) |
| U4 | Dashboard listed raw keys "To finish: account, academic, skills…" right after a completed registration, which reads as unfinished required work | `/dashboard` | 4 | Observed | Fixed (P6-004) |
| U5 | On phones the 7-step list filled the first screen and the form started below the fold | `/register`, `/onboarding` | 4 | Observed | Fixed (P6-005) |
| U6 | Legacy mode: "Forgot password?" explains that reset needs Firebase, so a student who forgets a password is stuck until the owner helps | `/login` | 1 for that student | Observed | Open (P6-008); use Firebase mode for the pilot |
| U7 | The "Account created" toast covers the top of the next form for a few seconds on phones | `/register` | 5 | Observed | Open (P6-012) |
| U8 | AI Tutor without a provider shows "AI unavailable" but still offers follow-up actions such as "Save key insights to Notes" | `/ai-agent` | 5 | Observed | Open (P6-010) |
| U9 | The AI-unavailable message says "ask your administrator", but pilot students have no administrator to ask | AI pages | 5 | Observed | Open; the student guides name the pilot contact instead |

Not observed (checked): uncaught page errors, API 5xx, error screens or horizontal overflow on 46 pages at two widths;
slow pages (max 2.05 s locally).

Not checkable without students: confusing labels, unnecessary fields, excessive steps, inconsistent layouts as felt by a
student, real mobile touch interaction, real network latency.

## B. Method for Stage 2/3

- An observer watches the first 45-minute session (in person or screen share **only with separate consent**, never recorded
  by default), uses the task table in PHASE_6_FEEDBACK_FRAMEWORK.md §4, and writes one row per difficulty.
- Problems are recorded separately from wishes.

| Participant code | Task | Observed problem (what the student did / said) | Priority 1–5 | Problem or request | Linked bug |
|---|---|---|---|---|---|
| _awaiting real student participation_ | | | | | |

## C. Subjective enhancement requests

_None collected: awaiting real student participation._
