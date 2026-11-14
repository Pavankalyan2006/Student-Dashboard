# Page-by-Page Redesign Report

Every page sits inside the new shell (grouped sidebar, header with breadcrumbs, footer with the student's name) and
draws from the single palette, type, radius and elevation scales. The table lists what changed beyond that.

"System only" means the page picked up the new tokens, shell, display headings, buttons and cards with no
page-specific edits; its layout and behaviour are unchanged.

| Group | Page (route) | Page-specific changes |
| --- | --- | --- |
| Overview | Dashboard (`/dashboard`) | Re-laid out: compact setup reminder instead of a full-width gradient banner; welcome → profile summary → continue learning → quick actions; a balanced 2/3 + 1/3 grid (today's plan, courses, analytics / progress, streak, deadlines, activity); AI tutor entry; recommendations and focus areas; module summary; the nine module widgets in an even 3-column grid instead of one 15-widget rail. All widgets and data sources unchanged. |
| Overview | Semester Command Center (`/semester-command-center`, `/semester/*`) | Moved from an all-dark layout to the light system; recovery alert is now a warning surface. |
| Overview | Unified Progress, Notifications | System only. Seeded welcome notification no longer mentions "Phase 1". |
| Learn | AI Tutor, Courses (+ detail, learning), Notes (+ detail), Documents (+ upload, workspace), Doubt Solver, Flashcards, Study Planner | System only; course hero uses `hero-brand`. |
| Learn | Language Learning (`/languages`) | Moved from an all-dark layout to the light system; hero and cards light. |
| Practice | Coding Lab (`/coding`), DSA Lab (`/dsa/*`) | Heroes use `hero-brand`. Code editors stay dark (IDE convention). |
| Practice | SQL Lab, Git Lab | System only. |
| Practice | System Design Lab | Palette only. The design canvas and component palette stay dark on purpose (canvas tool). |
| AI Labs | AI/ML Lab | System only; code editor stays dark. |
| AI Labs | Knowledge Base (`/knowledge`) | Moved from an all-dark layout to the light system; purple→pink buttons now brand→violet. |
| AI Labs | Lab Assistant | Hero uses `hero-brand`. |
| Assessments | Quiz (+ create, player, result, review, history, progress) | Hero uses `hero-brand`. |
| Assessments | Exam Preparation | System only. |
| Assessments | GATE Exam Preparation (`/assessment/gate-preparation`) | Moved from an all-dark page to the light system across all six tabs (dashboard, syllabus, question bank, mock tests, planner, revision) and the test-result view. |
| Assessments | Mock Interviews | Heroes and modal headers use `hero-brand`; live interview workspace keeps its dark editor panes. |
| Career | Career, Jobs Discovery, Placement Preparation (+ topics, companies, plan, technical, role, progress) | Heroes use `hero-brand`. |
| Career | Resume (+ editor, create, preview, tailor, templates), Applications | System only. |
| Projects & Research | Projects, Research, GitHub (+ connect, repos, detail) | Heroes use `hero-brand`. |
| Community | Hub, Q&A, Discussions, Resources, topic and question detail | System only. |
| Personal Workspace | Student Profile (+ edit, activity, achievements, certificates, bookmarks), Learning Goals, Connected Platforms | System only. |
| Personal Workspace | External Profiles (`/profile/external`) | Moved from dark panels to the light system. |
| Settings | Settings (`/profile/settings`, `/settings`) | "Pilot feedback and privacy concerns" block removed from Privacy & Data. |
| Removed | Pilot Feedback (`/pilot-feedback`, `/feedback`) | Page deleted; URLs redirect to `/dashboard`. |
| Fallback | Module placeholder | No roadmap phases, API routes or internal status labels. |
| Public | Home, About, How it works, Login, Onboarding, certificate verification | Palette and type only; home CTA uses `hero-brand`. |

## Not done in this pass (honest scope)

The brief lists a deep, feature-level redesign for each module (e.g. new course curriculum views, a calendar for the
study planner, pronunciation practice in languages). Those are new features or major rebuilds of working pages; this
pass changed the visual system and layout and did not change page logic or add features. Pages marked "System only"
are the candidates for follow-up page-level work.
