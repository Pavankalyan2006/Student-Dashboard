# Phase 5 Profile Propagation Report

How a profile change reaches each part of the platform. "Direct" = reads the central profile service.
"Shared store" = reads the onboarding stores that the central service writes on every save (same data, no copy).

| Module | How | Status | Evidence |
|---|---|---|---|
| Dashboard | Direct (`student_profile` block: academics, goals, completion) + shared store | PASS | Test 5; browser `9-dashboard` |
| Semester Command Center | Direct (`academic_context`) + shared store (subjects) | PASS | Test 5 |
| AI Tutor / Agent | Direct (`moduleContextSync('tutor')` in system prompt, minimised) | PASS | Test 5, Test 8 |
| Agent tools (student context) | `studentContextEngine` → shared store; fake fallbacks removed | PASS | existing e2e tests |
| Courses | Recommendations panel ("Your subject" = current subjects) | PASS | browser `evidence/courses-recommendations.png` |
| Coding Lab, DSA, SQL, ML, System Design, GATE, Mock interviews, Career, Jobs, Placements, Study planner | Recommendations panel on the landing page | PASS (panel); module internals unchanged | `/profile/me/recommendations/:module` |
| Progress, Learning modules, Resume, Career service | Shared store | PASS | existing tests |
| Profile page / edit / settings | Direct | PASS | browser walkthrough |
| Notifications | Preferences honoured when creating in-app notifications | PASS | code path in `notificationService.createNotification`; no dedicated Phase 5 test |
| Notes, Doubts, Flashcards, Quiz, Lab assistant, Languages | Context available at `/profile/me/context/:module`; the generators use it through the tutor/agent prompt only | PARTIAL |
| RAG / Knowledge base, GitHub, Applications, Community feed | Not personalised from the profile in Phase 5 | NOT IMPLEMENTED |

Job eligibility is reported as `NOT_DETERMINED` rather than guessed.
