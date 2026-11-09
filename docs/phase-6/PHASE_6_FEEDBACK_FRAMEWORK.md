# Phase 6 Feedback Framework

No feedback has been collected from real students. Everything below is the instrument, ready for Stage 2.

## 1. In-app feedback (built in Phase 6)

No feedback module existed. AI message thumbs-up/down records helpfulness per message and was not a fit. A small private
feature was added instead of an admin system.

| Part | Where |
|---|---|
| Student page | `/pilot-feedback` (sidebar: Profile > Pilot Feedback; Settings > Privacy & Data > Open pilot feedback) — `src/features/feedback/pages/PilotFeedbackPage.tsx` |
| API (own entries only) | `GET /api/v1/pilot-feedback/config`, `GET /pilot-feedback/mine`, `POST /pilot-feedback`, `DELETE /pilot-feedback/mine/:id`, `DELETE /pilot-feedback/mine` — `server/api/routes/pilotFeedback.ts` |
| Rules | `server/services/pilotFeedbackService.ts` |
| Owner export | `scripts/pilot/export-feedback.cjs` (pseudonymous, no admin page) |
| Switch | `PILOT_FEEDBACK_ENABLED=true` opens submissions. When off, students can still list and withdraw |
| Retention | `PILOT_FEEDBACK_RETENTION_DAYS` (default 90): older entries are deleted automatically |
| Tests | `src/tests/phase6_pilot.test.ts` (Pilot feedback: 5 tests) and a browser run on a phone-sized screen |

Three kinds: **Survey** (ratings), **Problem report** (module, page, what happened, expected, steps, impact),
**Privacy or security concern**.

## 2. Rating scale

1 Very poor · 2 Poor · 3 Average · 4 Good · 5 Excellent. Every question is optional. "Did not use" is left empty and not
counted. Only whole numbers 1–5 are accepted.

## 3. Questions

| Section | Id | Question |
|---|---|---|
| Registration | reg_easy | Was registration easy? |
| | reg_clear_details | Were the requested details clear? |
| | reg_completion_worked | Did profile completion work correctly? |
| | reg_confusing_fields (text) | Was any field confusing? Which one? |
| Learning | learn_dashboard_useful | Was the dashboard useful? |
| | learn_course_navigation | Were courses easy to navigate? |
| | learn_ai_understandable | Were AI explanations understandable? |
| | learn_resources_relevant | Were learning resources relevant? |
| Practical labs | lab_coding_easy | Was Coding Lab easy to use? |
| | lab_code_execution | Did code execution work? |
| | lab_sql_understandable | Was SQL Lab understandable? |
| | lab_ml_useful | Was AI/ML experimentation useful? |
| Career | career_resume_useful | Was Resume useful? |
| | career_jobs_relevant | Were job recommendations relevant? |
| | career_interview_helpful | Was Mock Interview feedback helpful? |
| User experience | ux_navigation | Was the interface easy to navigate? |
| | ux_reliable_loading | Did pages load reliably? |
| | ux_mobile | Did the mobile experience work? |
| | ux_errors_encountered (yes/no) | Did you encounter errors? |
| Overall | overall_satisfaction | Overall, how satisfied are you with the platform? |

Also optional: which pilot tasks (WF1–WF10) the student tried, device type (phone / tablet / laptop-desktop / prefer not
to say), and a free comment of up to 1000 characters.

## 4. Pilot tasks (for observers and the "tasks attempted" field)

Each participant does only the tasks they choose. Record per participant: Task ID, attempted (yes/no), completed
(yes/partly/no), time, difficulties observed, feedback.

| Task | Objective | Instructions given to the student | Expected outcome | Observe |
|---|---|---|---|---|
| WF1 | Register and onboard | Open the pilot address, choose Register, finish the 7 steps | Lands on Dashboard with own academic details | time taken, confusing fields, validation messages, completion %, sign-in again |
| WF2 | Academic learning | Find a course for one of your subjects, open a lesson, ask AI Tutor a question, save a note | Note saved, answer relevant | navigation, relevance, content quality |
| WF3 | Revision | Make flashcards, review them, take a quiz | Cards reviewed; quiz scored | question/explanation quality, progress accuracy |
| WF4 | Programming | Coding Lab: write, run and save a program | Correct output, saved | editor, language support, error messages |
| WF5 | AI/ML | AI/ML Lab: upload the provided sample CSV, train a model, read the metrics | Metrics shown | upload, training, interpretation |
| WF6 | Research | Search a paper, save it, upload a document, ask a question about it | Answer cites your document | relevance, citation accuracy |
| WF7 | Career | Create a resume, look at Jobs Discovery, practise an interview | Resume shows your details | profile accuracy, job relevance, feedback quality |
| WF8 | Goals | Create a goal with tasks and complete one | Progress updates | planner link, progress, reminders |
| WF9 | Community | Ask or answer a question, search | Post visible to others | creation, search, notifications |
| WF10 | Account | Change preferences, profile visibility and notifications; sign out and in | Settings kept | save, privacy, persistence |

Use only the **provided synthetic sample dataset** for WF5 and public papers/notes for WF6. No personal documents.

## 5. Consent notice (shown on the page; text in `FEEDBACK_CONSENT_TEXT`)

> Your feedback is voluntary. It is used only to find problems and improve this learning platform during the pilot. It is
> private: other students never see it, and it is not shown on your profile or in the community. The project owner reads
> it in an export that replaces your account with a random code and never includes your name or email. Do not include
> passwords, phone numbers or other personal details in written answers. You can withdraw (delete) any feedback you sent
> from this page at any time. Feedback is deleted automatically after the retention period.

Each submission records the consent version (`pilot-feedback-v1`). A submission without it is refused.

## 6. Data minimisation (enforced on the server)

- Only known question ids, task ids and choice values are stored. Any other field in the request is dropped.
- Email addresses and phone numbers typed into free text are replaced with `[email removed]` / `[number removed]`.
- Nothing from the profile (name, email, college, CGPA) is copied into a feedback entry.
- Max 50 entries per student. Screenshots and logs are not collected here.

## 7. Analysis rules

- Report **n** with every figure; do not report percentages for n < 5.
- Ratings are opinions. They are never evidence that an AI answer was correct.
- Keep observed problems (observer sheet, problem reports) separate from enhancement requests.
- Export: `PILOT_EXPORT_SALT=… node scripts/pilot/export-feedback.cjs <snapshot> > export.json`.
