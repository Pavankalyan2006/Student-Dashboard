# Phase 6 Success Criteria

Fixed on 2026-11-09, **before any pilot result exists**. Results are filled in from actual measurements only. There is no
minimum satisfaction score and no claim of success based on how many people took part. Every result line must report the
sample size (n) and its limits.

| Area | Criterion | How measured | Stage 1 (synthetic) | Stage 2 | Stage 3 |
|---|---|---|---|---|---|
| Registration | Every participant who starts registration can finish it, or the blocking reason is known and fixed | Observer sheet WF1 + server logs | PASS (3 synthetic accounts) | awaiting | awaiting |
| | Sign-in works on the pilot provider | Logs, WF1 | PASS legacy / BLOCKED Firebase | awaiting | awaiting |
| | Profile details persist across sign-out, refresh and restart | Re-read profile | PASS | awaiting | awaiting |
| | Onboarding resumes after interruption | WF1 observation | PASS | awaiting | awaiting |
| | No duplicate accounts | Count accounts per email in the pilot data | PASS (after P6-001) | awaiting | awaiting |
| Core learning | Participants can find a course relevant to their subjects | WF2 | PASS (recommendations) | awaiting | awaiting |
| | Learning activity persists | WF2/WF8 re-check | PASS | awaiting | awaiting |
| | Quiz results are scored correctly | Server-side score vs answer key | PASS (1/2) | awaiting | awaiting |
| | Progress reflects actual activity | Compare with own actions | PASS (quiz, goal) | awaiting | awaiting |
| AI | Configured AI features respond; failures are shown honestly | AI quality sample | BLOCKED (no key) / failure handling PASS | awaiting | awaiting |
| | RAG answers cite the student's own sources | Citation check | PASS (extractive) | awaiting | awaiting |
| Practical labs | Supported code runs and saves | WF4 | PASS (Python) | awaiting | awaiting |
| | SQL execution isolated | Phase 2 tests + WF | PASS (tests) | awaiting | awaiting |
| | Dataset processing and metrics shown | WF5 | PASS | awaiting | awaiting |
| Career | Resume shows the student's real details | WF7 | PASS | awaiting | awaiting |
| | Job listings are genuine (none invented) | Source check | PASS (0 listings shown, none invented) / BLOCKED (feed) | awaiting | awaiting |
| | Application tracking persists | WF7 | PASS | awaiting | awaiting |
| | An interview session can be completed | WF7 | NOT TESTED in Phase 6 | awaiting | awaiting |
| Privacy | No cross-student access | Isolation checks + reports | PASS | awaiting | awaiting |
| | Private data stays private; consent and controls work | Privacy settings, feedback consent | PASS | awaiting | awaiting |
| Reliability | Core journeys (WF1, WF2, WF4, WF8, WF10) completed without help by ≥1 participant each | Observer sheets | n/a | awaiting | awaiting |
| | No open P0/P1 at stage end | Bug tracker | PASS | awaiting | awaiting |
| | No unexplained data loss | Spot checks + reports | PASS | awaiting | awaiting |

Feedback ratings are reported as distributions with n (see PHASE_6_FEEDBACK_FRAMEWORK.md §7) next to these criteria,
not as pass/fail thresholds.
