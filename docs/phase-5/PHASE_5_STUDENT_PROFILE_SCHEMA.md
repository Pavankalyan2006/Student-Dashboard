# Phase 5 Student Profile Schema

The canonical profile (`server/services/studentProfile/types.ts`) has seven sections. Every module reads it through
`StudentProfileService`; nobody reads a second copy.

| Section | Fields (main) | Stored in (snapshot mode) | Postgres table |
|---|---|---|---|
| identity | full_name, display_name, email (read-only), phone, avatar_url, terms/privacy accepted at | `db.students` | `students` |
| academic | university, college, degree, department, branch, specialization, academic_year, current_semester, admission_year, expected_graduation_year, subjects, academic_status, cgpa, cgpa_scale, previous_qualifications, academic_achievements | `educationProfiles`, `semesterSyllabusData` | `student_academic_profiles`, `student_subjects` |
| skills | skills[] {name, category, proficiency} | `skillsAssessments` | `student_skills` |
| experience | projects[], experience[], certifications[], achievements, research_interests, github/linkedin/portfolio links | `portfolioProjects`, `experienceEntries`, `certificationEntries`, `profileMeta` | `student_projects`, `student_experience`, `student_certifications` |
| career | target_roles, career_interests, preferred_industries, preferred_locations, internship_interests, placement_goals, higher_education_interests, competitive_exams, gate_paper, short/long-term goals | `careerGoals` | `student_career_preferences` |
| learning | preferred_languages, explanation_style, learning_style, difficulty, learning_interests, weekly_study_hours, daily_study_minutes, preferred_study_days, preferred_study_time, revision_preference, notifications | `learningPreferences`, `studyConstraints`, `notificationPreferences` | `student_learning_preferences` |
| account (server-managed) | student_id, auth_provider, email_verified, role, status, profile_version, last_profile_update, onboarding {current_step, completed_steps, skipped_steps, completed, completed_at} | `db.students`, `profileMeta` | `students`, `student_onboarding_progress` |

## Rules

- Enumerations: skill categories `PROGRAMMING_LANGUAGE, FRONTEND, BACKEND, DATABASE, AI_ML, CLOUD, DEVELOPER_TOOLS, TESTING, OTHER`;
  proficiency `BEGINNER, INTERMEDIATE, ADVANCED, EXPERT` (always chosen by the student, never defaulted or raised automatically).
- Academic consistency: `ceil(semester / 2) == academic_year`; graduation ≥ admission and ≤ admission + 8; CGPA ≤ scale (4, 5 or 10).
- GATE paper only when GATE is in `competitive_exams`.
- URLs must be http(s); project GitHub links must be on github.com.
- Unknown keys are rejected (400 with `details`), which is how `firebase_uid`, `role`, `email`, `student_id`,
  `email_verified` and `profile_version` are protected from client edits.
- "Not entered" is `null` / empty list. Zero values from older stores (semester 0, 0 study hours) read as not entered.

## Completion

`completion.ts` computes per-section percentages from items actually present (no fixed numbers):
account, academic, skills, experience, career, learning. `overall_percentage` is their average; `onboarding_ready` is true
when every required item exists. The dashboard, profile page, legacy `/profile/completion` and settings all show this value.
